'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';

export function UpgradePrompt() {
  return (
    <Card className="border-2 border-dashed border-amber-400 bg-amber-50/50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            🚀 升级到 Pro 获取更多
          </h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>每天 10 次生成（免费版仅 1 次）</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>独家爆款公式，提示词质量更高</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>爆款建议和发布技巧</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-4 h-4 text-amber-600" />
              <span>解锁全部食物和场景</span>
            </li>
          </ul>
          <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            立即升级
          </Button>
        </div>
      </div>
    </Card>
  );
}
