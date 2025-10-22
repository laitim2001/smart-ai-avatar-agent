/**
 * Chat 狀態管理 Store
 * @module stores/chatStore
 * @description 使用 Zustand 管理對話狀態（訊息陣列、輸入文字、Loading 狀態）
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message, ChatStore } from '@/types/chat'
import { sendChatMessage } from '@/lib/api/chat'
import { useAudioStore } from './audioStore'
import { getFriendlyErrorMessage } from '@/lib/utils/error-messages'
import type { SupportedLanguage } from '@/types/stt'

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
export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      messages: [],
      input: '',
      isLoading: false,
      selectedLanguage: 'zh-TW',
      isTranscribing: false,
      currentConversationId: null, // Sprint 6: Current conversation ID

      // Actions
      setConversationId: (id) => {
        set({ currentConversationId: id })
      },

      /**
       * 載入對話訊息
       * @description 從 API 載入指定對話的所有訊息
       */
      loadConversationMessages: async (conversationId: string) => {
        try {
          set({ isLoading: true })

          const response = await fetch(`/api/conversations/${conversationId}`)

          if (!response.ok) {
            throw new Error('載入對話失敗')
          }

          const data = await response.json()
          const conversation = data.conversation

          // 轉換 API 訊息格式為 Chat Store 格式
          const messages: Message[] = conversation.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role === 'assistant' ? 'avatar' : 'user',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))

          set({
            messages,
            currentConversationId: conversationId,
            isLoading: false,
          })
        } catch (error) {
          console.error('[loadConversationMessages] Error:', error)
          set({ isLoading: false })
          throw error
        }
      },

      /**
       * 儲存訊息到資料庫
       * @description 將訊息持久化到當前對話
       */
      saveMessageToConversation: async (
        conversationId: string,
        role: 'user' | 'assistant',
        content: string
      ) => {
        try {
          const response = await fetch(
            `/api/conversations/${conversationId}/messages`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ role, content }),
            }
          )

          if (!response.ok) {
            throw new Error('儲存訊息失敗')
          }

          const data = await response.json()
          return data.message
        } catch (error) {
          console.error('[saveMessageToConversation] Error:', error)
          // 不拋出錯誤，避免影響對話流程
          return null
        }
      },

      sendMessage: async () => {
    const { input, isLoading, messages, currentConversationId, saveMessageToConversation } = get()

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

    // 如果有當前對話，儲存使用者訊息到資料庫（非阻塞）
    if (currentConversationId) {
      saveMessageToConversation(
        currentConversationId,
        'user',
        userMessage.content
      ).catch((err) => {
        console.warn('[sendMessage] Failed to save user message:', err)
      })
    }

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

    // 取得當前 UI 語言（從 URL 路徑中提取）
    const getCurrentLanguage = (): string => {
      if (typeof window === 'undefined') return 'zh-TW'

      const pathSegments = window.location.pathname.split('/')
      const locale = pathSegments[1] // /zh-TW/... or /en/... or /ja/...

      // 映射 next-intl 的 locale 到 AI 語言參數
      if (locale === 'zh-TW') return 'zh-TW'
      if (locale === 'en') return 'en'
      if (locale === 'ja') return 'ja'

      return 'zh-TW' // 預設繁體中文
    }

    const language = getCurrentLanguage()
    console.log(`[chatStore] 🌍 Sending message with language: ${language}`)

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

        // 如果有當前對話，儲存 Avatar 回應到資料庫（非阻塞）
        const { currentConversationId, saveMessageToConversation } = get()
        if (currentConversationId && fullContent) {
          saveMessageToConversation(
            currentConversationId,
            'assistant',
            fullContent
          ).catch((err) => {
            console.warn('[sendMessage] Failed to save assistant message:', err)
          })
        }

        // 更新 Loading 狀態
        set({ isLoading: false })

        // 自動播放語音（非阻塞）
        console.log('[chatStore] 🔊 準備呼叫 TTS，內容長度:', fullContent.length)
        try {
          const ttsStartTime = Date.now()
          const { speakText } = useAudioStore.getState()
          console.log('[chatStore] speakText 函數類型:', typeof speakText)

          if (typeof speakText !== 'function') {
            throw new Error('speakText is not a function')
          }

          console.log('[chatStore] ✅ 開始呼叫 speakText')
          await speakText(fullContent)
          console.log('[chatStore] ✅ speakText 完成')
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
      },
      language // 傳遞語言參數
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

  setLanguage: (language) => {
    set({ selectedLanguage: language })
  },

  /**
   * 套用 Prompt Template
   * @description 將 Prompt Template 內容填入輸入框
   * @param content - Prompt 內容
   */
  applyPrompt: (content: string) => {
    set({ input: content })
  },

  transcribeAudio: async (audioBlob: Blob) => {
    const { selectedLanguage } = get()

    try {
      set({ isTranscribing: true })

      // 建立 FormData
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', selectedLanguage)

      // 呼叫 STT API
      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '語音轉文字失敗')
      }

      const data = await response.json()

      set({ isTranscribing: false })

      // 返回轉換後的文字
      return data.data.text
    } catch (error) {
      set({ isTranscribing: false })

      console.error('[STT Error]', error)

      // 拋出友善錯誤訊息
      const errorMessage = error instanceof Error
        ? error.message
        : '語音轉文字失敗，請重試'

      throw new Error(errorMessage)
    }
  },
}),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        selectedLanguage: state.selectedLanguage,
      }),
    }
  )
)
