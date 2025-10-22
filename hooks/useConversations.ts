import { useState, useCallback } from 'react'

export interface Conversation {
  id: string
  userId: string
  title: string
  avatarId?: string | null
  createdAt: string
  updatedAt: string
  messages: Message[]
  _count?: {
    messages: number
  }
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface CreateConversationInput {
  title?: string
  avatarId?: string
}

export interface AddMessageInput {
  role: 'user' | 'assistant'
  content: string
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 建立新對話
   */
  const createConversation = useCallback(
    async (input?: CreateConversationInput): Promise<Conversation | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input || {}),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '建立對話失敗')
        }

        const data = await response.json()
        const newConversation = data.conversation

        // 更新本地狀態
        setConversations((prev) => [newConversation, ...prev])
        setCurrentConversation(newConversation)

        return newConversation
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '建立對話時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] createConversation error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * 載入對話列表
   */
  const loadConversations = useCallback(
    async (page = 1, pageSize = 20): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/conversations?page=${page}&pageSize=${pageSize}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '載入對話列表失敗')
        }

        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '載入對話列表時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] loadConversations error:', err)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * 載入單一對話詳情
   */
  const loadConversation = useCallback(
    async (conversationId: string): Promise<Conversation | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/conversations/${conversationId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '載入對話失敗')
        }

        const data = await response.json()
        const conversation = data.conversation

        setCurrentConversation(conversation)
        return conversation
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '載入對話時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] loadConversation error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * 更新對話標題
   */
  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '更新標題失敗')
        }

        const data = await response.json()
        const updatedConversation = data.conversation

        // 更新本地狀態
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? updatedConversation : conv
          )
        )

        if (currentConversation?.id === conversationId) {
          setCurrentConversation(updatedConversation)
        }

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '更新標題時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] updateConversationTitle error:', err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversation]
  )

  /**
   * 刪除對話
   */
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '刪除對話失敗')
        }

        // 更新本地狀態
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))

        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null)
        }

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '刪除對話時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] deleteConversation error:', err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversation]
  )

  /**
   * 新增訊息到對話
   */
  const addMessage = useCallback(
    async (
      conversationId: string,
      input: AddMessageInput
    ): Promise<Message | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '新增訊息失敗')
        }

        const data = await response.json()
        const newMessage = data.message

        // 更新當前對話的訊息列表
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) =>
            prev
              ? {
                  ...prev,
                  messages: [...prev.messages, newMessage],
                  updatedAt: newMessage.timestamp,
                }
              : null
          )
        }

        // 更新對話列表中的對話 (更新 updatedAt)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, updatedAt: newMessage.timestamp }
              : conv
          )
        )

        return newMessage
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '新增訊息時發生錯誤'
        setError(errorMessage)
        console.error('[useConversations] addMessage error:', err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [currentConversation]
  )

  /**
   * 清除錯誤
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    conversations,
    currentConversation,
    isLoading,
    error,

    // Actions
    createConversation,
    loadConversations,
    loadConversation,
    updateConversationTitle,
    deleteConversation,
    addMessage,
    clearError,
  }
}
