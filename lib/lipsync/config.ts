/**
 * Lip Sync 配置與預設值
 * @module lib/lipsync/config
 * @description 提供可調整的 Lip Sync 參數配置
 */

import { LipSyncConfig } from '@/types/lipsync'
import { Easing, EasingFunction } from './mouth-animator'

/**
 * 預設 Lip Sync 配置
 */
export const DEFAULT_LIPSYNC_CONFIG: Required<LipSyncConfig> = {
  enabled: true,
  smoothing: 0.05, // 50ms 平滑過渡
  intensity: 1.0, // 100% 強度
  lookAhead: 0.1, // 100ms 預視時間（用於 co-articulation）
  fallbackMode: 'volume', // 降級模式：使用音量分析
}

/**
 * Lip Sync 配置預設值集合
 */
export const LIPSYNC_PRESETS = {
  /**
   * 標準配置（預設）
   * 適合大多數場景，平衡質量與性能
   */
  standard: {
    enabled: true,
    smoothing: 0.05,
    intensity: 1.0,
    lookAhead: 0.1,
    fallbackMode: 'volume' as const,
  },

  /**
   * 高質量配置
   * 更平滑的過渡，更自然的 co-articulation
   */
  highQuality: {
    enabled: true,
    smoothing: 0.08,
    intensity: 1.1,
    lookAhead: 0.15,
    fallbackMode: 'volume' as const,
  },

  /**
   * 性能優化配置
   * 更快的過渡，減少計算負載
   */
  performance: {
    enabled: true,
    smoothing: 0.03,
    intensity: 0.9,
    lookAhead: 0.05,
    fallbackMode: 'volume' as const,
  },

  /**
   * 誇張配置
   * 更強烈的嘴型表現，適合卡通風格
   */
  exaggerated: {
    enabled: true,
    smoothing: 0.04,
    intensity: 1.5,
    lookAhead: 0.1,
    fallbackMode: 'volume' as const,
  },

  /**
   * 細膩配置
   * 更精細的嘴型控制，適合真實風格
   */
  subtle: {
    enabled: true,
    smoothing: 0.06,
    intensity: 0.7,
    lookAhead: 0.12,
    fallbackMode: 'volume' as const,
  },

  /**
   * 禁用配置
   * 完全關閉 Lip Sync
   */
  disabled: {
    enabled: false,
    smoothing: 0.05,
    intensity: 1.0,
    lookAhead: 0.1,
    fallbackMode: 'silent' as const,
  },
} as const

/**
 * 緩動函數預設值
 */
export const EASING_PRESETS: Record<string, EasingFunction> = {
  linear: Easing.linear,
  smooth: Easing.easeInOutQuad,
  natural: Easing.easeOutQuad,
  elastic: Easing.easeOutElastic,
  cubic: Easing.easeInOutCubic,
}

/**
 * Lip Sync 性能限制
 */
export const LIPSYNC_LIMITS = {
  /** 最小平滑時間（秒） */
  minSmoothing: 0.01,
  /** 最大平滑時間（秒） */
  maxSmoothing: 0.5,

  /** 最小強度倍數 */
  minIntensity: 0.1,
  /** 最大強度倍數 */
  maxIntensity: 3.0,

  /** 最小預視時間（秒） */
  minLookAhead: 0.0,
  /** 最大預視時間（秒） */
  maxLookAhead: 0.5,

  /** 最大 Viseme 數量（超過則警告性能問題） */
  maxVisemeCount: 1000,

  /** 最小音訊長度（秒） */
  minAudioDuration: 0.1,
  /** 最大音訊長度（秒） */
  maxAudioDuration: 300, // 5 分鐘
}

/**
 * 驗證 Lip Sync 配置參數
 *
 * @param config - 要驗證的配置
 * @returns {Required<LipSyncConfig>} 驗證並標準化後的配置
 */
export function validateLipSyncConfig(
  config: Partial<LipSyncConfig>
): Required<LipSyncConfig> {
  const validated: Required<LipSyncConfig> = {
    enabled: config.enabled ?? DEFAULT_LIPSYNC_CONFIG.enabled,
    smoothing: clamp(
      config.smoothing ?? DEFAULT_LIPSYNC_CONFIG.smoothing,
      LIPSYNC_LIMITS.minSmoothing,
      LIPSYNC_LIMITS.maxSmoothing
    ),
    intensity: clamp(
      config.intensity ?? DEFAULT_LIPSYNC_CONFIG.intensity,
      LIPSYNC_LIMITS.minIntensity,
      LIPSYNC_LIMITS.maxIntensity
    ),
    lookAhead: clamp(
      config.lookAhead ?? DEFAULT_LIPSYNC_CONFIG.lookAhead,
      LIPSYNC_LIMITS.minLookAhead,
      LIPSYNC_LIMITS.maxLookAhead
    ),
    fallbackMode: config.fallbackMode ?? DEFAULT_LIPSYNC_CONFIG.fallbackMode,
  }

  return validated
}

/**
 * 限制數值範圍
 *
 * @param value - 要限制的值
 * @param min - 最小值
 * @param max - 最大值
 * @returns {number} 限制後的值
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * 取得預設配置
 *
 * @param presetName - 預設配置名稱
 * @returns {Required<LipSyncConfig>} Lip Sync 配置
 */
export function getLipSyncPreset(
  presetName: keyof typeof LIPSYNC_PRESETS
): Required<LipSyncConfig> {
  return { ...LIPSYNC_PRESETS[presetName] }
}

/**
 * 混合兩個配置
 *
 * @param config1 - 第一個配置
 * @param config2 - 第二個配置
 * @param blendFactor - 混合係數 (0-1)，0 = 完全 config1，1 = 完全 config2
 * @returns {Required<LipSyncConfig>} 混合後的配置
 */
export function blendLipSyncConfigs(
  config1: Required<LipSyncConfig>,
  config2: Required<LipSyncConfig>,
  blendFactor: number
): Required<LipSyncConfig> {
  const t = clamp(blendFactor, 0, 1)

  return {
    enabled: t < 0.5 ? config1.enabled : config2.enabled,
    smoothing: lerp(config1.smoothing, config2.smoothing, t),
    intensity: lerp(config1.intensity, config2.intensity, t),
    lookAhead: lerp(config1.lookAhead, config2.lookAhead, t),
    fallbackMode: t < 0.5 ? config1.fallbackMode : config2.fallbackMode,
  }
}

/**
 * 線性插值
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * 取得推薦配置（基於性能與質量要求）
 *
 * @param options - 配置選項
 * @returns {Required<LipSyncConfig>} 推薦的 Lip Sync 配置
 */
export function getRecommendedConfig(options: {
  qualityLevel?: 'low' | 'medium' | 'high'
  avatarStyle?: 'realistic' | 'cartoon' | 'anime'
  performancePriority?: boolean
}): Required<LipSyncConfig> {
  const { qualityLevel = 'medium', avatarStyle = 'realistic', performancePriority = false } = options

  // 性能優先
  if (performancePriority) {
    return getLipSyncPreset('performance')
  }

  // 根據質量等級
  if (qualityLevel === 'high') {
    return getLipSyncPreset('highQuality')
  } else if (qualityLevel === 'low') {
    return getLipSyncPreset('performance')
  }

  // 根據 Avatar 風格
  if (avatarStyle === 'cartoon' || avatarStyle === 'anime') {
    return getLipSyncPreset('exaggerated')
  } else if (avatarStyle === 'realistic') {
    return getLipSyncPreset('subtle')
  }

  // 預設標準配置
  return getLipSyncPreset('standard')
}
