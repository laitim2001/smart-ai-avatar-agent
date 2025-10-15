/**
 * Chat API Route - Azure OpenAI + SSE 串流
 * @module app/api/chat
 * @description 處理 LLM 對話並使用 Server-Sent Events 串流回應
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, DEPLOYMENT_NAME } from '@/lib/azure/openai'
import { ChatRequest, ErrorResponse } from '@/types/chat'

// 使用 Edge Runtime 提升效能與 SSE 支援
export const runtime = 'edge'

// Avatar System Prompt
const AVATAR_SYSTEM_PROMPT = `你是一個友善、專業的 AI 虛擬助手。
你的回答應該：
1. 簡潔明瞭（每次回答 2-3 句話，約 50-100 字）
2. 使用繁體中文
3. 語氣友善、自然，像真人對話
4. 避免過於正式或機械化的回答
5. 必要時可以使用表情符號增加親切感

請記住：你正在透過 3D Avatar 與使用者對話，保持對話的自然流暢性。`

// 超時設定：10 秒
const TIMEOUT_MS = 10000

/**
 * Chat API - POST 端點
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {NextResponse} SSE 串流或錯誤回應
 *
 * @example
 * ```bash
 * curl -N -X POST http://localhost:3000/api/chat \
 *   -H "Content-Type: application/json" \
 *   -d '{"messages":[{"role":"user","content":"你好"}]}'
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // 解析請求 body
    const body: ChatRequest = await request.json()

    // 驗證必要欄位
    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        {
          error: 'Missing required field: messages',
          code: 'INVALID_REQUEST',
          timestamp: new Date().toISOString(),
        } as ErrorResponse,
        { status: 400 }
      )
    }

    // 建立 OpenAI 客戶端
    const client = getOpenAIClient()

    // 加入 System Prompt
    const messagesWithSystem = [
      { role: 'system' as const, content: AVATAR_SYSTEM_PROMPT },
      ...body.messages,
    ]

    // 設定超時控制
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => {
      timeoutController.abort()
    }, TIMEOUT_MS)

    // 呼叫 Azure OpenAI Chat Completions API（啟用串流）
    const response = await client.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: messagesWithSystem,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.max_tokens ?? 800,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
      stream: true,
    })

    // 建立 SSE 回應串流
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // @ts-expect-error - OpenAI SDK 型別問題
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''

            if (content) {
              // 格式化為 SSE 格式：data: {"content": "..."}\n\n
              const sseChunk = `data: ${JSON.stringify({ content })}\n\n`
              controller.enqueue(encoder.encode(sseChunk))
            }
          }

          // 串流結束，發送 done 訊號
          const doneChunk = `data: ${JSON.stringify({ content: '', done: true })}\n\n`
          controller.enqueue(encoder.encode(doneChunk))

          controller.close()
          clearTimeout(timeoutId)
        } catch (error) {
          console.error('[SSE Stream Error]', error)

          // 發送錯誤訊息給客戶端
          const errorChunk = `data: ${JSON.stringify({
            error: 'Stream interrupted',
            code: 'STREAM_ERROR',
          })}\n\n`
          controller.enqueue(encoder.encode(errorChunk))
          controller.close()
          clearTimeout(timeoutId)
        }
      },
    })

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[Chat API Error]', error)

    // 分類錯誤類型
    let errorCode = 'API_ERROR'
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Azure OpenAI API 錯誤
      if (error.message.includes('quota')) {
        errorCode = 'QUOTA_EXCEEDED'
        errorMessage = 'API quota exceeded. Please try again later.'
      } else if (error.message.includes('credentials')) {
        errorCode = 'INVALID_CREDENTIALS'
        errorMessage = 'Invalid Azure OpenAI credentials.'
        statusCode = 401
      } else if (error.name === 'AbortError') {
        errorCode = 'TIMEOUT'
        errorMessage = 'Request timeout (10 seconds exceeded).'
        statusCode = 408
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      { status: statusCode }
    )
  }
}
