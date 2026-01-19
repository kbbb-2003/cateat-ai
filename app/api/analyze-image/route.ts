import { NextRequest, NextResponse } from 'next/server';

const ANALYZE_PROMPT = `你是一个专业的AI图片提示词反推专家。请仔细分析这张猫咪吃播图片，生成详细的英文画面描述提示词。

要求：
1. 描述猫咪的特征：品种、毛色、表情、眼神、穿着的服饰/配饰
2. 描述食物：种类、摆放位置（左边/中间/右边）、外观质感
3. 描述饮品：种类、位置
4. 描述环境：桌子材质、背景、灯光
5. 描述画面质量：写实风格、光影、清晰度

输出格式要求：
- 直接输出英文描述，不要有任何前缀或解释
- 描述要详细具体，适合作为AI视频生成的画面提示词
- 参考示例风格：
"A cute fluffy ginger cat wearing a light blue fuzzy hoodie with a pink bow and plaid bowtie. The cat has round, wide eyes and a dazed, innocent expression, looking straight at the camera. It sits at a wooden table set for a mukbang. In front of it is a feast: a bowl of glossy red braised pork on the left, a plate of sliced Peking duck with pancakes and cucumbers in the center, and sweet and sour ribs on the right. A glass of orange juice is visible. High quality, photorealistic, bright studio lighting, soft shadows, sharp focus on the food texture and the cat's face."

现在请分析图片并生成描述：`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 });
    }

    // 检查文件大小（最大 10MB）
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 });
    }

    // 转换为 base64
    const imageBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

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
            role: 'user',
            content: [
              { type: 'text', text: ANALYZE_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${image.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: '图片分析失败，请稍后重试' },
        { status: 500 }
      );
    }

    const data = await response.json();
    // OpenAI 兼容格式的响应结构
    const description = data.choices?.[0]?.message?.content || '';

    if (!description) {
      return NextResponse.json(
        { error: '无法分析图片内容' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      description: description.trim(),
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: '图片分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
