/**
 * LanguageSelector Component
 *
 * 語言選擇器組件
 * 用於選擇語音輸入的語言
 */

'use client'

import { Languages } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUPPORTED_LANGUAGES } from '@/types/stt'
import type { SupportedLanguage } from '@/types/stt'

interface LanguageSelectorProps {
  /** 目前選擇的語言 */
  value: SupportedLanguage
  /** 語言變更回調 */
  onChange: (language: SupportedLanguage) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 顯示模式：完整 | 緊湊 */
  variant?: 'full' | 'compact'
  /** 自訂樣式 */
  className?: string
}

/**
 * LanguageSelector 組件
 */
export function LanguageSelector({
  value,
  onChange,
  disabled = false,
  variant = 'full',
  className = '',
}: LanguageSelectorProps) {
  if (variant === 'compact') {
    // 緊湊模式：僅顯示語言代碼
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Languages className="h-4 w-4 text-muted-foreground" />
        <Select
          value={value}
          onValueChange={(val) => onChange(val as SupportedLanguage)}
          disabled={disabled}
        >
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code} className="text-xs">
                {lang.nativeLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // 完整模式：顯示完整標籤
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Languages className="h-4 w-4" />
        語音輸入語言
      </label>
      <Select
        value={value}
        onValueChange={(val) => onChange(val as SupportedLanguage)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center justify-between w-full">
                <span>{lang.label}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {lang.nativeLabel}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
