/**
 * Next.js Middleware
 *
 * 全域路由中介軟體，用於：
 * 1. 認證保護（NextAuth.js）
 * 2. 路由重導向規則
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/request'

// 建立 i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
})

/**
 * 認證保護的路由前綴
 */
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/profile']

/**
 * 需要已認證使用者重導向的路由（登入後不應訪問）
 */
const AUTH_ROUTES = ['/login', '/register']

/**
 * Middleware 主函數
 * 組合 i18n 與認證 middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 首先執行 i18n middleware (處理語言前綴)
  const intlResponse = intlMiddleware(request)

  // 2. 從路徑中提取語言前綴並獲取實際路徑
  const pathnameWithoutLocale = pathname.replace(/^\/(zh-TW|en|ja)/, '') || '/'

  // 獲取當前 session
  const session = await auth()
  const isAuthenticated = !!session

  // 檢查是否為受保護的路由
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  // 檢查是否為認證相關路由
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  )

  // 3. 受保護路由：未登入則重導向至登入頁
  if (isProtectedRoute && !isAuthenticated) {
    const locale = pathname.match(/^\/(zh-TW|en|ja)/)?.[1] || defaultLocale
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. 認證路由：已登入則重導向至 Dashboard
  if (isAuthRoute && isAuthenticated) {
    const locale = pathname.match(/^\/(zh-TW|en|ja)/)?.[1] || defaultLocale
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
  }

  // 5. 返回 i18n middleware 的結果
  return intlResponse
}

/**
 * Middleware 配置
 * 指定哪些路由需要執行 Middleware
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - API routes (以 /api/ 開頭)
     * - Static files (以 /_ 開頭)
     * - Images, favicon 等靜態資源
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
