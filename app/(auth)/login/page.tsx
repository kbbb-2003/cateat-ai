'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { signIn } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, AlertCircle } from 'lucide-react';

// 错误类型定义
type ErrorType = 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | 'INVALID_EMAIL' | 'GENERIC';

interface FormError {
  type: ErrorType;
  message: string;
}

// 解析 Supabase 错误
function parseAuthError(error: any): FormError {
  const errorMessage = error?.message?.toLowerCase() || '';

  // Supabase 返回的常见错误消息
  if (errorMessage.includes('invalid login credentials') ||
      errorMessage.includes('invalid credentials')) {
    // Supabase 不区分用户不存在和密码错误，统一返回 invalid credentials
    return { type: 'WRONG_PASSWORD', message: '邮箱或密码错误，请检查后重试' };
  }

  if (errorMessage.includes('user not found') ||
      errorMessage.includes('no user found')) {
    return { type: 'USER_NOT_FOUND', message: '该账号不存在，请先注册' };
  }

  if (errorMessage.includes('invalid email')) {
    return { type: 'INVALID_EMAIL', message: '请输入有效的邮箱地址' };
  }

  return { type: 'GENERIC', message: '登录失败，请稍后重试' };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSsoConflict, setShowSsoConflict] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);

  // 检查 URL 参数是否包含 SSO 冲突错误
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'sso_conflict') {
      setShowSsoConflict(true);
      // 清除 URL 参数
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  // 清除错误当用户修改输入时
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError({ type: 'GENERIC', message: '请填写所有字段' });
      return;
    }

    if (password.length < 6) {
      setFormError({ type: 'WRONG_PASSWORD', message: '密码至少需要6位' });
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
      const parsedError = parseAuthError(error);
      setFormError(parsedError);
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-center mb-6">登录</h1>

        {/* 错误提示区域 - 优化样式 */}
        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  {formError.message}
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  {formError.type === 'USER_NOT_FOUND' && (
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <span className="underline underline-offset-2">立即注册</span>
                      <span>→</span>
                    </Link>
                  )}
                  {formError.type === 'WRONG_PASSWORD' && (
                    <Link
                      href="/forgot-password"
                      className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <span className="underline underline-offset-2">忘记密码？</span>
                    </Link>
                  )}
                </div>
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
              className={formError ? 'border-red-300 focus-visible:ring-red-500' : ''}
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
              className={formError ? 'border-red-300 focus-visible:ring-red-500' : ''}
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
        <div className="text-center text-sm text-gray-600 mt-6 space-x-2">
          <span>没有账号？</span>
          <Link href="/register" className="text-amber-600 hover:text-amber-700 font-medium">
            立即注册
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/" className="text-gray-600 hover:text-gray-700">
            返回首页
          </Link>
        </div>
      </Card>

      {/* SSO 冲突弹窗 */}
      <Dialog open={showSsoConflict} onOpenChange={setShowSsoConflict}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <DialogTitle className="text-lg">账号已在其他设备登录</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed">
              检测到您的账号已在其他设备登录，为了保护账号安全，当前设备已被自动登出。
              <br /><br />
              如果这不是您本人的操作，建议立即修改密码。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowSsoConflict(false)}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              我知道了
            </Button>
            <Button
              onClick={() => {
                setShowSsoConflict(false);
                router.push('/forgot-password');
              }}
              variant="outline"
              className="flex-1"
            >
              修改密码
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </Card>
    }>
      <LoginForm />
    </Suspense>
  );
}
