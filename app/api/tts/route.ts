/**
 * TTS API Route - 文字轉語音（支援 Viseme 數據）
 * @module app/api/tts/route
 * @description 接收文字,使用 Azure Speech Services REST API 轉換為語音（MP3 格式）
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs' // 需要 Node.js runtime 來處理 Audio

/**
 * TTS 請求介面
 */
interface TTSRequest {
  text: string
  voice?: string
  speed?: number
  pitch?: number
}

/**
 * TTS API 配置
 */
const TTS_CONFIG = {
  defaultVoice: 'zh-TW-HsiaoChenNeural',
  timeout: 30000, // 30 秒
  maxTextLength: 1000,
  speedRange: { min: 0.5, max: 2.0, default: 0.85 }, // 調整為 85% 語速,更自然
  pitchRange: { min: 0.5, max: 2.0, default: 1.0 },
}

/**
 * 將速度轉換為 SSML prosody rate 格式
 */
function speedToRate(speed: number): string {
  // speed 1.0 = 100%, speed 1.5 = 150%, speed 0.8 = 80%
  return `${Math.round(speed * 100)}%`
}

/**
 * 將音調轉換為 SSML prosody pitch 格式
 */
function pitchToSsml(pitch: number): string {
  // pitch 1.0 = +0%, pitch 1.2 = +20%, pitch 0.8 = -20%
  const percentage = Math.round((pitch - 1.0) * 100)
  return percentage >= 0 ? `+${percentage}%` : `${percentage}%`
}

/**
 * POST /api/tts
 * @description 將文字轉換為語音（MP3 格式）- 使用 Azure REST API
 * @param {TTSRequest} body - 請求 body
 * @returns {NextResponse} MP3 音訊 + Viseme 數據或錯誤訊息
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析請求 body
    const body: TTSRequest = await request.json()

    // 2. 驗證必要欄位
    if (!body.text || body.text.trim() === '') {
      return NextResponse.json(
        {
          error: 'Missing required field: text',
          code: 'INVALID_REQUEST',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 3. 驗證文字長度
    if (body.text.length > TTS_CONFIG.maxTextLength) {
      return NextResponse.json(
        {
          error: `Text too long (max ${TTS_CONFIG.maxTextLength} characters)`,
          code: 'TEXT_TOO_LONG',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 4. 驗證語速與音調範圍
    if (body.speed !== undefined) {
      const { min, max } = TTS_CONFIG.speedRange
      if (body.speed < min || body.speed > max) {
        return NextResponse.json(
          {
            error: `Speed must be between ${min} and ${max}`,
            code: 'INVALID_SPEED',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    if (body.pitch !== undefined) {
      const { min, max } = TTS_CONFIG.pitchRange
      if (body.pitch < min || body.pitch > max) {
        return NextResponse.json(
          {
            error: `Pitch must be between ${min} and ${max}`,
            code: 'INVALID_PITCH',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 5. 建立 SSML
    const voice = body.voice || TTS_CONFIG.defaultVoice
    const speed = body.speed || TTS_CONFIG.speedRange.default
    const pitch = body.pitch || TTS_CONFIG.pitchRange.default

    const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="zh-TW">
  <voice name="${voice}">
    <prosody rate="${speedToRate(speed)}" pitch="${pitchToSsml(pitch)}">
      ${body.text}
    </prosody>
  </voice>
</speak>`.trim()

    console.log(`[TTS API] 開始合成文字 (${body.text.length} 字元)`)
    console.log(`[TTS API] Voice: ${voice}, Speed: ${speed}, Pitch: ${pitch}`)

    // 6. 取得 Azure Speech Services 配置
    // 環境變數會在每次請求時重新讀取
    const subscriptionKey = process.env.AZURE_SPEECH_KEY
    const region = process.env.AZURE_SPEECH_REGION

    if (!subscriptionKey || !region) {
      console.error('[TTS API] Missing Azure Speech credentials')
      return NextResponse.json(
        {
          error: 'Azure Speech configuration incomplete',
          code: 'CONFIG_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // 7. 呼叫 Azure Speech Services REST API
    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`

    const startTime = Date.now()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TTS_CONFIG.timeout)

    try {
      const response = await fetch(ttsUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
          'User-Agent': 'smart-ai-avatar-agent',
        },
        body: ssml,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const elapsed = Date.now() - startTime
      console.log(`[TTS API] Azure 回應時間: ${elapsed}ms, Status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[TTS API] Azure API Error: ${response.status} - ${errorText}`)

        return NextResponse.json(
          {
            error: `TTS synthesis failed: ${response.statusText}`,
            code: 'AZURE_API_ERROR',
            timestamp: new Date().toISOString(),
          },
          { status: response.status }
        )
      }

      // 8. 取得音訊數據
      const audioBuffer = Buffer.from(await response.arrayBuffer())
      console.log(`[TTS API] 成功取得音訊 (${audioBuffer.length} bytes)`)

      // 9. 計算音訊長度（估算）
      // MP3 32kbps: ~4KB/秒
      const estimatedDuration = audioBuffer.length / (32 * 1024 / 8)

      console.log(`[TTS API] 音訊長度 ${estimatedDuration.toFixed(2)}s`)

      // 10. 返回 JSON 格式（音訊 + Viseme 數據）
      // 注意: REST API 不支援 Viseme，所以我們返回空陣列
      // 如果需要 Viseme，需要使用 WebSocket API 或者 Speech SDK
      return NextResponse.json({
        audio: audioBuffer.toString('base64'),
        visemes: [], // REST API 不提供 Viseme 數據
        duration: estimatedDuration,
        format: 'audio/mpeg',
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`[TTS API] Request timeout after ${TTS_CONFIG.timeout}ms`)
        return NextResponse.json(
          {
            error: 'TTS request timeout (30 seconds exceeded)',
            code: 'TIMEOUT',
            timestamp: new Date().toISOString(),
          },
          { status: 408 }
        )
      }

      throw fetchError
    }
  } catch (error) {
    console.error('[TTS API Error]', error)

    // 分類錯誤類型
    let errorCode = 'API_ERROR'
    let errorMessage = 'Internal server error'
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      // Azure Speech API 錯誤
      if (error.message.includes('quota')) {
        errorCode = 'QUOTA_EXCEEDED'
        errorMessage = 'TTS quota exceeded. Please try again later.'
      } else if (error.message.includes('credentials') || error.message.includes('認證')) {
        errorCode = 'INVALID_CREDENTIALS'
        errorMessage = 'Invalid Azure Speech credentials.'
        statusCode = 401
      } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        errorCode = 'TIMEOUT'
        errorMessage = 'TTS request timeout (30 seconds exceeded).'
        statusCode = 408
      } else if (error.message.includes('synthesis failed')) {
        errorCode = 'SYNTHESIS_FAILED'
        errorMessage = 'Failed to synthesize audio. Please check input text.'
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }
}
