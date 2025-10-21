'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('dashboard')
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
      label: t('stats.conversations'),
      value: '0',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('stats.totalTime'),
      value: `0 ${t('stats.minutes')}`,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('stats.monthlyUsage'),
      value: '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: t('stats.activeAvatars'),
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
          {t('welcome')}，{userData?.name || session?.user?.name || t('user')}！
        </h1>
        <p className="mt-2 text-blue-100">
          {t('welcomeMessage')}
        </p>
        {isLoading ? (
          <p className="mt-4 text-sm text-blue-200">{t('loadingUser')}</p>
        ) : (
          <div className="mt-4 space-y-1">
            <p className="text-sm text-blue-200">
              {t('account')}：{userData?.email || session?.user?.email}
            </p>
            {userData?.emailVerified && (
              <p className="text-sm text-blue-200">
                ✓ {t('emailVerified')}
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
          <h2 className="text-lg font-semibold text-gray-900">{t('quickStart.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('quickStart.description')}
          </p>
          <button
            onClick={() => router.push('/conversations')}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {t('quickStart.startButton')}
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity.title')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('recentActivity.noRecords')}
          </p>
          <button
            onClick={() => router.push('/conversations')}
            className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {t('recentActivity.viewAll')}
          </button>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('recentConversationsSection.title')}</h2>
          {recentConversations.length > 0 && (
            <button
              onClick={() => router.push('/conversations')}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              {t('recentConversationsSection.viewAll')}
            </button>
          )}
        </div>

        {isLoadingConversations ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">{t('recentConversationsSection.loading')}</p>
            </div>
          </div>
        ) : recentConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              {t('recentConversationsSection.noRecords')}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t('recentConversationsSection.startFirst')}
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
                        {conversation.title || t('recentConversationsSection.newConversation')}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {createdDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {messageCount} {t('recentConversationsSection.messages')}
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
