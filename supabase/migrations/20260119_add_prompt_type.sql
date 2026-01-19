-- Add prompt_type column to prompts_history table
ALTER TABLE prompts_history
ADD COLUMN IF NOT EXISTS prompt_type VARCHAR(20) DEFAULT 'image';

-- Add comment to explain the column
COMMENT ON COLUMN prompts_history.prompt_type IS 'Type of prompt: image or video';

-- Update existing records based on content
-- Records with video_prompt but no image_prompt are video type
UPDATE prompts_history
SET prompt_type = 'video'
WHERE video_prompt IS NOT NULL
  AND video_prompt != ''
  AND (image_prompt IS NULL OR image_prompt = '');

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_prompts_history_prompt_type ON prompts_history(prompt_type);
CREATE INDEX IF NOT EXISTS idx_prompts_history_user_type ON prompts_history(user_id, prompt_type);
