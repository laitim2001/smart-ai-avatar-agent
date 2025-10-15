/**
 * Lip Sync 模組入口
 * @module lib/lipsync
 * @description 統一導出所有 Lip Sync 相關功能
 */

// 控制器
export { LipSyncController, getLipSyncController, resetLipSyncController } from './controller'

// Viseme 映射
export {
  VISEME_BLENDSHAPE_MAP,
  getBlendshapeForViseme,
  mapVisemesToBlendshapes,
  checkVisemeSupport,
  getSupportedVisemes,
  getVisemeIndex,
  buildVisemeIndexCache,
  normalizeWeight,
  applyIntensity,
} from './viseme-mapper'

// 嘴型動畫
export {
  MouthAnimator,
  Easing,
  lerp,
  blendTargets,
  type MouthAnimatorConfig,
  type EasingFunction,
} from './mouth-animator'

// 配置
export {
  DEFAULT_LIPSYNC_CONFIG,
  LIPSYNC_PRESETS,
  EASING_PRESETS,
  LIPSYNC_LIMITS,
  validateLipSyncConfig,
  getLipSyncPreset,
  blendLipSyncConfigs,
  getRecommendedConfig,
} from './config'

// 降級方案
export {
  VolumeDrivenLipSync,
  SilentLipSync,
  LipSyncFallbackManager,
  createFallbackMessage,
  checkLipSyncAvailability,
  type FallbackMode,
} from './fallback'

// 類型定義（重新導出）
export type {
  VisemeData,
  BlendshapeTarget,
  VisemeBlendshapeMapping,
  LipSyncData,
  LipSyncConfig,
  LipSyncState,
  LipSyncController as ILipSyncController,
  TTSResponseWithVisemes,
} from '@/types/lipsync'
