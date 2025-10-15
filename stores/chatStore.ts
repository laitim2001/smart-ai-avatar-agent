/**
 * Chat 狀態管理 Store
 * @module stores/chatStore
 * @description 使用 Zustand 管理對話狀態（訊息陣列、輸入文字、Loading 狀態）
 */

import { create } from 'zustand'
import { Message, ChatStore } from '@/types/chat'

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
    const { input, isLoading } = get()

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

    // 後續 Story 3.3 將整合真實 API
    // 目前使用模擬回應驗證 Store 運作
    setTimeout(() => {
      const avatarMessage: Message = {
        id: `avatar-${Date.now()}`,
        role: 'avatar',
        content: '這是 Avatar 的測試回應（來自 chatStore）',
        timestamp: new Date(),
      }

      set((state) => ({
        messages: [...state.messages, avatarMessage],
        isLoading: false,
      }))
    }, 1500)
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
