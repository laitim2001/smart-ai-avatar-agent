'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Clock, TrendingUp, Users } from 'lucide-react'

interface UserData {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session])

  // 獲取最近對話記錄
  useEffect(() => {
    async function fetchRecentConversations() {
      try {
        const response = await fetch('/api/conversations?page=1&pageSize=5')
        if (response.ok) {
          const data = await response.json()
          setRecentConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Failed to fetch recent conversations:', error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    if (session) {
      fetchRecentConversations()
    }
  }, [session])

  const stats = [
    {
      label: '對話次數',
      value: '0',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '總對話時長',
      value: '0 分鐘',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: '本月使用次數',
      value: '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '活躍 Avatar',
      value: '3',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          歡迎回來，{userData?.name || session?.user?.name || '使用者'}！
        </h1>
        <p className="mt-2 text-blue-100">
          準備好與您的 AI Avatar 開始對話了嗎？
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-blue-200">載入使用者資訊中...</p>
        ) : (
          <div className="mt-4 space-y-1">
            <p className="text-sm text-blue-200">
              帳號：{userData?.email || session?.user?.email}
            </p>
            {userData?.emailVerified && (
              <p className="text-sm text-blue-200">
                ✓ Email 已驗證
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">快速開始</h2>
          <p className="mt-2 text-sm text-gray-600">
            開始與您的 AI Avatar 進行對話
          </p>
          <button
            onClick={() => router.push('/conversations')}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            開始對話
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">最近活動</h2>
          <p className="mt-2 text-sm text-gray-600">
            目前沒有最近的對話記錄
          </p>
          <button
            onClick={() => router.push('/conversations')}
            className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            查看全部記錄
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最近對話</h2>
          {recentConversations.length > 0 && (
            <button
              onClick={() => router.push('/conversations')}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              查看全部
            </button>
          )}
        </div>

        {isLoadingConversations ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">載入中...</p>
            </div>
          </div>
        ) : recentConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              還沒有對話記錄
            </p>
            <p className="mt-1 text-sm text-gray-500">
              開始您的第一次 AI Avatar 對話吧！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentConversations.map((conversation) => {
              const messageCount = conversation._count?.messages || 0
              const lastMessage = conversation.messages?.[0]
              const createdDate = new Date(conversation.createdAt).toLocaleDateString('zh-TW', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={conversation.id}
                  onClick={() => router.push('/conversations')}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.title || '新對話'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {createdDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {messageCount} 則訊息
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
