'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/CopyButton';
import { Clock, Star } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

export default function HistoryPage() {
  const { user } = useProfile();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();
    supabase
      .from('prompts_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching history:', error);
        } else {
          setHistory(data || []);
        }
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-gray-600">查看和复用之前生成的提示词</p>
      </div>

      {history.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-semibold text-lg mb-2">暂无历史记录</h3>
          <p className="text-sm text-gray-600">开始生成你的第一个提示词吧</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">生成记录</h3>
                      {item.is_favorite && (
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.mode === 'professional' ? 'default' : 'outline'}
                    className={
                      item.mode === 'professional'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : ''
                    }
                  >
                    {item.mode === 'professional' ? '专业版' : '基础版'}
                  </Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {item.image_prompt}
                </p>
              </div>

              <div className="flex gap-2">
                <CopyButton text={item.image_prompt} label="复制图片提示词" />
                <CopyButton text={item.video_prompt} label="复制视频提示词" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
