'use client'

import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAvatarStore } from '@/stores/avatarStore'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { status } = useSession()
  const router = useRouter()
  const { loadUserPreferences, loadAvatars } = useAvatarStore()

  // 當使用者認證成功時,載入 Avatar 偏好
  useEffect(() => {
    if (status === 'authenticated') {
      // 同時載入 Avatar 列表與使用者偏好
      Promise.all([loadAvatars(), loadUserPreferences()]).catch((error) => {
        console.error('載入 Avatar 資料失敗:', error)
      })
    }
  }, [status, loadAvatars, loadUserPreferences])

  // 認證保護：未登入時重導向至登入頁面
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // 載入中狀態
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  // 已認證：顯示 Dashboard 佈局
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navigation */}
        <Navigation />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
