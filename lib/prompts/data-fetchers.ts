import { createClient } from '@supabase/supabase-js';
import type {
  Cat,
  VisualStyle,
  Food,
  Emotion,
  Scene,
  PromptTemplate,
  CustomCat,
} from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function getCatById(catId: string): Promise<Cat | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .eq('id', catId)
      .single();

    if (error) {
      console.error('Error fetching cat:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getCatById error:', error);
    return null;
  }
}

export function formatCustomCat(customCat: CustomCat): Cat {
  return {
    id: 'custom',
    user_id: null,
    name: '自定义猫咪',
    breed: customCat.breed,
    breed_en: customCat.breed,
    body_type: customCat.bodyType,
    body_type_en: customCat.bodyType,
    fur_color: customCat.furColor || '',
    fur_color_en: customCat.furColor || '',
    fur_texture: null,
    fur_texture_en: null,
    special_features: customCat.specialFeatures || '',
    special_features_en: customCat.specialFeatures || '',
    personality: customCat.personality || '',
    personality_en: customCat.personality || '',
    default_style_id: null,
    avatar_url: null,
    is_preset: false,
    is_public: false,
    use_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getStyleById(styleId: string): Promise<VisualStyle | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('visual_styles')
      .select('*')
      .eq('id', styleId)
      .single();

    if (error) {
      console.error('Error fetching style:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getStyleById error:', error);
    return null;
  }
}

export async function getFoodById(foodId: string): Promise<Food | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .single();

    if (error) {
      console.error('Error fetching food:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getFoodById error:', error);
    return null;
  }
}

export async function getFoodsByIds(foodIds: string[]): Promise<Food[]> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .in('id', foodIds);

    if (error) {
      console.error('Error fetching foods:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('getFoodsByIds error:', error);
    return [];
  }
}

export async function getEmotionById(emotionId: string): Promise<Emotion | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('emotions')
      .select('*')
      .eq('id', emotionId)
      .single();

    if (error) {
      console.error('Error fetching emotion:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getEmotionById error:', error);
    return null;
  }
}

export async function getSceneById(sceneId: string): Promise<Scene | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .eq('id', sceneId)
      .single();

    if (error) {
      console.error('Error fetching scene:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getSceneById error:', error);
    return null;
  }
}

export async function getTemplateById(
  templateId: string
): Promise<PromptTemplate | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getTemplateById error:', error);
    return null;
  }
}

export async function getDefaultTemplate(): Promise<PromptTemplate | null> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('is_default', true)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching default template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('getDefaultTemplate error:', error);
    return null;
  }
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase.rpc('increment', {
      row_id: templateId,
      table_name: 'prompt_templates',
      column_name: 'use_count',
    });

    if (error) {
      console.error('Error incrementing template usage:', error);
    }
  } catch (error) {
    console.error('incrementTemplateUsage error:', error);
  }
}
