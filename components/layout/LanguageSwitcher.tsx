'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname as useNextPathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Globe, Check } from 'lucide-react'
import { useState, useRef, useEffect, useTransition } from 'react'

const languages = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
] as const

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = useNextPathname()
  const t = useTranslations('language')
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 關閉下拉選單當點擊外部
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const switchLanguage = (newLocale: string) => {
    setIsOpen(false)

    // 從當前路徑中移除現有的語言前綴
    const pathnameWithoutLocale = pathname.replace(/^\/(zh-TW|en|ja)/, '') || '/'

    // 建立新路徑: 新語言 + 無語言的路徑
    const newPathname = `/${newLocale}${pathnameWithoutLocale}`

    console.log('[LanguageSwitcher] Switching language:', {
      from: locale,
      to: newLocale,
      currentPath: pathname,
      pathnameWithoutLocale,
      newPath: newPathname,
    })

    // 使用 startTransition 以獲得更好的 UX
    startTransition(() => {
      router.replace(newPathname)
    })
  }

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 觸發按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('selectLanguage')}
      >
        <Globe className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.label}</span>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500">{t('selectLanguage')}</p>
          </div>
          {languages.map((lang) => {
            const isActive = locale === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                disabled={isPending}
                className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {isActive && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
