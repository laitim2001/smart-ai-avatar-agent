/**
 * Avatar 元數據介面
 * Sprint 5: Avatar Gallery 擴充
 */
export interface AvatarMetadata {
  id: string
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  url: string
  thumbnail: string
  category: 'male' | 'female' | 'neutral'
  tags: string[]
  featured: boolean
  popularity: number
}

/**
 * Ready Player Me Avatar URLs 與元數據
 * Sprint 5: 擴充至 10+ Avatar
 *
 * 這些是公開的測試 Avatar URL，用於開發與測試階段。
 * 正式版應使用自己的 Ready Player Me 帳號建立的 Avatar。
 *
 * @see https://readyplayer.me/
 */
export const AVATARS_METADATA: AvatarMetadata[] = [
  // Female Avatars (4 個)
  {
    id: 'avatar-female-professional',
    name: '艾莉絲',
    nameEn: 'Alice',
    description: '專業商務風格，適合正式場合與商務對話',
    descriptionEn: 'Professional business style, suitable for formal occasions',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=Oculus%20Visemes',
    thumbnail: '👩‍💼',
    category: 'female',
    tags: ['professional', 'business', 'formal'],
    featured: true,
    popularity: 100,
  },
  {
    id: 'avatar-female-casual',
    name: '莉莉',
    nameEn: 'Lily',
    description: '休閒活潑風格，適合輕鬆友好的日常對話',
    descriptionEn: 'Casual and lively style, suitable for relaxed daily conversations',
    url: 'https://models.readyplayer.me/658228794c1a2f27fd06b253.glb?morphTargets=Oculus%20Visemes',
    thumbnail: '👩',
    category: 'female',
    tags: ['casual', 'friendly', 'everyday'],
    featured: true,
    popularity: 95,
  },
  {
    id: 'avatar-female-creative',
    name: '蘇菲',
    nameEn: 'Sophie',
    description: '創意藝術風格，適合設計與創意主題對話',
    descriptionEn: 'Creative artistic style, suitable for design and creative topics',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=Oculus%20Visemes', // 使用艾莉絲的模型
    thumbnail: '👩‍🎨',
    category: 'female',
    tags: ['creative', 'artistic', 'design'],
    featured: false,
    popularity: 75,
  },
  {
    id: 'avatar-female-tech',
    name: '艾瑪',
    nameEn: 'Emma',
    description: '科技專業風格，適合技術討論與教學對話',
    descriptionEn: 'Tech professional style, suitable for technical discussions',
    url: 'https://models.readyplayer.me/658228794c1a2f27fd06b253.glb?morphTargets=Oculus%20Visemes', // 使用莉莉的模型
    thumbnail: '👩‍💻',
    category: 'female',
    tags: ['tech', 'professional', 'education'],
    featured: false,
    popularity: 80,
  },

  // Male Avatars (4 個) - 更新為有效的 Ready Player Me URLs
  {
    id: 'avatar-male-casual',
    name: '傑克',
    nameEn: 'Jack',
    description: '休閒友善風格，適合日常交流與輕鬆對話',
    descriptionEn: 'Casual friendly style, suitable for daily communication',
    url: 'https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes',
    thumbnail: '👨',
    category: 'male',
    tags: ['casual', 'friendly', 'everyday'],
    featured: true,
    popularity: 90,
  },
  {
    id: 'avatar-male-professional',
    name: '麥克',
    nameEn: 'Mike',
    description: '專業商務風格，適合正式商談與諮詢服務',
    descriptionEn: 'Professional business style, suitable for formal consultations',
    url: 'https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes', // 使用傑克的模型
    thumbnail: '👨‍💼',
    category: 'male',
    tags: ['professional', 'business', 'consultant'],
    featured: false,
    popularity: 85,
  },
  {
    id: 'avatar-male-sporty',
    name: '萊恩',
    nameEn: 'Ryan',
    description: '運動活力風格，適合健身與運動主題對話',
    descriptionEn: 'Sporty energetic style, suitable for fitness topics',
    url: 'https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes', // 使用傑克的模型
    thumbnail: '🏃‍♂️',
    category: 'male',
    tags: ['sporty', 'energetic', 'fitness'],
    featured: false,
    popularity: 70,
  },
  {
    id: 'avatar-male-academic',
    name: '大衛',
    nameEn: 'David',
    description: '學術專業風格，適合教育與研究主題討論',
    descriptionEn: 'Academic professional style, suitable for education and research',
    url: 'https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes', // 使用傑克的模型
    thumbnail: '👨‍🏫',
    category: 'male',
    tags: ['academic', 'education', 'research'],
    featured: false,
    popularity: 78,
  },

  // Neutral Avatars (3 個)
  {
    id: 'avatar-neutral-modern',
    name: '凱西',
    nameEn: 'Casey',
    description: '現代中性風格，適合多元包容的對話場景',
    descriptionEn: 'Modern neutral style, suitable for inclusive conversations',
    url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=Oculus%20Visemes', // 使用艾莉絲的模型
    thumbnail: '🧑',
    category: 'neutral',
    tags: ['modern', 'neutral', 'inclusive'],
    featured: true,
    popularity: 88,
  },
  {
    id: 'avatar-neutral-tech',
    name: '泰勒',
    nameEn: 'Taylor',
    description: '科技中性風格，適合未來科技與 AI 主題',
    descriptionEn: 'Tech neutral style, suitable for future tech and AI topics',
    url: 'https://models.readyplayer.me/658228794c1a2f27fd06b253.glb?morphTargets=Oculus%20Visemes', // 使用莉莉的模型
    thumbnail: '🧑‍💻',
    category: 'neutral',
    tags: ['tech', 'futuristic', 'ai'],
    featured: false,
    popularity: 82,
  },
  {
    id: 'avatar-neutral-creative',
    name: '喬登',
    nameEn: 'Jordan',
    description: '創意中性風格，適合藝術與設計主題對話',
    descriptionEn: 'Creative neutral style, suitable for art and design topics',
    url: 'https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes', // 使用傑克的有效模型
    thumbnail: '🧑‍🎨',
    category: 'neutral',
    tags: ['creative', 'artistic', 'design'],
    featured: false,
    popularity: 76,
  },
]

/**
 * Legacy: Avatar URLs (保持向下兼容)
 * @deprecated 使用 AVATARS_METADATA 替代
 */
export const AVATAR_URLS = {
  avatar1: AVATARS_METADATA[0].url,
  avatar2: AVATARS_METADATA[4].url,
  avatar3: AVATARS_METADATA[1].url,
} as const

/**
 * 預設 Avatar URL
 */
export const DEFAULT_AVATAR_URL = AVATARS_METADATA[0].url

/**
 * Avatar URL 類型 (Legacy)
 * @deprecated
 */
export type AvatarKey = keyof typeof AVATAR_URLS

/**
 * Avatar 分類
 */
export type AvatarCategory = 'male' | 'female' | 'neutral' | 'all'

/**
 * Avatar 標籤
 */
export const AVATAR_TAGS = [
  'professional',
  'business',
  'casual',
  'friendly',
  'creative',
  'artistic',
  'tech',
  'sporty',
  'academic',
  'modern',
  'futuristic',
  'education',
  'design',
  'fitness',
  'consultant',
  'everyday',
  'formal',
  'inclusive',
  'ai',
  'research',
] as const

export type AvatarTag = typeof AVATAR_TAGS[number]

/**
 * Ready Player Me Avatar Blendshapes 常數
 *
 * Blendshapes（變形目標）用於控制 Avatar 的臉部表情。
 * 值範圍：0-1（0 = 無變形，1 = 完全變形）
 *
 * @see https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets
 */
export const BLENDSHAPES = {
  /**
   * 眼睛閉合（眨眼）
   * 用於：眨眼動畫、睡眠表情
   */
  EYES_CLOSED: 'eyesClosed',

  /**
   * 微笑表情
   * 用於：愉快、友好情緒
   */
  SMILE: 'mouthSmile',

  /**
   * 皺眉表情
   * 用於：不滿、困惑情緒
   */
  FROWN: 'mouthFrown',

  /**
   * 睜大眼睛
   * 用於：驚訝、專注情緒
   */
  EYES_WIDE: 'eyesWide',

  /**
   * 揚眉
   * 用於：好奇、疑問情緒
   */
  BROW_UP: 'browInnerUp',

  /**
   * 張嘴
   * 用於：說話、驚訝
   */
  MOUTH_OPEN: 'mouthOpen',
} as const

/**
 * Blendshape 名稱類型
 */
export type BlendshapeName = typeof BLENDSHAPES[keyof typeof BLENDSHAPES]
