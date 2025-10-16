/**
 * LanguageSelector Component Tests
 *
 * 測試語言選擇器的顯示與互動
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageSelector } from '@/components/chat/LanguageSelector'
import type { SupportedLanguage } from '@/types/stt'

describe('LanguageSelector', () => {
  describe('完整模式 (full)', () => {
    it('應該顯示標籤「語音輸入語言」', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          variant="full"
        />
      )

      expect(screen.getByText('語音輸入語言')).toBeInTheDocument()
    })

    it('應該顯示語言圖示', () => {
      const onChange = vi.fn()

      const { container } = render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          variant="full"
        />
      )

      // Languages icon from lucide-react
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('應該使用完整寬度', () => {
      const onChange = vi.fn()

      const { container } = render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          variant="full"
        />
      )

      const trigger = container.querySelector('[role="combobox"]')
      expect(trigger?.className).toContain('w-full')
    })
  })

  describe('緊湊模式 (compact)', () => {
    it('應該不顯示標籤文字', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          variant="compact"
        />
      )

      expect(screen.queryByText('語音輸入語言')).not.toBeInTheDocument()
    })

    it('應該使用固定寬度', () => {
      const onChange = vi.fn()

      const { container } = render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          variant="compact"
        />
      )

      const trigger = container.querySelector('[role="combobox"]')
      expect(trigger?.className).toContain('w-24')
      expect(trigger?.className).toContain('h-8')
      expect(trigger?.className).toContain('text-xs')
    })
  })

  describe('語言選項', () => {
    it('應該顯示當前選擇的語言 (zh-TW)', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      // 檢查是否顯示繁體中文（使用 getAllByText 因為 full 模式會顯示兩次）
      const elements = screen.getAllByText('繁體中文')
      expect(elements.length).toBeGreaterThan(0)
    })

    it('應該顯示當前選擇的語言 (en-US)', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="en-US"
          onChange={onChange}
        />
      )

      // 檢查是否顯示英文
      expect(screen.getByText('English')).toBeInTheDocument()
    })

    it('應該顯示當前選擇的語言 (ja-JP)', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="ja-JP"
          onChange={onChange}
        />
      )

      // 檢查是否顯示日文
      expect(screen.getByText('日本語')).toBeInTheDocument()
    })
  })

  describe('語言切換', () => {
    it('應該接受 onChange 回調函數', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      // 組件已渲染，onChange prop 已傳遞
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('應該正確傳遞 SupportedLanguage 型別', () => {
      const onChange = vi.fn<[SupportedLanguage], void>()

      render(
        <LanguageSelector
          value="ja-JP"
          onChange={onChange}
        />
      )

      // 檢查顯示的語言正確
      expect(screen.getByText('日本語')).toBeInTheDocument()
    })
  })

  describe('disabled 狀態', () => {
    it('應該在 disabled=true 時禁用選擇器', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          disabled={true}
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('data-disabled')
      expect(trigger).toBeDisabled()
    })

    it('應該在 disabled=false 時啟用選擇器', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          disabled={false}
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).not.toHaveAttribute('data-disabled')
      expect(trigger).not.toBeDisabled()
    })
  })

  describe('自訂樣式', () => {
    it('應該套用自訂 className', () => {
      const onChange = vi.fn()

      const { container } = render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
          className="custom-class"
        />
      )

      const wrapper = container.firstChild
      expect(wrapper).toHaveClass('custom-class')
    })
  })

  describe('預設行為', () => {
    it('應該預設使用 full 模式', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      expect(screen.getByText('語音輸入語言')).toBeInTheDocument()
    })

    it('應該預設為未禁用狀態', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).not.toHaveAttribute('data-disabled')
      expect(trigger).not.toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('選擇器應該可被鍵盤聚焦', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      const trigger = screen.getByRole('combobox')
      expect(trigger).not.toHaveAttribute('tabindex', '-1')
    })

    it('應該有正確的 ARIA role', () => {
      const onChange = vi.fn()

      render(
        <LanguageSelector
          value="zh-TW"
          onChange={onChange}
        />
      )

      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })
})
