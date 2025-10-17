'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, type Locale } from '@/i18n/request'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

/**
 * 語言切換組件
 * 支援繁體中文、英文、日文切換
 * 使用 localStorage 持久化語言偏好
 */
export function LanguageSwitcher() {
  const t = useTranslations('language')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  // 語言顯示名稱映射
  const languageNames: Record<Locale, string> = {
    'zh-TW': t('zhTW'),
    en: t('en'),
    ja: t('ja'),
  }

  /**
   * 切換語言處理函數
   * 1. 從當前路徑移除舊語言前綴
   * 2. 加上新語言前綴
   * 3. 儲存語言偏好到 localStorage
   * 4. 路由導航到新路徑
   */
  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === locale) return

    // 移除當前語言前綴並加上新語言前綴
    const pathnameWithoutLocale = pathname.replace(/^\/(zh-TW|en|ja)/, '')
    const newPathname = `/${newLocale}${pathnameWithoutLocale}`

    // 儲存語言偏好到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale)
    }

    // 導航到新路徑
    router.push(newPathname)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          aria-label={t('selectLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languageNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            {languageNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
