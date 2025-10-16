/**
 * useAudioRecorder Hook
 *
 * React Hook 封裝音訊錄製功能
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { getAudioRecorder, cleanupAudioRecorder } from '@/lib/audio/recorder'
import type { RecordingState, RecordingError } from '@/types/stt'
import { RECORDING_CONSTRAINTS } from '@/types/stt'

export interface UseAudioRecorderReturn {
  /** 錄音狀態 */
  state: RecordingState
  /** 錄音時長（秒） */
  duration: number
  /** 即時音量（0-1） */
  volume: number
  /** 錄音錯誤 */
  error: RecordingError | null
  /** 波形資料（用於視覺化） */
  waveformData: Uint8Array
  /** 開始錄音 */
  startRecording: () => Promise<void>
  /** 停止錄音 */
  stopRecording: () => Promise<Blob | null>
  /** 取消錄音 */
  cancelRecording: () => void
  /** 重置錯誤狀態 */
  clearError: () => void
}

/**
 * useAudioRecorder Hook
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   duration,
 *   volume,
 *   waveformData,
 *   startRecording,
 *   stopRecording,
 * } = useAudioRecorder()
 *
 * // 開始錄音
 * await startRecording()
 *
 * // 停止並取得音訊
 * const audioBlob = await stopRecording()
 * ```
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0)
  const [error, setError] = useState<RecordingError | null>(null)
  const [waveformData, setWaveformData] = useState<Uint8Array>(new Uint8Array(0))

  const recorderRef = useRef(getAudioRecorder())
  const animationFrameRef = useRef<number | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 更新錄音時長和音量（每幀）
   */
  const updateRecordingState = useCallback(() => {
    if (recorderRef.current.isRecording) {
      setDuration(recorderRef.current.getDuration())
      setVolume(recorderRef.current.getVolume())
      setWaveformData(recorderRef.current.getWaveformData())

      // 檢查是否達到最大錄音時長
      if (recorderRef.current.getDuration() >= RECORDING_CONSTRAINTS.MAX_DURATION) {
        stopRecording()
        return
      }

      animationFrameRef.current = requestAnimationFrame(updateRecordingState)
    }
  }, [])

  /**
   * 開始錄音
   */
  const startRecording = useCallback(async () => {
    try {
      setState('idle')
      setError(null)
      setDuration(0)
      setVolume(0)

      // 初始化錄音器（如未初始化）
      if (!recorderRef.current.isInitialized) {
        await recorderRef.current.initialize()
      }

      // 開始錄音
      recorderRef.current.start()
      setState('recording')

      // 開始更新狀態
      animationFrameRef.current = requestAnimationFrame(updateRecordingState)
    } catch (err) {
      const error = err as RecordingError
      setError(error)
      setState('error')
      throw error
    }
  }, [updateRecordingState])

  /**
   * 停止錄音
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      // 停止動畫幀
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      if (!recorderRef.current.isRecording) {
        return null
      }

      setState('processing')

      // 停止錄音並取得音訊
      const audioBlob = await recorderRef.current.stop()

      setState('idle')
      setDuration(0)
      setVolume(0)
      setWaveformData(new Uint8Array(0))

      return audioBlob
    } catch (err) {
      const error = err as RecordingError
      setError(error)
      setState('error')
      throw error
    }
  }, [])

  /**
   * 取消錄音
   */
  const cancelRecording = useCallback(() => {
    // 停止動畫幀
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (recorderRef.current.isRecording) {
      recorderRef.current.cancel()
    }

    setState('idle')
    setDuration(0)
    setVolume(0)
    setWaveformData(new Uint8Array(0))
    setError(null)
  }, [])

  /**
   * 清除錯誤狀態
   */
  const clearError = useCallback(() => {
    setError(null)
    if (state === 'error') {
      setState('idle')
    }
  }, [state])

  /**
   * 清理資源（組件卸載時）
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (durationIntervalRef.current !== null) {
        clearInterval(durationIntervalRef.current)
      }

      // 清理錄音器
      cleanupAudioRecorder()
    }
  }, [])

  return {
    state,
    duration,
    volume,
    error,
    waveformData,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  }
}
