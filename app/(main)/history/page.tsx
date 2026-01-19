'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/CopyButton';
import { Clock, Star, Image, Video } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

type PromptType = 'image' | 'video';

export default function HistoryPage() {
  const { user } = useProfile();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PromptType>('image');

  const fetchHistory = useCallback(async (type: PromptType) => {
    if (!user) return;

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('prompts_history')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory(activeTab);
  }, [user, activeTab, fetchHistory]);

  // 根据 generation_mode 获取标签样式和文本
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'professional':
      case 'pro':
        return {
          text: '专业版',
          className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        };
      case 'vip':
        return {
          text: 'VIP',
          className: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
        };
      case 'basic':
      default:
        return {
          text: '基础版',
          className: 'bg-gray-100 text-gray-600',
        };
    }
  };

  // 获取要显示的提示词内容
  const getPromptContent = (item: any) => {
    if (activeTab === 'video') {
      // 视频类型：优先使用 video_prompt，兼容旧数据使用 image_prompt
      return item.video_prompt || item.image_prompt || '';
    }
    // 图片类型：使用 image_prompt
    return item.image_prompt || '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">历史记录</h1>
        <p className="text-gray-600">查看和复用之前生成的提示词</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'image'
              ? 'border-orange-500 bg-orange-50 text-orange-600'
              : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          <Image className="w-4 h-4" />
          图片提示词
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
            activeTab === 'video'
              ? 'border-orange-500 bg-orange-50 text-orange-600'
              : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          <Video className="w-4 h-4" />
          视频提示词
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : history.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">{activeTab === 'image' ? '🖼️' : '🎬'}</div>
          <h3 className="font-semibold text-lg mb-2">暂无{activeTab === 'image' ? '图片' : '视频'}提示词记录</h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'image' ? '去生成你的第一个图片提示词吧' : '去生成你的第一个视频提示词吧'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const modeLabel = getModeLabel(item.generation_mode);
            const promptContent = getPromptContent(item);

            return (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {activeTab === 'image' ? '图片提示词' : '视频提示词'}
                        </h3>
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
                  <Badge
                    variant="outline"
                    className={modeLabel.className}
                  >
                    {modeLabel.text}
                  </Badge>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {promptContent}
                  </p>
                </div>

                <div className="flex gap-2">
                  <CopyButton
                    text={promptContent}
                    label={activeTab === 'image' ? '复制图片提示词' : '复制视频提示词'}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
