/**
 * Chat 相關型別定義
 * @module types/chat
 */

/**
 * 訊息介面
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
 * Chat Store 狀態管理介面
 * @interface ChatStore
 * @property {Message[]} messages - 對話訊息陣列
 * @property {string} input - 使用者輸入的文字
 * @property {boolean} isLoading - 是否正在處理訊息（Loading 狀態）
 */
export interface ChatStore {
  // State
  messages: Message[]
  input: string
  isLoading: boolean

  // Actions
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
}
