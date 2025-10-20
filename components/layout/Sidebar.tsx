'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: '控制台',
  },
  {
    href: '/conversations',
    icon: MessageSquare,
    label: '對話記錄',
  },
  {
    href: '/custom-avatar',
    icon: Sparkles,
    label: '自定義 Avatar',
    badge: 'NEW',
  },
  {
    href: '/avatar-lip-sync-test',
    icon: Sparkles,
    label: 'Avatar Lip Sync 測試',
    badge: 'TEST',
  },
  {
    href: '/prompts',
    icon: History,
    label: '對話主題',
  },
  {
    href: '/settings',
    icon: Settings,
    label: '設定',
  },
]

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // 自動響應視窗大小
  useEffect(() => {
    const handleResize = () => {
      // 小於 768px 時，自動收合側邊欄
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    handleResize() // 初始化檢查
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 移動版選單切換按鈕（固定在左上角）
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label="開啟選單"
    >
      {isMobileOpen ? (
        <X className="h-5 w-5 text-gray-600" />
      ) : (
        <Menu className="h-5 w-5 text-gray-600" />
      )}
    </button>
  )

  return (
    <>
      {/* 移動版選單按鈕 */}
      <MobileMenuButton />

      {/* 移動版遮罩 */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 側邊欄 */}
      <aside
        className={cn(
          'fixed md:relative top-0 left-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40',
          // 桌面版
          'md:block',
          isCollapsed ? 'md:w-16' : 'md:w-64',
          // 移動版
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
      {/* Collapse Toggle Button (桌面版) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-6 z-10 h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
        aria-label={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
            AI
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold text-gray-900">
              AI Avatar
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)} // 移動版點擊後關閉選單
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                isCollapsed && 'md:justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="flex-1">{item.label}</span>
              )}
              {'badge' in item && item.badge && !isCollapsed && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
    </>
  )
}
