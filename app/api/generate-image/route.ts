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

    // 使用 Google AI Studio API 生成图片
    console.log('[API] 开始生成图片...');
    const imageStartTime = Date.now();

    const aiStudioUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:predict?key=${googleImageApiKey}`;
    console.log('[API] AI Studio URL:', aiStudioUrl.replace(googleImageApiKey, '***'));

    const imageResponse = await fetch(aiStudioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [
          { prompt: prompt }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio || "1:1",
          outputMimeType: format === 'jpg' ? 'image/jpeg' : `image/${format || 'png'}`
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

    const imageBase64 = imageData.predictions?.[0]?.bytesBase64;
    const imageMimeType = format === 'jpg' ? 'image/jpeg' : `image/${format || 'png'}`;

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
