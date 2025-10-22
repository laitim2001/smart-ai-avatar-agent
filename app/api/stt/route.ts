/**
 * Speech-to-Text (STT) API Route
 *
 * POST /api/stt
 *
 * 將音訊檔案轉換為文字
 */

import { NextRequest, NextResponse } from 'next/server'
import { recognizeSpeechFromBuffer } from '@/lib/azure/speech-stt'
import type { SupportedLanguage, STTResponse } from '@/types/stt'
import { SUPPORTED_LANGUAGES, RECORDING_CONSTRAINTS } from '@/types/stt'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
  handleApiError,
} from '@/lib/utils/api-response'

// 使用 Node.js Runtime（Azure Speech SDK 需要）
export const runtime = 'nodejs'

// 增加請求大小限制（2MB 音訊檔案）
export const maxDuration = 30 // 30 秒超時

/**
 * POST /api/stt
 *
 * 語音轉文字 API
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 解析 FormData（音訊檔案以 multipart/form-data 傳送）
    const formData = await request.formData()

    const audioFile = formData.get('audio') as File | null
    const language = (formData.get('language') as SupportedLanguage) || 'zh-TW'

    // 驗證輸入
    if (!audioFile) {
      return validationErrorResponse('缺少音訊檔案')
    }

    // 驗證語言
    const supportedLanguageCodes = SUPPORTED_LANGUAGES.map((lang) => lang.code)
    if (!supportedLanguageCodes.includes(language)) {
      return validationErrorResponse(
        `不支援的語言: ${language}。支援的語言: ${supportedLanguageCodes.join(', ')}`
      )
    }

    // 驗證檔案大小
    if (audioFile.size > RECORDING_CONSTRAINTS.MAX_FILE_SIZE) {
      return validationErrorResponse(
        `音訊檔案過大（最大 ${RECORDING_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB）`
      )
    }

    // 驗證檔案類型
    if (!audioFile.type.startsWith('audio/')) {
      return validationErrorResponse('無效的音訊檔案格式')
    }

    // 轉換為 ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer()

    // 記錄開始時間（用於效能監控）
    const startTime = Date.now()

    // 呼叫 Azure Speech Services
    const result = await recognizeSpeechFromBuffer(arrayBuffer, language)

    // 記錄結束時間
    const endTime = Date.now()
    const processingTime = endTime - startTime

    console.log(`[STT] 語音轉文字成功:`)
    console.log(`  - 語言: ${language}`)
    console.log(`  - 文字: ${result.text}`)
    console.log(`  - 信心分數: ${result.confidence.toFixed(2)}`)
    console.log(`  - 音訊時長: ${result.duration.toFixed(2)}s`)
    console.log(`  - 處理時間: ${processingTime}ms`)

    // 回傳結果
    return successResponse(
      {
        text: result.text,
        confidence: result.confidence,
        language: result.language,
        duration: result.duration,
      },
      '語音轉文字成功'
    )
  } catch (error) {
    console.error('[STT API Error]', error)

    // 特定錯誤處理
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      // Azure Speech Services 特定錯誤
      if (
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('authentication')
      ) {
        return errorResponse(
          'Azure Speech Services 認證失敗，請檢查 API 金鑰',
          401,
          'SPEECH_AUTH_ERROR'
        )
      }

      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit')
      ) {
        return errorResponse(
          'Azure Speech Services 配額已用盡，請稍後再試',
          429,
          'SPEECH_QUOTA_EXCEEDED'
        )
      }

      if (errorMessage.includes('無法辨識')) {
        return validationErrorResponse('無法辨識語音內容，請重新錄音')
      }

      // 一般錯誤
      return errorResponse(
        `語音轉文字失敗: ${error.message}`,
        500,
        'STT_ERROR'
      )
    }

    // 未知錯誤
    return handleApiError(error, '[STT API]')
  }
}

/**
 * GET /api/stt
 *
 * 健康檢查與 API 資訊
 */
export async function GET(): Promise<NextResponse> {
  return successResponse(
    {
      service: 'Speech-to-Text API',
      version: '1.0.0',
      supportedLanguages: SUPPORTED_LANGUAGES,
      constraints: RECORDING_CONSTRAINTS,
    },
    'STT API 運作正常'
  )
}
