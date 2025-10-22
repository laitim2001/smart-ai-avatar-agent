import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// 支援的語言列表
export const locales = ['zh-TW', 'en', 'ja'] as const
export type Locale = (typeof locales)[number]

// 預設語言
export const defaultLocale: Locale = 'zh-TW'

// next-intl 配置
export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale

  // 驗證語言是否支援,如果不支援則使用預設語言
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default,
  }
})
