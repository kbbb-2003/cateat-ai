'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Video, Copy, Check, Camera, Sparkles, Loader2, X, Wand2, Pencil, RefreshCw, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PRESET_ACTIONS, SOUND_OPTIONS } from '@/lib/data/video-actions';
import { GenerationModeIndicator } from '@/components/common/GenerationModeIndicator';
import { UsageBadge } from '@/components/common/UsageBadge';
import { GenerationProgress } from '@/components/common/GenerationProgress';
import { toast } from 'sonner';
import { buildVideoPrompt } from '@/lib/prompts/video-template';
import { compressImage } from '@/lib/utils/image-compression';
import { uploadImageToStorage } from '@/lib/supabase/storage';

export default function CreateVideoPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const isPremium = profile?.plan_type === 'pro' || profile?.plan_type === 'vip';

  // 输入模式
  const [inputMode, setInputMode] = useState<'manual' | 'upload'>('manual');

  // 图片上传相关
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Frame 描述（首帧画面）
  const [frameDescription, setFrameDescription] = useState('');

  // Action 描述（动作）
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [customAction, setCustomAction] = useState('');
  const [expandedAction, setExpandedAction] = useState('');

  // 音效选择
  const [selectedSound, setSelectedSound] = useState<string>('');

  // 最终结果
  const [videoPrompt, setVideoPrompt] = useState('');
  const [soundSuggestion, setSoundSuggestion] = useState('');
  const [tips, setTips] = useState('');

  // 加载状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 弹窗相关状态
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isEditingAction, setIsEditingAction] = useState(false);
  const [improvementText, setImprovementText] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  // 进度条状态
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [progressStatus, setProgressStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [progressError, setProgressError] = useState('');

  // 切换动作选择
  const toggleAction = (actionId: string) => {
    setSelectedActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
    // 清除之前的扩写结果
    setExpandedAction('');
  };

  // 图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小
      if (file.size > 10 * 1024 * 1024) {
        toast.error('图片大小不能超过 10MB');
        return;
      }

      setUploadedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);

      // 立即压缩图片
      try {
        toast.info('正在压缩图片...');
        const compressed = await compressImage(file, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.8,
          outputFormat: 'image/jpeg',
        });
        setCompressedBlob(compressed);
        toast.success('图片压缩完成');
      } catch (error) {
        console.error('图片压缩失败:', error);
        toast.error('图片压缩失败，请重试');
      }
    }
  };

  // 移除图片
  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setCompressedBlob(null);
  };

  // 步骤 1: 分析图片（Gemini）
  const handleAnalyzeImage = async () => {
    if (!compressedBlob) {
      toast.error('请先上传并等待图片压缩完成');
      return;
    }

    if (!profile?.id) {
      toast.error('请先登录');
      return;
    }

    setIsAnalyzing(true);
    setIsUploading(true);

    try {
      // 步骤 1: 上传到 Supabase Storage
      toast.info('正在上传图片...');
      const uploadResult = await uploadImageToStorage(compressedBlob, profile.id);

      if (!uploadResult.success || !uploadResult.url) {
        toast.error(uploadResult.error || '图片上传失败');
        setIsAnalyzing(false);
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
      toast.success('图片上传成功');

      // 步骤 2: 调用分析接口（传 URL 而非文件）
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadResult.url,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFrameDescription(data.description);
        toast.success('图片分析完成');
      } else {
        toast.error(data.error || '分析失败');
      }
    } catch (error) {
      toast.error('图片分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  // 步骤 2: 扩写动作（DeepSeek）
  const handleExpandAction = async () => {
    // 获取选中动作的中文标签
    const selectedActionLabels = selectedActions.map(actionId => {
      const action = PRESET_ACTIONS
        .flatMap(c => c.actions)
        .find(a => a.id === actionId);
      return action?.label || '';
    }).filter(Boolean);

    if (selectedActionLabels.length === 0 && !customAction.trim()) {
      toast.error('请选择或输入动作描述');
      return;
    }

    setIsExpanding(true);
    try {
      const response = await fetch('/api/expand-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actions: selectedActionLabels,
          customAction: customAction.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExpandedAction(data.expandedAction);
        toast.success('动作扩写完成');
      } else {
        toast.error(data.error || '扩写失败');
      }
    } catch (error) {
      toast.error('动作扩写失败，请重试');
    } finally {
      setIsExpanding(false);
    }
  };

  // 步骤 3: 生成最终视频提示词
  const handleGenerateVideoPrompt = async () => {
    if (!frameDescription.trim()) {
      toast.error('请先填写或通过图片分析获取画面描述');
      return;
    }

    // 初始化进度条
    setShowProgress(true);
    setProgress(0);
    setProgressStatus('loading');
    setProgressError('');

    // 模拟进度增长
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += Math.random() * 6;
      if (currentProgress >= 85) {
        currentProgress = 85;
        clearInterval(progressInterval);
      }
      setProgress(Math.round(currentProgress));
    }, 400);

    // 确定最终的动作描述
    let finalActionDescription = expandedAction;

    // 如果没有扩写过，但有动作输入，先进行扩写
    if (!finalActionDescription && (selectedActions.length > 0 || customAction.trim())) {
      // 获取选中动作的中文标签
      const selectedActionLabels = selectedActions.map(actionId => {
        const action = PRESET_ACTIONS
          .flatMap(c => c.actions)
          .find(a => a.id === actionId);
        return action?.label || '';
      }).filter(Boolean);

      setProgressStep('AI 扩写动作中...');
      setProgress(10);

      setIsExpanding(true);
      try {
        const expandResponse = await fetch('/api/expand-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actions: selectedActionLabels,
            customAction: customAction.trim(),
          }),
        });

        const expandData = await expandResponse.json();
        if (expandData.success) {
          finalActionDescription = expandData.expandedAction;
          setExpandedAction(expandData.expandedAction);
          setProgress(35);
        } else {
          clearInterval(progressInterval);
          setProgressStatus('error');
          setProgressStep('动作扩写失败');
          setProgressError('动作扩写失败，请重试');
          toast.error('动作扩写失败');
          setIsExpanding(false);
          return;
        }
      } catch (error) {
        clearInterval(progressInterval);
        setProgressStatus('error');
        setProgressStep('动作扩写失败');
        setProgressError('动作扩写失败，请重试');
        toast.error('动作扩写失败');
        setIsExpanding(false);
        return;
      }
      setIsExpanding(false);
    }

    if (!finalActionDescription) {
      clearInterval(progressInterval);
      setProgressStatus('error');
      setProgressStep('请填写动作描述');
      setProgressError('请填写动作描述');
      toast.error('请填写动作描述');
      return;
    }

    setProgressStep('AI 生成视频提示词...');
    setProgress(50);

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-video-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameDescription: frameDescription.trim(),
          actionDescription: finalActionDescription,
          soundOption: selectedSound,
        }),
      });

      clearInterval(progressInterval);

      const data = await response.json();
      if (data.success) {
        setProgressStep('优化输出...');
        setProgress(90);

        await new Promise(resolve => setTimeout(resolve, 300));

        setVideoPrompt(data.videoPrompt);
        setSoundSuggestion(data.soundSuggestion || '');
        setTips(data.tips || '');

        setProgress(100);
        setProgressStep('完成 ✓');
        setProgressStatus('success');

        setTimeout(() => {
          setShowProgress(false);
          setShowResultDialog(true);
        }, 1000);

        toast.success('视频提示词生成成功');
      } else {
        setProgress(100);
        setProgressStatus('error');
        setProgressStep('生成失败');
        setProgressError(data.error || '生成失败，请重试');
        toast.error(data.error || '生成失败');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(100);
      setProgressStatus('error');
      setProgressStep('生成失败');
      setProgressError('生成失败，请重试');
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 复制提示词
  const handleCopy = async () => {
    await navigator.clipboard.writeText(videoPrompt);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  // 改进动作描述
  const handleImproveAction = async () => {
    console.log('=== handleImproveAction 开始 ===');
    console.log('improvementText:', improvementText);
    console.log('expandedAction:', expandedAction);

    if (!improvementText.trim()) {
      toast.error('请输入改进意见');
      return;
    }

    if (!expandedAction) {
      toast.error('没有可改进的动作描述');
      return;
    }

    setIsImproving(true);
    try {
      console.log('发送改进请求...');
      const response = await fetch('/api/improve-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalAction: expandedAction,
          improvement: improvementText.trim(),
        }),
      });

      console.log('响应状态:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (data.success) {
        console.log('改进成功，更新状态...');
        setExpandedAction(data.improvedAction);

        // 判断是否选择了「博主同款」音效（仅专业版可用）
        const includeSound = isPremium && selectedSound === 'blogger_style';
        console.log('isPremium:', isPremium, 'includeSound:', includeSound);

        // 根据用户版本生成提示词
        const newPrompt = buildVideoPrompt(
          frameDescription.trim(),
          data.improvedAction,
          {
            isPremium,
            includeSound,
          }
        );
        console.log('新提示词生成完成');

        setVideoPrompt(newPrompt);
        setImprovementText('');
        setIsEditingAction(false);
        toast.success('动作描述已更新');
      } else {
        console.error('改进失败:', data.error);
        toast.error(data.error || '改进失败');
      }
    } catch (error) {
      console.error('=== handleImproveAction 错误 ===');
      console.error('错误详情:', error);
      toast.error('改进失败，请重试');
    } finally {
      setIsImproving(false);
      console.log('=== handleImproveAction 结束 ===');
    }
  };

  // 判断是否可以生成
  const usageLimit = profile?.plan_type === 'vip' ? Infinity : profile?.plan_type === 'pro' ? 5 : 3;
  const remainingUsage = usageLimit === Infinity ? Infinity : usageLimit - (profile?.daily_usage || 0);
  const hasUsageLeft = remainingUsage > 0;

  const canGenerate = frameDescription.trim().length > 0 &&
    (selectedActions.length > 0 || customAction.trim() || expandedAction) &&
    hasUsageLeft;

  return (
    <div className="page-gradient-bg">
      {/* 装饰性猫爪 */}
      <div className="paw-decoration top-right hidden md:block">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor" className="text-orange-500">
          <ellipse cx="50" cy="65" rx="30" ry="25"/>
          <circle cx="25" cy="35" r="12"/>
          <circle cx="50" cy="25" r="12"/>
          <circle cx="75" cy="35" r="12"/>
          <circle cx="35" cy="50" r="10"/>
          <circle cx="65" cy="50" r="10"/>
        </svg>
      </div>

      <div className="max-w-2xl mx-auto p-4 pb-20 relative z-10">
        {/* 顶部状态 */}
        <div className="flex items-center justify-between mb-4">
          <GenerationModeIndicator mode={isPremium ? 'professional' : 'basic'} />
          <UsageBadge
            used={profile?.daily_usage || 0}
            limit={profile?.plan_type === 'vip' ? Infinity : profile?.plan_type === 'pro' ? 5 : 3}
            isUnlimited={profile?.plan_type === 'vip'}
            planType={profile?.plan_type || 'free'}
          />
        </div>

        <Card className="card-enhanced p-5 space-y-5 rounded-xl">
        {/* 生成类型选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">生成类型</label>
          <Tabs value="video" onValueChange={(v) => {
            if (v === 'image') {
              router.push('/create');
            }
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">
                <Camera className="w-4 h-4 mr-2" />
                图片提示词
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="w-4 h-4 mr-2" />
                视频提示词
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ========== 步骤 1: 首帧画面描述 ========== */}
        <div className="space-y-3">
          <label className="section-title text-sm">
            <span>🎬</span> 首帧画面描述 <span className="text-red-500 ml-1">*</span>
          </label>

          {/* Tab 切换按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                inputMode === 'manual'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <Pencil className="w-4 h-4" />
              手动输入
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                inputMode === 'upload'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <Camera className="w-4 h-4" />
              图片分析
            </button>
          </div>

          {/* 图片上传模式 */}
          {inputMode === 'upload' && (
            <div className="space-y-3">
              {/* 图片上传区域 */}
              {!imagePreviewUrl ? (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors bg-orange-50/30">
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-12 h-12 mb-3 rounded-full bg-orange-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="text-orange-500 font-medium">点击上传图片</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">支持 PNG, JPG, WEBP (最大 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreviewUrl}
                    alt="预览"
                    className="w-full max-h-48 object-contain rounded-lg border bg-gray-50"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {imagePreviewUrl && (
                <Button
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing || !compressedBlob}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      上传中...
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gemini 分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI 分析图片
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* 画面描述文本框 */}
          <Textarea
            placeholder={inputMode === 'upload'
              ? '上传图片后点击分析，AI 会自动识别画面内容...'
              : '描述首帧画面，例如：A cute fluffy ginger cat wearing a light blue fuzzy hoodie with a pink bow, sitting at a wooden table with delicious food in front...'
            }
            value={frameDescription}
            onChange={(e) => setFrameDescription(e.target.value)}
            className="min-h-[100px] resize-none input-enhanced transition-all duration-200"
          />
          {frameDescription && inputMode === 'upload' && (
            <p className="text-xs text-green-600">✅ 图片分析完成，可以手动编辑修改</p>
          )}
        </div>

        {/* ========== 步骤 2: 动作描述 ========== */}
        <div className="space-y-3">
          <label className="section-title text-sm">
            <span>🎭</span> 动作类型 <span className="text-gray-400 text-xs ml-1 font-normal">（可多选）</span>
          </label>

          {/* 已选动作显示 */}
          {selectedActions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-3 bg-orange-50 rounded-lg border border-orange-100">
              {selectedActions.map(actionId => {
                const action = PRESET_ACTIONS
                  .flatMap(c => c.actions)
                  .find(a => a.id === actionId);
                return (
                  <span
                    key={actionId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-sm rounded-full tag-badge"
                  >
                    {action?.label}
                    <button
                      onClick={() => toggleAction(actionId)}
                      className="hover:bg-orange-600 rounded-full p-0.5 transition-colors"
                      aria-label="删除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* 分类选择区域 */}
          <div className="space-y-3">
            {PRESET_ACTIONS.map(category => (
              <div key={category.id}>
                <p className="text-xs text-gray-500 mb-2">{category.label}</p>
                <div className="flex flex-wrap gap-2">
                  {category.actions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => toggleAction(action.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        selectedActions.includes(action.id)
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 自定义动作输入 */}
          <Textarea
            placeholder="或输入自定义动作，例如：猫咪挥手打招呼，然后拿起一块食物咬一口..."
            value={customAction}
            onChange={(e) => {
              setCustomAction(e.target.value);
              setExpandedAction(''); // 清除之前的扩写结果
            }}
            className="min-h-[70px] resize-none input-enhanced transition-all duration-200"
          />

          {/* 扩写按钮 */}
          <Button
            onClick={handleExpandAction}
            disabled={isExpanding || (selectedActions.length === 0 && !customAction.trim())}
            variant="outline"
            className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
          >
            {isExpanding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gemini 扩写中...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                AI 扩写动作描述（Gemini）
              </>
            )}
          </Button>

          {/* 扩写结果预览 */}
          {expandedAction && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-600 mb-2 font-medium">✅ 动作扩写完成：</p>
              <p className="text-sm text-gray-700 leading-relaxed">{expandedAction}</p>
            </div>
          )}
        </div>

        {/* ========== 步骤 3: 音效推荐 ========== */}
        <div className="space-y-3">
          <label className="section-title text-sm">
            <span>🎵</span> 音效推荐 <span className="text-gray-400 text-xs ml-1 font-normal">（可选）</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {SOUND_OPTIONS.map(option => {
              // 博主同款仅专业版可用
              const isLocked = option.id === 'blogger_style' && !isPremium;

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (isLocked) {
                      toast.error('「博主同款」音效仅限专业版用户使用，请升级解锁');
                      return;
                    }
                    setSelectedSound(selectedSound === option.id ? '' : option.id);
                  }}
                  disabled={option.isPro && !isPremium && option.id !== 'blogger_style'}
                  className={`relative p-3 rounded-lg border text-left transition-all ${
                    selectedSound === option.id
                      ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500'
                      : isLocked
                        ? 'border-gray-200 bg-gray-50 cursor-pointer hover:border-orange-200'
                        : option.isPro && !isPremium
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {/* 锁定图标（博主同款 - 免费用户） */}
                  {isLocked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* 推荐标签（博主同款 - 付费用户） */}
                  {!isLocked && option.id === 'blogger_style' && isPremium && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full font-bold shadow-sm">
                      推荐
                    </div>
                  )}

                  {/* PRO 标签（其他付费选项） */}
                  {option.isPro && option.id !== 'blogger_style' && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full">
                      PRO
                    </span>
                  )}

                  <div className="font-medium text-sm flex items-center gap-1">
                    {option.label}
                    {isLocked && <span className="text-xs text-gray-400">🔒</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>

                  {/* 选中勾选 */}
                  {selectedSound === option.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 免费用户提示 */}
          {!isPremium && (
            <p className="text-xs text-gray-500">
              💡 升级到专业版解锁「博主同款」音效推荐
            </p>
          )}
        </div>

        {/* ========== 结果展示 ========== */}
        {videoPrompt && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="section-title text-sm">📹 视频提示词</label>
                {isPremium ? (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                    专业版
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    基础版
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </>
                )}
              </Button>
            </div>

            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border leading-relaxed">
              {videoPrompt}
            </pre>

            {soundSuggestion && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎵</span>
                  <span className="text-sm font-medium text-orange-700">音效建议</span>
                </div>
                <p className="text-sm text-orange-800">{soundSuggestion}</p>
              </div>
            )}

            {tips && (
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 {tips}
              </p>
            )}
          </div>
        )}
      </Card>
      </div>

      {/* 生成按钮 - 固定在底部 */}
      <div className="fixed bottom-0 left-0 right-0 bottom-bar shadow-lg p-3 z-10">
        <div className="max-w-2xl mx-auto">
          {/* 进度条 */}
          <GenerationProgress
            isVisible={showProgress}
            progress={progress}
            step={progressStep}
            status={progressStatus}
            errorMessage={progressError}
            onRetry={progressStatus === 'error' ? handleGenerateVideoPrompt : undefined}
          />

          <Button
            onClick={handleGenerateVideoPrompt}
            disabled={isGenerating || isExpanding || !canGenerate}
            className="w-full btn-generate h-12 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl"
          >
            {isExpanding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                扩写动作中...
              </>
            ) : isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : !hasUsageLeft ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                今日次数已用完
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2 sparkle" />
                生成视频提示词
              </>
            )}
          </Button>
          {profile && (
            <p className="text-xs text-center text-gray-500 mt-1.5">
              {profile.plan_type === 'free' && (
                remainingUsage > 0
                  ? `今日剩余 ${remainingUsage}/3 次`
                  : '今日次数已用完，升级解锁更多次数'
              )}
              {profile.plan_type === 'pro' && (
                remainingUsage > 0
                  ? `今日剩余 ${remainingUsage}/5 次`
                  : '今日次数已用完，明天再来吧'
              )}
              {profile.plan_type === 'vip' && '无限次数'}
            </p>
          )}
        </div>
      </div>

      {/* 结果弹窗 */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📹 视频提示词生成结果
              {isPremium ? (
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
                  专业版
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                  基础版
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 升级提示（仅基础版显示） */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-700 font-medium mb-1">
                  💡 升级到专业版，解锁完整专业模板
                </p>
                <p className="text-xs text-purple-600">
                  专业版包含：视觉一致性控制、画面色调保持、博主同款音效描述等高级功能
                </p>
              </div>
            )}

            {/* 完整提示词 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">完整提示词</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      复制
                    </>
                  )}
                </Button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border leading-relaxed max-h-48 overflow-y-auto">
                {videoPrompt}
              </pre>
            </div>

            {/* 动作描述部分 - 可编辑 */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">🎬 动作描述</h3>
                {!isEditingAction && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingAction(true)}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                )}
              </div>

              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-700 leading-relaxed">{expandedAction}</p>
              </div>

              {/* 编辑模式 */}
              {isEditingAction && (
                <div className="mt-3 space-y-3">
                  <div>
                    <Label className="text-sm text-gray-600 mb-1.5 block">输入改进意见</Label>
                    <Textarea
                      placeholder="例如：动作再慢一点、添加眨眼的细节、让猫咪先看向食物再拿起来..."
                      value={improvementText}
                      onChange={(e) => setImprovementText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImproveAction}
                      disabled={isImproving || !improvementText.trim()}
                      className="flex-1 bg-purple-500 hover:bg-purple-600"
                    >
                      {isImproving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          重新生成中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          重新生成动作
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingAction(false);
                        setImprovementText('');
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 音效建议 */}
            {soundSuggestion && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🎵</span>
                  <span className="text-sm font-medium text-orange-700">音效建议</span>
                </div>
                <p className="text-sm text-orange-800">{soundSuggestion}</p>
              </div>
            )}

            {/* 使用提示 */}
            {tips && (
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 {tips}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
