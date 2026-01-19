# Supabase Storage 配置说明

## 创建 Storage Bucket

### 步骤 1: 登录 Supabase 控制台

1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 选择你的项目

### 步骤 2: 创建 Bucket

1. 在左侧菜单中点击 **Storage**
2. 点击 **New bucket** 按钮
3. 填写以下信息：
   - **Name**: `uploads`
   - **Public bucket**: ✅ **勾选**（设置为公开访问）
   - **File size limit**: 可选，建议设置为 10MB
   - **Allowed MIME types**: 可选，建议设置为 `image/jpeg,image/png,image/webp`

4. 点击 **Create bucket**

### 步骤 3: 配置 RLS 策略（可选但推荐）

为了安全性，建议配置以下 RLS 策略：

#### 允许已登录用户上传到自己的文件夹

```sql
-- 允许用户上传到自己的文件夹
CREATE POLICY "Users can upload to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### 允许所有人读取（公开访问）

```sql
-- 允许所有人读取
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

#### 允许用户删除自己的文件

```sql
-- 允许用户删除自己的文件
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 步骤 4: 验证配置

1. 在 Supabase 控制台的 Storage 页面，确认 `uploads` bucket 已创建
2. 确认 bucket 的 **Public** 标签显示为 **Public**
3. 尝试在应用中上传一张图片，检查是否成功

## 文件路径结构

上传的文件将按以下结构存储：

```
uploads/
  ├── {user_id_1}/
  │   ├── 1234567890.jpg
  │   ├── 1234567891.jpg
  │   └── ...
  ├── {user_id_2}/
  │   ├── 1234567892.jpg
  │   └── ...
  └── ...
```

- 每个用户的文件存储在独立的文件夹中（以 user_id 命名）
- 文件名使用时间戳（毫秒）+ `.jpg` 后缀

## 公开 URL 格式

上传成功后，文件的公开 URL 格式为：

```
https://{project_id}.supabase.co/storage/v1/object/public/uploads/{user_id}/{timestamp}.jpg
```

## 常见问题

### Q: 为什么要设置为 Public bucket？

A: 因为生成的图片 URL 需要被 Gemini API 访问，设置为 Public 可以让外部服务直接访问图片 URL，无需额外的认证。

### Q: 如何限制上传文件大小？

A: 在创建 bucket 时可以设置 **File size limit**，建议设置为 10MB。

### Q: 如何清理旧文件？

A: 可以使用 Supabase 的 Storage API 或编写定时任务来删除超过一定时间的文件。参考 `lib/supabase/storage.ts` 中的 `deleteImageFromStorage` 函数。

### Q: RLS 策略是必须的吗？

A: 不是必须的，但强烈推荐。RLS 策略可以确保：
- 用户只能上传到自己的文件夹
- 用户只能删除自己的文件
- 防止恶意用户上传大量文件

## 测试

配置完成后，可以通过以下方式测试：

1. 登录应用
2. 进入「视频提示词」页面
3. 选择「上传图片分析」模式
4. 上传一张图片
5. 检查是否显示「图片压缩完成」和「图片上传成功」的提示
6. 点击「分析图片」按钮
7. 检查是否成功分析并返回画面描述

如果遇到问题，请检查：
- Supabase 控制台的 Storage 日志
- 浏览器控制台的错误信息
- 服务端日志（Vercel Logs）
