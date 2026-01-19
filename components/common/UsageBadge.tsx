'use client';

import { Badge } from '@/components/ui/badge';

interface UsageBadgeProps {
  used: number;
  limit: number;
  isUnlimited?: boolean;
  planType: 'free' | 'pro' | 'vip';
}

export function UsageBadge({ used, limit, isUnlimited, planType }: UsageBadgeProps) {
  if (isUnlimited) {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-700">
        无限次数 · 专业模式
      </Badge>
    );
  }

  const remaining = limit - used;
  const isLow = remaining <= 1;

  return (
    <Badge
      variant="outline"
      className={`${
        isLow
          ? 'border-red-500 text-red-700'
          : planType === 'free'
          ? 'border-gray-400 text-gray-700'
          : 'border-amber-500 text-amber-700'
      }`}
    >
      今日剩余 {remaining}/{limit} 次
      {planType !== 'free' && ' · 专业模式'}
    </Badge>
  );
}
