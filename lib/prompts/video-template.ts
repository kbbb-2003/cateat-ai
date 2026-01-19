// ============ 基础版模板（免费用户）============
// 简化模板，只包含 Frame + Action，不含 Crucial、Picture、Sound

export function buildBasicVideoPrompt(
  frameDescription: string,
  actionDescription: string
): string {
  return `${frameDescription}. ${actionDescription}. Smooth natural motion, cinematic quality, 4K high definition video.`;
}

// ============ 专业版模板（Pro/VIP用户）============
// 完整模板，包含 Crucial + Frame + Action + Picture + Sound（可选）

// 专业版基础部分（不含音效）
export const PROFESSIONAL_BASE_TEMPLATE = `Crucial: maintain absolute visual consistency with the initial reference frame throughout the entire sequence:1.7, continuous uninterrupted single shot video, seamless fluid motion, no cuts, no jump cuts, no camera angle changes, designed as one smooth long take sequences.

Frame: {FRAME_DESCRIPTION}

Action: {ACTION_DESCRIPTION}

Picture: Do not change the color tone of the picture, do not change the cat's fur color, and keep the same color tone as the first frame of the picture`;

// 音效部分（仅博主同款）
export const SOUND_SECTION = `

Sound: Binaural ASMR audio experience, pristine audio quality with zero background noise, highly sensitive microphone capture, distinct and detailed mouth sounds, immersive stereo soundscape, macro lens shots focusing on textures. From time to time, there are the purring sounds of cats in the background`;

// 生成专业版视频提示词
export function buildProfessionalVideoPrompt(
  frameDescription: string,
  actionDescription: string,
  includeSound: boolean = false
): string {
  let prompt = PROFESSIONAL_BASE_TEMPLATE
    .replace('{FRAME_DESCRIPTION}', frameDescription)
    .replace('{ACTION_DESCRIPTION}', actionDescription);

  // 只有选择博主同款时才添加 Sound 部分
  if (includeSound) {
    prompt += SOUND_SECTION;
  }

  return prompt;
}

// ============ 统一入口函数 ============
// 根据用户版本自动选择模板

export function buildVideoPrompt(
  frameDescription: string,
  actionDescription: string,
  options: {
    isPremium: boolean;      // 是否专业版用户
    includeSound?: boolean;  // 是否包含博主同款音效
  }
): string {
  if (options.isPremium) {
    return buildProfessionalVideoPrompt(frameDescription, actionDescription, options.includeSound || false);
  } else {
    return buildBasicVideoPrompt(frameDescription, actionDescription);
  }
}
