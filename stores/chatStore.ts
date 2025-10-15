/**
 * Chat 狀態管理 Store
 * @module stores/chatStore
 * @description 使用 Zustand 管理對話狀態（訊息陣列、輸入文字、Loading 狀態）
 */

import { create } from 'zustand'
import { Message, ChatStore } from '@/types/chat'
import { sendChatMessage } from '@/lib/api/chat'

/**
 * Chat Store Hook
 * @description 提供對話狀態管理與操作方法
 * @returns {ChatStore} Chat 狀態與 Actions
 *
 * @example
 * ```tsx
 * const { messages, input, sendMessage, setInput } = useChatStore()
 *
 * // 使用者輸入
 * <input value={input} onChange={(e) => setInput(e.target.value)} />
 *
 * // 送出訊息
 * <button onClick={sendMessage}>送出</button>
 *
 * // 顯示訊息
 * {messages.map(msg => <div key={msg.id}>{msg.content}</div>)}
 * ```
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial State
  messages: [],
  input: '',
  isLoading: false,

  // Actions
  sendMessage: () => {
    const { input, isLoading, messages } = get()

    // 驗證輸入與狀態
    if (input.trim() === '' || isLoading) return

    // 建立使用者訊息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    // 更新狀態
    set((state) => ({
      messages: [...state.messages, userMessage],
      input: '',
      isLoading: true,
    }))

    // 準備 API 訊息格式（轉換 role）
    const apiMessages = [...messages, userMessage].map((msg) => ({
      role: msg.role === 'avatar' ? ('assistant' as const) : ('user' as const),
      content: msg.content,
    }))

    // 建立 Avatar 訊息（用於即時更新）
    const avatarMessageId = `avatar-${Date.now()}`
    const avatarMessage: Message = {
      id: avatarMessageId,
      role: 'avatar',
      content: '',
      timestamp: new Date(),
    }

    // 加入空 Avatar 訊息
    set((state) => ({
      messages: [...state.messages, avatarMessage],
    }))

    // 呼叫 Chat API（SSE 串流）
    sendChatMessage(
      apiMessages,
      // onChunk: 即時更新 Avatar 訊息內容
      (content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === avatarMessageId
              ? { ...msg, content: msg.content + content }
              : msg
          ),
        }))
      },
      // onDone: 串流完成
      () => {
        set({ isLoading: false })
      },
      // onError: 錯誤處理
      (error) => {
        console.error('[Chat API Error]', error)
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === avatarMessageId
              ? { ...msg, content: `錯誤：${error}` }
              : msg
          ),
          isLoading: false,
        }))
      }
    )
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setInput: (input) => {
    set({ input })
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },
}))
