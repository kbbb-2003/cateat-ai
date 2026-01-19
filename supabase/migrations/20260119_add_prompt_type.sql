-- Add prompt_type column to prompts_history table
ALTER TABLE prompts_history
ADD COLUMN IF NOT EXISTS prompt_type VARCHAR(20) DEFAULT 'image';

-- Add comment to explain the column
COMMENT ON COLUMN prompts_history.prompt_type IS 'Type of prompt: image or video';
