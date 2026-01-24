import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// export const runtime = 'edge';

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

    // 暂时跳过阶段1，直接使用原始 prompt
    console.log('[API] 跳过优化阶段，直接使用原始提示词');
    const optimizedPrompt = prompt;

    // 阶段2: 使用 Google SDK 生成图片
    console.log('[API] 阶段2: 开始生成图片...');
    const imageStartTime = Date.now();

    const genAI = new GoogleGenerativeAI(googleImageApiKey);
    console.log('[API] GoogleGenerativeAI 初始化完成');

    const imageModel = genAI.getGenerativeModel({
      model: 'imagen-3.0-generate-001'
    });
    console.log('[API] 图片模型获取完成');

    const imageResult = await imageModel.generateContent(optimizedPrompt);
    console.log('[API] 图片生成请求已发送');

    const imageResponse = await imageResult.response;
    const imageDuration = Date.now() - imageStartTime;
    console.log('[API] 图片生成完成，耗时:', imageDuration, 'ms');

    const imageData = imageResponse.candidates?.[0]?.content?.parts?.[0];

    if (!imageData || !imageData.inlineData) {
      console.error('[API] 图片数据格式错误:', imageResponse);
      return NextResponse.json(
        { error: '图片生成失败，返回数据格式错误' },
        { status: 500 }
      );
    }

    const base64Image = `data:${imageData.inlineData.mimeType};base64,${imageData.inlineData.data}`;
    console.log('[API] 图片数据提取成功');

    const totalDuration = Date.now() - imageStartTime;
    console.log('[API] 总耗时:', totalDuration, 'ms');

    return NextResponse.json({
      success: true,
      optimizedPrompt: optimizedPrompt,
      image: base64Image
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
