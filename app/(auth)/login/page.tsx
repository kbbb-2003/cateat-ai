'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signIn } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('请填写所有字段');
      return;
    }

    if (password.length < 6) {
      toast.error('密码至少需要6位');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('登录成功');

      // 等待一小段时间确保 Cookie 写入完成
      await new Promise(resolve => setTimeout(resolve, 100));

      // 使用 window.location.href 强制刷新页面，确保 middleware 能读取到新的 Cookie
      window.location.href = '/create';
    } catch (error: any) {
      toast.error(error.message || '登录失败');
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-center mb-6">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">邮箱</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">密码</label>
          <Input
            type="password"
            placeholder="至少6位"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-amber-600 hover:text-amber-700"
          >
            忘记密码？
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              登录中...
            </>
          ) : (
            '登录'
          )}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        没有账号？
        <Link href="/register" className="text-amber-600 hover:text-amber-700 ml-1">
          去注册
        </Link>
      </p>
    </Card>
  );
}
