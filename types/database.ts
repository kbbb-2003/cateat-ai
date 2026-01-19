// 数据库类型定义

export interface VisualStyle {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  prompt_keywords: string;
  example_prompt: string | null;
  thumbnail_url: string | null;
  recommended_for: string | null;
  sort_order: number;
  is_active: boolean;
  is_premium: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface Cat {
  id: string | null;
  user_id: string | null;
  name: string;
  breed: string;
  breed_en: string | null;
  body_type: string;
  body_type_en: string | null;
  fur_color: string | null;
  fur_color_en: string | null;
  fur_texture: string | null;
  fur_texture_en: string | null;
  special_features: string | null;
  special_features_en: string | null;
  personality: string | null;
  personality_en: string | null;
  default_style_id: string | null;
  avatar_url: string | null;
  is_preset: boolean;
  is_public: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
  customDescription?: string; // 自定义猫咪描述
}

export interface Food {
  id: string;
  name: string;
  name_en: string;
  category: string;
  heat_level: number;
  difficulty: number;
  visual_keywords: string;
  texture_keywords: string | null;
  sound_keywords: string | null;
  emoji: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface Emotion {
  id: string;
  name: string;
  name_en: string;
  category: string | null;
  description: string | null;
  action_keywords: string;
  facial_expression: string;
  body_language: string | null;
  emoji: string | null;
  intensity: number;
  is_active: boolean;
  sort_order: number;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  name: string;
  name_en: string;
  description: string | null;
  visual_keywords: string;
  lighting_keywords: string | null;
  camera_angle: string | null;
  atmosphere: string | null;
  thumbnail_url: string | null;
  is_premium: boolean;
  is_active: boolean;
  sort_order: number;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  version: string;
  image_prompt_template: string;
  video_prompt_template: string;
  system_prompt: string;
  include_tips: boolean;
  include_sound_suggestion: boolean;
  tips_template: string | null;
  example_input: any;
  example_output: any;
  applicable_styles: string[] | null;
  applicable_foods: string[] | null;
  applicable_emotions: string[] | null;
  min_plan_type: string;
  is_active: boolean;
  is_default: boolean;
  use_count: number;
  success_rate: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  nickname: string | null;
  avatar_url: string | null;
  plan_type: 'free' | 'pro' | 'vip';
  plan_expires_at: string | null;
  daily_usage: number;
  usage_reset_at: string;
  total_generations: number;
  default_style_id: string | null;
  preferred_template_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomCat {
  breed: string;
  bodyType: string;
  furColor?: string;
  personality?: string;
  specialFeatures?: string;
}
