'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Palette, Apple, Heart, MapPin, FileText, Users, BarChart3 } from 'lucide-react';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/styles', label: '风格管理', icon: Palette },
  { href: '/admin/foods', label: '食物管理', icon: Apple },
  { href: '/admin/emotions', label: '情绪管理', icon: Heart },
  { href: '/admin/scenes', label: '场景管理', icon: MapPin },
  { href: '/admin/templates', label: '模板管理', icon: FileText },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/stats', label: '数据统计', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-orange-600">管理后台</h1>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
