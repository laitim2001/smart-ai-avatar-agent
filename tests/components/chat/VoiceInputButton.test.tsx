/**
 * VoiceInputButton Component Tests
 *
 * 測試語音輸入按鈕的所有狀態與互動
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceInputButton } from '@/components/chat/VoiceInputButton'
import type { RecordingState } from '@/types/stt'

describe('VoiceInputButton', () => {
  describe('狀態顯示', () => {
    it('應該在 idle 狀態顯示麥克風圖示與「語音輸入」文字', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
        />
      )

      expect(screen.getByText('語音輸入')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeEnabled()
    })

    it('應該在 recording 狀態顯示停止圖示與「停止錄音」文字', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="recording"
          onStart={onStart}
          onStop={onStop}
        />
      )

      expect(screen.getByText('停止錄音')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeEnabled()
    })

    it('應該在 processing 狀態顯示載入圖示與「處理中...」文字', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="processing"
          onStart={onStart}
          onStop={onStop}
        />
      )

      expect(screen.getByText('處理中...')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('應該在 error 狀態顯示麥克風圖示與「語音輸入」文字', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="error"
          onStart={onStart}
          onStop={onStop}
        />
      )

      expect(screen.getByText('語音輸入')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeEnabled()
    })
  })

  describe('點擊互動', () => {
    it('應該在 idle 狀態點擊時呼叫 onStart', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
        />
      )

      await user.click(screen.getByRole('button'))

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onStop).not.toHaveBeenCalled()
    })

    it('應該在 recording 狀態點擊時呼叫 onStop', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="recording"
          onStart={onStart}
          onStop={onStop}
        />
      )

      await user.click(screen.getByRole('button'))

      expect(onStop).toHaveBeenCalledTimes(1)
      expect(onStart).not.toHaveBeenCalled()
    })

    it('應該在 error 狀態點擊時呼叫 onStart', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="error"
          onStart={onStart}
          onStop={onStop}
        />
      )

      await user.click(screen.getByRole('button'))

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(onStop).not.toHaveBeenCalled()
    })

    it('應該在 processing 狀態無法點擊', async () => {
      const user = userEvent.setup()
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="processing"
          onStart={onStart}
          onStop={onStop}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()

      // 嘗試點擊被禁用的按鈕
      await user.click(button).catch(() => {})

      expect(onStart).not.toHaveBeenCalled()
      expect(onStop).not.toHaveBeenCalled()
    })
  })

  describe('disabled 屬性', () => {
    it('應該在 disabled=true 時禁用按鈕', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
          disabled={true}
        />
      )

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('應該在 disabled=false 時啟用按鈕（非 processing 狀態）', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
          disabled={false}
        />
      )

      expect(screen.getByRole('button')).toBeEnabled()
    })
  })

  describe('CSS 樣式', () => {
    it('應該在 recording 狀態套用紅色樣式', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="recording"
          onStart={onStart}
          onStop={onStop}
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-red-500')
      expect(button.className).toContain('animate-pulse')
    })

    it('應該套用自訂 className', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
          className="custom-class"
        />
      )

      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })
  })

  describe('Accessibility', () => {
    it('應該設定正確的 button type', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
        />
      )

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('應該在所有狀態都能被鍵盤聚焦（除非 disabled）', () => {
      const onStart = vi.fn()
      const onStop = vi.fn()

      const { rerender } = render(
        <VoiceInputButton
          state="idle"
          onStart={onStart}
          onStop={onStop}
        />
      )

      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('tabindex', '-1')

      rerender(
        <VoiceInputButton
          state="recording"
          onStart={onStart}
          onStop={onStop}
        />
      )

      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
