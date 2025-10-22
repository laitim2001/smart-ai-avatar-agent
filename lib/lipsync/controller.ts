/**
 * Lip Sync 控制器
 * @module lib/lipsync/controller
 * @description 主要 Lip Sync 協調器，同步音訊與 Viseme 動畫
 */

import { SkinnedMesh } from 'three'
import {
  VisemeData,
  LipSyncState,
  LipSyncConfig,
  LipSyncController as ILipSyncController,
  BlendshapeTarget,
} from '@/types/lipsync'
import { MouthAnimator, MouthAnimatorConfig } from './mouth-animator'
import { getBlendshapeForViseme, checkVisemeSupport } from './viseme-mapper'

/**
 * Lip Sync 控制器實現
 *
 * 協調音訊播放與 Viseme 動畫同步，提供完整的 Lip Sync 功能
 */
export class LipSyncController implements ILipSyncController {
  private state: LipSyncState = LipSyncState.IDLE
  private config: Required<LipSyncConfig>
  private mouthAnimator: MouthAnimator
  private visemeTimeline: VisemeData[] = []
  private startTime: number = 0
  private pauseTime: number = 0
  private currentVisemeIndex: number = 0
  private headMesh: SkinnedMesh | null = null

  constructor(config: LipSyncConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      smoothing: config.smoothing ?? 0.03, // 極短過渡時間（30ms），快速響應 viseme 變化
      intensity: config.intensity ?? 1.5, // 1.5 倍強度，保持自然變化
      lookAhead: config.lookAhead ?? 0.1,
      fallbackMode: config.fallbackMode ?? 'volume',
    }

    // 建立嘴型動畫控制器
    const animatorConfig: MouthAnimatorConfig = {
      smoothing: this.config.smoothing,
      intensity: this.config.intensity,
      coArticulation: true,
      lookAhead: this.config.lookAhead,
    }

    this.mouthAnimator = new MouthAnimator(animatorConfig)
  }

  /**
   * 初始化控制器（設定 Avatar 頭部 Mesh）
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   * @returns {boolean} 是否初始化成功
   */
  initialize(headMesh: SkinnedMesh): boolean {
    // 調試: 輸出所有可用的 morphTargets
    console.log('[LipSyncController] 可用的 morphTargets:',
      Object.keys(headMesh.morphTargetDictionary || {}))

    if (!checkVisemeSupport(headMesh.morphTargetDictionary)) {
      console.warn(
        '[LipSyncController] Avatar 不支援 Viseme Blendshapes，Lip Sync 將被禁用'
      )
      console.warn(
        '[LipSyncController] 需要至少 3 個 viseme blendshapes (例如: viseme_sil, viseme_PP, viseme_aa)'
      )
      this.config.enabled = false
      return false
    }

    this.headMesh = headMesh
    this.mouthAnimator.initialize(headMesh)

    console.log('[LipSyncController] 初始化成功')
    return true
  }

  /**
   * 開始 Lip Sync 播放
   *
   * @param visemes - Viseme 時間軸數據
   * @param startTime - 音訊開始時間（AudioContext.currentTime）
   */
  start(visemes: VisemeData[], startTime: number): void {
    if (!this.config.enabled) {
      console.warn('[LipSyncController] Lip Sync 未啟用，跳過播放')
      return
    }

    if (!this.headMesh) {
      console.error('[LipSyncController] 頭部 Mesh 未初始化，無法播放')
      return
    }

    if (visemes.length === 0) {
      console.warn('[LipSyncController] Viseme 數據為空，無法播放')
      this.state = LipSyncState.ERROR
      return
    }

    // 重置狀態
    this.visemeTimeline = [...visemes]
    this.startTime = startTime
    this.pauseTime = 0
    this.currentVisemeIndex = 0
    this.state = LipSyncState.PLAYING

    console.log(
      `[LipSyncController] 開始播放，Viseme 數量: ${visemes.length}，開始時間: ${startTime.toFixed(3)}s`
    )
  }

  /**
   * 停止 Lip Sync 播放
   */
  stop(): void {
    if (this.state === LipSyncState.IDLE) return

    this.state = LipSyncState.IDLE
    this.currentVisemeIndex = 0
    this.pauseTime = 0

    // 重置嘴型到靜音狀態
    if (this.headMesh) {
      this.mouthAnimator.reset(this.headMesh, false)
    }

    console.log('[LipSyncController] 停止播放')
  }

  /**
   * 暫停 Lip Sync 播放
   */
  pause(): void {
    if (this.state !== LipSyncState.PLAYING) return

    this.state = LipSyncState.PAUSED
    this.pauseTime = performance.now() / 1000 - this.startTime

    console.log('[LipSyncController] 暫停播放')
  }

  /**
   * 恢復 Lip Sync 播放
   */
  resume(): void {
    if (this.state !== LipSyncState.PAUSED) return

    this.state = LipSyncState.PLAYING
    this.startTime = performance.now() / 1000 - this.pauseTime

    console.log('[LipSyncController] 恢復播放')
  }

  /**
   * 更新 Lip Sync 狀態（每幀呼叫）
   *
   * @param currentTime - 當前音訊播放時間（秒，相對於音訊開始）
   * @returns {BlendshapeTarget | null} 當前應顯示的 Blendshape 目標
   */
  update(currentTime: number): BlendshapeTarget | null {
    if (this.state !== LipSyncState.PLAYING || !this.headMesh) {
      return null
    }

    // 計算相對於音訊開始的時間
    const audioTime = currentTime - this.startTime

    // 找到當前時間點對應的 Viseme
    const currentViseme = this.findVisemeAtTime(audioTime)

    if (!currentViseme) {
      // 音訊播放結束，重置到靜音狀態
      const silenceTarget = getBlendshapeForViseme(0)
      this.mouthAnimator.setTarget(silenceTarget, performance.now() / 1000)
      this.mouthAnimator.update(this.headMesh, performance.now() / 1000)
      return silenceTarget
    }

    // 轉換 Viseme 為 Blendshape 目標
    const blendshapeTarget = getBlendshapeForViseme(currentViseme.visemeId)

    // 查找下一個 Viseme（用於 co-articulation）
    const nextViseme = this.findNextViseme(audioTime)
    const nextTarget = nextViseme
      ? getBlendshapeForViseme(nextViseme.visemeId)
      : undefined

    // 設定目標 Blendshape
    this.mouthAnimator.setTarget(
      blendshapeTarget,
      performance.now() / 1000,
      nextTarget
    )

    // 更新嘴型動畫
    this.mouthAnimator.update(this.headMesh, performance.now() / 1000)

    return blendshapeTarget
  }

  /**
   * 取得當前狀態
   */
  getState(): LipSyncState {
    return this.state
  }

  /**
   * 設定配置
   */
  setConfig(config: Partial<LipSyncConfig>): void {
    Object.assign(this.config, config)

    // 同步更新嘴型動畫控制器配置
    this.mouthAnimator.updateConfig({
      smoothing: this.config.smoothing,
      intensity: this.config.intensity,
      lookAhead: this.config.lookAhead,
    })

    console.log('[LipSyncController] 配置已更新', this.config)
  }

  /**
   * 取得配置
   */
  getConfig(): Readonly<Required<LipSyncConfig>> {
    return { ...this.config }
  }

  /**
   * 找到指定時間點的 Viseme
   *
   * @param time - 目標時間（秒，相對於音訊開始）
   * @returns {VisemeData | null} 當前時間點的 Viseme
   */
  private findVisemeAtTime(time: number): VisemeData | null {
    if (this.visemeTimeline.length === 0) return null

    // 使用二分搜尋優化查找
    let left = this.currentVisemeIndex
    let right = this.visemeTimeline.length - 1

    // 如果時間小於當前 Viseme，從頭開始搜尋
    if (time < this.visemeTimeline[left].time) {
      left = 0
    }

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const viseme = this.visemeTimeline[mid]
      const visemeEnd = viseme.time + (viseme.duration || 0.1)

      if (time >= viseme.time && time < visemeEnd) {
        this.currentVisemeIndex = mid
        return viseme
      } else if (time < viseme.time) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    // 如果超過最後一個 Viseme，返回靜音
    if (time >= this.visemeTimeline[this.visemeTimeline.length - 1].time) {
      return { time, visemeId: 0, duration: 0 }
    }

    return null
  }

  /**
   * 找到下一個 Viseme（用於 co-articulation）
   *
   * @param time - 當前時間（秒）
   * @returns {VisemeData | null} 下一個 Viseme
   */
  private findNextViseme(time: number): VisemeData | null {
    const nextIndex = this.currentVisemeIndex + 1

    if (nextIndex >= this.visemeTimeline.length) {
      return null
    }

    const nextViseme = this.visemeTimeline[nextIndex]

    // 只有在預視範圍內才返回下一個 Viseme
    if (nextViseme.time - time <= this.config.lookAhead) {
      return nextViseme
    }

    return null
  }

  /**
   * 清理資源
   */
  dispose(): void {
    this.stop()
    this.mouthAnimator.dispose()
    this.headMesh = null
    this.visemeTimeline = []

    console.log('[LipSyncController] 資源已清理')
  }
}

/**
 * 建立全域 LipSyncController 實例（單例模式）
 */
let globalLipSyncController: LipSyncController | null = null

/**
 * 取得全域 LipSyncController 實例
 *
 * @param config - 可選配置
 * @returns {LipSyncController} LipSyncController 實例
 */
export function getLipSyncController(
  config?: LipSyncConfig
): LipSyncController {
  if (!globalLipSyncController) {
    globalLipSyncController = new LipSyncController(config)
  } else if (config) {
    globalLipSyncController.setConfig(config)
  }

  return globalLipSyncController
}

/**
 * 重置全域 LipSyncController 實例
 */
export function resetLipSyncController(): void {
  if (globalLipSyncController) {
    globalLipSyncController.dispose()
    globalLipSyncController = null
  }
}
