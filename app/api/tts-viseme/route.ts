import { NextRequest, NextResponse } from 'next/server'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import type { VisemeEvent, TTSWithVisemeResponse } from '@/types/viseme'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/tts-viseme
 *
 * 文字轉語音 + Viseme 資料
 *
 * 使用 Azure Speech SDK 生成語音並同時獲取 Viseme 事件
 * Viseme 用於驅動 2D/3D Avatar 的嘴型動畫
 *
 * @param request - 包含文字內容的請求
 * @returns 音訊 URL + Viseme 事件陣列
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      text,
      voice = 'zh-TW-HsiaoChenNeural',
      speed = 0.85,
      pitch = 1.0
    } = body

    // 驗證必要欄位
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '缺少文字內容 (text)' },
        { status: 400 }
      )
    }

    // 驗證文字長度
    if (text.length > 1000) {
      return NextResponse.json(
        { error: '文字長度超過 1000 字元' },
        { status: 400 }
      )
    }

    console.log('[TTS Viseme] Processing request:', {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      voice,
      speed,
      pitch
    })

    const startTime = Date.now()

    // 1. 設置 Azure Speech SDK
    const speechKey = process.env.AZURE_SPEECH_KEY
    const speechRegion = process.env.AZURE_SPEECH_REGION

    if (!speechKey || !speechRegion) {
      throw new Error('Missing Azure Speech configuration')
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechSynthesisVoiceName = voice
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

    // 2. 建立音訊輸出配置（輸出到記憶體）
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()

    // 3. 建立 synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

    // 4. 建立 SSML（包含 speed 和 pitch）
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-TW">
        <voice name="${voice}">
          <prosody rate="${Math.round(speed * 100)}%" pitch="${pitch >= 1.0 ? '+' : ''}${Math.round((pitch - 1.0) * 100)}%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `.trim()

    // 5. 收集 Viseme 事件
    const visemes: VisemeEvent[] = []

    synthesizer.visemeReceived = (s, e) => {
      const visemeId = e.visemeId as any
      const audioOffset = e.audioOffset / 10000 // 轉換為毫秒

      visemes.push({
        visemeId,
        audioOffset: e.audioOffset,
        audioOffsetMs: audioOffset
      })
    }

    // 6. 執行合成（Promise 化）
    const result = await new Promise<{
      audioData: ArrayBuffer
      duration: number
    }>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = result.audioData
            const duration = result.audioDuration / 10000 // 轉換為毫秒

            console.log('[TTS Viseme] Synthesis completed:', {
              audioDataSize: audioData.byteLength,
              duration: `${duration}ms`,
              visemeCount: visemes.length
            })

            resolve({ audioData, duration })
          } else {
            console.error('[TTS Viseme] Synthesis failed:', result.errorDetails)
            reject(new Error(`Synthesis failed: ${result.errorDetails}`))
          }

          synthesizer.close()
        },
        (error) => {
          console.error('[TTS Viseme] Synthesis error:', error)
          synthesizer.close()
          reject(new Error(`Synthesis error: ${error}`))
        }
      )
    })

    // 7. 轉換音訊為 Base64 Data URL（直接返回，不上傳到 Blob Storage）
    const audioBase64 = Buffer.from(result.audioData).toString('base64')
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`

    const totalDuration = Date.now() - startTime

    console.log('[TTS Viseme] Success:', {
      totalDuration: `${totalDuration}ms`,
      audioDuration: `${result.duration}ms`,
      visemeCount: visemes.length,
      visemeFirst5: visemes.slice(0, 5)
    })

    // 8. 返回結果
    const response: TTSWithVisemeResponse = {
      audioUrl,
      duration: result.duration,
      visemes,
      text
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('[TTS Viseme] Error:', error)

    return NextResponse.json(
      {
        error: 'TTS with Viseme 生成失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/tts-viseme
 *
 * 測試端點
 */
export async function GET() {
  return NextResponse.json({
    service: 'TTS with Viseme API',
    version: '1.0.0',
    description: '文字轉語音並提供 Viseme 數據用於 Lip Sync',
    endpoints: {
      POST: {
        description: '生成語音和 Viseme 資料',
        body: {
          text: 'string (required)',
          voice: 'string (optional, default: zh-TW-HsiaoChenNeural)',
          speed: 'number (optional, default: 0.85)',
          pitch: 'number (optional, default: 1.0)'
        }
      }
    }
  })
}
