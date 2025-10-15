/**
 * Audio 狀態管理 Store
 * @module stores/audioStore
 * @description 使用 Zustand 管理音訊播放狀態（播放狀態、音訊佇列、當前音訊）
 */

import { create } from 'zustand'
import { AudioState, AudioItem, AudioStore } from '@/types/audio'

/**
 * Audio Store Hook
 * @description 提供音訊播放狀態管理與操作方法
 * @returns {AudioStore} Audio 狀態與 Actions
 *
 * @example
 * ```tsx
 * const { state, currentAudio, playAudio, pauseAudio } = useAudioStore()
 *
 * // 播放音訊
 * playAudio({
 *   id: 'audio-1',
 *   url: 'https://example.com/audio.mp3',
 *   text: '你好',
 *   timestamp: new Date()
 * })
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

  // Actions
  playAudio: (audio) => {
    set({
      currentAudio: audio,
      state: AudioState.PLAYING,
    })
    // 實際播放邏輯將在 Story 3.6 實作（Web Audio API）
  },

  pauseAudio: () => {
    const { state } = get()
    if (state === AudioState.PLAYING) {
      set({ state: AudioState.PAUSED })
      // 實際暫停邏輯將在 Story 3.6 實作
    }
  },

  stopAudio: () => {
    set({
      currentAudio: null,
      state: AudioState.IDLE,
    })
    // 實際停止邏輯將在 Story 3.6 實作
  },

  resumeAudio: () => {
    const { state, currentAudio } = get()
    if (state === AudioState.PAUSED && currentAudio) {
      set({ state: AudioState.PLAYING })
      // 實際恢復播放邏輯將在 Story 3.6 實作
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
    // 實際音量調整邏輯將在 Story 3.6 實作
  },

  playNext: () => {
    const { queue } = get()
    if (queue.length > 0) {
      const [nextAudio, ...remainingQueue] = queue
      set({
        currentAudio: nextAudio,
        queue: remainingQueue,
        state: AudioState.PLAYING,
      })
      // 實際播放邏輯將在 Story 3.6 實作
    } else {
      set({
        currentAudio: null,
        state: AudioState.IDLE,
      })
    }
  },
}))
