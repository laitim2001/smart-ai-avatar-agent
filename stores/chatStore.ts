/**
 * Chat 狀態管理 Store
 * @module stores/chatStore
 * @description 使用 Zustand 管理對話狀態（訊息陣列、輸入文字、Loading 狀態）
 */

import { create } from 'zustand'
import { Message, ChatStore } from '@/types/chat'
import { sendChatMessage } from '@/lib/api/chat'
import { useAudioStore } from './audioStore'
import { getFriendlyErrorMessage } from '@/lib/utils/error-messages'

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

    // 記錄效能監控時間點
    const startTime = Date.now()

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
      async () => {
        const llmEndTime = Date.now()
        console.log(
          `[Performance] LLM Response Time: ${llmEndTime - startTime}ms`
        )

        // 取得完整回應內容
        const fullContent =
          get().messages.find((msg) => msg.id === avatarMessageId)?.content ||
          ''

        // 更新 Loading 狀態
        set({ isLoading: false })

        // 自動播放語音（非阻塞）
        try {
          const ttsStartTime = Date.now()
          const { speakText } = useAudioStore.getState()
          await speakText(fullContent)
          const ttsEndTime = Date.now()

          const totalTime = ttsEndTime - startTime
          console.log(`[Performance] TTS Time: ${ttsEndTime - ttsStartTime}ms`)
          console.log(`[Performance] Total E2E Time: ${totalTime}ms`)

          if (totalTime > 2500) {
            console.warn(
              `[Performance] E2E delay exceeded target: ${totalTime}ms > 2500ms`
            )
          }
        } catch (ttsError) {
          console.error('[TTS Error]', ttsError)
          // TTS 失敗不影響對話，僅無語音
        }
      },
      // onError: 錯誤處理
      (error) => {
        console.error('[Chat Error]', error)

        // 使用友善錯誤訊息工具
        const errorMessage = getFriendlyErrorMessage(error)

        // 移除臨時 Avatar 訊息，加入錯誤訊息
        set((state) => ({
          messages: [
            ...state.messages.filter((m) => m.id !== avatarMessageId),
            {
              id: `error-${Date.now()}`,
              role: 'avatar' as const,
              content: errorMessage,
              timestamp: new Date(),
            },
          ],
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
