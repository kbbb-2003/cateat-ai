'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface GenerationModeIndicatorProps {
  mode: 'basic' | 'professional';
  templateName?: string;
}

export function GenerationModeIndicator({
  mode,
  templateName,
}: GenerationModeIndicatorProps) {
  if (mode === 'basic') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
        <span>🎨</span>
        <span className="font-medium">基础模式</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow-md">
      <Sparkles className="w-4 h-4" />
      <span className="font-medium">
        专业模式 {templateName && `· ${templateName}`}
      </span>
    </div>
  );
}
