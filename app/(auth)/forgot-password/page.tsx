'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { resetPassword } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('请输入邮箱');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('重置链接已发送，请查收邮件');
    } catch (error: any) {
      toast.error(error.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        返回登录
      </Link>
      <h1 className="text-2xl font-bold text-center mb-2">忘记密码</h1>
      <p className="text-center text-sm text-gray-600 mb-6">
        输入你的邮箱，我们将发送重置密码链接
      </p>

      {sent ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">📧</div>
          <h3 className="font-semibold mb-2">邮件已发送</h3>
          <p className="text-sm text-gray-600 mb-6">
            请查收邮件并点击链接重置密码
          </p>
          <Button asChild variant="outline">
            <Link href="/login">返回登录</Link>
          </Button>
        </div>
      ) : (
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
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                发送中...
              </>
            ) : (
              '发送重置链接'
            )}
          </Button>
        </form>
      )}
    </Card>
  );
}
