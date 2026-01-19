-- =====================================================
-- 猫猫吃播提示词生成器 - 数据库初始化脚本
-- =====================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. visual_styles（视觉风格表）
-- =====================================================
CREATE TABLE visual_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  description TEXT,
  prompt_keywords TEXT NOT NULL,
  example_prompt TEXT,
  thumbnail_url TEXT,
  recommended_for TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. cats（猫咪角色表）
-- =====================================================
CREATE TABLE cats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,

  breed VARCHAR(50) NOT NULL,
  breed_en VARCHAR(100),

  body_type VARCHAR(30) NOT NULL,
  body_type_en VARCHAR(50),
  fur_color VARCHAR(50),
  fur_color_en VARCHAR(50),
  fur_texture VARCHAR(30),
  fur_texture_en VARCHAR(50),
  special_features TEXT,
  special_features_en TEXT,

  personality VARCHAR(30),
  personality_en VARCHAR(50),

  default_style_id UUID REFERENCES visual_styles(id),

  avatar_url TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. foods（食物模板表）
-- =====================================================
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,

  heat_level INT DEFAULT 3 CHECK (heat_level BETWEEN 1 AND 5),
  difficulty INT DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),

  visual_keywords TEXT NOT NULL,
  texture_keywords TEXT,
  sound_keywords TEXT,

  emoji VARCHAR(10),
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. emotions（情绪/动作表）
-- =====================================================
CREATE TABLE emotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  category VARCHAR(30),
  description TEXT,

  action_keywords TEXT NOT NULL,
  facial_expression TEXT NOT NULL,
  body_language TEXT,

  emoji VARCHAR(10),
  intensity INT DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. scenes（场景模板表）
-- =====================================================
CREATE TABLE scenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  description TEXT,

  visual_keywords TEXT NOT NULL,
  lighting_keywords TEXT,
  camera_angle TEXT,
  atmosphere TEXT,

  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. prompt_templates（专业提示词模板表）⭐ 核心表
-- =====================================================
CREATE TABLE prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0',

  image_prompt_template TEXT NOT NULL,
  video_prompt_template TEXT NOT NULL,

  system_prompt TEXT NOT NULL,

  include_tips BOOLEAN DEFAULT TRUE,
  include_sound_suggestion BOOLEAN DEFAULT TRUE,
  tips_template TEXT,

  example_input JSONB,
  example_output JSONB,

  applicable_styles UUID[],
  applicable_foods UUID[],
  applicable_emotions UUID[],

  min_plan_type VARCHAR(20) DEFAULT 'pro' CHECK (min_plan_type IN ('pro', 'vip')),

  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  use_count INT DEFAULT 0,
  success_rate DECIMAL(5,2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. prompts_history（生成历史表）
-- =====================================================
CREATE TABLE prompts_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  cat_id UUID REFERENCES cats(id) ON DELETE SET NULL,
  style_id UUID REFERENCES visual_styles(id) ON DELETE SET NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  emotion_id UUID REFERENCES emotions(id) ON DELETE SET NULL,
  scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,

  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  generation_mode VARCHAR(20) DEFAULT 'basic',

  image_prompt TEXT NOT NULL,
  video_prompt TEXT NOT NULL,
  explanation TEXT,
  tips TEXT,
  sound_suggestion TEXT,

  input_snapshot JSONB,

  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  is_favorite BOOLEAN DEFAULT FALSE,
  copy_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. user_profiles（用户配置表）
-- =====================================================
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255),
  nickname VARCHAR(50),
  avatar_url TEXT,

  plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'vip')),
  plan_expires_at TIMESTAMPTZ,

  daily_usage INT DEFAULT 0,
  usage_reset_at TIMESTAMPTZ DEFAULT NOW(),
  total_generations INT DEFAULT 0,

  default_style_id UUID REFERENCES visual_styles(id),
  preferred_template_id UUID REFERENCES prompt_templates(id),

  is_admin BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 索引设计
-- =====================================================
CREATE INDEX idx_cats_user_id ON cats(user_id);
CREATE INDEX idx_cats_is_preset ON cats(is_preset);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_is_active ON foods(is_active);
CREATE INDEX idx_emotions_category ON emotions(category);
CREATE INDEX idx_prompts_history_user_id ON prompts_history(user_id);
CREATE INDEX idx_prompts_history_created_at ON prompts_history(created_at DESC);
CREATE INDEX idx_prompts_history_template_id ON prompts_history(template_id);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active);
CREATE INDEX idx_prompt_templates_default ON prompt_templates(is_default);

-- =====================================================
-- RLS 策略
-- =====================================================

-- 启用 RLS
ALTER TABLE visual_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- visual_styles 策略
CREATE POLICY "所有人可读取启用的视觉风格"
  ON visual_styles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "管理员可管理视觉风格"
  ON visual_styles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- cats 策略
CREATE POLICY "用户可读取自己的猫咪、预设猫咪和公开猫咪"
  ON cats FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_preset = TRUE OR
    is_public = TRUE
  );

CREATE POLICY "用户可创建自己的猫咪"
  ON cats FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可更新自己的猫咪"
  ON cats FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "用户可删除自己的猫咪"
  ON cats FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "管理员可管理预设猫咪"
  ON cats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- foods 策略
CREATE POLICY "所有人可读取启用的食物"
  ON foods FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "管理员可管理食物"
  ON foods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- emotions 策略
CREATE POLICY "所有人可读取启用的情绪"
  ON emotions FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "管理员可管理情绪"
  ON emotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- scenes 策略
CREATE POLICY "所有人可读取启用的场景"
  ON scenes FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "管理员可管理场景"
  ON scenes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- prompt_templates 策略
CREATE POLICY "登录用户可读取启用的模板"
  ON prompt_templates FOR SELECT
  USING (is_active = TRUE AND auth.uid() IS NOT NULL);

CREATE POLICY "管理员可管理模板"
  ON prompt_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- prompts_history 策略
CREATE POLICY "用户可读取自己的历史记录"
  ON prompts_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "用户可创建自己的历史记录"
  ON prompts_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户可更新自己的历史记录"
  ON prompts_history FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "用户可删除自己的历史记录"
  ON prompts_history FOR DELETE
  USING (user_id = auth.uid());

-- user_profiles 策略
CREATE POLICY "用户可读取自己的配置"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "用户可更新自己的配置"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- =====================================================
-- Trigger：自动创建用户配置
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 完成
-- =====================================================
