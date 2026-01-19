import { NextRequest, NextResponse } from 'next/server';

const IMPROVE_SYSTEM_PROMPT = `你是一个专业的AI视频提示词专家，专门为猫咪吃播视频优化动作描述。

你的任务是根据用户的改进意见，修改原有的动作描述，生成更好的英文动作提示词。

要求：
1. 保持原有动作的基本结构和流畅性
2. 根据用户的改进意见进行针对性修改
3. 动作要细腻、缓慢、可爱
4. 用"First... Then... Next... Finally..."等连接词
5. 添加猫咪可爱的细节（如表情变化、眼神、小动作）

直接输出改进后的英文动作描述，不要有任何前缀、解释或markdown格式。`;

export async function POST(request: NextRequest) {
  try {
    const { originalAction, improvement } = await request.json();

    if (!originalAction) {
      return NextResponse.json({ error: '请提供原动作描述' }, { status: 400 });
    }

    if (!improvement) {
      return NextResponse.json({ error: '请提供改进意见' }, { status: 400 });
    }

    // 调试日志
    console.log('=== improve-action API 调试 ===');
    console.log('原动作:', originalAction);
    console.log('改进意见:', improvement);

    // 调用 Gemini API（中转站，OpenAI 兼容格式）
    const response = await fetch(`${process.env.GEMINI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: IMPROVE_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `原动作描述：
${originalAction}

用户的改进意见：
${improvement}

请根据改进意见修改动作描述：`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API 错误状态码:', response.status);
      console.error('Gemini API 错误响应:', errorText);
      return NextResponse.json(
        { error: '动作改进失败，请稍后重试' },
        { status: 500 }
      );
    }

    const data = await response.json();
    // OpenAI 兼容格式的响应结构
    const improvedAction = data.choices?.[0]?.message?.content || '';

    console.log('改进后的动作:', improvedAction);

    if (!improvedAction) {
      return NextResponse.json(
        { error: '无法改进动作描述' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      improvedAction: improvedAction.trim(),
    });
  } catch (error) {
    console.error('=== improve-action 详细错误 ===');
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '动作改进失败，请稍后重试' },
      { status: 500 }
    );
  }
}
