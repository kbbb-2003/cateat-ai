import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsersRes, paidUsersRes, todayGenRes, totalGenRes, proGenRes] = await Promise.all([
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('id', { count: 'exact', head: true }).in('plan_type', ['pro', 'vip']),
    supabase.from('prompts_history').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabase.from('prompts_history').select('id', { count: 'exact', head: true }),
    supabase.from('prompts_history').select('id', { count: 'exact', head: true }).eq('mode', 'professional'),
  ]);

  const totalUsers = totalUsersRes.count || 0;
  const paidUsers = paidUsersRes.count || 0;
  const todayGenerations = todayGenRes.count || 0;
  const totalGenerations = totalGenRes.count || 0;
  const proGenerations = proGenRes.count || 0;

  const proTemplateUsage = totalGenerations > 0
    ? Math.round((proGenerations / totalGenerations) * 100)
    : 0;

  return NextResponse.json({
    todayGenerations,
    totalUsers,
    paidUsers,
    proTemplateUsage,
  });
}
