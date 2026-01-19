'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signUp } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { text: '太短', color: 'text-red-600' };
    if (pwd.length < 8) return { text: '一般', color: 'text-yellow-600' };
    if (pwd.length >= 12) return { text: '强', color: 'text-green-600' };
    return { text: '中等', color: 'text-blue-600' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast.error('请填写所有字段');
      return;
    }

    if (password.length < 6) {
      toast.error('密码至少需要6位');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      toast.success('注册成功！请查收验证邮件');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>
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
          {strength && (
            <p className={`text-xs mt-1 ${strength.color}`}>
              密码强度：{strength.text}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">确认密码</label>
          <Input
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              注册中...
            </>
          ) : (
            '注册'
          )}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        已有账号？
        <Link href="/login" className="text-amber-600 hover:text-amber-700 ml-1">
          去登录
        </Link>
      </p>
    </Card>
  );
}
