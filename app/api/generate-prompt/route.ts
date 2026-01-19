import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generatePrompt } from '@/lib/prompts/generator';
import { checkAndUpdateUsage } from '@/lib/utils/usage';
import {
  getCatById,
  formatCustomCat,
  getStyleById,
  getFoodsByIds,
  getEmotionById,
  getSceneById,
} from '@/lib/prompts/data-fetchers';

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

    // 1. 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    console.log('User authenticated:', user.id);

    // 2. 获取用户信息和套餐
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: '无法获取用户信息' },
        { status: 500 }
      );
    }

    const planType = (profile?.plan_type || 'free') as 'free' | 'pro' | 'vip';
    console.log('User plan type:', planType);

    // 3. 检查用量限制
    const usageCheck = await checkAndUpdateUsage(user.id, planType);
    if (!usageCheck.allowed) {
      console.log('Usage limit exceeded:', usageCheck.usage);
      return NextResponse.json(
        {
          error: '今日生成次数已用完',
          message:
            planType === 'free'
              ? '免费用户每天可生成1次，升级到 Pro 解锁更多次数'
              : '今日次数已达上限，明天再来吧',
          usage: usageCheck.usage,
        },
        { status: 429 }
      );
    }

    console.log('Usage check passed:', usageCheck.usage);

    // 4. 解析请求参数
    const body = await request.json();
    const {
      generateType,
      catId,
      customCat,
      customCatDescription,
      styleId,
      foodIds,
      customFoods,
      emotionId,
      sceneId,
      customSceneDetails,
      extraRequirements,
      templateId
    } = body;

    console.log('Request params:', {
      generateType,
      catId,
      hasCustomCat: !!customCat,
      hasCustomCatDescription: !!customCatDescription,
      styleId,
      foodIds,
      customFoods,
      emotionId,
      sceneId,
      hasCustomSceneDetails: !!customSceneDetails,
      hasExtraRequirements: !!extraRequirements,
      templateId,
    });

    // 5. 验证必填参数
    if (!styleId) {
      return NextResponse.json(
        { error: '缺少必填参数：styleId' },
        { status: 400 }
      );
    }

    const totalFoods = (foodIds?.length || 0) + (customFoods?.length || 0);
    if (totalFoods === 0) {
      return NextResponse.json(
        { error: '至少需要选择或输入1种食物' },
        { status: 400 }
      );
    }

    if (totalFoods > 5) {
      return NextResponse.json(
        { error: '最多只能选择5种食物' },
        { status: 400 }
      );
    }

    if (!catId && !customCat && !customCatDescription) {
      return NextResponse.json(
        { error: '必须提供 catId、customCat 或 customCatDescription' },
        { status: 400 }
      );
    }

    // 6. 获取猫咪数据
    console.log('Fetching data from database...');
    let catData = null;

    if (catId) {
      // 用户选了预设猫咪
      catData = await getCatById(catId);
      if (!catData) {
        return NextResponse.json({ error: '猫咪数据不存在' }, { status: 404 });
      }
    } else if (customCatDescription && customCatDescription.trim()) {
      // 用户输入了自定义描述
      catData = {
        id: null,
        user_id: null,
        name: '自定义猫咪',
        breed: '自定义',
        breed_en: 'custom cat',
        body_type: '自定义',
        body_type_en: 'custom',
        fur_color: '',
        fur_color_en: '',
        fur_texture: null,
        fur_texture_en: null,
        special_features: '',
        special_features_en: '',
        personality: '',
        personality_en: '',
        default_style_id: null,
        avatar_url: null,
        is_preset: false,
        is_public: false,
        use_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customDescription: customCatDescription.trim(),
      };
    }

    // 验证：必须有猫咪（预设或自定义）
    if (!catData) {
      return NextResponse.json({ error: '请选择猫咪或输入自定义描述' }, { status: 400 });
    }

    // 获取其他数据
    const [styleData, foodsData, emotionData, sceneData] =
      await Promise.all([
        getStyleById(styleId),
        foodIds?.length > 0 ? getFoodsByIds(foodIds) : [],
        emotionId ? getEmotionById(emotionId) : null,
        sceneId ? getSceneById(sceneId) : null,
      ]);
    if (!styleData) {
      return NextResponse.json(
        { error: '视觉风格数据不存在' },
        { status: 404 }
      );
    }

    console.log('Data fetched successfully');

    // 7. 调用生成服务
    console.log('Calling generatePrompt service...');
    const result = await generatePrompt({
      generateType: generateType || 'image',
      userId: user.id,
      planType,
      cat: catData,
      customCatDescription: customCatDescription || undefined,
      style: styleData,
      foods: foodsData || [],
      customFoods: customFoods || [],
      emotion: emotionData,
      scene: sceneData,
      customSceneDetails: customSceneDetails || undefined,
      extraRequirements: extraRequirements || undefined,
      templateId: planType !== 'free' ? templateId : undefined,
    });

    console.log('Prompt generated successfully:', {
      mode: result.mode,
      templateName: result.templateName,
      historyId: result.data.historyId,
    });

    // 8. 返回结果
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Generate prompt API error:', error);
    return NextResponse.json(
      {
        error: '生成失败，请稍后重试',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
