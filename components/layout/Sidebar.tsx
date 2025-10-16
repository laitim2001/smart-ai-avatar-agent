'use client'

import { useState } from 'react'
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
    href: '/dashboard/conversations',
    icon: MessageSquare,
    label: '對話記錄',
  },
  {
    href: '/dashboard/history',
    icon: History,
    label: '歷史紀錄',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: '設定',
  },
]

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative bg-white border-r border-gray-200 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors"
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
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed && (
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs font-medium text-blue-900">升級至 Pro</p>
            <p className="mt-1 text-xs text-blue-700">
              解鎖更多功能與對話時數
            </p>
            <button className="mt-2 w-full rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
              立即升級
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
