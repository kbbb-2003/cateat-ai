'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { signUp } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

// 错误类型定义
type ErrorType = 'EMAIL_EXISTS' | 'WEAK_PASSWORD' | 'PASSWORD_MISMATCH' | 'INVALID_EMAIL' | 'GENERIC';

interface FormError {
  type: ErrorType;
  message: string;
}

// 解析 Supabase 注册错误
function parseSignUpError(error: any): FormError {
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorMessage.includes('user already registered') ||
      errorMessage.includes('email already exists') ||
      errorMessage.includes('already registered')) {
    return { type: 'EMAIL_EXISTS', message: '该账号已注册，请直接登录' };
  }

  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return { type: 'WEAK_PASSWORD', message: '密码强度不够，请使用更复杂的密码' };
  }

  if (errorMessage.includes('invalid email')) {
    return { type: 'INVALID_EMAIL', message: '请输入有效的邮箱地址' };
  }

  return { type: 'GENERIC', message: '注册失败，请稍后重试' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { text: '太短', color: 'text-red-600' };
    if (pwd.length < 8) return { text: '一般', color: 'text-yellow-600' };
    if (pwd.length >= 12) return { text: '强', color: 'text-green-600' };
    return { text: '中等', color: 'text-blue-600' };
  };

  // 清除错误当用户修改输入时
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formError) setFormError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password || !confirmPassword) {
      setFormError({ type: 'GENERIC', message: '请填写所有字段' });
      return;
    }

    if (password.length < 6) {
      setFormError({ type: 'WEAK_PASSWORD', message: '密码需要至少 6 位' });
      return;
    }

    if (password !== confirmPassword) {
      setFormError({ type: 'PASSWORD_MISMATCH', message: '两次输入的密码不一致' });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      toast.success('注册成功！请查收验证邮件');
      router.push('/login');
    } catch (error: any) {
      const parsedError = parseSignUpError(error);
      setFormError(parsedError);
      setLoading(false);
    }
  };

  const strength = password ? getPasswordStrength(password) : null;

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-center mb-6">注册</h1>

      {/* 错误提示区域 - 优化样式 */}
      {formError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">
                {formError.message}
              </p>
              {formError.type === 'EMAIL_EXISTS' && (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <span className="underline underline-offset-2">立即登录</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">邮箱</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            className={formError?.type === 'EMAIL_EXISTS' || formError?.type === 'INVALID_EMAIL' ? 'border-red-300 focus-visible:ring-red-500' : ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">密码</label>
          <Input
            type="password"
            placeholder="至少6位"
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            className={formError?.type === 'WEAK_PASSWORD' || formError?.type === 'PASSWORD_MISMATCH' ? 'border-red-300 focus-visible:ring-red-500' : ''}
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
            onChange={handleConfirmPasswordChange}
            disabled={loading}
            className={formError?.type === 'PASSWORD_MISMATCH' ? 'border-red-300 focus-visible:ring-red-500' : ''}
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
      <div className="text-center text-sm text-gray-600 mt-6 space-x-2">
        <span>已有账号？</span>
        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-medium">
          立即登录
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/" className="text-gray-600 hover:text-gray-700">
          返回首页
        </Link>
      </div>
    </Card>
  );
}
