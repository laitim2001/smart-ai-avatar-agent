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
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 獲取當前 session
  const session = await auth()
  const isAuthenticated = !!session

  // 檢查是否為受保護的路由
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // 檢查是否為認證相關路由
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // 1. 受保護路由：未登入則重導向至登入頁
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. 認證路由：已登入則重導向至 Dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. 其他路由：允許訪問
  return NextResponse.next()
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
