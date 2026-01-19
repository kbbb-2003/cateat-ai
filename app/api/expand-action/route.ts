import { NextRequest, NextResponse } from 'next/server';

const EXPAND_SYSTEM_PROMPT = `你是一个专业的AI视频提示词专家，专门为猫咪吃播视频生成动作描述。

你的任务是将用户简单的动作描述扩写成详细、流畅、适合AI视频生成的英文动作提示词。

扩写要求：
1. 动作要分步骤描述，用"First... Then... Next... Finally..."等连接词
2. 每个动作要描述得细腻、缓慢、可爱
3. 强调动作的流畅性和连贯性
4. 添加猫咪可爱的细节（如表情变化、眼神、小动作）
5. 适合作为视频生成的动作指令

参考示例：
用户输入：挥手、调整蝴蝶结、拿起食物
扩写输出：The cat slowly raised one paw and gently waved it left and right towards the camera as a friendly greeting. At the same time, the cat gently opened its mouth and made a soft and sweet meow. Next, the cat steadily moved the same claws to its head, gently patting and adjusting the pink bow on its hood. Then, the cat placed its two paws on its neck and clumsily but cutely adjusted the bow tie. Finally, the cat slowly reached out its paw and picked up a piece of food, bringing it close to its mouth. All the movements are slow, smooth and lovely.

直接输出英文动作描述，不要有任何前缀、解释或markdown格式。`;

export async function POST(request: NextRequest) {
  try {
    const { actions, customAction } = await request.json();

    // 组合用户选择的动作和自定义动作
    const userInput = [
      ...(actions || []),
      customAction,
    ].filter(Boolean).join('，');

    if (!userInput) {
      return NextResponse.json({ error: '请输入动作描述' }, { status: 400 });
    }

    // 调试日志
    console.log('=== expand-action API 调试 ===');
    console.log('GEMINI_BASE_URL:', process.env.GEMINI_BASE_URL);
    console.log('GEMINI_API_KEY 存在:', !!process.env.GEMINI_API_KEY);
    console.log('用户输入:', userInput);

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
            content: EXPAND_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `请将以下动作描述扩写成详细的英文动作提示词：\n${userInput}`,
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
        { error: '动作扩写失败，请稍后重试' },
        { status: 500 }
      );
    }

    const data = await response.json();
    // OpenAI 兼容格式的响应结构
    const expandedAction = data.choices?.[0]?.message?.content || '';

    if (!expandedAction) {
      return NextResponse.json(
        { error: '无法扩写动作描述' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expandedAction: expandedAction.trim(),
    });
  } catch (error) {
    console.error('=== expand-action 详细错误 ===');
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
    return NextResponse.json(
      { error: '动作扩写失败，请稍后重试' },
      { status: 500 }
    );
  }
}
