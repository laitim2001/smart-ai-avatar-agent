/**
 * Chat 相關型別定義
 * @module types/chat
 */

/**
 * 訊息介面（前端使用）
 * @interface Message
 * @property {string} id - 唯一識別碼（格式：`user-${timestamp}` 或 `avatar-${timestamp}`）
 * @property {'user' | 'avatar'} role - 訊息來源：使用者或 Avatar
 * @property {string} content - 訊息內容（支援多行文字）
 * @property {Date} timestamp - 訊息時間戳記（用於顯示時間與排序）
 */
export interface Message {
  id: string
  role: 'user' | 'avatar'
  content: string
  timestamp: Date
}

/**
 * Chat API 訊息介面（符合 Azure OpenAI 格式）
 * @interface ChatMessage
 * @property {'user' | 'assistant' | 'system'} role - 訊息角色
 * @property {string} content - 訊息內容
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Chat API 請求介面
 * @interface ChatRequest
 * @property {ChatMessage[]} messages - 對話訊息陣列
 * @property {number} [temperature] - 溫度參數（可選，預設 0.7）
 * @property {number} [max_tokens] - 最大 tokens 數量（可選，預設 800）
 */
export interface ChatRequest {
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

/**
 * SSE Chunk 介面
 * @interface SSEChunk
 * @property {string} content - 本次 chunk 的文字內容
 * @property {boolean} [done] - 是否為最後一個 chunk
 */
export interface SSEChunk {
  content: string
  done?: boolean
}

/**
 * API 錯誤回應介面
 * @interface ErrorResponse
 * @property {string} error - 錯誤訊息
 * @property {string} [code] - 錯誤代碼（如 'TIMEOUT', 'API_ERROR'）
 * @property {string} timestamp - 錯誤發生時間（ISO 格式）
 */
export interface ErrorResponse {
  error: string
  code?: string
  timestamp: string
}

/**
 * Chat Store 狀態管理介面
 * @interface ChatStore
 * @property {Message[]} messages - 對話訊息陣列
 * @property {string} input - 使用者輸入的文字
 * @property {boolean} isLoading - 是否正在處理訊息（Loading 狀態）
 * @property {SupportedLanguage} selectedLanguage - 語音輸入選擇的語言
 * @property {boolean} isTranscribing - 是否正在進行語音轉文字
 */
export interface ChatStore {
  // State
  messages: Message[]
  input: string
  isLoading: boolean
  selectedLanguage: 'zh-TW' | 'en-US' | 'ja-JP' // SupportedLanguage
  isTranscribing: boolean
  currentConversationId: string | null // Sprint 6: Current conversation ID

  // Actions
  /**
   * 設定當前對話 ID
   * @param {string | null} id - 對話 ID (null 代表新對話)
   */
  setConversationId: (id: string | null) => void

  /**
   * 載入對話訊息
   * @description 從 API 載入指定對話的所有訊息
   * @param {string} conversationId - 對話 ID
   */
  loadConversationMessages: (conversationId: string) => Promise<void>

  /**
   * 儲存訊息到資料庫
   * @description 將訊息持久化到當前對話
   * @param {string} conversationId - 對話 ID
   * @param {'user' | 'assistant'} role - 訊息角色
   * @param {string} content - 訊息內容
   */
  saveMessageToConversation: (
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ) => Promise<any>

  /**
   * 送出訊息
   * @description 驗證輸入、建立使用者訊息、更新狀態、觸發 API 呼叫
   */
  sendMessage: () => void

  /**
   * 新增訊息到對話歷史
   * @param {Message} message - 要新增的訊息
   */
  addMessage: (message: Message) => void

  /**
   * 清除所有對話訊息
   */
  clearMessages: () => void

  /**
   * 設定使用者輸入文字
   * @param {string} input - 新的輸入文字
   */
  setInput: (input: string) => void

  /**
   * 設定 Loading 狀態
   * @param {boolean} isLoading - Loading 狀態
   */
  setLoading: (isLoading: boolean) => void

  /**
   * 設定語音輸入語言
   * @param {SupportedLanguage} language - 語言代碼
   */
  setLanguage: (language: 'zh-TW' | 'en-US' | 'ja-JP') => void

  /**
   * 套用 Prompt Template
   * @description 將 Prompt Template 內容填入輸入框
   * @param {string} content - Prompt 內容
   */
  applyPrompt: (content: string) => void

  /**
   * 語音轉文字
   * @param {Blob} audioBlob - 音訊資料
   * @returns {Promise<string>} 轉換後的文字
   */
  transcribeAudio: (audioBlob: Blob) => Promise<string>
}
