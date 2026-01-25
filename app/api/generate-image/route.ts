import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// export const runtime = 'edge';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('[API] 开始处理图片生成请求');

  try {
    console.log('[API] 解析请求体...');
    const { prompt, aspectRatio, resolution, format } = await request.json();
    console.log('[API] 请求参数:', { prompt, aspectRatio, resolution, format });

    if (!prompt) {
      console.log('[API] 错误: 缺少提示词');
      return NextResponse.json(
        { error: '请提供图片描述' },
        { status: 400 }
      );
    }

    // 读取环境变量
    const geminiBaseUrl = process.env.GEMINI_BASE_URL;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const googleImageApiKey = process.env.GOOGLE_IMAGE_API_KEY;

    console.log('[API] 环境变量检查:', {
      hasGeminiBaseUrl: !!geminiBaseUrl,
      hasGeminiApiKey: !!geminiApiKey,
      hasGoogleImageApiKey: !!googleImageApiKey
    });

    if (!geminiBaseUrl || !geminiApiKey) {
      console.log('[API] 错误: Gemini 配置缺失');
      return NextResponse.json(
        { error: 'Gemini API 配置缺失' },
        { status: 500 }
      );
    }

    if (!googleImageApiKey) {
      console.log('[API] 错误: Google Image API Key 未配置');
      return NextResponse.json(
        { error: 'Google Image API Key 未配置' },
        { status: 500 }
      );
    }

    // 阶段1: 使用中转站优化提示词
    console.log('[API] 阶段1: 开始优化提示词...');
    const optimizeStartTime = Date.now();

    const geminiUrl = `${geminiBaseUrl}/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`;
    console.log('[API] Gemini API URL:', geminiUrl.replace(geminiApiKey, '***'));

    const optimizeResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `请将以下描述优化成适合 AI 图片生成的英文提示词，要详细、具体、富有艺术感：\n\n${prompt}\n\n只返回优化后的英文提示词，不要其他内容。`
          }]
        }]
      })
    });

    console.log('[API] 优化提示词响应状态:', optimizeResponse.status);

    if (!optimizeResponse.ok) {
      const errorText = await optimizeResponse.text();
      console.error('[API] 优化提示词失败:', errorText);
      return NextResponse.json(
        { error: '优化提示词失败' },
        { status: optimizeResponse.status }
      );
    }

    const optimizeData = await optimizeResponse.json();
    const optimizeDuration = Date.now() - optimizeStartTime;
    console.log('[API] 优化提示词完成，耗时:', optimizeDuration, 'ms');

    const optimizedPrompt = optimizeData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    console.log('[API] 优化后的提示词:', optimizedPrompt);

    // 阶段2: 使用原生 fetch 调用 Vertex AI
    console.log('[API] 阶段2: 开始生成图片...');
    const imageStartTime = Date.now();

    const vertexUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0031506214/locations/us-central1/publishers/google/models/gemini-3-pro-image-preview:predict?key=${googleImageApiKey}`;
    console.log('[API] Vertex AI URL:', vertexUrl.replace(googleImageApiKey, '***'));

    const imageResponse = await fetch(vertexUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: optimizedPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio || "1:1",
          imageSize: resolution || "1K",
        }
      })
    });

    console.log('[API] 生图响应状态:', imageResponse.status);

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('[API] 生图失败:', errorText);
      return NextResponse.json(
        { error: '图片生成失败' },
        { status: imageResponse.status }
      );
    }

    const imageData = await imageResponse.json();
    const imageDuration = Date.now() - imageStartTime;
    console.log('[API] 图片生成完成，耗时:', imageDuration, 'ms');

    const imageBase64 = imageData.predictions?.[0]?.bytesBase64Encoded;
    const imageMimeType = imageData.predictions?.[0]?.mimeType || 'image/png';

    if (!imageBase64) {
      console.error('[API] 未接收到图片数据:', imageData);
      return NextResponse.json(
        { error: '图片生成失败，未接收到图片数据' },
        { status: 500 }
      );
    }

    console.log('[API] 图片数据接收完成');

    // 阶段3: 上传到 Supabase
    console.log('[API] 阶段3: 上传图片到 Supabase...');
    const uploadStartTime = Date.now();

    const buffer = Buffer.from(imageBase64, 'base64');
    const fileName = `${Date.now()}.${format || 'png'}`;
    const filePath = `generated/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: imageMimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('[API] 上传失败:', uploadError);
      return NextResponse.json(
        { error: '图片上传失败' },
        { status: 500 }
      );
    }

    console.log('[API] 图片上传成功:', uploadData.path);

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('[API] 公开URL:', publicUrl);

    // 阶段4: 记录到数据库
    console.log('[API] 阶段4: 记录到数据库...');
    const { data: dbData, error: dbError } = await supabase
      .from('pictures')
      .insert({
        prompt: optimizedPrompt,
        original_prompt: prompt,
        image_url: publicUrl,
        aspect_ratio: aspectRatio,
        resolution: resolution,
        format: format
      })
      .select()
      .single();

    if (dbError) {
      console.error('[API] 数据库记录失败:', dbError);
    } else {
      console.log('[API] 数据库记录成功:', dbData.id);
    }

    const uploadDuration = Date.now() - uploadStartTime;
    const totalDuration = Date.now() - optimizeStartTime;
    console.log('[API] 上传耗时:', uploadDuration, 'ms');
    console.log('[API] 总耗时:', totalDuration, 'ms');

    return NextResponse.json({
      success: true,
      optimizedPrompt: optimizedPrompt,
      image: publicUrl
    });

  } catch (error: any) {
    console.error('[API] 错误详情:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || '图片生成失败' },
      { status: 500 }
    );
  }
}
