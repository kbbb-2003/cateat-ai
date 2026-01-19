'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function ResultComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Basic Version */}
      <Card className="p-6">
        <Badge variant="outline" className="mb-4">
          基础版（免费）
        </Badge>
        <h4 className="font-semibold mb-3 text-sm">图片提示词示例</h4>
        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Pixar 3D style close-up photograph of orange tabby cat positioned behind table, only head visible, looking at camera with big eyes, steaming ramen bowl with visible noodle texture in center, warm lighting, 8K
          </p>
        </div>
        <h4 className="font-semibold mb-2 text-sm">包含内容</h4>
        <ul className="text-xs text-gray-600 space-y-2">
          <li>✓ 图片提示词（简洁版）</li>
          <li>✓ 视频提示词（简洁版）</li>
          <li>✓ 画面说明</li>
          <li>✓ 音效建议</li>
        </ul>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">适合快速测试和基础使用</p>
        </div>
      </Card>

      {/* Professional Version */}
      <Card className="p-6 border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
        <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500">
          <Sparkles className="w-3 h-3 mr-1" />
          专业版（Pro/VIP）
        </Badge>
        <h4 className="font-semibold mb-3 text-sm">图片提示词示例</h4>
        <div className="bg-white p-3 rounded mb-4 border border-amber-200">
          <p className="text-xs text-gray-700 leading-relaxed">
            Pixar 3D animation style, close-up shot of adorable chubby orange tabby cat with fluffy fur and pink nose, positioned behind traditional wooden table, only head, neck and upper chest visible above table edge, lower body hidden, looking directly at camera with big round sparkling eyes and gentle smile, steaming bowl of ramen with golden wavy noodles, soft-boiled egg, rich savory broth, all food items fully visible within frame arranged in balanced center layout with even spacing, sharp focus on food with visible textures (noodle strands, egg yolk, broth surface), deep depth of field keeping both cat and food crisp, tight framing filling 90% of frame, warm cozy ambient lighting from soft overhead source, only distant background softly blurred, 8K ultra HD, hyper-detailed professional food photography, masterpiece
          </p>
        </div>
        <h4 className="font-semibold mb-2 text-sm">包含内容</h4>
        <ul className="text-xs text-gray-700 space-y-2">
          <li>✓ 专业级图片提示词（6部分结构）</li>
          <li>✓ 专业级视频提示词（详细分镜）</li>
          <li>✓ 画面说明</li>
          <li className="text-amber-700 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            爆款建议（发布时间、配乐、系列化）
          </li>
          <li>✓ 音效建议</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="text-xs text-amber-800 font-medium">独家专业吃播公式，效果接近专业博主</p>
        </div>
      </Card>
    </div>
  );
}
