-- =====================================================
-- 猫猫吃播提示词生成器 - 种子数据
-- =====================================================

-- =====================================================
-- 1. 视觉风格预设（visual_styles）
-- =====================================================

INSERT INTO visual_styles (name, name_en, description, prompt_keywords, recommended_for, sort_order, is_active, is_premium) VALUES
('皮克斯3D', 'pixar_3d', '最受欢迎的可爱风格，适合搞笑和治愈向内容', 'Pixar 3D animation style, smooth fur texture, big expressive eyes, soft studio lighting, vibrant colors, high detail, cinematic quality, adorable character design', '可爱向、搞笑向内容，最受欢迎的风格', 1, TRUE, FALSE),

('迪士尼风格', 'disney_style', '温馨治愈的经典动画风格', 'Disney animation style, charming character design, warm golden lighting, magical atmosphere, appealing proportions, family-friendly aesthetic, whimsical details', '温馨治愈向内容', 2, TRUE, FALSE),

('写实摄影', 'realistic_photo', '高端质感的真实摄影风格', 'photorealistic, real cat photography, DSLR quality, natural lighting, shallow depth of field, 8K ultra HD, detailed fur texture, professional photography', '高端质感、真实感强的内容', 3, TRUE, FALSE),

('超写实CG', 'hyper_realistic_cg', '电影级别的震撼视觉效果', 'hyper-realistic CGI, Unreal Engine 5 render, ray tracing, subsurface scattering on fur, cinematic lighting, movie quality VFX, photorealistic rendering', '震撼视觉效果', 4, TRUE, FALSE),

('日系动漫', 'anime_style', '二次元可爱风格', 'Japanese anime style, Studio Ghibli inspired, soft cel shading, kawaii aesthetic, pastel colors, 2D animation look, clean linework, expressive anime eyes', '二次元受众、日系可爱风', 5, TRUE, FALSE),

('黏土定格', 'claymation', '独特的手工质感', 'claymation style, stop-motion animation, clay texture, handcrafted look, Aardman studios inspired, tactile materials, warm handmade aesthetic', '独特质感、怀旧风格', 6, TRUE, FALSE),

('水彩插画', 'watercolor', '文艺清新的插画风格', 'watercolor illustration style, soft edges, artistic brush strokes, dreamy atmosphere, children''s book illustration, gentle pastel colors, delicate details', '文艺清新风格', 7, TRUE, FALSE),

('赛博朋克', 'cyberpunk', '科技感十足的未来风格', 'cyberpunk style, neon lights, futuristic setting, holographic effects, dark atmosphere with vibrant neon accents, sci-fi aesthetic, glowing elements', '科技感、潮流向内容', 8, TRUE, TRUE),

('复古像素', 'pixel_art', '怀旧的像素游戏风格', 'pixel art style, 16-bit retro game aesthetic, limited color palette, nostalgic gaming look, crisp pixels, retro video game style', '游戏怀旧向、像素风爱好者', 9, TRUE, FALSE),

('毛绒玩具', 'plush_toy', '超萌的玩偶风格', 'plush toy style, soft fabric texture, stuffed animal look, cute button eyes, fluffy cotton-like fur, kawaii plushie aesthetic, huggable appearance', '超萌治愈向', 10, TRUE, FALSE);

-- =====================================================
-- 2. 预设猫咪（cats）
-- =====================================================

INSERT INTO cats (name, breed, breed_en, body_type, body_type_en, fur_color, fur_color_en, personality, personality_en, special_features, special_features_en, is_preset, is_public) VALUES
('肥橘', '橘猫', 'orange tabby cat', '圆胖', 'chubby, round', '橘色带白', 'orange with white patches', '贪吃', 'gluttonous, food-obsessed', '大圆脸、肉垫粉粉的', 'big round face, pink toe beans', TRUE, TRUE),

('蓝胖子', '英短蓝猫', 'British Shorthair blue', '微胖', 'plump, stocky', '纯蓝灰', 'solid blue-gray', '傲娇', 'tsundere, aloof but cute', '圆眼睛、表情淡定', 'round copper eyes, calm expression', TRUE, TRUE),

('小布丁', '布偶猫', 'Ragdoll cat', '修长', 'elegant, slender', '奶油色重点色', 'cream with color points', '优雅', 'elegant, gentle', '蓝眼睛、长毛飘逸', 'striking blue eyes, long flowing fur', TRUE, TRUE),

('狸花大侠', '中华狸花猫', 'Chinese Li Hua cat, tabby', '标准', 'athletic, well-proportioned', '虎斑纹', 'classic tabby pattern, brown mackerel', '暴躁', 'feisty, energetic', '眼神犀利、虎纹明显', 'sharp eyes, prominent tabby markings', TRUE, TRUE),

('奶牛猫', '奶牛猫', 'tuxedo cat, black and white', '标准', 'medium build', '黑白相间', 'black and white patches', '呆萌', 'derpy, goofy', '一脸懵、经常表情包', 'confused expression, meme-worthy face', TRUE, TRUE);

-- =====================================================
-- 3. 食物模板（foods）
-- =====================================================

-- 水果类
INSERT INTO foods (name, name_en, category, heat_level, difficulty, visual_keywords, texture_keywords, sound_keywords, emoji, is_premium) VALUES
('西瓜', 'watermelon', 'fruit', 5, 3, 'juicy red watermelon slice, black seeds, dripping juice', 'juicy, refreshing', 'wet crunching', '🍉', FALSE),
('草莓', 'strawberry', 'fruit', 4, 3, 'fresh red strawberries, green leaves, glistening surface', 'soft, sweet', 'soft bite', '🍓', FALSE),
('榴莲', 'durian', 'fruit', 5, 4, 'creamy yellow durian flesh, spiky shell, rich texture', 'creamy, rich', 'soft squish', '🥭', FALSE),
('葡萄', 'grapes', 'fruit', 3, 3, 'purple grapes cluster, translucent skin, water droplets', 'juicy, bursting', 'pop sound', '🍇', FALSE),
('芒果', 'mango', 'fruit', 4, 3, 'golden mango cubes, juicy flesh, tropical fruit', 'smooth, juicy', 'wet chewing', '🥭', FALSE);

-- 主食类
INSERT INTO foods (name, name_en, category, heat_level, difficulty, visual_keywords, texture_keywords, sound_keywords, emoji, is_premium) VALUES
('拉面', 'ramen', 'main', 5, 3, 'steaming hot ramen bowl, wavy noodles, rich broth, soft-boiled egg, nori', 'chewy noodles, savory broth', 'slurping, sipping', '🍜', FALSE),
('寿司', 'sushi', 'main', 4, 3, 'fresh sushi roll, rice, nori wrap, salmon on top', 'soft rice, fresh fish', 'gentle chewing', '🍣', FALSE),
('火锅', 'hot pot', 'main', 5, 4, 'bubbling spicy hot pot, red chili oil, various ingredients floating', 'boiling, spicy', 'bubbling, sizzling', '🍲', FALSE),
('披萨', 'pizza', 'main', 4, 3, 'cheesy pizza slice, melted mozzarella stretching, pepperoni', 'gooey cheese, crispy crust', 'cheese stretching', '🍕', FALSE),
('汉堡', 'burger', 'main', 4, 3, 'juicy beef burger, melted cheese, fresh lettuce, sesame bun', 'juicy patty, soft bun', 'crunchy bite', '🍔', FALSE);

-- 零食类
INSERT INTO foods (name, name_en, category, heat_level, difficulty, visual_keywords, texture_keywords, sound_keywords, emoji, is_premium) VALUES
('薯片', 'chips', 'snack', 3, 3, 'crispy potato chips, golden color, wavy texture', 'crispy, crunchy', 'crunchy, crispy', '🥔', FALSE),
('冰淇淋', 'ice cream', 'snack', 5, 3, 'colorful ice cream cone, melting drips, sprinkles', 'creamy, cold', 'licking, soft bite', '🍦', FALSE),
('蛋糕', 'cake', 'snack', 4, 3, 'layered cream cake, strawberry topping, fluffy texture', 'soft, fluffy', 'soft chewing', '🍰', FALSE),
('棒棒糖', 'lollipop', 'snack', 3, 3, 'swirly colorful lollipop, shiny candy surface', 'hard candy', 'licking, sucking', '🍭', FALSE),
('甜甜圈', 'donut', 'snack', 4, 3, 'glazed donut, colorful sprinkles, sugar coating', 'soft, sweet', 'soft bite', '🍩', FALSE);

-- 猎奇类
INSERT INTO foods (name, name_en, category, heat_level, difficulty, visual_keywords, texture_keywords, sound_keywords, emoji, is_premium) VALUES
('辣椒', 'chili pepper', 'exotic', 5, 5, 'bright red chili pepper, fiery hot, seeds visible', 'spicy, burning', 'crunchy bite', '🌶️', TRUE),
('柠檬', 'lemon', 'exotic', 4, 4, 'sour yellow lemon slice, juice splashing, citrus texture', 'sour, juicy', 'wet bite', '🍋', TRUE),
('芥末', 'wasabi', 'exotic', 4, 5, 'green wasabi paste, pungent condiment', 'spicy paste', 'none', '🟢', TRUE),
('仙人掌', 'cactus', 'exotic', 3, 4, 'green cactus pad, nopales, prickly texture', 'crunchy, fresh', 'crunchy', '🌵', TRUE),
('臭豆腐', 'stinky tofu', 'exotic', 4, 3, 'golden fried stinky tofu, crispy outside, soft inside', 'crispy exterior, soft interior', 'crunchy frying', '🧈', TRUE);

-- 饮品类
INSERT INTO foods (name, name_en, category, heat_level, difficulty, visual_keywords, texture_keywords, sound_keywords, emoji, is_premium) VALUES
('珍珠奶茶', 'bubble tea', 'drink', 5, 3, 'creamy milk tea, black tapioca pearls, transparent cup', 'chewy pearls, creamy tea', 'slurping, chewing pearls', '🧋', FALSE),
('可乐', 'cola', 'drink', 3, 3, 'fizzy cola, ice cubes, bubbles rising, red can', 'fizzy, cold', 'fizzing, gulping', '🥤', FALSE),
('咖啡', 'coffee', 'drink', 3, 3, 'latte art coffee, steaming cup, foam heart', 'hot, creamy', 'sipping, gentle slurp', '☕', FALSE);

-- =====================================================
-- 4. 情绪/动作（emotions）
-- =====================================================

-- 开心类
INSERT INTO emotions (name, name_en, category, description, action_keywords, facial_expression, body_language, emoji, intensity) VALUES
('满足享受', 'satisfied', 'happy', '闭眼享受美食的满足感', 'slow savoring bite, gentle chewing', 'eyes closed in satisfaction, content smile, relaxed posture', 'body relaxed, tail gently swaying', '😌', 4),
('超级开心', 'super happy', 'happy', '发现美食时的兴奋', 'excited bouncing, happy tail swish', 'wide sparkling eyes, big smile, ears perked up', 'bouncing, energetic movement', '😆', 5),
('陶醉', 'blissful', 'happy', '沉浸在美味中的陶醉状态', 'slow motion chewing, head tilting back', 'dreamy half-closed eyes, slight drool, peaceful expression', 'swaying gently, completely relaxed', '😇', 5);

-- 惊讶类
INSERT INTO emotions (name, name_en, category, description, action_keywords, facial_expression, body_language, emoji, intensity) VALUES
('惊喜发现', 'pleasantly surprised', 'surprised', '发现意外美味的惊喜', 'sudden pause, leaning forward', 'wide eyes, raised eyebrows, open mouth', 'leaning in, ears forward', '😲', 4),
('被吓到', 'startled', 'surprised', '被突然的味道吓到', 'jumping back, paw raised', 'fur standing up, wide shocked eyes, frozen pose', 'body tensed, ready to flee', '😱', 5),
('发现美味', 'taste explosion', 'surprised', '味蕾爆炸的惊艳感', 'dramatic pause then eager eating', 'eyes popping, jaw dropped, amazed expression', 'body leaning forward eagerly', '🤯', 5);

-- 难受类
INSERT INTO emotions (name, name_en, category, description, action_keywords, facial_expression, body_language, emoji, intensity) VALUES
('被辣到', 'too spicy', 'uncomfortable', '被辣椒辣到的痛苦', 'fanning mouth with paw, desperate panting', 'teary eyes, tongue out, sweat drops, red face', 'frantic paw movements, body wiggling', '🥵', 5),
('被酸到', 'too sour', 'uncomfortable', '被酸味刺激的反应', 'head shaking, face scrunching', 'squinting eyes, puckered face, whiskers twitching', 'head shaking vigorously', '😖', 4),
('被烫到', 'too hot', 'uncomfortable', '被烫到嘴的反应', 'blowing on food, careful pawing', 'startled expression, open mouth cooling, watery eyes', 'pulling back, cautious approach', '🔥', 4),
('脑结冰', 'brain freeze', 'uncomfortable', '吃冰太快导致的头痛', 'holding head, squeezing eyes shut', 'frozen expression, clutching head, pained look', 'body frozen, head held', '🥶', 4);

-- 搞笑类
INSERT INTO emotions (name, name_en, category, description, action_keywords, facial_expression, body_language, emoji, intensity) VALUES
('吃相狼狈', 'messy eater', 'funny', '吃得满脸都是的狼狈样', 'aggressive chomping, food flying', 'food all over face, messy whiskers, crumbs everywhere', 'messy eating, no table manners', '🤤', 4),
('偷吃被发现', 'caught stealing', 'funny', '偷吃被抓包的尴尬', 'slow motion freeze, awkward pause', 'guilty frozen look, food in mouth, deer in headlights', 'frozen mid-bite, awkward posture', '😳', 4),
('吃撑了', 'food coma', 'funny', '吃太饱犯困的状态', 'slow blinks, falling asleep while chewing', 'sleepy droopy eyes, full belly, lazy posture', 'lying down, belly up, sleepy', '😴', 3),
('嫌弃', 'disgusted', 'funny', '对食物不满意的嫌弃表情', 'sniffing then pushing away, head turn', 'side-eye, nose wrinkled, unimpressed look', 'turning away, pushing food', '😒', 3);

-- =====================================================
-- 5. 场景模板（scenes）
-- =====================================================

INSERT INTO scenes (name, name_en, description, visual_keywords, lighting_keywords, camera_angle, atmosphere, sort_order, is_premium) VALUES
('简约纯色背景', 'simple background', '干净简约的纯色背景，适合突出主体', 'clean solid color background, minimalist setting', 'soft studio lighting, even illumination', 'front view, eye level', 'clean and focused', 1, FALSE),

('温馨厨房', 'cozy kitchen', '温暖的家庭厨房氛围', 'warm home kitchen, wooden table, cozy interior, homey atmosphere', 'warm natural light from window, morning sunshine', 'slight low angle, intimate perspective', 'warm and inviting', 2, FALSE),

('日式居酒屋', 'Japanese izakaya', '传统日式居酒屋的温馨氛围', 'traditional Japanese izakaya, paper lanterns, wooden counter, cozy bar', 'warm ambient lighting, lantern glow', 'medium shot, slightly elevated', 'cozy and intimate', 3, FALSE),

('户外野餐', 'outdoor picnic', '阳光明媚的户外野餐场景', 'sunny park, picnic blanket, green grass, blue sky', 'bright natural daylight, dappled sunlight', 'low angle from blanket level', 'cheerful and fresh', 4, FALSE),

('高级餐厅', 'fine dining', '优雅的高级餐厅环境', 'elegant restaurant, white tablecloth, crystal glasses, sophisticated setting', 'soft candlelight, ambient warm glow', 'elegant medium shot', 'sophisticated and refined', 5, FALSE),

('深夜食堂', 'late night eatery', '温馨的深夜食堂氛围', 'cozy late night food stall, neon signs, steam rising, urban night scene', 'neon glow, warm food steam, moody lighting', 'atmospheric medium shot', 'cozy and nostalgic', 6, FALSE),

('圣诞场景', 'Christmas setting', '温馨的圣诞节氛围', 'Christmas decorated room, twinkling lights, Christmas tree, festive atmosphere', 'warm Christmas lights, fireplace glow', 'cozy medium shot', 'festive and magical', 7, TRUE),

('生日派对', 'birthday party', '欢乐的生日派对场景', 'birthday party decorations, balloons, confetti, celebration setup', 'bright festive lighting, candle glow', 'cheerful medium shot', 'joyful and celebratory', 8, TRUE);

-- =====================================================
-- 6. 专业提示词模板（prompt_templates）
-- =====================================================

INSERT INTO prompt_templates (
  name,
  description,
  version,
  image_prompt_template,
  video_prompt_template,
  system_prompt,
  include_tips,
  include_sound_suggestion,
  tips_template,
  example_input,
  example_output,
  min_plan_type,
  is_default,
  is_active
) VALUES (
  '爆款吃播公式 V1',
  '经过100+爆款视频验证的提示词公式，专注于可爱风格和夸张表情，让你的猫猫吃播更容易火',
  '1.0',
  '{{STYLE_KEYWORDS}}, an adorable {{CAT_BREED}} cat with {{CAT_FEATURES}}, {{BODY_TYPE}} body, {{FUR_DESCRIPTION}}, sitting at {{SCENE_SETTING}}, {{FOOD_DESCRIPTION}} in front, the cat shows {{EMOTION_EXPRESSION}}, {{ACTION_POSE}}, {{LIGHTING}}, {{ATMOSPHERE}}, close-up shot, shallow depth of field, highly detailed fur texture, 4K, masterpiece, trending on artstation',
  'The adorable {{CAT_BREED}} cat {{INITIAL_POSE}}, {{TRANSITION_WORD}} {{APPROACH_ACTION}}, then {{MAIN_EATING_ACTION}}, {{EMOTION_REACTION}} with {{MICRO_EXPRESSION}}, {{SECONDARY_ACTION}}, {{CAMERA_MOVEMENT}}, smooth animation, {{STYLE_CONSISTENCY}}, 4 seconds',
  '你是一个专业的猫猫吃播AI视频提示词专家。你掌握了【独家爆款公式】，能够生成更容易火的提示词。

## 独家爆款公式（核心秘诀）

### 图片提示词公式
1. 【风格先行】始终把视觉风格关键词放在最前面，这决定了整体画面调性
2. 【主体突出】猫咪描述要具体到位：
   - 品种特征（orange tabby, British Shorthair）
   - 体型描述（chubby, plump, fluffy）
   - 毛色细节（with white patches, solid blue-gray）
   - 独特特征（big round face, pink toe beans）
3. 【食物诱人】食物描述三要素：
   - 色泽（golden, vibrant red, creamy）
   - 质感（crispy, juicy, steaming）
   - 温度感（steam rising, sizzling, glistening）
4. 【表情是灵魂】表情要具体到面部每个部位：
   - 眼睛状态（eyes closed, wide sparkling eyes, teary eyes）
   - 嘴部动作（content smile, tongue out, mouth open）
   - 耳朵位置（ears perked up, ears relaxed, ears flattened）
   - 微表情（slight drool, whiskers twitching）
5. 【氛围烘托】灯光场景要配合情绪：
   - 满足感 → 暖光（warm ambient lighting）
   - 惊讶 → 明亮光（bright lighting with highlights）
   - 难受 → 戏剧光（dramatic lighting）
6. 【构图技巧】必须加入：
   - 景别：close-up shot（最推荐）、medium shot
   - 景深：shallow depth of field（突出主体）
7. 【质量拉满】结尾必加这套组合：
   - highly detailed fur texture, 4K, masterpiece, trending on artstation

### 视频提示词公式
1. 【动作分解】把吃东西的动作拆成3-4个连续步骤：
   - 准备动作（sits eagerly, leans forward）
   - 接近食物（sniffs, reaches out paw）
   - 核心吃的动作（bites, chews, slurps, licks）
   - 反应动作（eyes close, body wiggles, ears twitch）
2. 【节奏控制】每个动作要指定速度：
   - slowly（享受时）
   - quickly（急切时）
   - suddenly（惊讶时）
   - gradually（过渡时）
3. 【表情过渡】描述表情的变化过程，不是静态：
   - "eyes widen then close in satisfaction"
   - "expression changes from curious to blissful"
4. 【镜头语言】必须加镜头运动：
   - push-in：表示专注、深入
   - pull-out：表示惊讶、全景
   - steady shot：表示平静享受
   - subtle zoom：表示情绪递进
5. 【时长控制】固定 4 seconds，这是短视频最佳传播长度

### 爆款要素检查清单
生成后自动检查是否包含：
- ✓ 猫咪的"萌点"突出了吗？（大眼睛、肉垫、肥脸、短腿）
- ✓ 食物看起来诱人吗？（要有食欲感和质感）
- ✓ 表情够夸张吗？（夸张才有传播性和表情包潜力）
- ✓ 动作有戏剧性吗？（被辣到、被烫到、偷吃被发现最容易火）
- ✓ 有没有"反差萌"？（优雅的猫吃得很狼狈）

### 额外爆款提示
根据用户的选择，额外输出1-2条针对性的爆款建议，例如：
- 音效搭配建议
- 最佳发布时间
- 配文建议
- 系列化建议

## 输出格式
严格按以下 JSON 格式输出：
{
  "imagePrompt": "完整的英文图片提示词，应用上述公式",
  "videoPrompt": "完整的英文视频提示词，应用上述公式",
  "explanation": "中文说明，2-3句话解释画面亮点",
  "tips": "1-2条针对性的爆款建议（中文）",
  "soundSuggestion": "推荐的音效关键词，英文逗号分隔"
}',
  TRUE,
  TRUE,
  '根据用户选择的食物、情绪和场景，生成1-2条针对性的爆款建议',
  '{"cat": {"breed": "橘猫", "bodyType": "圆胖", "furColor": "橘白色", "personality": "贪吃", "features": "大圆脸"}, "style": "皮克斯3D", "food": "拉面", "emotion": "满足享受", "scene": "日式居酒屋"}',
  '{"imagePrompt": "Pixar 3D animation style, smooth fur texture, big expressive eyes, vibrant colors, an adorable orange tabby cat with big round face and white patches on chest, chubby round body with fluffy cheeks, soft short fur, sitting at a traditional Japanese izakaya wooden counter, a steaming bowl of ramen with golden wavy noodles, soft-boiled egg, rich savory broth, and green onions in front, the cat shows pure bliss with eyes gently closed, content peaceful smile, ears relaxed and tilted back, holding wooden chopsticks with both front paws, warm ambient lighting from paper lanterns casting soft glow, cozy intimate atmosphere with subtle steam rising, close-up shot, shallow depth of field, highly detailed fur texture, 4K, masterpiece, trending on artstation", "videoPrompt": "The adorable chubby orange tabby cat sits eagerly at the izakaya counter, slowly leans forward to sniff the rising steam from the ramen bowl, then carefully lifts a bundle of noodles with chopsticks and slurps them into mouth with a satisfied expression, eyes gradually close in bliss with ears relaxing, a subtle happy body wiggle follows, gentle push-in camera movement focusing on the content face, smooth Pixar animation style maintained throughout, warm lantern lighting consistent, 4 seconds", "explanation": "胖橘猫在温馨居酒屋享用热腾腾拉面的治愈场景。吸面条+满足眯眼+轻微扭动的组合是经过验证的高互动公式，皮克斯风格让表情更加生动可爱。", "tips": "建议配合吸面条的ASMR音效，发布时间推荐晚8-10点。可以做成系列：橘猫日料探店记。", "soundSuggestion": "noodle slurping ASMR, chopsticks gentle clicking, ambient izakaya chatter, soft satisfied purr, steam sizzling"}',
  'pro',
  TRUE,
  TRUE
);

-- =====================================================
-- 7. 专业吃播模板（Pro用户专属）
-- =====================================================

INSERT INTO prompt_templates (
  name,
  description,
  version,
  system_prompt,
  is_default,
  is_active,
  min_plan_type,
  use_count
) VALUES (
  '专业吃播公式 V1',
  '基于专业猫咪吃播图片分析的独家提示词公式，生成效果接近专业水准',
  '1.0',
  '你是一个专业的猫咪吃播首帧图片提示词生成助手。

## 专业吃播首帧提示词结构（独家公式）

生成的提示词必须严格按以下结构组织，这是经过大量测试验证的爆款公式：

### 第一部分：风格定义
"Photorealistic mukbang livestream first-frame photograph, ASMR style intimate shot,"

### 第二部分：猫咪主体
核心要素：
- 位置：在桌子正后方，只露出头部、脖子和上胸部
- 体型：微胖圆润（chubby, plump）
- 眼睛：大而圆，瞳孔放大，呆萌无辜（big round innocent eyes, large dilated pupils）
- 表情：略带呆滞，充满对食物的渴望（slightly dazed expression, eyes filled with longing for food）
- 毛发：蓬松细腻，纹理清晰（detailed fluffy fur texture）
- 麦克风：必须包含领夹式麦克风（small black clip-on lavalier microphone）

模板：
"a chubby plump [猫咪描述] cat positioned behind a [桌子材质] table, only head neck and upper chest visible above table edge, body completely hidden behind table, [装饰物], with a small black clip-on lavalier microphone attached, cat has big round innocent eyes with large dilated pupils, slightly dazed adorable expression, eyes filled with longing and anticipation for the food, detailed fluffy fur texture,"

### 第三部分：食物摆放
核心要素：
- 所有食物清晰锐利，纹理细节可见
- 食物占画面下半部分 40-50%
- 使用各种餐具增加层次感
- 为每种食物添加质感描述

食物质感描述参考：
- 寿司 → "fresh sushi rolls with visible fish grain and glossy rice"
- 炸鸡 → "crispy golden fried chicken with crunchy batter coating"
- 拉面 → "steaming ramen with springy noodles and rich broth"
- 奶茶 → "bubble tea with visible tapioca pearls and creamy milk"
- 草莓 → "fresh strawberries with detailed seeds and green leaves"
- 披萨 → "cheesy pizza with melted mozzarella stretching"

模板：
"[食物描述+质感] arranged neatly on the table in the foreground, all food items in tack-sharp crisp focus with visible textures and fine details, food filling the lower half of frame, presented on various plates bowls and dishes, appetizing professional food styling,"

### 第四部分：构图参数（关键！）
- 猫咪头部占画面上部 40%
- 食物占画面下部 50%
- 整体填充率 90%，几乎无空白
- 正面平视角度

模板：
"close-up shot, cat''s face large and prominent filling upper 40% of frame, tight framing with subject taking up 90% of image, front-facing eye-level camera angle, minimal empty space,"

### 第五部分：背景环境
- 奶油色/米色纯色墙壁
- 木质架子上有可爱玩偶和猫咪衣服
- 温馨可爱的生活感

模板：
"cozy room setting with cream beige solid color wall, wooden shelves decorated with cute plush toys figurines and miniature cat costumes, warm homey atmosphere,"

### 第六部分：技术参数
"deep depth of field keeping both cat and food in sharp focus, soft warm natural lighting, 8K ultra HD resolution, hyper-realistic professional food photography, detailed fur and food textures, no text no watermarks no UI overlays"

## 输出格式
{
  "imagePrompt": "完整的英文提示词，严格按上述6部分结构组织",
  "videoPrompt": "完整的英文视频提示词",
  "explanation": "中文画面说明，描述生成的画面效果",
  "tips": "爆款建议：发布时间、配乐选择、系列化建议等",
  "soundSuggestion": "ASMR音效建议：咀嚼声、餐具声等"
}',
  FALSE,
  TRUE,
  'pro',
  0
);

-- =====================================================
-- 完成
-- =====================================================
