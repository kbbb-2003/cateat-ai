export interface ActionOption {
  id: string;
  label: string;
  en: string;
}

export interface ActionCategory {
  id: string;
  label: string;
  actions: ActionOption[];
}

export const PRESET_ACTIONS: ActionCategory[] = [
  {
    id: 'eating',
    label: '🍽️ 吃东西',
    actions: [
      { id: 'bite', label: '咬一口', en: 'takes a bite of the food' },
      { id: 'chew', label: '咀嚼', en: 'chews slowly with satisfied expression' },
      { id: 'swallow', label: '吞咽', en: 'swallows the food' },
      { id: 'lick_lips', label: '舔嘴唇', en: 'licks lips with satisfaction' },
    ],
  },
  {
    id: 'expression',
    label: '😊 表情',
    actions: [
      { id: 'blink', label: '眨眼', en: 'blinks eyes slowly' },
      { id: 'surprised', label: '惊讶', en: 'looks surprised with wide eyes' },
      { id: 'satisfied', label: '满足', en: 'shows satisfied happy expression' },
      { id: 'anticipation', label: '期待', en: 'looks at food with anticipation' },
    ],
  },
  {
    id: 'head',
    label: '🐱 头部动作',
    actions: [
      { id: 'nod', label: '点头', en: 'nods head gently' },
      { id: 'shake', label: '摇头', en: 'shakes head slightly' },
      { id: 'tilt', label: '歪头', en: 'tilts head cutely to the side' },
      { id: 'turn_to_food', label: '看向食物', en: 'turns head to look at the food' },
    ],
  },
  {
    id: 'paws',
    label: '🐾 爪子动作',
    actions: [
      { id: 'pick_up', label: '拿起食物', en: 'picks up food with both front paws' },
      { id: 'put_down', label: '放下食物', en: 'puts down the food gently' },
      { id: 'wave', label: '挥爪', en: 'waves paw cutely' },
    ],
  },
];

// 音效推荐选项
export interface SoundOption {
  id: string;
  label: string;
  description: string;
  isPro: boolean;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'blogger_style',
    label: '🔥 博主同款',
    description: '爆款音效搭配',
    isPro: true,
  },
  {
    id: 'asmr_eating',
    label: '🎧 ASMR吃播',
    description: '咀嚼声+环境白噪音',
    isPro: false,
  },
  {
    id: 'cute_bgm',
    label: '🎵 可爱BGM',
    description: '轻快卡通背景音乐',
    isPro: false,
  },
  {
    id: 'relaxing',
    label: '😌 治愈系',
    description: '轻音乐+自然音效',
    isPro: false,
  },
  {
    id: 'funny',
    label: '😂 搞笑风格',
    description: '夸张音效+综艺配乐',
    isPro: false,
  },
  {
    id: 'none',
    label: '🔇 不需要推荐',
    description: '我自己选音效',
    isPro: false,
  },
];
