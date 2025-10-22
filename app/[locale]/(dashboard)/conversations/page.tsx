'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import ConversationList from '@/components/conversations/ConversationList'
import ChatInterface from '@/components/chat/ChatInterface'
import AvatarSelector from '@/components/avatar/AvatarSelector'
import AvatarChangeButton from '@/components/avatar/AvatarChangeButton'
import { ClearCacheButton } from './clear-cache'
import { useChatStore } from '@/stores/chatStore'
import { useAvatarStore } from '@/stores/avatarStore'
import { Loader2 } from 'lucide-react'

// Dynamic import for AvatarCanvas with SSR disabled (Three.js requirement)
const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-700 text-lg">載入 3D Avatar...</p>
      </div>
    </div>
  ),
})

export default function ConversationsPage() {
  const router = useRouter()
  const t = useTranslations('conversation')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const {
    currentConversationId,
    setConversationId,
    loadConversationMessages,
    clearMessages,
  } = useChatStore()

  const { currentAvatarUrl } = useAvatarStore()

  // 處理從 URL 查詢參數載入對話
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('id')

    if (conversationId && conversationId !== selectedConversationId) {
      handleSelectConversation(conversationId)
    }
  }, [])

  // 處理對話選擇
  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === selectedConversationId) return

    try {
      setSelectedConversationId(conversationId)

      // 載入對話訊息
      await loadConversationMessages(conversationId)
    } catch (error) {
      console.error('[ConversationsPage] Load conversation error:', error)
      alert(t('loadingError'))
    }
  }

  // 處理建立新對話
  const handleNewConversation = async () => {
    try {
      setIsCreatingConversation(true)

      const { currentAvatarId } = useAvatarStore.getState()

      // 呼叫 API 建立新對話
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: t('startNewConversation'),
          avatarId: currentAvatarId,
        }),
      })

      if (!response.ok) {
        throw new Error('建立對話失敗')
      }

      const data = await response.json()
      const newConversation = data.conversation

      // 設定為當前對話
      setConversationId(newConversation.id)
      setSelectedConversationId(newConversation.id)

      // 清空訊息
      clearMessages()

      // 觸發 ConversationList 重新載入（透過 key 變更強制重新掛載）
      setRefreshTrigger((prev) => prev + 1)
    } catch (error) {
      console.error('[ConversationsPage] Create conversation error:', error)
      alert(t('createError'))
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden -m-6">
      {/* 臨時的快取清除按鈕 */}
      <ClearCacheButton />

      {/* Left Sidebar - Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white shadow-sm overflow-y-auto">
        <ConversationList
          key={refreshTrigger}
          selectedId={selectedConversationId || undefined}
          onSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Content - Chat Interface + Avatar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Avatar Canvas (Left) - 3D Avatar 顯示區 - 調整為 40% 寬度，限制最大高度 */}
        <div className="w-[40%] h-full bg-gradient-to-b from-blue-50 to-indigo-100 border-r border-gray-200 relative overflow-hidden">
          <AvatarCanvas />

          {/* Avatar Change Button - 右上角觸發按鈕 */}
          <AvatarChangeButton />

          {/* Avatar Selector Modal - Avatar 選擇器 */}
          <AvatarSelector />
        </div>

        {/* Chat Interface (Right) - 調整為 60% 寬度，限制高度防止溢出 */}
        <div className="w-[60%] h-full flex flex-col bg-white overflow-hidden">
          {isCreatingConversation ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm text-gray-600">{t('creating')}</p>
              </div>
            </div>
          ) : selectedConversationId ? (
            <div className="h-full overflow-hidden">
              <ChatInterface />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center px-4">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-6">
                    <svg
                      className="h-12 w-12 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('selectOrCreate')}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {t('selectOrCreateHint')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
