/**
 * Supabase Storage 上传工具
 * 用于将图片上传到 Supabase Storage 并获取公开 URL
 */

import { createClient } from './client';

const BUCKET_NAME = 'uploads';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * 上传图片到 Supabase Storage
 * @param blob 图片 Blob
 * @param userId 用户 ID（用于生成存储路径）
 * @returns 上传结果，包含公开 URL
 */
export async function uploadImageToStorage(
  blob: Blob,
  userId: string
): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // 生成唯一文件名：uploads/{user_id}/{timestamp}.jpg
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}.jpg`;

    // 上传文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message || '图片上传失败',
      };
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: '无法获取图片 URL',
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '图片上传失败',
    };
  }
}

/**
 * 删除 Storage 中的图片
 * @param filePath 文件路径
 */
export async function deleteImageFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
