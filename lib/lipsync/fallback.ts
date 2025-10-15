/**
 * Lip Sync 降級方案
 * @module lib/lipsync/fallback
 * @description 當 Viseme 數據不可用時的降級策略
 */

import { SkinnedMesh } from 'three'
import { VisemeData } from '@/types/lipsync'
import { analyzeAudioVolume, normalizeVolume } from '../audio/viseme-analyzer'
import { getVisemeIndex } from './viseme-mapper'

/**
 * 降級模式類型
 */
export type FallbackMode = 'volume' | 'silent' | 'none'

/**
 * 音量驅動的 Lip Sync 控制器
 *
 * 當 Viseme 數據不可用時，使用音量分析作為降級方案
 */
export class VolumeDrivenLipSync {
  private volumeTimeline: Array<{ time: number; volume: number }> = []
  private startTime: number = 0
  private headMesh: SkinnedMesh | null = null
  private mouthOpenIndex: number | null = null

  /**
   * 初始化音量驅動的 Lip Sync
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   * @param audioBuffer - Web Audio API AudioBuffer
   */
  initialize(headMesh: SkinnedMesh, audioBuffer: AudioBuffer): void {
    this.headMesh = headMesh

    // 尋找 mouthOpen blendshape 索引
    this.mouthOpenIndex = getVisemeIndex(
      headMesh.morphTargetDictionary,
      'mouthOpen'
    )

    if (this.mouthOpenIndex === null) {
      // 嘗試其他可能的名稱
      this.mouthOpenIndex =
        getVisemeIndex(headMesh.morphTargetDictionary, 'jawOpen') ||
        getVisemeIndex(headMesh.morphTargetDictionary, 'viseme_aa')

      if (this.mouthOpenIndex === null) {
        console.warn('[VolumeDrivenLipSync] 找不到 mouthOpen blendshape，降級方案失效')
        return
      }
    }

    // 分析音訊音量
    const rawVolumeData = analyzeAudioVolume(audioBuffer, 0.05)
    this.volumeTimeline = normalizeVolume(rawVolumeData)

    console.log(
      `[VolumeDrivenLipSync] 初始化完成，音量數據點: ${this.volumeTimeline.length}`
    )
  }

  /**
   * 開始播放
   *
   * @param startTime - 音訊開始時間（AudioContext.currentTime）
   */
  start(startTime: number): void {
    this.startTime = startTime
  }

  /**
   * 更新嘴型動畫
   *
   * @param currentTime - 當前音訊播放時間（AudioContext.currentTime）
   */
  update(currentTime: number): void {
    if (!this.headMesh || this.mouthOpenIndex === null) return

    const audioTime = currentTime - this.startTime

    // 找到當前時間點的音量
    const volume = this.getVolumeAtTime(audioTime)

    // 將音量映射到 mouthOpen 權重 (0-1)
    // 音量越大，嘴巴張開越大
    const mouthOpenWeight = volume * 0.6 // 限制最大開口為 60%

    // 更新 blendshape
    if (this.headMesh.morphTargetInfluences) {
      this.headMesh.morphTargetInfluences[this.mouthOpenIndex] = mouthOpenWeight
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.headMesh && this.mouthOpenIndex !== null) {
      // 重置嘴巴到閉合狀態
      if (this.headMesh.morphTargetInfluences) {
        this.headMesh.morphTargetInfluences[this.mouthOpenIndex] = 0
      }
    }
  }

  /**
   * 取得指定時間點的音量
   *
   * @param time - 目標時間（秒）
   * @returns {number} 音量 (0-1)
   */
  private getVolumeAtTime(time: number): number {
    if (this.volumeTimeline.length === 0) return 0

    // 二分搜尋找到最接近的音量數據點
    let left = 0
    let right = this.volumeTimeline.length - 1

    while (left < right) {
      const mid = Math.floor((left + right) / 2)

      if (this.volumeTimeline[mid].time < time) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    // 如果超出範圍，返回 0
    if (left >= this.volumeTimeline.length) return 0
    if (left === 0 && time < this.volumeTimeline[0].time) return 0

    // 線性插值
    if (left > 0 && left < this.volumeTimeline.length) {
      const prev = this.volumeTimeline[left - 1]
      const curr = this.volumeTimeline[left]

      const t = (time - prev.time) / (curr.time - prev.time)
      return prev.volume + (curr.volume - prev.volume) * t
    }

    return this.volumeTimeline[left].volume
  }

  /**
   * 清理資源
   */
  dispose(): void {
    this.volumeTimeline = []
    this.headMesh = null
    this.mouthOpenIndex = null
  }
}

/**
 * 靜音模式 Lip Sync（不顯示嘴型動畫）
 */
export class SilentLipSync {
  private headMesh: SkinnedMesh | null = null

  /**
   * 初始化
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   */
  initialize(headMesh: SkinnedMesh): void {
    this.headMesh = headMesh
  }

  /**
   * 開始播放（無操作）
   */
  start(): void {
    // 靜音模式不做任何操作
  }

  /**
   * 更新（無操作）
   */
  update(): void {
    // 靜音模式不做任何操作
  }

  /**
   * 停止播放（無操作）
   */
  stop(): void {
    // 靜音模式不做任何操作
  }

  /**
   * 清理資源
   */
  dispose(): void {
    this.headMesh = null
  }
}

/**
 * Lip Sync 降級管理器
 *
 * 根據可用數據自動選擇最佳降級策略
 */
export class LipSyncFallbackManager {
  private mode: FallbackMode = 'volume'
  private volumeLipSync: VolumeDrivenLipSync | null = null
  private silentLipSync: SilentLipSync | null = null

  constructor(mode: FallbackMode = 'volume') {
    this.mode = mode
  }

  /**
   * 檢查是否需要降級
   *
   * @param visemes - Viseme 數據
   * @returns {boolean} 是否需要降級
   */
  shouldFallback(visemes: VisemeData[] | null): boolean {
    return !visemes || visemes.length === 0
  }

  /**
   * 初始化降級方案
   *
   * @param headMesh - Avatar 頭部 SkinnedMesh
   * @param audioBuffer - 可選，Web Audio API AudioBuffer（音量模式需要）
   */
  initialize(headMesh: SkinnedMesh, audioBuffer?: AudioBuffer): void {
    if (this.mode === 'volume' && audioBuffer) {
      this.volumeLipSync = new VolumeDrivenLipSync()
      this.volumeLipSync.initialize(headMesh, audioBuffer)
      console.log('[LipSyncFallbackManager] 使用音量驅動降級方案')
    } else if (this.mode === 'silent') {
      this.silentLipSync = new SilentLipSync()
      this.silentLipSync.initialize(headMesh)
      console.log('[LipSyncFallbackManager] 使用靜音降級方案')
    } else {
      console.log('[LipSyncFallbackManager] 無降級方案')
    }
  }

  /**
   * 開始降級播放
   *
   * @param startTime - 音訊開始時間
   */
  start(startTime: number): void {
    if (this.volumeLipSync) {
      this.volumeLipSync.start(startTime)
    } else if (this.silentLipSync) {
      this.silentLipSync.start()
    }
  }

  /**
   * 更新降級動畫
   *
   * @param currentTime - 當前音訊播放時間
   */
  update(currentTime: number): void {
    if (this.volumeLipSync) {
      this.volumeLipSync.update(currentTime)
    } else if (this.silentLipSync) {
      this.silentLipSync.update()
    }
  }

  /**
   * 停止降級播放
   */
  stop(): void {
    if (this.volumeLipSync) {
      this.volumeLipSync.stop()
    } else if (this.silentLipSync) {
      this.silentLipSync.stop()
    }
  }

  /**
   * 設定降級模式
   *
   * @param mode - 降級模式
   */
  setMode(mode: FallbackMode): void {
    this.mode = mode
  }

  /**
   * 取得當前降級模式
   */
  getMode(): FallbackMode {
    return this.mode
  }

  /**
   * 清理資源
   */
  dispose(): void {
    if (this.volumeLipSync) {
      this.volumeLipSync.dispose()
      this.volumeLipSync = null
    }

    if (this.silentLipSync) {
      this.silentLipSync.dispose()
      this.silentLipSync = null
    }
  }
}

/**
 * 建立降級方案提示訊息
 *
 * @param mode - 降級模式
 * @param reason - 降級原因
 * @returns {string} 提示訊息
 */
export function createFallbackMessage(
  mode: FallbackMode,
  reason: 'no_visemes' | 'unsupported_avatar' | 'error'
): string {
  const messages = {
    volume: {
      no_visemes: 'Viseme 數據不可用，使用音量驅動降級方案',
      unsupported_avatar: 'Avatar 不支援 Viseme Blendshapes，使用音量驅動降級方案',
      error: 'Lip Sync 錯誤，使用音量驅動降級方案',
    },
    silent: {
      no_visemes: 'Viseme 數據不可用，Lip Sync 已禁用',
      unsupported_avatar: 'Avatar 不支援 Viseme Blendshapes，Lip Sync 已禁用',
      error: 'Lip Sync 錯誤，Lip Sync 已禁用',
    },
    none: {
      no_visemes: 'Viseme 數據不可用，無降級方案',
      unsupported_avatar: 'Avatar 不支援 Viseme Blendshapes，無降級方案',
      error: 'Lip Sync 錯誤，無降級方案',
    },
  }

  return messages[mode][reason]
}

/**
 * 檢查 Lip Sync 可用性
 *
 * @param headMesh - Avatar 頭部 SkinnedMesh
 * @param visemes - Viseme 數據
 * @returns {{ available: boolean, reason?: string }} 可用性檢查結果
 */
export function checkLipSyncAvailability(
  headMesh: SkinnedMesh | null,
  visemes: VisemeData[] | null
): { available: boolean; reason?: string } {
  if (!headMesh) {
    return { available: false, reason: 'Avatar 頭部 Mesh 未初始化' }
  }

  if (!headMesh.morphTargetDictionary) {
    return { available: false, reason: 'Avatar 不支援 morphTargetDictionary' }
  }

  if (!visemes || visemes.length === 0) {
    return { available: false, reason: 'Viseme 數據不可用或為空' }
  }

  // 檢查是否有至少一個 Viseme Blendshape
  const hasVisemeBlendshapes = Object.keys(headMesh.morphTargetDictionary).some(
    (name) => name.startsWith('viseme_')
  )

  if (!hasVisemeBlendshapes) {
    return { available: false, reason: 'Avatar 不支援 Viseme Blendshapes' }
  }

  return { available: true }
}
