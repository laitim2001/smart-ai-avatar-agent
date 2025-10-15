/**
 * TTS API Route - 文字轉語音
 * @module app/api/tts/route
 * @description 接收文字，使用 Azure Speech Services 轉換為語音（MP3 格式）
 */

import { NextRequest, NextResponse } from 'next/server'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { getSpeechConfig, DEFAULT_VOICE } from '@/lib/azure/speech'

export const runtime = 'nodejs' // Azure Speech SDK 需要 Node.js runtime

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
  defaultVoice: DEFAULT_VOICE,
  audioFormat: sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3,
  timeout: 5000,
  maxTextLength: 1000,
  speedRange: { min: 0.5, max: 2.0, default: 1.0 },
  pitchRange: { min: 0.5, max: 2.0, default: 1.0 },
}

/**
 * POST /api/tts
 * @description 將文字轉換為語音（MP3 格式）
 * @param {TTSRequest} body - 請求 body
 * @returns {NextResponse} MP3 音訊檔案或錯誤訊息
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

    // 5. 建立 Speech 配置
    const speechConfig = getSpeechConfig()
    speechConfig.speechSynthesisVoiceName = body.voice || TTS_CONFIG.defaultVoice
    speechConfig.speechSynthesisOutputFormat = TTS_CONFIG.audioFormat

    // 6. 準備 SSML（如需要語速/音調調整）
    let textOrSSML = body.text
    if (body.speed || body.pitch) {
      const speed = body.speed || TTS_CONFIG.speedRange.default
      const pitch = body.pitch || TTS_CONFIG.pitchRange.default
      textOrSSML = `
        <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-TW">
          <voice name="${speechConfig.speechSynthesisVoiceName}">
            <prosody rate="${speed}" pitch="${pitch}">
              ${body.text}
            </prosody>
          </voice>
        </speak>
      `
    }

    // 7. 建立 TTS 合成器
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null)

    // 8. 執行 TTS 轉換（Promise 包裝）
    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        synthesizer.close()
        reject(new Error('TTS request timeout (5 seconds exceeded)'))
      }, TTS_CONFIG.timeout)

      // 使用 SSML 或純文字
      const speakMethod = body.speed || body.pitch ? 'speakSsmlAsync' : 'speakTextAsync'

      synthesizer[speakMethod](
        textOrSSML,
        (result) => {
          clearTimeout(timeoutId)
          synthesizer.close()

          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            // 轉換成功，取得音訊 Buffer
            const audioData = Buffer.from(result.audioData)
            resolve(audioData)
          } else {
            reject(new Error(`TTS synthesis failed: ${result.errorDetails}`))
          }
        },
        (error) => {
          clearTimeout(timeoutId)
          synthesizer.close()
          reject(error)
        }
      )
    })

    // 9. 計算音訊長度（估算）
    // MP3 32kbps: ~4KB/秒
    const estimatedDuration = audioBuffer.length / (32 * 1024 / 8)

    // 10. 返回音訊檔案
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'X-Audio-Duration': estimatedDuration.toFixed(2),
        'Cache-Control': 'public, max-age=3600', // 快取 1 小時
      },
    })
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
      } else if (error.message.includes('timeout')) {
        errorCode = 'TIMEOUT'
        errorMessage = 'TTS request timeout (5 seconds exceeded).'
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
