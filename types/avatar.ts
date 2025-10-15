import { Group } from 'three'

/**
 * Avatar 模型組件的 Props
 *
 * @property modelUrl - Ready Player Me GLB 模型 URL
 * @property position - 模型在場景中的位置 [x, y, z]，預設 [0, 0, 0]
 * @property scale - 模型縮放比例，預設 1
 * @property onLoad - 模型載入成功時的回調函式
 * @property onError - 模型載入失敗時的回調函式
 */
export interface AvatarModelProps {
  modelUrl: string
  position?: [number, number, number]
  scale?: number
  onLoad?: (model: Group) => void
  onError?: (error: Error) => void
}

/**
 * Avatar 狀態管理介面
 *
 * @property isLoading - 模型是否正在載入中
 * @property error - 錯誤訊息，null 表示無錯誤
 * @property modelUrl - 當前載入的模型 URL
 */
export interface AvatarState {
  isLoading: boolean
  error: string | null
  modelUrl: string
}

/**
 * Avatar Blendshapes 控制介面
 *
 * Blendshapes 用於控制 Avatar 的臉部表情與嘴型
 * Key 為 blendshape 名稱，Value 為權重 (0-1)
 *
 * @example
 * ```typescript
 * const blendshapes: Blendshapes = {
 *   'mouthSmile': 0.8,  // 微笑 80%
 *   'eyeBlink': 1.0,    // 眨眼 100%
 * }
 * ```
 */
export interface Blendshapes {
  [key: string]: number
}

/**
 * Avatar 動畫狀態
 *
 * @property isPlaying - 動畫是否正在播放
 * @property currentAnimation - 當前播放的動畫名稱
 * @property loop - 是否循環播放
 */
export interface AvatarAnimationState {
  isPlaying: boolean
  currentAnimation: string | null
  loop: boolean
}
