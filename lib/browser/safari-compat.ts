/**
 * Safari 瀏覽器相容性檢測與優化工具
 * @module lib/browser/safari-compat
 * @description 針對 Safari (macOS + iOS) 提供 Web API 相容性檢測與 Fallback 機制
 */

/**
 * Safari 相容性檢測結果
 */
export interface SafariCompatibility {
  /** 是否為 Safari 瀏覽器 */
  isSafari: boolean
  /** 是否為 iOS Safari */
  isIOS: boolean
  /** 是否支援 Web Speech API */
  supportsSpeechRecognition: boolean
  /** 是否支援 MediaRecorder */
  supportsMediaRecorder: boolean
  /** 是否支援 Web Audio API */
  supportsWebAudio: boolean
  /** 是否支援 WebGL */
  supportsWebGL: boolean
  /** Safari 版本號 (如果是 Safari) */
  safariVersion: number | null
  /** iOS 版本號 (如果是 iOS) */
  iosVersion: number | null
}

/**
 * 檢測是否為 Safari 瀏覽器
 * @returns 是否為 Safari
 */
export function isSafari(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent
  const isSafariBrowser =
    /^((?!chrome|android).)*safari/i.test(ua) || /iPhone|iPad|iPod/.test(ua)

  return isSafariBrowser
}

/**
 * 檢測是否為 iOS 裝置
 * @returns 是否為 iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua)
}

/**
 * 取得 Safari 版本號
 * @returns Safari 版本號，如果不是 Safari 則返回 null
 */
export function getSafariVersion(): number | null {
  if (typeof window === 'undefined') return null

  const ua = window.navigator.userAgent
  const match = ua.match(/Version\/(\d+)/)

  return match ? parseInt(match[1], 10) : null
}

/**
 * 取得 iOS 版本號
 * @returns iOS 版本號，如果不是 iOS 則返回 null
 */
export function getIOSVersion(): number | null {
  if (typeof window === 'undefined') return null

  const ua = window.navigator.userAgent
  const match = ua.match(/OS (\d+)_/)

  return match ? parseInt(match[1], 10) : null
}

/**
 * 檢測 Web Speech API 支援度
 * @returns 是否支援 Web Speech API
 */
export function supportsSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false

  // Safari 14.1+ 在 macOS Big Sur 和 iOS 14.5+ 開始支援 Web Speech API
  // 但支援度不完整，需要特殊處理
  const hasSpeechRecognition =
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in (window as any)

  return hasSpeechRecognition
}

/**
 * 檢測 MediaRecorder API 支援度
 * @returns 是否支援 MediaRecorder
 */
export function supportsMediaRecorder(): boolean {
  if (typeof window === 'undefined') return false

  // Safari 14.1+ 開始支援 MediaRecorder，但有限制
  return 'MediaRecorder' in window && typeof MediaRecorder !== 'undefined'
}

/**
 * 檢測 Web Audio API 支援度
 * @returns 是否支援 Web Audio API
 */
export function supportsWebAudio(): boolean {
  if (typeof window === 'undefined') return false

  return (
    'AudioContext' in window ||
    'webkitAudioContext' in (window as any)
  )
}

/**
 * 檢測 WebGL 支援度
 * @returns 是否支援 WebGL
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl !== null
  } catch {
    return false
  }
}

/**
 * 取得完整的 Safari 相容性資訊
 * @returns Safari 相容性檢測結果
 */
export function getSafariCompatibility(): SafariCompatibility {
  return {
    isSafari: isSafari(),
    isIOS: isIOS(),
    supportsSpeechRecognition: supportsSpeechRecognition(),
    supportsMediaRecorder: supportsMediaRecorder(),
    supportsWebAudio: supportsWebAudio(),
    supportsWebGL: supportsWebGL(),
    safariVersion: getSafariVersion(),
    iosVersion: getIOSVersion(),
  }
}

/**
 * 記錄 Safari 相容性資訊到 console
 */
export function logSafariCompatibility(): void {
  const compat = getSafariCompatibility()

  console.group('🧭 Safari Compatibility Check')
  console.log('Browser:', compat.isSafari ? '✅ Safari' : '❌ Not Safari')
  console.log('Platform:', compat.isIOS ? '📱 iOS' : '🖥️ Desktop/Other')

  if (compat.safariVersion) {
    console.log('Safari Version:', compat.safariVersion)
  }

  if (compat.iosVersion) {
    console.log('iOS Version:', compat.iosVersion)
  }

  console.log(
    'Web Speech API:',
    compat.supportsSpeechRecognition ? '✅ Supported' : '❌ Not Supported'
  )
  console.log(
    'MediaRecorder:',
    compat.supportsMediaRecorder ? '✅ Supported' : '❌ Not Supported'
  )
  console.log(
    'Web Audio API:',
    compat.supportsWebAudio ? '✅ Supported' : '❌ Not Supported'
  )
  console.log(
    'WebGL:',
    compat.supportsWebGL ? '✅ Supported' : '❌ Not Supported'
  )
  console.groupEnd()
}

/**
 * 檢查是否需要 Safari 特殊處理
 * @returns 是否需要特殊處理
 */
export function needsSafariOptimizations(): boolean {
  const compat = getSafariCompatibility()

  // 如果是 Safari 且版本 < 15，或是 iOS < 15，則需要特殊處理
  return (
    compat.isSafari &&
    ((compat.safariVersion !== null && compat.safariVersion < 15) ||
      (compat.iosVersion !== null && compat.iosVersion < 15))
  )
}

/**
 * 建立使用者友善的瀏覽器不支援提示訊息
 * @param feature 不支援的功能名稱
 * @returns 錯誤訊息
 */
export function getBrowserUnsupportedMessage(feature: string): string {
  const compat = getSafariCompatibility()

  if (compat.isIOS) {
    return `您的 iOS 版本 (${compat.iosVersion || '未知'}) 不支援 ${feature} 功能。建議升級至 iOS 15 或更新版本。`
  }

  if (compat.isSafari) {
    return `您的 Safari 版本 (${compat.safariVersion || '未知'}) 不支援 ${feature} 功能。建議升級至 Safari 15 或更新版本，或使用 Chrome/Edge 瀏覽器。`
  }

  return `您的瀏覽器不支援 ${feature} 功能。建議使用 Chrome、Edge 或最新版 Safari。`
}
