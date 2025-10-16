/**
 * RecordingIndicator Component Tests
 *
 * 測試錄音指示器的顯示與互動
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecordingIndicator } from '@/components/chat/RecordingIndicator'

describe('RecordingIndicator', () => {
  describe('錄音時長顯示', () => {
    it('應該顯示格式化的錄音時長', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={25}
          volume={0.5}
          onStop={onStop}
        />
      )

      expect(screen.getByText('錄音中')).toBeInTheDocument()
      expect(screen.getByText(/0:25/)).toBeInTheDocument()
    })

    it('應該顯示最大錄音時長', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={30}
          volume={0.5}
          maxDuration={60}
          onStop={onStop}
        />
      )

      expect(screen.getByText(/1:00/)).toBeInTheDocument()
    })

    it('應該使用預設最大時長 60 秒', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      // 預設 maxDuration 是 60
      expect(screen.getByText(/1:00/)).toBeInTheDocument()
    })
  })

  describe('進度條顯示', () => {
    it('應該根據 duration 計算進度百分比', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={30}
          volume={0.5}
          maxDuration={60}
          onStop={onStop}
        />
      )

      // 30/60 = 50%
      const progressBar = container.querySelector('.bg-red-500.dark\\:bg-red-400.transition-all')
      expect(progressBar).toHaveStyle({ width: '50%' })
    })

    it('應該在超過最大時長時顯示 100%', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={70}
          volume={0.5}
          maxDuration={60}
          onStop={onStop}
        />
      )

      const progressBar = container.querySelector('.bg-red-500.dark\\:bg-red-400.transition-all')
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('應該在 0 秒時顯示 0%', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={0}
          volume={0.5}
          maxDuration={60}
          onStop={onStop}
        />
      )

      const progressBar = container.querySelector('.bg-red-500.dark\\:bg-red-400.transition-all')
      expect(progressBar).toHaveStyle({ width: '0%' })
    })
  })

  describe('音量指示器', () => {
    it('應該根據 volume 值顯示對應數量的音量條', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      // volume 0.5 * 10 = 5 bars (Math.ceil(0.5 * 10) = 5)
      // 檢查總共有 10 個音量條
      const allVolumeBars = container.querySelectorAll('.w-1.rounded-full')
      expect(allVolumeBars).toHaveLength(10)

      // 檢查至少有 5 個是紅色高亮的（active bars）
      const activeBars = Array.from(allVolumeBars).filter((bar) =>
        bar.className.includes('bg-red-500')
      )
      expect(activeBars.length).toBeGreaterThanOrEqual(5)
    })

    it('應該在 volume=0 時無音量條高亮', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={10}
          volume={0}
          onStop={onStop}
        />
      )

      // volume 0 * 10 = 0 bars (Math.ceil(0) = 0)
      const volumeBars = container.querySelectorAll('.w-1.rounded-full')
      expect(volumeBars).toHaveLength(10) // 總共 10 條
    })

    it('應該在 volume=1 時所有音量條高亮', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={10}
          volume={1.0}
          onStop={onStop}
        />
      )

      // volume 1.0 * 10 = 10 bars
      const volumeBars = container.querySelectorAll('.w-1.rounded-full')
      expect(volumeBars).toHaveLength(10)
    })
  })

  describe('停止按鈕', () => {
    it('應該顯示停止按鈕', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      expect(screen.getByText('停止')).toBeInTheDocument()
    })

    it('應該在點擊停止按鈕時呼叫 onStop', async () => {
      const user = userEvent.setup()
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      await user.click(screen.getByText('停止'))

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('停止按鈕應該套用紅色樣式', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      const button = screen.getByText('停止').closest('button')
      expect(button?.className).toContain('bg-red-500')
      expect(button?.className).toContain('hover:bg-red-600')
    })
  })

  describe('視覺動畫', () => {
    it('應該顯示脈動紅點動畫', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      const pulseIndicator = container.querySelector('.animate-pulse')
      expect(pulseIndicator).toBeInTheDocument()

      const pingIndicator = container.querySelector('.animate-ping')
      expect(pingIndicator).toBeInTheDocument()
    })

    it('應該套用紅色主題樣式', () => {
      const onStop = vi.fn()

      const { container } = render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('bg-red-50')
      expect(wrapper).toHaveClass('dark:bg-red-950/20')
      expect(wrapper).toHaveClass('border-red-200')
      expect(wrapper).toHaveClass('dark:border-red-800')
    })
  })

  describe('Accessibility', () => {
    it('停止按鈕應該可被鍵盤聚焦', () => {
      const onStop = vi.fn()

      render(
        <RecordingIndicator
          duration={10}
          volume={0.5}
          onStop={onStop}
        />
      )

      const button = screen.getByText('停止').closest('button')
      expect(button).not.toHaveAttribute('tabindex', '-1')
    })
  })
})
