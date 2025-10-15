/**
 * Ready Player Me Avatar URLs
 *
 * 這些是公開的測試 Avatar URL，用於開發與測試階段。
 * 正式版應使用自己的 Ready Player Me 帳號建立的 Avatar。
 *
 * @see https://readyplayer.me/
 */
export const AVATAR_URLS = {
  /**
   * Avatar 1: 女性，專業風格
   * 適合商務場景展示
   */
  avatar1: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb',

  /**
   * Avatar 2: 男性，休閒風格
   * 適合一般對話場景
   */
  avatar2: 'https://models.readyplayer.me/6419b4d5c2efa2a5b0f4c3d1.glb',

  /**
   * Avatar 3: 女性，年輕風格
   * 適合活潑對話場景
   */
  avatar3: 'https://models.readyplayer.me/658228794c1a2f27fd06b253.glb',
} as const

/**
 * 預設 Avatar URL
 */
export const DEFAULT_AVATAR_URL = AVATAR_URLS.avatar1

/**
 * Avatar URL 類型
 */
export type AvatarKey = keyof typeof AVATAR_URLS

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
