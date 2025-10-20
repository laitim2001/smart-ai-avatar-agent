/**
 * 嘴型動畫控制器
 * @module lib/lipsync/mouth-animator
 * @description 提供平滑的嘴型 Blendshape 過渡與動畫控制
 */

import { SkinnedMesh } from 'three'
import { BlendshapeTarget } from '@/types/lipsync'
import { normalizeWeight, applyIntensity } from './viseme-mapper'

/**
 * 緩動函數類型
 */
export type EasingFunction = (t: number) => number

/**
 * 預設緩動函數集合
 */
export const Easing = {
  /**
   * 線性緩動
   */
  linear: (t: number): number => t,

  /**
   * 緩入緩出（平滑過渡）
   */
  easeInOutQuad: (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

  /**
   * 緩入緩出（更平滑）
   */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /**
   * 緩出（快速啟動，緩慢結束）
   */
  easeOutQuad: (t: number): number => t * (2 - t),

  /**
   * 彈性緩動（輕微回彈效果）
   */
  easeOutElastic: (t: number): number => {
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1
  },
}

/**
 * Blendshape 過渡狀態
 */
interface BlendshapeTransition {
  /** 目標 Blendshape 名稱 */
  targetName: string
  /** 目標權重 */
  targetWeight: number
  /** 當前權重 */
  currentWeight: number
  /** 過渡開始時間 */
  startTime: number
  /** 過渡持續時間 */
  duration: number
  /** 緩動函數 */
  easing: EasingFunction
}

/**
 * 嘴型動畫控制器配置
 */
export interface MouthAnimatorConfig {
  /** 平滑過渡時間（秒），預設 0.05 */
  smoothing?: number
  /** Viseme 強度倍數（0-2），預設 1.0 */
  intensity?: number
  /** 緩動函數，預設 easeOutQuad */
  easing?: EasingFunction
  /** 是否啟用 co-articulation（協同發音），預設 true */
  coArticulation?: boolean
  /** Co-articulation 預視時間（秒），預設 0.1 */
  lookAhead?: number
}

/**
 * 嘴型動畫控制器
 *
 * 提供平滑的 Blendshape 過渡、Co-articulation 支援、多種緩動函數
 */
export class MouthAnimator {
  private config: Required<MouthAnimatorConfig>
  private transitions: Map<string, BlendshapeTransition> = new Map()
  private visemeIndexCache: Map<string, number> = new Map()
  private previousTarget: BlendshapeTarget | null = null
  private lastLogTime: number = 0

  constructor(config: MouthAnimatorConfig = {}) {
    this.config = {
      smoothing: config.smoothing ?? 0.05,
      intensity: config.intensity ?? 1.0,
      easing: config.easing ?? Easing.easeOutQuad,
      coArticulation: config.coArticulation ?? true,
      lookAhead: config.lookAhead ?? 0.1,
    }
  }

  /**
   * 初始化 Viseme Blendshape 索引快取
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   */
  initialize(headMesh: SkinnedMesh): void {
    if (!headMesh.morphTargetDictionary) {
      console.warn('[MouthAnimator] Avatar 不支援 morphTargetDictionary')
      return
    }

    // 建立 Viseme Blendshape 索引快取
    this.visemeIndexCache.clear()

    const visemeNames = Object.keys(headMesh.morphTargetDictionary).filter(
      (name) => name.startsWith('viseme_')
    )

    visemeNames.forEach((name) => {
      const index = headMesh.morphTargetDictionary![name]
      if (index !== undefined) {
        this.visemeIndexCache.set(name, index)
      }
    })

    console.log(
      `[MouthAnimator] 初始化完成，找到 ${this.visemeIndexCache.size} 個 Viseme Blendshapes`
    )
  }

  /**
   * 設定目標 Blendshape
   *
   * @param target - 目標 Blendshape 名稱與權重
   * @param currentTime - 當前時間（秒）
   * @param nextTarget - 下一個目標（用於 co-articulation）
   */
  setTarget(
    target: BlendshapeTarget,
    currentTime: number,
    nextTarget?: BlendshapeTarget
  ): void {
    // 自適應強度：根據原始權重自動調整
    let adaptiveIntensity = this.config.intensity
    if (target.weight < 0.1) {
      adaptiveIntensity = Math.min(10.0, this.config.intensity * 5) // 小值放大 5 倍
      console.log(`[MouthAnimator] 🔧 Low weight detected: ${target.name}=${target.weight.toFixed(3)}, using intensity=${adaptiveIntensity}`)
    } else if (target.weight > 0.5) {
      adaptiveIntensity = Math.max(1.0, this.config.intensity * 0.8) // 大值縮小 20%
    }

    // 應用強度倍數
    let targetWeight = applyIntensity(target.weight, adaptiveIntensity)

    // 調試：顯示轉換結果
    if (target.weight > 0.001 && targetWeight < 0.05) {
      console.log(`[MouthAnimator] ⚠️ Result too small: ${target.name} ${target.weight.toFixed(3)} × ${adaptiveIntensity.toFixed(1)} = ${targetWeight.toFixed(3)}`)
    }

    // Co-articulation: 如果有下一個目標，進行混合
    if (this.config.coArticulation && nextTarget) {
      const blendFactor = 0.3 // 30% 混合下一個 Viseme

      // 為 nextTarget 也計算自適應強度
      let nextAdaptiveIntensity = this.config.intensity
      if (nextTarget.weight < 0.1) {
        nextAdaptiveIntensity = Math.min(10.0, this.config.intensity * 5)
      } else if (nextTarget.weight > 0.5) {
        nextAdaptiveIntensity = Math.max(1.0, this.config.intensity * 0.8)
      }

      const nextWeight = applyIntensity(nextTarget.weight, nextAdaptiveIntensity)
      const beforeBlend = targetWeight
      targetWeight = targetWeight * (1 - blendFactor) + nextWeight * blendFactor

      console.log(`[MouthAnimator] 🔀 Co-articulation: ${target.name}(${beforeBlend.toFixed(3)}) + ${nextTarget.name}(${nextWeight.toFixed(3)}) = ${targetWeight.toFixed(3)}`)
    }

    // 取得或建立過渡狀態
    let transition = this.transitions.get(target.name)

    if (!transition) {
      // 建立新過渡
      transition = {
        targetName: target.name,
        targetWeight,
        currentWeight: 0,
        startTime: currentTime,
        duration: this.config.smoothing,
        easing: this.config.easing,
      }
      this.transitions.set(target.name, transition)
    } else {
      // 更新現有過渡
      transition.targetWeight = targetWeight
      transition.startTime = currentTime
      transition.duration = this.config.smoothing
    }

    // 將其他非目標 Blendshape 的權重設為 0（快速淡出）
    // 使用相同的過渡時間，確保快速切換到新 viseme
    this.transitions.forEach((trans, name) => {
      if (name !== target.name) {
        trans.targetWeight = 0
        trans.startTime = currentTime
        trans.duration = this.config.smoothing // 快速淡出
      }
    })

    this.previousTarget = target
  }

  /**
   * 更新 Blendshape 權重（每幀呼叫）
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   * @param currentTime - 當前時間（秒）
   */
  update(headMesh: SkinnedMesh, currentTime: number): void {
    if (!headMesh.morphTargetInfluences) return

    // 調試: 記錄每秒更新狀態
    if (!this.lastLogTime || currentTime - this.lastLogTime > 1.0) {
      this.lastLogTime = currentTime
      const activeTransitions = Array.from(this.transitions.entries())
        .filter(([_, t]) => t.currentWeight > 0.01 || t.targetWeight > 0.01)
        .map(([name, t]) => `${name}: current=${t.currentWeight.toFixed(3)} target=${t.targetWeight.toFixed(3)}`)
      if (activeTransitions.length > 0) {
        console.log('[MouthAnimator] 📊 Active visemes:', activeTransitions.join(' | '))
      }
    }

    // 更新所有過渡中的 Blendshape
    this.transitions.forEach((transition, name) => {
      const index = this.visemeIndexCache.get(name)
      if (index === undefined) return

      // 計算過渡進度
      const elapsed = currentTime - transition.startTime
      const progress = Math.min(elapsed / transition.duration, 1)

      // 應用緩動函數
      const easedProgress = transition.easing(progress)

      // 計算當前權重（線性插值）
      const startWeight = transition.currentWeight
      const targetWeight = transition.targetWeight
      const currentWeight = startWeight + (targetWeight - startWeight) * easedProgress

      // 更新權重
      transition.currentWeight = currentWeight
      if (headMesh.morphTargetInfluences) {
        headMesh.morphTargetInfluences[index] = normalizeWeight(currentWeight)
      }

      // 如果過渡完成且權重為 0，移除過渡
      if (progress >= 1 && targetWeight === 0) {
        this.transitions.delete(name)
      }
    })
  }

  /**
   * 重置所有 Blendshape 權重為 0
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   * @param immediate - 是否立即重置（不使用平滑過渡），預設 false
   */
  reset(headMesh: SkinnedMesh, immediate: boolean = false): void {
    if (!headMesh.morphTargetInfluences) return

    if (immediate) {
      // 立即重置
      this.visemeIndexCache.forEach((index) => {
        headMesh.morphTargetInfluences![index] = 0
      })
      this.transitions.clear()
    } else {
      // 平滑過渡到 0
      const currentTime = performance.now() / 1000

      this.transitions.forEach((transition) => {
        transition.targetWeight = 0
        transition.startTime = currentTime
        transition.duration = this.config.smoothing
      })
    }

    this.previousTarget = null
  }

  /**
   * 更新配置
   *
   * @param config - 部分配置更新
   */
  updateConfig(config: Partial<MouthAnimatorConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 取得當前配置
   */
  getConfig(): Readonly<Required<MouthAnimatorConfig>> {
    return { ...this.config }
  }

  /**
   * 取得當前活躍的 Blendshape 權重
   *
   * @returns {Map<string, number>} Blendshape 名稱到當前權重的映射
   */
  getCurrentWeights(): Map<string, number> {
    const weights = new Map<string, number>()

    this.transitions.forEach((transition, name) => {
      if (transition.currentWeight > 0.01) {
        weights.set(name, transition.currentWeight)
      }
    })

    return weights
  }

  /**
   * 清理資源
   */
  dispose(): void {
    this.transitions.clear()
    this.visemeIndexCache.clear()
    this.previousTarget = null
  }
}

/**
 * 線性插值工具函數
 *
 * @param a - 起始值
 * @param b - 結束值
 * @param t - 插值係數 (0-1)
 * @returns {number} 插值結果
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * 計算兩個 Blendshape 目標之間的混合
 *
 * @param target1 - 第一個目標
 * @param target2 - 第二個目標
 * @param blendFactor - 混合係數 (0-1)，0 = 完全 target1，1 = 完全 target2
 * @returns {BlendshapeTarget} 混合後的目標
 */
export function blendTargets(
  target1: BlendshapeTarget,
  target2: BlendshapeTarget,
  blendFactor: number
): BlendshapeTarget {
  // 如果兩個目標是同一個 Blendshape，直接混合權重
  if (target1.name === target2.name) {
    return {
      name: target1.name,
      weight: lerp(target1.weight, target2.weight, blendFactor),
    }
  }

  // 如果是不同的 Blendshape，返回權重較高的那個
  const weight1 = target1.weight * (1 - blendFactor)
  const weight2 = target2.weight * blendFactor

  return weight1 >= weight2 ? target1 : target2
}
