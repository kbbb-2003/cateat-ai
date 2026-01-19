'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Crown, Sparkles, Calendar, TrendingUp } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useAuth';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, loading } = useProfile();

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!user || !profile) {
    return <div className="text-center py-12">未找到用户信息</div>;
  }

  const planNames = {
    free: '免费版',
    pro: 'Pro 版',
    vip: 'VIP 版',
  };

  const usageLimit = profile.plan_type === 'free' ? 1 : profile.plan_type === 'pro' ? 10 : 999;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p className="text-gray-600">管理你的账户和订阅</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-amber-100 text-amber-700 text-xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile.nickname || '用户'}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-sm text-gray-600">加入时间</div>
              <div className="font-semibold">
                {new Date(profile.created_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-sm text-gray-600">累计生成</div>
              <div className="font-semibold">{profile.total_generations} 次</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-sm text-gray-600">今日剩余</div>
              <div className="font-semibold">
                {profile.plan_type === 'vip' ? '无限' : `${usageLimit - profile.daily_usage} 次`}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">当前套餐</h3>
              <div className="flex items-center gap-2">
                <Badge variant={profile.plan_type === 'free' ? 'outline' : 'default'}>
                  {planNames[profile.plan_type]}
                </Badge>
                <span className="text-sm text-gray-600">
                  {profile.plan_type === 'vip' ? '无限次生成' : `每天 ${usageLimit} 次生成`}
                </span>
              </div>
            </div>
            <Crown className={`w-8 h-8 ${profile.plan_type === 'free' ? 'text-gray-400' : 'text-amber-500'}`} />
          </div>

          {profile.plan_type === 'free' && (
            <>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border-2 border-amber-200 mb-4">
                <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  升级到 Pro 版
                </h4>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    每天 10 次生成
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    独家爆款公式模板
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    爆款建议和发布技巧
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-600">✓</span>
                    解锁全部食物和场景
                  </li>
                </ul>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">¥29</span>
                  <span className="text-gray-600">/月</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  立即升级
                </Button>
              </div>

              <div className="text-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  查看所有套餐对比
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
