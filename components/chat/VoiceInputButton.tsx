/**
 * VoiceInputButton Component
 *
 * 語音輸入按鈕組件
 * 支援三種狀態：閒置、錄音中、處理中
 */

'use client'

import { Mic, Square, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RecordingState } from '@/types/stt'

interface VoiceInputButtonProps {
  /** 錄音狀態 */
  state: RecordingState
  /** 點擊開始錄音 */
  onStart: () => void
  /** 點擊停止錄音 */
  onStop: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 自訂樣式 */
  className?: string
}

/**
 * VoiceInputButton 組件
 */
export function VoiceInputButton({
  state,
  onStart,
  onStop,
  disabled = false,
  className = '',
}: VoiceInputButtonProps) {
  // 根據狀態決定按鈕行為
  const handleClick = () => {
    if (state === 'idle' || state === 'error') {
      onStart()
    } else if (state === 'recording') {
      onStop()
    }
    // processing 狀態不可點擊
  }

  // 根據狀態決定按鈕外觀
  const getButtonContent = () => {
    switch (state) {
      case 'idle':
      case 'error':
        return (
          <>
            <Mic className="h-4 w-4 mr-2" />
            語音輸入
          </>
        )

      case 'recording':
        return (
          <>
            <Square className="h-4 w-4 mr-2 fill-current" />
            停止錄音
          </>
        )

      case 'processing':
        return (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            處理中...
          </>
        )
    }
  }

  // 根據狀態決定按鈕樣式
  const getButtonVariant = (): 'primary' | 'secondary' | 'outline' => {
    if (state === 'error') {
      return 'outline' // 邊框（錯誤）
    }
    return 'secondary' // 預設（閒置/處理中/錄音）
  }

  const isDisabled = disabled || state === 'processing'

  return (
    <Button
      onClick={handleClick}
      disabled={isDisabled}
      variant={getButtonVariant()}
      className={`
        relative
        ${state === 'recording' ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''}
        ${className}
      `}
      type="button"
    >
      {getButtonContent()}

      {/* 錄音中的脈動動畫 */}
      {state === 'recording' && (
        <span className="absolute inset-0 rounded-md bg-red-500/20 animate-ping" />
      )}
    </Button>
  )
}
