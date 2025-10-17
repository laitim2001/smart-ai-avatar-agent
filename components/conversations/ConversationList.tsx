'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Search, Loader2 } from 'lucide-react'
import ConversationItem from './ConversationItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Conversation {
  id: string
  title: string
  avatarId?: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
  }
  messages: Array<{
    id: string
    role: string
    content: string
    timestamp: string
  }>
}

interface ConversationListProps {
  selectedId?: string
  onSelect?: (conversationId: string) => void
  onNewConversation?: () => void
}

export default function ConversationList({
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  // 載入對話列表
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/conversations')

      if (!response.ok) {
        throw new Error('載入對話列表失敗')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('[ConversationList] Error:', err)
      setError(err instanceof Error ? err.message : '載入失敗')
    } finally {
      setIsLoading(false)
    }
  }

  // 刪除對話
  const handleDelete = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('刪除對話失敗')
      }

      // 更新本地狀態
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      )

      // 如果刪除的是當前選中的對話，清除選中狀態
      if (selectedId === conversationId && onSelect) {
        onSelect('')
      }
    } catch (err) {
      console.error('[ConversationList] Delete error:', err)
      alert(err instanceof Error ? err.message : '刪除失敗')
    }
  }

  // 更新對話標題
  const handleRename = async (conversationId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      })

      if (!response.ok) {
        throw new Error('更新標題失敗')
      }

      const data = await response.json()

      // 更新本地狀態
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, title: data.conversation.title }
            : conv
        )
      )
    } catch (err) {
      console.error('[ConversationList] Rename error:', err)
      alert(err instanceof Error ? err.message : '更新失敗')
    }
  }

  // 過濾對話列表（搜尋功能）
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const titleMatch = conv.title.toLowerCase().includes(query)
    const contentMatch = conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(query)
    )

    return titleMatch || contentMatch
  })

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">對話記錄</h2>
          </div>
          <Button
            size="sm"
            onClick={onNewConversation}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            新對話
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="搜尋對話..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              className="mt-2"
            >
              重試
            </Button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {searchQuery ? '找不到符合的對話' : '尚無對話記錄'}
            </p>
            <p className="text-xs text-gray-500 text-center">
              {searchQuery
                ? '試試其他搜尋關鍵字'
                : '點擊「新對話」開始與 AI 助手交流'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedId === conversation.id}
                onSelect={() => onSelect?.(conversation.id)}
                onDelete={() => handleDelete(conversation.id)}
                onRename={(newTitle) => handleRename(conversation.id, newTitle)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isLoading && !error && filteredConversations.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-500">
            共 {filteredConversations.length} 個對話
            {searchQuery && ` (搜尋結果)`}
          </p>
        </div>
      )}
    </div>
  )
}
