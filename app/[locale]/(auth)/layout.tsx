/**
 * Authentication Layout
 *
 * 認證相關頁面的佈局 (登入、註冊、驗證等)
 */

import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
