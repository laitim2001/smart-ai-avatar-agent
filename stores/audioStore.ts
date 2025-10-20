/**
 * Audio 狀態管理 Store
 * @module stores/audioStore
 * @description 使用 Zustand 管理音訊播放狀態（播放狀態、音訊佇列、當前音訊）
 */

import { create } from 'zustand'
import { AudioState, AudioItem, AudioStore } from '@/types/audio'
import { getAudioPlayer } from '@/lib/audio/player'
import { VisemeData } from '@/types/lipsync'

/**
 * TTS 快取項目
 */
interface TTSCacheItem {
  audioBlob: Blob
  visemes: VisemeData[]
  duration: number
  timestamp: number
}

/**
 * TTS 快取管理器
 */
class TTSCache {
  private cache = new Map<string, TTSCacheItem>()
  private readonly MAX_CACHE_SIZE = 50
  private readonly CACHE_EXPIRY_MS = 1000 * 60 * 30 // 30 分鐘

  /**
   * 生成快取 key（正規化文字）
   */
  private normalizeKey(text: string): string {
    return text.trim().toLowerCase()
  }

  /**
   * 取得快取項目
   */
  get(text: string): TTSCacheItem | null {
    const key = this.normalizeKey(text)
    const item = this.cache.get(key)

    if (!item) return null

    // 檢查是否過期
    const isExpired = Date.now() - item.timestamp > this.CACHE_EXPIRY_MS
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item
  }

  /**
   * 設定快取項目
   */
  set(text: string, item: Omit<TTSCacheItem, 'timestamp'>): void {
    const key = this.normalizeKey(text)

    // 如果快取已滿，移除最舊的項目
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      ...item,
      timestamp: Date.now(),
    })

    console.log(`[TTSCache] Cached item for text (${text.length} chars), cache size: ${this.cache.size}`)
  }

  /**
   * 清空快取
   */
  clear(): void {
    this.cache.clear()
  }
}

// 全域 TTS 快取實例
const ttsCache = new TTSCache()

/**
 * 將 base64 字串轉換為 Blob
 *
 * @param base64 - base64 編碼字串
 * @param contentType - MIME 類型，預設 'audio/mpeg'
 * @returns {Blob} Blob 物件
 */
function base64ToBlob(base64: string, contentType: string = 'audio/mpeg'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}

/**
 * Audio Store Hook
 * @description 提供音訊播放狀態管理與操作方法
 * @returns {AudioStore} Audio 狀態與 Actions
 *
 * @example
 * ```tsx
 * const { state, currentAudio, speakText, pauseAudio } = useAudioStore()
 *
 * // 文字轉語音並播放
 * await speakText('你好，我是 Avatar')
 *
 * // 暫停播放
 * <button onClick={pauseAudio} disabled={state !== AudioState.PLAYING}>
 *   暫停
 * </button>
 * ```
 */
export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial State
  state: AudioState.IDLE,
  queue: [],
  currentAudio: null,
  volume: 1.0,
  currentVisemes: null, // 新增：當前音訊的 Viseme 數據

  // Actions

  /**
   * 文字轉語音並播放
   * @param {string} text - 要轉換的文字
   */
  speakText: async (text: string): Promise<void> => {
    try {
      // 停止當前播放
      const { stopAudio } = get()
      stopAudio()

      // 更新狀態為 Loading
      set({ state: AudioState.LOADING })

      // 檢查快取
      const cachedItem = ttsCache.get(text)
      let audioBlob: Blob
      let visemes: VisemeData[]

      if (cachedItem) {
        console.log('[TTSCache] Cache hit, using cached audio')
        audioBlob = cachedItem.audioBlob
        visemes = cachedItem.visemes
      } else {
        console.log('[TTSCache] Cache miss, calling TTS API')

        // 呼叫 TTS API
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'TTS API request failed')
        }

        // 取得 TTS 回應（包含音訊與 Viseme 數據）
        const data = await response.json()
        const { audio: audioBase64, visemes: visemesData, duration } = data

        // 將 base64 音訊轉換為 Blob
        audioBlob = base64ToBlob(audioBase64, 'audio/mpeg')
        visemes = visemesData as VisemeData[]

        // 儲存到快取
        ttsCache.set(text, {
          audioBlob,
          visemes,
          duration,
        })
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('[audioStore] Blob URL created:', audioUrl)

      // 載入音訊
      const audioPlayer = getAudioPlayer()
      console.log('[audioStore] Loading audio buffer...')
      const audioBuffer = await audioPlayer.loadAudio(audioUrl)
      console.log('[audioStore] Audio buffer loaded, duration:', audioBuffer.duration.toFixed(2), 's')

      // 建立 AudioItem
      const audioItem: AudioItem = {
        id: `audio-${Date.now()}`,
        url: audioUrl,
        text: text,
        duration: audioBuffer.duration,
        timestamp: new Date(),
      }

      // 更新狀態並播放
      console.log('[audioStore] Setting state to PLAYING, visemes count:', visemes?.length || 0)
      set({
        currentAudio: audioItem,
        currentVisemes: visemes as VisemeData[],
        state: AudioState.PLAYING,
      })

      console.log('[audioStore] Starting playback...')
      await audioPlayer.play(audioBuffer, () => {
        // 播放結束回調
        set({
          currentAudio: null,
          currentVisemes: null,
          state: AudioState.IDLE,
        })

        // 清理 Blob URL
        URL.revokeObjectURL(audioUrl)

        // 播放下一個音訊（如有）
        const { playNext } = get()
        playNext()
      })
    } catch (error) {
      console.error('[Audio Error]', error)
      set({
        currentAudio: null,
        currentVisemes: null,
        state: AudioState.IDLE,
      })
      throw error
    }
  },

  playAudio: (audio) => {
    set({
      currentAudio: audio,
      state: AudioState.PLAYING,
    })
    // 由 speakText 處理實際播放
  },

  pauseAudio: () => {
    const { state } = get()
    if (state === AudioState.PLAYING) {
      const audioPlayer = getAudioPlayer()
      audioPlayer.pause()
      set({ state: AudioState.PAUSED })
    }
  },

  stopAudio: () => {
    const { currentAudio } = get()
    const audioPlayer = getAudioPlayer()
    audioPlayer.stop()

    // 清理 Blob URL 防止記憶體洩漏
    if (currentAudio?.url) {
      URL.revokeObjectURL(currentAudio.url)
    }

    set({
      currentAudio: null,
      currentVisemes: null,
      state: AudioState.IDLE,
    })
  },

  resumeAudio: async () => {
    const { state, currentAudio } = get()
    if (state === AudioState.PAUSED && currentAudio) {
      const audioPlayer = getAudioPlayer()
      await audioPlayer.resume()
      set({ state: AudioState.PLAYING })
    }
  },

  addToQueue: (audio) => {
    set((state) => ({
      queue: [...state.queue, audio],
    }))
  },

  clearQueue: () => {
    set({ queue: [] })
  },

  setVolume: (volume) => {
    // 限制音量範圍 0-1
    const clampedVolume = Math.max(0, Math.min(1, volume))
    set({ volume: clampedVolume })
  },

  playNext: () => {
    const { queue, speakText } = get()
    if (queue.length > 0) {
      const [nextAudio, ...remainingQueue] = queue
      set({ queue: remainingQueue })
      // 播放下一個音訊
      speakText(nextAudio.text).catch((error) => {
        console.error('[PlayNext Error]', error)
      })
    }
  },
}))
