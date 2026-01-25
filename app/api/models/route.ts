import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  try {
    // 返回可用的图片生成模型列表
    const models = [
      {
        id: 'imagen-3.0-generate-001',
        name: 'Imagen 3.0',
        description: 'Google 最新的图片生成模型',
        maxResolution: '2K',
        supportedRatios: ['1:1', '16:9', '9:16', '4:3', '3:4']
      }
    ];

    return NextResponse.json({
      success: true,
      models
    });

  } catch (error: any) {
    console.error('[Models API] 错误:', error);
    return NextResponse.json(
      { error: error.message || '获取模型列表失败' },
      { status: 500 }
    );
  }
}
