import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function checkAdmin(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return profile?.is_admin === true;
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !(await checkAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: users } = await supabase.auth.admin.listUsers();

  const userProfiles = await Promise.all(
    users.users.map(async (u) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', u.id)
        .single();

      return {
        id: u.id,
        email: u.email,
        nickname: profile?.nickname,
        plan_type: profile?.plan_type || 'free',
        daily_usage: profile?.daily_usage || 0,
        total_generations: profile?.total_generations || 0,
        created_at: u.created_at,
      };
    })
  );

  return NextResponse.json(userProfiles);
}
