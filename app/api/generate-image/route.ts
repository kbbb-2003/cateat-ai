import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const maxDuration = 10;

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

    const googleImageApiKey = process.env.GOOGLE_IMAGE_API_KEY;

    if (!googleImageApiKey) {
      console.log('[API] 错误: Google Image API Key 未配置');
      return NextResponse.json(
        { error: 'Google Image API Key 未配置' },
        { status: 500 }
      );
    }

    // 直接使用用户提示词
    console.log('[API] 使用用户提示词:', prompt);
    const optimizeStartTime = Date.now();

    // 使用中转站 Gemini 3 Pro Preview 生成图片
    console.log('[API] 开始生成图片...');
    const imageStartTime = Date.now();

    const aiStudioUrl = `https://gemini.wxart.space/v1beta/models/gemini-3-pro-preview:generateContent?key=${googleImageApiKey}`;
    console.log('[API] 中转站 URL:', aiStudioUrl.replace(googleImageApiKey, '***'));

    const imageResponse = await fetch(aiStudioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: "You are an image generation AI. Your ONLY task is to generate images. You MUST NOT output any text, thoughts, or explanations. When given a prompt, immediately generate and return an image. Do not think, do not explain, just generate the image directly."
          }]
        },
        contents: [{
          parts: [{
            text: `Generate an image: ${prompt}`
          }]
        }],
        generationConfig: {
          response_modalities: ["IMAGE"],
          temperature: 0.4
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

    // 从 generateContent 响应中提取图片数据
    let imageBase64 = null;
    let imageMimeType = 'image/png';

    const parts = imageData.candidates?.[0]?.content?.parts;
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          imageMimeType = part.inlineData.mimeType || 'image/png';
          console.log('[API] 找到图片数据，类型:', imageMimeType);
          break;
        }
      }
    }

    if (!imageBase64) {
      console.error('[API] 未接收到图片数据:', imageData);
      return NextResponse.json(
        { error: '图片生成失败，未接收到图片数据' },
        { status: 500 }
      );
    }

    console.log('[API] 图片数据接收完成');

    // 上传到 Supabase
    console.log('[API] 上传图片到 Supabase...');
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

    // 记录到数据库
    console.log('[API] 记录到数据库...');
    const { data: dbData, error: dbError } = await supabase
      .from('pictures')
      .insert({
        prompt: prompt,
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
      optimizedPrompt: prompt,
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
