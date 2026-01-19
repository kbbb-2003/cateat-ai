'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ChevronDown, X, Search, Sparkles, Lock, Camera, Video } from 'lucide-react';
import { GenerationModeIndicator } from '@/components/common/GenerationModeIndicator';
import { UsageBadge } from '@/components/common/UsageBadge';
import { CopyButton } from '@/components/common/CopyButton';

const MAX_FOODS = 5;

const FOOD_CATEGORIES = {
  fruit: { name: '水果', emoji: '🍎' },
  main: { name: '主食', emoji: '🍚' },
  snack: { name: '零食', emoji: '🍪' },
  drink: { name: '饮品', emoji: '🥤' },
  exotic: { name: '猎奇', emoji: '🌶️', premium: true },
};

export default function CreatePage() {
  const router = useRouter();
  const { profile, user } = useProfile();
  const [loading, setLoading] = useState(false);

  // 生成类型
  const [generateType, setGenerateType] = useState<'image' | 'video'>('image');

  // 数据
  const [cats, setCats] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [emotions, setEmotions] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);

  // 猫咪选择
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [customCatDescription, setCustomCatDescription] = useState('');

  // 风格和食物
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState('');
  const [customFoods, setCustomFoods] = useState<string[]>([]);

  // 情绪
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  // 场景
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [customSceneDetails, setCustomSceneDetails] = useState('');

  // 额外要求
  const [extraRequirements, setExtraRequirements] = useState('');

  // 食物搜索和折叠
  const [foodSearch, setFoodSearch] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>(['fruit']);

  // 结果
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const supabase = createClient();

    const [catsRes, stylesRes, foodsRes, emotionsRes, scenesRes] = await Promise.all([
      supabase.from('cats').select('*').eq('is_preset', true).order('created_at', { ascending: true }),
      supabase.from('visual_styles').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('foods').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('emotions').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('scenes').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
    ]);

    if (catsRes.data) setCats(catsRes.data);
    if (stylesRes.data) setStyles(stylesRes.data);
    if (foodsRes.data) setFoods(foodsRes.data);
    if (emotionsRes.data) setEmotions(emotionsRes.data);
    if (scenesRes.data) setScenes(scenesRes.data);
  };

  const totalFoodsCount = selectedFoods.length + customFoods.length;
  const canAddMore = totalFoodsCount < MAX_FOODS;

  const addCustomFood = () => {
    const trimmed = customFood.trim();
    if (trimmed && !customFoods.includes(trimmed) && canAddMore) {
      setCustomFoods(prev => [...prev, trimmed]);
      setCustomFood('');
    }
  };

  const removeCustomFood = (food: string) => {
    setCustomFoods(prev => prev.filter(f => f !== food));
  };

  const handleCustomFoodKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomFood();
    }
  };

  const toggleFood = (foodId: string) => {
    if (selectedFoods.includes(foodId)) {
      setSelectedFoods(prev => prev.filter(id => id !== foodId));
    } else if (canAddMore) {
      setSelectedFoods(prev => [...prev, foodId]);
    }
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(id => id !== foodId));
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
    food.name_en.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const foodsByCategory = Object.entries(FOOD_CATEGORIES).map(([key, meta]) => ({
    key,
    name: meta.name,
    emoji: meta.emoji,
    premium: (meta as any).premium || false,
    foods: filteredFoods.filter(f => f.category === key),
  }));

  const handleGenerate = async () => {
    // 验证必填项
    if (!selectedStyle) {
      toast.error('请选择视觉风格');
      return;
    }
    if (!selectedCat && !customCatDescription.trim()) {
      toast.error('请选择预设猫咪或输入自定义猫咪描述');
      return;
    }
    if (selectedFoods.length === 0 && customFoods.length === 0) {
      toast.error('请至少选择或输入一种食物');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generateType,
          catId: selectedCat || undefined,
          customCatDescription: customCatDescription.trim() || undefined,
          styleId: selectedStyle,
          foodIds: selectedFoods,
          customFoods,
          emotionId: selectedEmotion || undefined,
          sceneId: selectedScene || undefined,
          customSceneDetails: customSceneDetails.trim() || undefined,
          extraRequirements: extraRequirements.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.data);
      setShowResult(true);
      toast.success('生成成功！');
    } catch (error: any) {
      toast.error(error.message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = profile?.plan_type === 'pro' || profile?.plan_type === 'vip';
  const selectedCatData = cats.find(c => c.id === selectedCat);
  const selectedStyleData = styles.find(s => s.id === selectedStyle);
  const selectedEmotionData = emotions.find(e => e.id === selectedEmotion);
  const selectedSceneData = scenes.find(s => s.id === selectedScene);
  const selectedFoodsData = foods.filter(f => selectedFoods.includes(f.id));

  const canGenerate = selectedStyle && (selectedCat || customCatDescription.trim()) && (selectedFoods.length > 0 || customFoods.length > 0);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* 顶部状态 */}
      <div className="flex items-center justify-between mb-4">
        <GenerationModeIndicator mode={isPremium ? 'professional' : 'basic'} />
        <UsageBadge
          used={profile?.daily_usage || 0}
          limit={profile?.plan_type === 'vip' ? Infinity : profile?.plan_type === 'pro' ? Infinity : Infinity}
          isUnlimited={profile?.plan_type === 'vip' || profile?.plan_type === 'pro' || profile?.plan_type === 'free'}
          planType={profile?.plan_type || 'free'}
        />
      </div>

      <Card className="p-4 space-y-4">
        {/* 生成类型选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">生成类型</label>
          <Tabs value={generateType} onValueChange={(v) => {
            if (v === 'video') {
              router.push('/create-video');
            } else {
              setGenerateType(v as 'image' | 'video');
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

        {/* 猫咪选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            猫咪形象 <span className="text-red-500 ml-1">*</span>
          </label>
          <Select value={selectedCat || 'none'} onValueChange={(v) => setSelectedCat(v === 'none' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择预设猫咪（可选）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不选择预设</SelectItem>
              <SelectGroup>
                <SelectLabel>预设猫咪</SelectLabel>
                {cats.filter(c => c.is_preset).map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} - {cat.breed}
                  </SelectItem>
                ))}
              </SelectGroup>
              {cats.filter(c => !c.is_preset && c.user_id === user?.id).length > 0 && (
                <SelectGroup>
                  <SelectLabel>我的猫咪</SelectLabel>
                  {cats.filter(c => !c.is_preset && c.user_id === user?.id).map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} - {cat.breed}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="或输入自定义猫咪描述，例如：一只蓝眼睛的白色布偶猫，毛茸茸的，戴着红色蝴蝶结..."
            value={customCatDescription}
            onChange={(e) => setCustomCatDescription(e.target.value)}
            rows={2}
            className="resize-none min-h-[60px]"
          />
        </div>

        {/* 视觉风格 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            视觉风格 <span className="text-red-500 ml-1">*</span>
          </label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="选择视觉风格" />
            </SelectTrigger>
            <SelectContent>
              {styles.map(style => (
                <SelectItem
                  key={style.id}
                  value={style.id}
                  disabled={style.is_premium && !isPremium}
                >
                  <div className="flex items-center gap-2">
                    {style.is_premium && !isPremium && <Lock className="w-3 h-3" />}
                    <span>{style.name}</span>
                    <span className="text-xs text-gray-500">- {style.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 食物选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            选择食物 <span className="text-red-500 ml-1">*</span>
            <span className="text-xs text-gray-400 ml-2">
              已选 {totalFoodsCount}/{MAX_FOODS} 种
            </span>
          </label>

          {/* 自定义食物输入 */}
          <div className="mb-2">
            <div className="flex gap-2">
              <Input
                placeholder="输入自定义食物，如：烤鸡翅、芝士蛋糕..."
                value={customFood}
                onChange={(e) => setCustomFood(e.target.value)}
                onKeyDown={handleCustomFoodKeyDown}
                disabled={!canAddMore}
              />
              <Button
                type="button"
                onClick={addCustomFood}
                disabled={!customFood.trim() || !canAddMore}
                variant="outline"
              >
                添加
              </Button>
            </div>
          </div>

          {/* 已添加的自定义食物 */}
          {customFoods.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">已添加:</div>
              <div className="flex flex-wrap gap-1.5">
                {customFoods.map(food => (
                  <Badge
                    key={food}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                  >
                    <span>{food}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomFood(food)}
                      className="hover:bg-green-700 rounded-full p-0.5 transition-colors"
                      aria-label="删除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 预设食物搜索 */}
          <div className="text-xs text-gray-500 mb-1.5">或从预设中选择:</div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索食物..."
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 已选预设食物标签 */}
          {selectedFoods.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">已选:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedFoodsData.map(food => (
                  <Badge
                    key={food.id}
                    className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1"
                  >
                    <span>{food.emoji} {food.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFood(food.id)}
                      className="hover:bg-amber-700 rounded-full p-0.5 transition-colors"
                      aria-label="删除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 分类折叠列表 */}
          <div className="space-y-1.5 border rounded-lg p-2.5 max-h-80 overflow-y-auto">
            {foodsByCategory.map(({ key, name, emoji, premium, foods: categoryFoods }) => (
              <Collapsible
                key={key}
                open={openCategories.includes(key)}
                onOpenChange={() => toggleCategory(key)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{emoji}</span>
                    <span className="text-sm font-medium">{name}</span>
                    {premium && <Lock className="w-3 h-3 text-amber-500" />}
                    <span className="text-xs text-gray-400">({categoryFoods.length})</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openCategories.includes(key) ? 'rotate-180' : ''
                    }`}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 pt-1.5 space-y-1.5">
                  {categoryFoods.map(food => {
                    const isSelected = selectedFoods.includes(food.id);
                    const isDisabled = !isSelected && !canAddMore;
                    const isPremiumFood = food.is_premium && !isPremium;

                    return (
                      <div
                        key={food.id}
                        className={`flex items-center gap-2 p-1.5 rounded ${
                          isDisabled || isPremiumFood ? 'opacity-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => !isPremiumFood && toggleFood(food.id)}
                          disabled={isDisabled || isPremiumFood}
                        />
                        <span className="text-sm">{food.emoji}</span>
                        <span className="text-sm">{food.name}</span>
                        {food.is_premium && <Lock className="w-3 h-3 text-amber-500" />}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>

        {/* 情绪/动作（可选） */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            情绪/动作 <span className="text-gray-400 text-xs ml-1">（可选）</span>
          </label>
          <Select value={selectedEmotion || 'none'} onValueChange={(v) => setSelectedEmotion(v === 'none' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择情绪" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不选择 / 无特定情绪</SelectItem>
              {['happy', 'surprised', 'uncomfortable', 'funny'].map(category => (
                <SelectGroup key={category}>
                  <SelectLabel>
                    {category === 'happy' && '😊 开心'}
                    {category === 'surprised' && '😲 惊讶'}
                    {category === 'uncomfortable' && '😖 难受'}
                    {category === 'funny' && '😂 搞笑'}
                  </SelectLabel>
                  {emotions.filter(e => e.category === category).map(emotion => (
                    <SelectItem key={emotion.id} value={emotion.id}>
                      {emotion.emoji} {emotion.name} - {emotion.description}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 场景选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            场景与环境 <span className="text-gray-400 text-xs ml-1">（可选）</span>
          </label>
          <Select value={selectedScene || 'none'} onValueChange={(v) => setSelectedScene(v === 'none' ? null : v)}>
            <SelectTrigger>
              <SelectValue placeholder="选择预设场景（可选）" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不选择预设</SelectItem>
              {scenes.map(scene => (
                <SelectItem
                  key={scene.id}
                  value={scene.id}
                  disabled={scene.is_premium && !isPremium}
                >
                  <div className="flex items-center gap-2">
                    {scene.is_premium && !isPremium && <Lock className="w-3 h-3" />}
                    <span>{scene.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="或补充环境细节，例如：木质餐桌、柔和的窗边光线、背景有绿植..."
            value={customSceneDetails}
            onChange={(e) => setCustomSceneDetails(e.target.value)}
            rows={2}
            className="resize-none min-h-[60px]"
          />
        </div>

        {/* 额外要求 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            额外要求 <span className="text-gray-400 text-xs ml-1">（可选）</span>
          </label>
          <Textarea
            placeholder="其他想要的效果，例如：浅景深、暖色调、俯拍角度、食物冒热气..."
            value={extraRequirements}
            onChange={(e) => setExtraRequirements(e.target.value)}
            rows={2}
            className="resize-none min-h-[60px]"
          />
        </div>

        {/* 当前选择摘要 */}
        {canGenerate && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded">
            {selectedCatData?.name || '自定义猫咪'} · {selectedStyleData?.name} ·
            {[...selectedFoodsData.map(f => f.name), ...customFoods].join('、')}
            {selectedEmotionData && ` · ${selectedEmotionData.name}`}
            {selectedSceneData && ` · ${selectedSceneData.name}`}
          </div>
        )}
      </Card>

      {/* 生成按钮 - 固定在底部 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-10">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleGenerate}
            disabled={loading || !canGenerate}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 h-11 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {generateType === 'image' ? '生成图片提示词' : '生成视频提示词'}
              </>
            )}
          </Button>
          {profile && (
            <p className="text-xs text-center text-gray-500 mt-1.5">
              {profile.plan_type === 'free' && '无限次数'}
              {profile.plan_type === 'pro' && `今日剩余 ${10 - (profile.daily_usage || 0)} 次`}
              {profile.plan_type === 'vip' && '无限次数'}
            </p>
          )}
        </div>
      </div>

      {/* 结果弹窗 */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {profile?.plan_type === 'pro' || profile?.plan_type === 'vip' ? '✨ 专业版生成结果' : '生成结果'}
              {(profile?.plan_type === 'pro' || profile?.plan_type === 'vip') && (
                <Badge className="bg-amber-500">专业版</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-4">
              {generateType === 'image' && result.imagePrompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">📝 图片提示词</h3>
                    <CopyButton text={result.imagePrompt} />
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.imagePrompt}</p>
                </div>
              )}

              {generateType === 'video' && result.videoPrompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">📹 视频提示词</h3>
                    <CopyButton text={result.videoPrompt} />
                  </div>
                  <p className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{result.videoPrompt}</p>
                </div>
              )}

              {result.explanation && (
                <div>
                  <h3 className="font-medium mb-2">💬 画面说明</h3>
                  <p className="text-sm text-gray-600">{result.explanation}</p>
                </div>
              )}

              {/* 爆款提示 - 仅专业版 */}
              {(profile?.plan_type === 'pro' || profile?.plan_type === 'vip') && result.tips && (
                <div className="border-2 border-amber-400 rounded-lg p-3 bg-amber-50">
                  <h3 className="font-medium text-amber-600 mb-2">🔥 爆款提示</h3>
                  <p className="text-sm text-amber-900">{result.tips}</p>
                </div>
              )}

              {result.soundSuggestion && (
                <div>
                  <h3 className="font-medium mb-2">🎵 推荐音效</h3>
                  <p className="text-sm text-gray-600">{result.soundSuggestion}</p>
                </div>
              )}

              {/* 免费用户升级提示 */}
              {profile?.plan_type === 'free' && (
                <div className="border-2 border-dashed border-amber-400 rounded-lg p-4 mt-4 bg-amber-50">
                  <h3 className="font-bold text-amber-600 mb-2">🚀 升级到 Pro 获取更专业的效果</h3>
                  <ul className="text-sm space-y-1 mb-3 text-gray-700">
                    <li>✓ 独家专业吃播公式，效果接近专业博主</li>
                    <li>✓ 详细的构图、光线、质感优化</li>
                    <li>✓ 爆款建议和发布技巧</li>
                    <li>✓ 每天 10 次生成额度</li>
                  </ul>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600">
                    立即升级 Pro
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
