/**
 * ================================================================
 * Azure Speech Services 客戶端封裝 (lib/azure/speech.ts)
 * ================================================================
 *
 * 提供 Azure Cognitive Services Speech SDK 的統一配置功能
 *
 * 功能：
 * - 語音合成 (TTS)：文字轉語音
 * - 語音識別 (STT)：語音轉文字
 * - 預設繁體中文語音：zh-TW-HsiaoChenNeural
 * - 環境變數驗證：啟動時檢查必要配置
 *
 * 使用範例：
 * ```typescript
 * import { getSpeechConfig, DEFAULT_VOICE } from '@/lib/azure/speech'
 *
 * // TTS 語音合成
 * const config = getSpeechConfig()
 * const synthesizer = new SpeechSynthesizer(config)
 * await synthesizer.speakTextAsync(text)
 *
 * // STT 語音識別
 * const recognizer = new SpeechRecognizer(config)
 * ```
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

/**
 * 預設語音：繁體中文（台灣）- 曉臻
 * 音質：Neural（神經網絡 TTS，高質量）
 * 特點：自然、流暢的女性聲音
 *
 * 其他可用的繁體中文語音：
 * - zh-TW-YunJheNeural（男性）
 * - zh-TW-HsiaoYuNeural（女性）
 */
export const DEFAULT_VOICE = 'zh-TW-HsiaoChenNeural'

/**
 * 預設語言：繁體中文（台灣）
 * 用於語音識別 (STT)
 */
export const DEFAULT_LANGUAGE = 'zh-TW'

/**
 * 語音輸出格式
 * 預設：Riff24Khz16BitMonoPcm（24kHz, 16-bit, 單聲道 PCM）
 * 適合網頁播放的高質量音頻格式
 */
export const DEFAULT_OUTPUT_FORMAT =
  sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm

/**
 * 獲取 Azure Speech SDK 配置
 *
 * @returns {sdk.SpeechConfig} Azure Speech 配置實例
 * @throws {Error} 當環境變數未配置時拋出錯誤
 *
 * 環境變數要求：
 * - AZURE_SPEECH_KEY: Azure Speech Services 訂閱金鑰
 * - AZURE_SPEECH_REGION: Azure Speech Services 區域（例如：eastasia）
 *
 * 範例：
 * ```typescript
 * try {
 *   const config = getSpeechConfig()
 *   config.speechSynthesisVoiceName = DEFAULT_VOICE
 *   // 使用配置創建語音合成器或識別器
 * } catch (error) {
 *   console.error('Azure Speech 配置失敗:', error.message)
 * }
 * ```
 */
export function getSpeechConfig(): sdk.SpeechConfig {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION

  // 驗證必要的環境變數
  if (!subscriptionKey || !region) {
    const missing = []
    if (!subscriptionKey) missing.push('AZURE_SPEECH_KEY')
    if (!region) missing.push('AZURE_SPEECH_REGION')

    throw new Error(
      `Azure Speech 配置不完整。缺少環境變數：${missing.join(', ')}\n` +
        '請在 .env.local 檔案中設定這些變數。\n' +
        '參考 .env.local.example 檔案查看範例配置。'
    )
  }

  // 建立 Speech SDK 配置
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    region
  )

  // 設定預設語音
  speechConfig.speechSynthesisVoiceName = DEFAULT_VOICE

  // 設定預設語言（用於 STT）
  speechConfig.speechRecognitionLanguage = DEFAULT_LANGUAGE

  // 設定輸出格式
  speechConfig.speechSynthesisOutputFormat = DEFAULT_OUTPUT_FORMAT

  return speechConfig
}

/**
 * 獲取 TTS（文字轉語音）配置
 *
 * @param voiceName - 語音名稱（可選，預設為 DEFAULT_VOICE）
 * @returns {sdk.SpeechConfig} 配置好的 Speech Config
 *
 * 範例：
 * ```typescript
 * // 使用預設語音
 * const config = getTTSConfig()
 *
 * // 使用自定義語音
 * const configMale = getTTSConfig('zh-TW-YunJheNeural')
 * ```
 */
export function getTTSConfig(voiceName?: string): sdk.SpeechConfig {
  const config = getSpeechConfig()

  if (voiceName) {
    config.speechSynthesisVoiceName = voiceName
  }

  return config
}

/**
 * 獲取 STT（語音轉文字）配置
 *
 * @param language - 語言代碼（可選，預設為 DEFAULT_LANGUAGE）
 * @returns {sdk.SpeechConfig} 配置好的 Speech Config
 *
 * 範例：
 * ```typescript
 * // 使用預設語言（繁體中文）
 * const config = getSTTConfig()
 *
 * // 使用其他語言
 * const configEN = getSTTConfig('en-US')
 * ```
 */
export function getSTTConfig(language?: string): sdk.SpeechConfig {
  const config = getSpeechConfig()

  if (language) {
    config.speechRecognitionLanguage = language
  }

  return config
}

/**
 * 驗證 Azure Speech 配置是否完整
 *
 * @returns {boolean} 配置是否完整
 *
 * 用途：在應用啟動時檢查配置狀態
 * 可用於顯示配置提示或跳過 Speech 功能
 */
export function isConfigured(): boolean {
  return !!(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION)
}

/**
 * 獲取 Azure Speech 配置摘要（安全）
 *
 * @returns {object} 配置摘要（不包含敏感資訊）
 *
 * 用途：除錯和日誌記錄
 * 不會暴露完整的訂閱金鑰
 */
export function getConfigSummary() {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION

  return {
    configured: isConfigured(),
    defaultVoice: DEFAULT_VOICE,
    defaultLanguage: DEFAULT_LANGUAGE,
    region: region || '未設定',
    subscriptionKey: subscriptionKey
      ? `${subscriptionKey.substring(0, 8)}...`
      : '未設定',
  }
}

/**
 * 可用的繁體中文語音列表
 * 用於動態語音選擇
 */
export const AVAILABLE_ZH_TW_VOICES = [
  {
    name: 'zh-TW-HsiaoChenNeural',
    gender: '女性',
    description: '曉臻 - 自然流暢的女性聲音',
  },
  {
    name: 'zh-TW-YunJheNeural',
    gender: '男性',
    description: '雲哲 - 專業穩重的男性聲音',
  },
  {
    name: 'zh-TW-HsiaoYuNeural',
    gender: '女性',
    description: '曉雨 - 溫和親切的女性聲音',
  },
] as const

/**
 * 語音類型定義
 */
export type VoiceName = (typeof AVAILABLE_ZH_TW_VOICES)[number]['name']
