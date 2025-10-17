'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConversationList from '@/components/conversations/ConversationList'
import ChatInterface from '@/components/chat/ChatInterface'
import AvatarCanvas from '@/components/avatar/AvatarCanvas'
import { useChatStore } from '@/stores/chatStore'
import { useAvatarStore } from '@/stores/avatarStore'
import { Loader2 } from 'lucide-react'

export default function ConversationsPage() {
  const router = useRouter()
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const {
    currentConversationId,
    setConversationId,
    loadConversationMessages,
    clearMessages,
  } = useChatStore()

  const { currentAvatarUrl } = useAvatarStore()

  // 處理對話選擇
  const handleSelectConversation = async (conversationId: string) => {
    if (conversationId === selectedConversationId) return

    try {
      setSelectedConversationId(conversationId)

      // 載入對話訊息
      await loadConversationMessages(conversationId)
    } catch (error) {
      console.error('[ConversationsPage] Load conversation error:', error)
      alert('載入對話失敗，請重試')
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
          title: '新對話',
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

      // 重新整理對話列表（透過重新掛載 ConversationList）
      window.location.reload()
    } catch (error) {
      console.error('[ConversationsPage] Create conversation error:', error)
      alert('建立對話失敗，請重試')
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white shadow-sm">
        <ConversationList
          selectedId={selectedConversationId || undefined}
          onSelect={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Content - Chat Interface + Avatar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Avatar Canvas (Left) - Temporarily Hidden Due to Model Loading Issues */}
        {/* TODO: Fix Ready Player Me model loading or replace with alternative solution */}
        {false && (
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 border-r border-gray-200">
            <AvatarCanvas />
          </div>
        )}

        {/* Chat Interface (Full Width - Avatar temporarily disabled) */}
        <div className="w-full bg-white">
          {isCreatingConversation ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm text-gray-600">建立新對話中...</p>
              </div>
            </div>
          ) : selectedConversationId ? (
            <ChatInterface />
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
                  選擇或建立對話
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  從左側選擇現有對話，或點擊「新對話」開始與 AI 助手交流
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
