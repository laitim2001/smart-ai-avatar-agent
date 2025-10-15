'use client'

import { useRef, useEffect } from 'react'
import Spinner from './Spinner'
import { useChatStore } from '@/stores/chatStore'

/**
 * 對話介面組件
 *
 * 提供與 Avatar 對話的使用者介面，包含：
 * - 對話歷史顯示區域（最近 5 則訊息）
 * - 文字輸入框（支援 Enter 送出、Shift+Enter 換行）
 * - 送出與清除按鈕（含 Loading 狀態）
 * - 自動滾動到最新訊息
 *
 * @component
 * @example
 * ```tsx
 * import ChatInterface from '@/components/chat/ChatInterface'
 *
 * export default function Page() {
 *   return <ChatInterface />
 * }
 * ```
 */
export default function ChatInterface() {
  // Zustand 狀態管理
  const { messages, input, isLoading, sendMessage, clearMessages, setInput } =
    useChatStore()

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * 自動滾動到訊息列表底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * 處理 Enter 鍵送出邏輯
   * - Enter: 送出訊息
   * - Shift+Enter: 換行
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim() !== '') {
        sendMessage()
      }
    }
  }

  /**
   * 處理清除所有對話
   */
  const handleClear = () => {
    if (window.confirm('確定要清除所有對話紀錄嗎？')) {
      clearMessages()
    }
  }

  // 監聽訊息變更，自動滾動到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* 對話歷史區域 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>開始與 Avatar 對話...</p>
          </div>
        ) : (
          messages.slice(-5).map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息與 Avatar 對話..."
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || input.trim() === ''}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>傳送中...</span>
              </>
            ) : (
              <span>送出</span>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading || messages.length === 0}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  )
}
