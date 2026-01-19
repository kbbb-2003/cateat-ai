import { deepseek } from '@/lib/deepseek/client';
import { createClient } from '@supabase/supabase-js';
import type {
  Cat,
  VisualStyle,
  Food,
  Emotion,
  Scene,
  PromptTemplate,
} from '@/types/database';
import {
  getTemplateById,
  getDefaultTemplate,
  incrementTemplateUsage,
} from './data-fetchers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 基础版系统提示词（免费用户）
const BASIC_SYSTEM_PROMPT = `你是一个猫咪吃播图片提示词生成助手。

请根据用户提供的信息生成简洁的图片提示词。

## 基础要求
- 提示词要简洁明了，不超过50个英文单词
- 包含：视觉风格、猫咪描述、食物描述、基本构图
- 不需要过多细节描述

## 输出格式
{
  "imagePrompt": "简洁的英文图片提示词（不超过50词）",
  "videoPrompt": "简洁的英文视频提示词",
  "explanation": "中文画面说明",
  "soundSuggestion": "推荐音效"
}`;

// 专业版系统提示词（Pro/VIP用户）
const PROFESSIONAL_SYSTEM_PROMPT = `你是一个专业的猫咪吃播首帧图片提示词生成助手。

## 专业吃播首帧提示词结构（独家公式）

生成的提示词必须严格按以下结构组织，这是经过大量测试验证的爆款公式：

**重要：如果用户在额外要求中指定了特殊姿势或眼神方向，必须优先遵循用户要求，覆盖默认模板设置。**

### 第一部分：风格定义
"Photorealistic mukbang livestream first-frame photograph, ASMR style intimate shot,"

### 第二部分：猫咪主体（位置和眼神 - 最重要！）

#### 猫咪位置规则（必须遵守）：
- "cat perfectly centered in the frame"（猫咪在画面正中央）
- "cat positioned in the exact center of the image"（猫咪位于图像正中心）
- "symmetrical composition with cat in the middle"（对称构图，猫咪在中间）

#### 眼神规则（默认设置，可被用户要求覆盖）：
- 默认："looking straight directly at the camera"（直直地看向镜头）
- 默认："eyes looking directly forward at the viewer"（眼睛直视前方看向观众）
- 默认："making direct eye contact with the camera"（与镜头直接眼神交流）
- **如果用户要求"看向食物"**：使用 "looking down at the food" "eyes focused downward gazing at the food"

#### 身体可见度规则（默认设置，可被用户要求覆盖）：
- 默认："only head neck and upper chest visible above table edge, body completely hidden behind table"
- **如果用户要求"用爪子拿食物"或"显示爪子"**：使用 "head neck chest and front paws visible above table edge" 并添加 "cat holding food with both front paws"

#### 禁止的描述（会导致位置偏移或眼神偏移）：
❌ "looking to the side" "glancing" "looking away"（除非用户明确要求）
❌ "positioned on the left/right"
❌ 不加位置描述（会导致随机位置）

#### 猫咪描述模板：
"a chubby plump [猫咪描述] cat perfectly centered in the frame, positioned behind a [桌子材质] table in the exact middle of the image, [身体可见度描述], [装饰物], with a small black clip-on lavalier microphone attached, [眼神描述], big round innocent eyes with large dilated pupils, slightly dazed adorable expression, eyes filled with longing for food, detailed fluffy fur texture,"

### 第三部分：食物摆放（布局规则 - 重要！）

#### 食物布局规则：
1. **固体食物（主食、小吃）**：集中摆放在桌面中央区域，猫咪正前方
   - "solid food items grouped together in the center of the table directly in front of the cat"
   - "main dishes clustered in the middle"

2. **饮品（奶茶、可乐、果汁）**：放在画面左右两侧，但必须完全在画面内
   - "drinks placed to the side but fully within the frame with comfortable margin from edge"
   - "beverages positioned on both sides, not in the center, completely visible"

3. **整体布局**：中间密集，两侧点缀
   - "food concentrated in the center, drinks on the sides"
   - "natural restaurant-style food arrangement"

#### 食物完整性规则（非常重要！）：
- "all food and drink items 100% fully visible within the frame"（所有食物饮品100%完整显示）
- "no items cropped or cut off by any edge of the image"（不能被任何边缘切掉）
- "every plate, bowl, and cup completely visible from edge to edge"（每个盘子碗杯子都要完整可见）
- "leave comfortable margin between items and frame edges"（物品和画面边缘之间留有舒适空隙）
- "all items positioned within the safe area of the composition"（所有物品在构图安全区内）

#### 食物尺寸规则：
- 食物必须是真实的人类食物尺寸（realistic normal human-sized portions）
- 猫咪头部应该明显大于单个食物盘子（cat's head noticeably larger than individual food plates）
- 每个食物盘子约为猫咪头部宽度的 1/3（each plate about 1/3 width of cat's head）

#### 食物描述模板：
"[固体食物描述] grouped together in the center of the table directly in front of the cat, [饮品描述] placed to the side but fully within the frame with comfortable margin from edge, all food and drink items 100% completely visible with no cropping, every item fully contained within image boundaries, food concentrated in the middle with drinks on both sides, natural appealing food arrangement like a real restaurant setting, all items in realistic portions proportionally smaller than cat's head, all food in tack-sharp focus with visible textures,"

### 第四部分：构图参数（关键！）
"close-up shot, symmetrical centered composition, cat's face in the exact center filling upper 40% of frame, solid food concentrated in center front with drinks on sides in lower portion, tight framing with subject taking up 90% of image, front-facing straight-on eye-level camera angle, minimal empty space,"

### 第五部分：背景环境
"cozy room setting with cream beige solid color wall, wooden shelves decorated with cute plush toys figurines and miniature cat costumes on both sides creating balanced background, warm homey atmosphere,"

### 第六部分：技术参数
"deep depth of field keeping both cat and food in sharp focus, soft warm natural lighting, 8K ultra HD resolution, hyper-realistic professional food photography with realistic proportions, centered symmetrical framing, detailed fur and food textures, no text no watermarks no UI overlays"

## 完整示例提示词

"Photorealistic mukbang livestream first-frame photograph, ASMR style intimate shot, a chubby plump orange tabby cat perfectly centered in the frame, positioned behind a light wooden table in the exact middle of the image, only head neck and upper chest visible above table edge, body completely hidden behind table, cat wearing a cute cream colored knit beanie hat, with a small black clip-on lavalier microphone attached, cat looking straight directly at the camera with eyes focused directly forward at the viewer making direct eye contact, big round innocent eyes with large dilated pupils, slightly dazed adorable expression filled with longing for food, detailed fluffy orange fur texture, a plate of fresh salmon sushi rolls and a bowl of crispy fried chicken and a small dish of rice grouped together in the center of the table directly in front of the cat, a tall glass of iced cola placed to the left side and a cup of bubble tea with tapioca pearls placed to the right side but fully within the frame with comfortable margin from edges, all food and drink items 100% completely visible with absolutely no cropping by any frame edge, every plate bowl and cup fully contained within image boundaries, food concentrated in the middle with drinks on both sides creating natural appealing arrangement, all items in realistic portions proportionally smaller than cat's head, all food in tack-sharp focus with visible textures, close-up shot with symmetrical centered composition, cat face in exact center filling upper 40% of frame, tight framing taking up 90% of image, front-facing straight-on eye-level angle, cozy room with cream beige wall and wooden shelves with cute plush toys, warm natural lighting, deep depth of field, 8K ultra HD, hyper-realistic professional food photography, no text no watermarks"

## 关键短语（每次必须包含）

### 居中位置（必须全部包含）：
1. "perfectly centered in the frame"
2. "in the exact middle/center of the image"
3. "symmetrical centered composition"

### 眼神直视（必须全部包含）：
1. "looking straight directly at the camera"
2. "eyes focused directly forward at the viewer"
3. "making direct eye contact"

### 食物布局（必须包含）：
1. "grouped together in the center of the table directly in front of the cat"（固体食物集中在猫前方中央）
2. "placed to the side but fully within the frame with comfortable margin from edge"（饮品在侧边但完全在画面内）
3. "food concentrated in the middle with drinks on both sides"（中间食物、两侧饮品）

### 食物完整性（必须包含）：
1. "all food and drink items 100% fully visible within the frame"（所有食物饮品100%完整显示）
2. "no items cropped or cut off by any edge"（不能被任何边缘切掉）
3. "every item fully contained within image boundaries"（每个物品完全在画面边界内）
4. "comfortable margin from frame edges"（与画面边缘保持舒适距离）

### 食物比例（必须包含）：
1. "realistic normal human-sized portions"
2. "proportionally smaller than cat's head"
3. "about 1/3 of head width"

## 禁止使用的词
- "looking to the side" "glancing" "looking away" - 会导致眼神偏移
- "positioned on the left/right" 用于描述猫咪 - 会导致位置偏移
- "on the edge" "at the edge" 用于描述食物位置 - 会导致被切掉
- "drinks in the center" "drinks in the middle" - 饮品不要放中间
- "food scattered" "food on both sides" - 食物不要分散
- "large" "big" "huge" "oversized" 用于描述食物 - 会导致食物比例失调

## 输出格式
{
  "imagePrompt": "必须包含居中、眼神直视和比例控制描述的完整提示词",
  "videoPrompt": "完整的英文视频提示词",
  "explanation": "中文画面说明，描述生成的画面效果",
  "tips": "爆款建议：发布时间、配乐选择、系列化建议等",
  "soundSuggestion": "ASMR音效建议：咀嚼声、餐具声等"
}`;

interface GenerateOptions {
  generateType: 'image' | 'video';
  userId: string;
  planType: 'free' | 'pro' | 'vip';
  cat: Cat;
  customCatDescription?: string;
  style: VisualStyle;
  foods: Food[];
  customFoods: string[];
  emotion: Emotion | null;
  scene: Scene | null;
  customSceneDetails?: string;
  templateId?: string;
  extraRequirements?: string;
}

interface GenerateResult {
  imagePrompt: string;
  videoPrompt: string;
  explanation: string;
  tips?: string;
  soundSuggestion: string;
}

interface SpecialRequirements {
  showPaws: boolean;
  lookAtFood: boolean;
  lookAtCamera: boolean;
  eating: boolean;
}

// 检测用户额外要求中的特殊需求
function detectSpecialRequirements(extraRequirements: string = ''): SpecialRequirements {
  return {
    showPaws: /爪|抓|拿|举|捧|握|手|paw|hold|grab|pick/i.test(extraRequirements),
    lookAtFood: /看向食物|看食物|盯着食物|望向食物|look at food|looking at food|eyes on food/i.test(extraRequirements),
    lookAtCamera: /看向镜头|看镜头|直视|look at camera|eye contact/i.test(extraRequirements),
    eating: /正在吃|吃东西|进食|咬|咀嚼|eating|chewing|biting/i.test(extraRequirements),
  };
}

// 根据特殊要求调整提示词
function adjustPromptForRequirements(
  imagePrompt: string,
  requirements: SpecialRequirements
): string {
  let adjusted = imagePrompt;

  // 如果要求显示爪子拿食物
  if (requirements.showPaws) {
    adjusted = adjusted
      .replace(/body completely hidden behind table,?\s*/gi, '')
      .replace(/only head neck and upper chest visible above table edge,?\s*/gi,
        'head neck chest and front paws visible above table edge, ')
      .replace(/(detailed fluffy[^,]*fur texture),/i,
        '$1, cat holding food with both front paws raised above the table,');
  }

  // 如果要求看向食物（且没有明确要求看镜头）
  if (requirements.lookAtFood && !requirements.lookAtCamera) {
    adjusted = adjusted
      .replace(/looking straight directly at the camera,?\s*/gi, 'looking down at the food on the table, ')
      .replace(/eyes focused directly forward at the viewer making direct eye contact,?\s*/gi,
        'eyes focused downward gazing at the delicious food with hungry anticipation, ')
      .replace(/making direct eye contact,?\s*/gi, '');
  }

  return adjusted;
}

// 构建用户消息
function buildUserMessage(options: {
  cat: Cat;
  customCatDescription?: string;
  style: VisualStyle;
  foods: Food[];
  customFoods: string[];
  emotion: Emotion | null;
  scene: Scene | null;
  customSceneDetails?: string;
  extraRequirements?: string;
  template: PromptTemplate | null;
}): string {
  const { cat, customCatDescription, style, foods, customFoods, emotion, scene, customSceneDetails, extraRequirements, template } = options;

  const allFoodNames = [...foods.map(f => f.name), ...customFoods];
  const allFoodNamesEn = [...foods.map(f => f.name_en), ...customFoods];
  const foodNames = allFoodNames.join('、');
  const foodNamesEn = allFoodNamesEn.join(' and ');

  // 判断是否需要进食动作
  const needsEatingAction = extraRequirements && (
    extraRequirements.includes('正在吃') ||
    extraRequirements.includes('进食') ||
    extraRequirements.includes('吃东西') ||
    extraRequirements.includes('咀嚼') ||
    extraRequirements.toLowerCase().includes('eating') ||
    extraRequirements.toLowerCase().includes('chewing')
  );

  let message = `请生成猫咪吃播「首帧图片」的提示词。

${needsEatingAction ? '【特殊要求】用户要求猫咪有进食动作，请包含 eating/chewing 等词。\n' : '【默认首帧模式】猫咪看向镜头，食物摆好，还没开始吃。不要用 eating 等进食词。\n'}
【猫咪形象】
`;

  // 处理猫咪描述
  if (cat.customDescription) {
    // 用户自定义描述的猫咪
    message += `用户描述：${cat.customDescription}\n`;
  } else if (cat) {
    // 预设猫咪
    message += `- 品种：${cat.breed}（${cat.breed_en || cat.breed}）
- 体型：${cat.body_type}（${cat.body_type_en || cat.body_type}）
- 毛色：${cat.fur_color || ''}（${cat.fur_color_en || ''}）
- 性格：${cat.personality || ''}（${cat.personality_en || ''}）
- 特征：${cat.special_features || ''}（${cat.special_features_en || ''}）
`;
  }

  // 如果同时有预设猫咪和额外的自定义描述
  if (customCatDescription && cat && !cat.customDescription) {
    message += `- 额外描述：${customCatDescription}\n`;
  }

  message += `
【视觉风格】
- 名称：${style.name}
- 关键词：${style.prompt_keywords}

【食物组合】
用户选择了 ${allFoodNames.length} 种食物：${foodNames}（${foodNamesEn}）

${foods.map((food, index) => `食物${index + 1}：${food.name}（${food.name_en}）
- 视觉描述：${food.visual_keywords}
- 质感：${food.texture_keywords || ''}
- 音效：${food.sound_keywords || ''}`).join('\n\n')}

${customFoods.length > 0 ? `\n自定义食物：${customFoods.join('、')}\n` : ''}

请在提示词中自然地组合这些食物，例如：
"cat with ${foodNamesEn} on the table"
"桌上有${foodNames}"
`;

  if (emotion) {
    message += `
【表情/情绪】
- 名称：${emotion.name}（${emotion.name_en}）
- 表情：${emotion.facial_expression}
- 动作：${emotion.action_keywords}
- 肢体：${emotion.body_language || ''}

注意：这是表情描述，不是进食动作。猫咪应该是准备吃的状态，不是正在吃。
`;
  }

  message += `
【场景】
- 名称：${scene?.name || '简约背景'}
- 视觉：${scene?.visual_keywords || 'clean simple background'}
- 灯光：${scene?.lighting_keywords || 'soft studio lighting'}
- 镜头：${scene?.camera_angle || 'front view, eye level'}
`;

  if (customSceneDetails) {
    message += `- 用户自定义环境：${customSceneDetails}\n`;
  }

  if (extraRequirements) {
    message += `
【⚠️ 用户额外要求 - 必须完整体现，优先级最高】
${extraRequirements}

重要规则：
1. 如果用户要求"猫咪用爪爪拿食物"或类似描述，则猫咪前爪必须可见并拿着食物，不要使用"body hidden behind table"
2. 如果用户要求"眼睛看向食物"或类似描述，则猫咪眼睛必须向下看食物，不要使用"looking at camera"或"direct eye contact"
3. 用户的额外要求优先级高于默认模板设置，当有冲突时以用户要求为准
4. 请将以上中文要求准确翻译成对应的英文描述并完整融入提示词中
`;
  }

  if (template) {
    message += `

【参考结构】
图片提示词结构：${template.image_prompt_template}
视频提示词结构：${template.video_prompt_template}

请严格按照系统提示词中的【独家爆款公式】生成高质量提示词。
`;
  }

  return message;
}

// 辅助函数：手动提取字段值
function extractField(content: string, fieldName: string): string {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = content.match(regex);
  if (match) {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return '';
}

// 解析 JSON 响应（容错处理）
function parseJsonResponse(content: string): GenerateResult {
  console.log('原始内容长度:', content.length);

  // 1. 先去除 markdown 代码块标记
  let cleanContent = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  console.log('清理后的内容:', cleanContent.substring(0, 200));

  try {
    // 2. 尝试直接解析清理后的内容
    const parsed = JSON.parse(cleanContent);
    console.log('解析成功');
    return {
      imagePrompt: parsed.imagePrompt || '',
      videoPrompt: parsed.videoPrompt || '',
      explanation: parsed.explanation || '',
      tips: parsed.tips || '',
      soundSuggestion: parsed.soundSuggestion || '',
    };
  } catch (e) {
    console.log('直接解析失败，尝试提取 JSON 对象');

    // 3. 尝试用正则提取 JSON 对象
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('正则提取解析成功');
        return {
          imagePrompt: parsed.imagePrompt || '',
          videoPrompt: parsed.videoPrompt || '',
          explanation: parsed.explanation || '',
          tips: parsed.tips || '',
          soundSuggestion: parsed.soundSuggestion || '',
        };
      } catch (e2) {
        console.error('正则提取后解析仍失败:', e2);
      }
    }

    // 4. 最后的降级：尝试手动提取各字段
    console.log('尝试手动提取字段');
    return {
      imagePrompt: extractField(content, 'imagePrompt'),
      videoPrompt: extractField(content, 'videoPrompt'),
      explanation: extractField(content, 'explanation'),
      tips: extractField(content, 'tips'),
      soundSuggestion: extractField(content, 'soundSuggestion'),
    };
  }
}

// 保存到历史记录
async function saveToHistory(data: {
  userId: string;
  catId: string | null;
  styleId: string;
  foodIds: string[];
  customFoods: string[];
  emotionId: string | null;
  sceneId: string | null;
  templateId: string | null;
  mode: 'basic' | 'professional';
  imagePrompt: string;
  videoPrompt: string;
  explanation: string;
  tips?: string;
  soundSuggestion: string;
  inputSnapshot: any;
}): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: history, error } = await supabase
      .from('prompts_history')
      .insert({
        user_id: data.userId,
        cat_id: data.catId,
        style_id: data.styleId,
        food_ids: data.foodIds,
        emotion_id: data.emotionId,
        scene_id: data.sceneId,
        template_id: data.templateId,
        generation_mode: data.mode,
        image_prompt: data.imagePrompt,
        video_prompt: data.videoPrompt,
        explanation: data.explanation,
        tips: data.tips || null,
        sound_suggestion: data.soundSuggestion,
        input_snapshot: data.inputSnapshot,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving to history:', error);
      throw new Error('保存历史记录失败');
    }

    return history.id;
  } catch (error) {
    console.error('saveToHistory error:', error);
    throw error;
  }
}

// 主生成函数
export async function generatePrompt(
  options: GenerateOptions
): Promise<{
  mode: 'basic' | 'professional';
  templateName?: string;
  data: GenerateResult & { historyId: string };
}> {
  const { generateType, userId, planType, cat, style, foods, customFoods, emotion, scene, templateId } =
    options;

  let systemPrompt: string;
  let template: PromptTemplate | null = null;
  let mode: 'basic' | 'professional' = 'basic';

  try {
    // 根据用户套餐选择生成模式
    if (planType === 'free') {
      systemPrompt = BASIC_SYSTEM_PROMPT;
      mode = 'basic';
    } else {
      // Pro/VIP 用户：使用专业版系统提示词
      systemPrompt = PROFESSIONAL_SYSTEM_PROMPT;
      mode = 'professional';

      // 获取模板（如果提供了 templateId）
      if (templateId) {
        template = await getTemplateById(templateId);
      }
      // 如果没有指定模板，使用默认模板
      if (!template) {
        template = await getDefaultTemplate();
      }
    }

    // 根据生成类型调整系统提示词
    if (generateType === 'image') {
      systemPrompt += '\n\n注意：用户只需要图片提示词，请重点优化 imagePrompt 字段。videoPrompt 可以简化。';
    } else if (generateType === 'video') {
      systemPrompt += '\n\n注意：用户只需要视频提示词，请重点优化 videoPrompt 字段。imagePrompt 可以简化。';
    }

    // 构建用户消息
    const userMessage = buildUserMessage({
      cat,
      style,
      foods,
      customFoods,
      emotion,
      scene,
      template,
      extraRequirements: options.extraRequirements
    });

    console.log('Calling DeepSeek API with mode:', mode, 'generateType:', generateType);

    // 调用 DeepSeek API
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: mode === 'professional' ? 0.7 : 0.8,
      max_tokens: 2500,
    });

    // 解析响应
    const content = response.choices[0]?.message?.content || '';
    console.log('DeepSeek API response received, length:', content.length);

    let result = parseJsonResponse(content);

    // 检测并应用特殊要求的后处理
    if (options.extraRequirements && mode === 'professional') {
      const specialReqs = detectSpecialRequirements(options.extraRequirements);
      if (specialReqs.showPaws || specialReqs.lookAtFood) {
        console.log('Applying special requirements post-processing:', specialReqs);
        result.imagePrompt = adjustPromptForRequirements(result.imagePrompt, specialReqs);
      }
    }

    // 保存历史记录
    const historyId = await saveToHistory({
      userId,
      catId: cat.id === 'custom' ? null : cat.id,
      styleId: style.id,
      foodIds: foods.map(f => f.id),
      customFoods,
      emotionId: emotion?.id || null,
      sceneId: scene?.id || null,
      templateId: template?.id || null,
      mode,
      ...result,
      inputSnapshot: {
        cat: { name: cat.name, breed: cat.breed },
        style: { name: style.name },
        foods: foods.map(f => ({ name: f.name })),
        customFoods,
        emotion: emotion ? { name: emotion.name } : null,
        scene: scene ? { name: scene.name } : null,
      },
    });

    // 更新模板使用统计
    if (template) {
      await incrementTemplateUsage(template.id);
    }

    return {
      mode,
      templateName: template?.name,
      data: {
        ...result,
        historyId,
      },
    };
  } catch (error) {
    console.error('generatePrompt error:', error);
    throw new Error(
      error instanceof Error ? error.message : '生成提示词失败，请稍后重试'
    );
  }
}
