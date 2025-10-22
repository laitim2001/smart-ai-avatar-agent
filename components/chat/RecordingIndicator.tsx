/**
 * RecordingIndicator Component
 *
 * 錄音指示器組件
 * 顯示錄音時長、音量指示、停止按鈕
 */

'use client'

import { Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/audio/audio-utils'

interface RecordingIndicatorProps {
  /** 錄音時長（秒） */
  duration: number
  /** 音量（0-1） */
  volume: number
  /** 最大錄音時長（秒） */
  maxDuration?: number
  /** 停止錄音回調 */
  onStop: () => void
}

/**
 * RecordingIndicator 組件
 */
export function RecordingIndicator({
  duration,
  volume,
  maxDuration = 60,
  onStop,
}: RecordingIndicatorProps) {
  // 計算進度百分比
  const progress = (duration / maxDuration) * 100

  // 計算音量條數量（1-10）
  const volumeBars = Math.ceil(volume * 10)

  return (
    <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
      {/* 錄音圖示（脈動） */}
      <div className="relative">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      </div>

      {/* 錄音時長 */}
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            錄音中
          </span>
          <span className="text-xs text-red-600/70 dark:text-red-400/70">
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        </div>

        {/* 進度條 */}
        <div className="w-full h-1 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 dark:bg-red-400 transition-all duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* 音量指示器 */}
      <div className="flex items-center gap-0.5 h-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`
              w-1 rounded-full transition-all duration-100
              ${i < volumeBars ? 'bg-red-500 dark:bg-red-400' : 'bg-red-200 dark:bg-red-900/50'}
            `}
            style={{
              height: `${((i + 1) / 10) * 100}%`,
            }}
          />
        ))}
      </div>

      {/* 停止按鈕 */}
      <Button
        onClick={onStop}
        variant="primary"
        size="sm"
        className="shrink-0 bg-red-500 hover:bg-red-600"
      >
        <Square className="h-3 w-3 mr-1 fill-current" />
        停止
      </Button>
    </div>
  )
}
