/**
 * Chat API 客戶端
 * @module lib/api/chat
 * @description SSE 串流接收與處理
 */

import { ChatMessage } from '@/types/chat'
import { retryAsync } from '@/lib/utils/retry'

/**
 * SSE 串流回調函式型別
 */
export type OnChunkCallback = (content: string) => void
export type OnDoneCallback = () => void
export type OnErrorCallback = (error: string) => void

/**
 * 發送對話訊息並接收 SSE 串流回應
 *
 * @param {ChatMessage[]} messages - 對話訊息陣列
 * @param {OnChunkCallback} onChunk - 接收到 chunk 時的回調
 * @param {OnDoneCallback} onDone - 串流完成時的回調
 * @param {OnErrorCallback} onError - 發生錯誤時的回調
 * @param {string} language - AI 回應語言（zh-TW, en, ja）
 * @param {string} agentId - Agent ID（可選）
 *
 * @example
 * ```tsx
 * sendChatMessage(
 *   [{ role: 'user', content: '你好' }],
 *   (content) => console.log('Chunk:', content),
 *   () => console.log('Done'),
 *   (error) => console.error('Error:', error),
 *   'zh-TW',
 *   'agent-123'
 * )
 * ```
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk: OnChunkCallback,
  onDone: OnDoneCallback,
  onError: OnErrorCallback,
  language: string = 'zh-TW',
  agentId?: string
): Promise<void> {
  try {
    // 使用 retryAsync 包裝 fetch 請求，支援自動重試
    const response = await retryAsync(
      async () => {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            language,
            ...(agentId && { agentId })
          }),
        })

        // 如果是 5xx 錯誤，拋出錯誤以觸發重試
        if (res.status >= 500) {
          throw new Error(`Server error: ${res.status}`)
        }

        return res
      },
      {
        maxRetries: 1, // 最多重試 1 次
        retryDelay: 1000, // 重試延遲 1 秒
      }
    )

    if (!response.ok) {
      const error = await response.json()
      onError(error.error || 'API request failed')
      return
    }

    // 處理 SSE 串流
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      onError('No response body')
      return
    }

    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 處理完整的 SSE 訊息（以 \n\n 分隔）
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || '' // 保留不完整的訊息

      for (const message of messages) {
        if (message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))

            if (data.error) {
              onError(data.error)
              return
            }

            if (data.done) {
              onDone()
              return
            }

            if (data.content) {
              onChunk(data.content)
            }
          } catch (e) {
            console.error('[SSE Parse Error]', e)
          }
        }
      }
    }
  } catch (error) {
    onError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
  }
}
