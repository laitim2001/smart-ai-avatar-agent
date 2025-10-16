'use client'

/**
 * Settings Layout with Sidebar Navigation
 * 設定頁面布局 - 包含側邊欄導航
 */

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const settingsNav = [
  {
    title: '個人資料',
    href: '/settings',
    icon: '👤',
  },
  {
    title: 'Avatar 偏好',
    href: '/settings/avatar',
    icon: '🎭',
  },
  {
    title: '偏好設定',
    href: '/settings/preferences',
    icon: '⚙️',
  },
  {
    title: '安全性',
    href: '/settings/security',
    icon: '🔒',
  },
  {
    title: '活動記錄',
    href: '/settings/activity',
    icon: '📊',
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-gray-600 mt-2">管理您的帳號設定與偏好</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <nav className="md:col-span-1">
          <div className="space-y-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  )
}
