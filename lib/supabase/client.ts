import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const cookies = document.cookie.split('; ');
          const cookie = cookies.find(c => c.startsWith(`${name}=`));
          return cookie?.split('=')[1];
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;

          let cookieString = `${name}=${value}`;

          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          // 在生产环境（HTTPS）中设置 secure
          if (window.location.protocol === 'https:') {
            cookieString += '; secure';
          }
          // 设置 SameSite 为 Lax 以支持跨页面导航
          cookieString += '; samesite=lax';

          document.cookie = cookieString;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;

          let cookieString = `${name}=; max-age=0`;

          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }

          document.cookie = cookieString;
        },
      },
    }
  );

  return client;
}
