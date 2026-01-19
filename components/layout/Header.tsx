'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProfile, signOut } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/create', label: '生成器' },
  { href: '/my-cats', label: '我的猫咪' },
  { href: '/history', label: '历史记录' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || '退出失败');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🐱</span>
          <span className="font-bold text-lg hidden sm:inline-block">
            猫猫吃播
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-amber-600 ${
                pathname === link.href
                  ? 'text-amber-600'
                  : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {!user ? (
            <>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <Link href="/login">登录</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Link href="/register">注册</Link>
              </Button>
            </>
          ) : (
            <>
              {profile?.plan_type === 'free' && (
                <Button
                  asChild
                  size="sm"
                  className="hidden sm:inline-flex bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Link href="/profile">升级 Pro</Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.nickname || '用户'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">个人中心</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-cats">我的猫咪</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/history">历史记录</Link>
                  </DropdownMenuItem>
                  {profile?.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-orange-600 font-medium">
                          🔧 管理后台
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  {profile?.plan_type === 'free' && (
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="text-amber-600">
                        升级到 Pro
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
