/**
 * TTS API Route - 文字轉語音（支援 Viseme 數據）
 * @module app/api/tts/route
 * @description 接收文字,使用 Azure Speech SDK 轉換為語音（MP3 格式）並返回 Viseme 資料
 */

import { NextRequest, NextResponse } from 'next/server'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { getSpeechConfig } from '@/lib/azure/speech'
import { VisemeData } from '@/types/lipsync'

export const runtime = 'nodejs' // 需要 Node.js runtime 來處理 Audio
export const maxDuration = 60 // 最長執行時間 60 秒

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
  speedRange: { min: 0.2, max: 2.0, default: 0.2 }, // 降低到 20% 語速，極慢速度讓每個嘴型清楚可見
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

    // 6. 取得 Azure Speech SDK 配置
    let speechConfig: sdk.SpeechConfig
    try {
      speechConfig = getSpeechConfig()
      speechConfig.speechSynthesisVoiceName = voice
      speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    } catch (error) {
      console.error('[TTS API] Missing Azure Speech credentials:', error)
      return NextResponse.json(
        {
          error: 'Azure Speech configuration incomplete',
          code: 'CONFIG_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // 7. 建立 Speech Synthesizer（使用 Pull Audio Stream）
    const startTime = Date.now()
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput() // 我們會從 result 取得音訊，所以這裡用預設即可
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

    // 8. 收集 Viseme 資料
    const visemes: VisemeData[] = []

    synthesizer.visemeReceived = (s, e) => {
      visemes.push({
        time: e.audioOffset / 10000000, // 轉換為秒
        visemeId: e.visemeId,
      })
    }

    // 9. 使用 Promise 包裝 Speech SDK 的非同步操作
    const synthesisResult = await new Promise<sdk.SpeechSynthesisResult>(
      (resolve, reject) => {
        const timeoutId = setTimeout(() => {
          synthesizer.close()
          reject(new Error('TTS request timeout (30 seconds exceeded)'))
        }, TTS_CONFIG.timeout)

        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            clearTimeout(timeoutId)
            resolve(result)
          },
          (error) => {
            clearTimeout(timeoutId)
            synthesizer.close()
            reject(error)
          }
        )
      }
    )

    const elapsed = Date.now() - startTime
    console.log(`[TTS API] Azure 回應時間: ${elapsed}ms`)

    // 10. 檢查合成結果
    if (synthesisResult.reason === sdk.ResultReason.Canceled) {
      const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(
        synthesisResult
      )
      synthesizer.close()

      console.error(
        `[TTS API] Speech synthesis canceled: ${cancellation.reason}, ${cancellation.errorDetails}`
      )

      return NextResponse.json(
        {
          error: `TTS synthesis failed: ${cancellation.errorDetails}`,
          code: 'AZURE_API_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    // 11. 取得音訊數據
    const audioData = synthesisResult.audioData
    const audioBuffer = Buffer.from(audioData)
    synthesizer.close()

    console.log(`[TTS API] 成功取得音訊 (${audioBuffer.length} bytes)`)
    console.log(`[TTS API] Viseme 數量: ${visemes.length}`)

    // 12. 計算音訊長度
    const audioDuration = synthesisResult.audioDuration / 10000000 // 轉換為秒

    console.log(`[TTS API] 音訊長度 ${audioDuration.toFixed(2)}s`)

    // 13. 返回 JSON 格式（音訊 + Viseme 數據）
    return NextResponse.json({
      audio: audioBuffer.toString('base64'),
      visemes: visemes, // ✅ 真正的 Viseme 資料
      duration: audioDuration,
      format: 'audio/mpeg',
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
