/**
 * Azure Speech Services - Speech-to-Text (STT) Wrapper
 *
 * 封裝 Azure Speech SDK，提供語音轉文字功能
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import type { SupportedLanguage, STTData } from '@/types/stt'

/**
 * Azure Speech 配置驗證
 */
function validateSpeechConfig(): {
  key: string
  region: string
} {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION

  if (!key) {
    throw new Error('AZURE_SPEECH_KEY environment variable is not set')
  }

  if (!region) {
    throw new Error('AZURE_SPEECH_REGION environment variable is not set')
  }

  return { key, region }
}

/**
 * 建立 Speech Config
 */
function createSpeechConfig(language: SupportedLanguage): sdk.SpeechConfig {
  const { key, region } = validateSpeechConfig()

  const speechConfig = sdk.SpeechConfig.fromSubscription(key, region)

  // 設定辨識語言
  speechConfig.speechRecognitionLanguage = language

  // 設定輸出格式（詳細結果，包含信心分數）
  speechConfig.outputFormat = sdk.OutputFormat.Detailed

  return speechConfig
}

/**
 * 從音訊 Buffer 辨識語音
 *
 * @param audioBuffer - 音訊資料（WAV 格式，16kHz, 16-bit, Mono）
 * @param language - 辨識語言
 * @returns 辨識結果
 */
export async function recognizeSpeechFromBuffer(
  audioBuffer: ArrayBuffer,
  language: SupportedLanguage
): Promise<STTData> {
  const speechConfig = createSpeechConfig(language)

  // 建立音訊配置（從 Buffer）
  const audioFormat = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1)
  const pushStream = sdk.AudioInputStream.createPushStream(audioFormat)

  // 推送音訊資料
  pushStream.write(audioBuffer)
  pushStream.close()

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

  // 建立語音辨識器
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

  return new Promise((resolve, reject) => {
    // 辨識完成事件
    recognizer.recognizeOnceAsync(
      (result) => {
        recognizer.close()

        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          // 辨識成功
          // 嘗試從詳細結果中提取信心分數
          let confidence = 0.9 // 預設信心分數

          try {
            // 使用 properties 來取得詳細結果（Azure SDK 的標準方式）
            const detailsJson = result.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult
            )
            if (detailsJson) {
              const details = JSON.parse(detailsJson)
              const nBest = details?.NBest?.[0]
              if (nBest?.Confidence !== undefined) {
                confidence = nBest.Confidence
              }
            }
          } catch {
            // 如果無法解析詳細結果，使用預設值
          }

          // 計算音訊時長（從 offset 和 duration）
          const durationInSeconds = result.duration / 10000000 // 轉換為秒

          resolve({
            text: result.text,
            confidence,
            language,
            duration: durationInSeconds,
          })
        } else if (result.reason === sdk.ResultReason.NoMatch) {
          // 無法辨識語音
          const noMatchDetail = sdk.NoMatchDetails.fromResult(result)
          reject(
            new Error(
              `無法辨識語音內容。原因: ${sdk.NoMatchReason[noMatchDetail.reason]}`
            )
          )
        } else if (result.reason === sdk.ResultReason.Canceled) {
          // 辨識被取消
          const cancellation = sdk.CancellationDetails.fromResult(result)

          if (cancellation.reason === sdk.CancellationReason.Error) {
            reject(
              new Error(
                `語音辨識錯誤: ${cancellation.errorDetails} (錯誤代碼: ${cancellation.ErrorCode})`
              )
            )
          } else {
            reject(new Error(`語音辨識被取消: ${cancellation.reason}`))
          }
        } else {
          reject(new Error(`未預期的辨識結果: ${sdk.ResultReason[result.reason]}`))
        }
      },
      (error) => {
        recognizer.close()
        reject(new Error(`語音辨識失敗: ${error}`))
      }
    )
  })
}

/**
 * 測試 Azure Speech Services 連線
 *
 * @returns 連線是否成功
 */
export async function testSpeechConnection(): Promise<boolean> {
  try {
    validateSpeechConfig()
    return true
  } catch {
    return false
  }
}
