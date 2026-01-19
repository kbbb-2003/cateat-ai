import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 用量限制配置
const USAGE_LIMITS = {
  free: 3,        // 基础用户：每天 3 次
  pro: 5,         // Pro 用户：每天 5 次
  vip: Infinity,  // VIP 用户：无限
};

// 判断是否跨天（UTC+8）
function isNewDay(lastReset: Date, now: Date): boolean {
  const offset = 8 * 60 * 60 * 1000; // UTC+8
  const lastDay = new Date(lastReset.getTime() + offset).toDateString();
  const today = new Date(now.getTime() + offset).toDateString();
  return lastDay !== today;
}

export async function checkAndUpdateUsage(
  userId: string,
  planType: 'free' | 'pro' | 'vip'
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取用户当前用量
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('daily_usage, usage_reset_at, total_generations')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('无法获取用户信息');
    }

    // 检查是否需要重置（跨天，UTC+8）
    const now = new Date();
    const resetAt = new Date(profile?.usage_reset_at || 0);
    const shouldReset = isNewDay(resetAt, now);

    let currentUsage = shouldReset ? 0 : profile?.daily_usage || 0;
    const limit = USAGE_LIMITS[planType] || 1;

    // 检查是否超限
    if (currentUsage >= limit) {
      return {
        allowed: false,
        usage: {
          used: currentUsage,
          limit,
          isUnlimited: limit === Infinity,
        },
      };
    }

    // 更新用量
    const newUsage = currentUsage + 1;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        daily_usage: newUsage,
        usage_reset_at: shouldReset ? now.toISOString() : profile?.usage_reset_at,
        total_generations: (profile?.total_generations || 0) + 1,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating usage:', updateError);
      throw new Error('无法更新用量');
    }

    return {
      allowed: true,
      usage: {
        used: newUsage,
        limit,
        isUnlimited: limit === Infinity,
      },
    };
  } catch (error) {
    console.error('checkAndUpdateUsage error:', error);
    throw error;
  }
}

export async function getUserUsageInfo(userId: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('daily_usage, usage_reset_at, plan_type, total_generations')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user usage info:', error);
      return null;
    }

    const planType = (profile?.plan_type || 'free') as keyof typeof USAGE_LIMITS;
    const limit = USAGE_LIMITS[planType] || 1;

    return {
      used: profile?.daily_usage || 0,
      limit,
      isUnlimited: limit === Infinity,
      totalGenerations: profile?.total_generations || 0,
      resetAt: profile?.usage_reset_at,
    };
  } catch (error) {
    console.error('getUserUsageInfo error:', error);
    return null;
  }
}
