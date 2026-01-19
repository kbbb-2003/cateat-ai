'use client';

import { useEffect, useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationProgressProps {
  isVisible: boolean;
  progress: number; // 0-100
  step: string; // 当前步骤描述
  status: 'loading' | 'success' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}

export function GenerationProgress({
  isVisible,
  progress,
  step,
  status,
  errorMessage,
  onRetry,
}: GenerationProgressProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setFadeOut(false);
    } else {
      // 淡出动画
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className={`transition-all duration-300 ${
        fadeOut ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <div
        className={`rounded-lg border p-4 mb-3 ${
          status === 'success'
            ? 'bg-green-50 border-green-200'
            : status === 'error'
            ? 'bg-red-50 border-red-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        {/* 标题行 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {status === 'loading' && <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />}
            {status === 'success' && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </div>
            )}
            <span
              className={`text-sm font-medium ${
                status === 'success'
                  ? 'text-green-700'
                  : status === 'error'
                  ? 'text-red-700'
                  : 'text-orange-700'
              }`}
            >
              {status === 'success' ? '✨ 生成完成' : status === 'error' ? '生成失败' : '✨ 正在生成...'}
            </span>
          </div>
          <span
            className={`text-sm font-semibold ${
              status === 'success'
                ? 'text-green-700'
                : status === 'error'
                ? 'text-red-700'
                : 'text-orange-700'
            }`}
          >
            {progressPercentage}%
          </span>
        </div>

        {/* 进度条 */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${
              status === 'success'
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : status === 'error'
                ? 'bg-gradient-to-r from-red-400 to-red-500'
                : 'bg-gradient-to-r from-amber-400 to-orange-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* 步骤描述 */}
        <p
          className={`text-xs ${
            status === 'success'
              ? 'text-green-600'
              : status === 'error'
              ? 'text-red-600'
              : 'text-orange-600'
          }`}
        >
          {status === 'error' && errorMessage ? errorMessage : step}
        </p>

        {/* 错误时显示重试按钮 */}
        {status === 'error' && onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="outline"
            className="mt-3 w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            重试
          </Button>
        )}
      </div>
    </div>
  );
}
