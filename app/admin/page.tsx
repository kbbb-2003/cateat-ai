'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Sparkles, TrendingUp, Crown } from 'lucide-react';

interface Stats {
  todayGenerations: number;
  totalUsers: number;
  paidUsers: number;
  proTemplateUsage: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayGenerations: 0,
    totalUsers: 0,
    paidUsers: 0,
    proTemplateUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: '今日生成次数',
      value: stats.todayGenerations,
      icon: Sparkles,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: '总用户数',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '付费用户数',
      value: stats.paidUsers,
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '专业模板使用率',
      value: `${stats.proTemplateUsage}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  if (loading) {
    return <div className="text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
