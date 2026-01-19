import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { buildVideoPrompt } from '@/lib/prompts/video-template';

interface GenerateVideoPromptRequest {
  frameDescription: string;
  actionDescription: string;
  soundOption?: string;
}

// 音效建议映射
function getSoundSuggestion(soundOption: string): string {
  const suggestions: Record<string, string> = {
    'blogger_style': '博主同款音效：ASMR咀嚼声 + 轻快可爱BGM + 适当的音效点缀（惊讶音效、满足音效等）',
    'asmr_eating': '推荐音效：纯净ASMR咀嚼声，轻微环境白噪音，无背景音乐',
    'cute_bgm': '推荐音效：轻快卡通BGM + 可爱音效点缀',
    'relaxing': '推荐音效：轻柔钢琴曲 + 自然环境音（雨声、鸟鸣）',
    'funny': '推荐音效：综艺节目常用BGM + 夸张搞笑音效',
    'none': '',
  };
  return suggestions[soundOption] || '';
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const body: GenerateVideoPromptRequest = await request.json();
    const { frameDescription, actionDescription, soundOption } = body;

    if (!frameDescription || !frameDescription.trim()) {
      return NextResponse.json(
        { error: '请填写画面描述' },
        { status: 400 }
      );
    }

    if (!actionDescription || !actionDescription.trim()) {
      return NextResponse.json(
        { error: '请填写动作描述' },
        { status: 400 }
      );
    }

    // 获取用户套餐类型
    let planType = 'free';
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();

      planType = profile?.plan_type || 'free';
    }

    // 判断是否为专业版用户
    const isPremium = planType === 'pro' || planType === 'vip';

    // 判断是否选择了「博主同款」音效（仅专业版可用）
    const includeSound = isPremium && soundOption === 'blogger_style';

    // 根据用户版本生成提示词
    const videoPrompt = buildVideoPrompt(
      frameDescription.trim(),
      actionDescription.trim(),
      {
        isPremium,
        includeSound,
      }
    );

    // 获取音效建议
    const soundSuggestion = getSoundSuggestion(soundOption || '');

    // 如果用户已登录，保存到历史记录
    if (user) {
      await supabase.from('prompts_history').insert({
        user_id: user.id,
        prompt_type: 'video',
        image_prompt: videoPrompt,
        input_data: {
          frameDescription,
          actionDescription,
          soundOption,
          planType,
        },
      });
    }

    return NextResponse.json({
      success: true,
      videoPrompt,
      soundSuggestion,
      tips: isPremium
        ? '提示：将此提示词用于 Veo、Runway、Pika 等AI视频生成工具'
        : '提示：升级到专业版解锁完整专业模板，获得更好的视频生成效果',
      planType,
    });
  } catch (error) {
    console.error('Error generating video prompt:', error);
    return NextResponse.json(
      { error: '生成视频提示词失败，请稍后重试' },
      { status: 500 }
    );
  }
}
