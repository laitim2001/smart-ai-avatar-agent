'use client'

/**
 * Activity Log Page
 * 活動記錄頁面
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ActivityLog, ActivityLogResponse } from '@/types/user'

// 活動類型對應的顯示文字和圖示
const activityTypeMap: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  login: { label: '登入', icon: '🔐', color: 'text-green-600' },
  logout: { label: '登出', icon: '👋', color: 'text-gray-600' },
  profile_update: { label: '更新個人資料', icon: '✏️', color: 'text-blue-600' },
  avatar_change: { label: '變更 Avatar', icon: '🎭', color: 'text-purple-600' },
  password_change: {
    label: '變更密碼',
    icon: '🔒',
    color: 'text-orange-600',
  },
  settings_update: {
    label: '更新設定',
    icon: '⚙️',
    color: 'text-indigo-600',
  },
}

export default function ActivityPage() {
  const router = useRouter()
  const { status } = useSession()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 檢查認證狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 載入活動記錄
  useEffect(() => {
    async function loadActivities() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          `/api/user/activity?limit=${pagination.limit}&offset=${pagination.offset}`
        )
        const data: ActivityLogResponse = await response.json()

        if (!response.ok) {
          throw new Error('載入活動記錄失敗')
        }

        setActivities(data.activities)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入時發生錯誤')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadActivities()
    }
  }, [status, pagination.limit, pagination.offset])

  function loadMore() {
    setPagination((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }))
  }

  function formatDate(dateString: string | Date) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // 載入中狀態
  if (status === 'loading' || (isLoading && activities.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>活動記錄</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // 未認證時不顯示內容
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>活動記錄</CardTitle>
        <CardDescription>
          查看您的帳號活動歷史 (共 {pagination.total} 筆記錄)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="rounded-md p-4 bg-red-50 text-red-800 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p>尚無活動記錄</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 活動記錄列表 */}
            <div className="space-y-3">
              {activities.map((activity) => {
                const activityType =
                  activityTypeMap[activity.action] ||
                  activityTypeMap['profile_update']

                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-2xl mt-0.5">{activityType.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium ${activityType.color}`}
                        >
                          {activityType.label}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                      {activity.metadata && (
                        <div className="mt-1 text-sm text-gray-600">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </div>
                      )}
                      {activity.ipAddress && (
                        <div className="mt-1 text-xs text-gray-400">
                          IP: {activity.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 載入更多按鈕 */}
            {pagination.hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '載入中...' : '載入更多'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
