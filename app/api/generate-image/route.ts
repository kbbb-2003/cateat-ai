import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// export const runtime = 'edge';
export const maxDuration = 10; // Vercel Hobby 限制

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 超时保护函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  }
}

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

    // 跳过提示词优化，直接使用用户输入
    console.log('[API] 跳过优化阶段，直接使用用户提示词');
    const optimizedPrompt = prompt;
    const optimizeStartTime = Date.now();

    // 阶段2: 使用 Google AI Studio API 生成图片（带超时保护）
    console.log('[API] 阶段2: 开始生成图片...');
    const imageStartTime = Date.now();

    const aiStudioUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateContent?key=${googleImageApiKey}`;
    console.log('[API] AI Studio URL:', aiStudioUrl.replace(googleImageApiKey, '***'));

    const imageResponse = await fetchWithTimeout(aiStudioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: optimizedPrompt
          }]
        }],
        generationConfig: {
          responseModalities: ["IMAGE"]
        }
      })
    }, 8000); // 8秒超时

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

    // 从 AI Studio 响应中提取图片数据
    const imageBase64 = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const imageMimeType = imageData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'image/png';

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
