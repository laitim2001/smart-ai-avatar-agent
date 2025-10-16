/**
 * Device Detection and Performance Tier System
 * 裝置偵測與效能分級系統
 *
 * 根據裝置的硬體特性自動偵測效能等級，
 * 用於動態調整 3D 渲染品質與優化使用者體驗
 */

/**
 * 效能分級
 */
export type PerformanceTier = 'low' | 'medium' | 'high'

/**
 * 效能配置介面
 */
export interface PerformanceConfig {
  /** 效能分級 */
  tier: PerformanceTier
  /** 是否啟用陰影 */
  shadows: boolean
  /** 陰影貼圖解析度 */
  shadowMapSize: number
  /** 是否啟用抗鋸齒 */
  antialias: boolean
  /** 像素密度 (Device Pixel Ratio) */
  pixelRatio: number
  /** 最大光源數量 */
  maxLights: number
  /** 是否啟用環境光遮蔽 (AO) */
  ambientOcclusion: boolean
}

/**
 * 裝置資訊介面
 */
export interface DeviceInfo {
  /** 裝置記憶體 (GB) */
  memory: number
  /** CPU 核心數 */
  cores: number
  /** GPU 供應商 */
  gpuVendor: string
  /** GPU 渲染器 */
  gpuRenderer: string
  /** 是否為行動裝置 */
  isMobile: boolean
  /** 是否為觸控裝置 */
  isTouch: boolean
  /** 螢幕像素密度 */
  devicePixelRatio: number
  /** 使用者代理字串 */
  userAgent: string
}

/**
 * 低階裝置效能配置
 * 適用於: 舊款手機, 低階筆電
 */
const LOW_END_CONFIG: PerformanceConfig = {
  tier: 'low',
  shadows: false,                  // 關閉陰影
  shadowMapSize: 256,               // 最小陰影解析度
  antialias: false,                 // 關閉抗鋸齒
  pixelRatio: 1,                    // 固定 1x 解析度
  maxLights: 2,                     // 最多 2 個光源
  ambientOcclusion: false,          // 關閉 AO
}

/**
 * 中階裝置效能配置
 * 適用於: 標準手機, 一般筆電
 */
const MEDIUM_CONFIG: PerformanceConfig = {
  tier: 'medium',
  shadows: true,                    // 啟用陰影
  shadowMapSize: 512,               // 中等陰影解析度
  antialias: false,                 // 關閉抗鋸齒 (省效能)
  pixelRatio: 1.5,                  // 最高 1.5x 解析度
  maxLights: 3,                     // 最多 3 個光源
  ambientOcclusion: false,          // 關閉 AO
}

/**
 * 高階裝置效能配置
 * 適用於: 旗艦手機, 高效能桌機
 */
const HIGH_END_CONFIG: PerformanceConfig = {
  tier: 'high',
  shadows: true,                    // 啟用陰影
  shadowMapSize: 1024,              // 高解析度陰影
  antialias: true,                  // 啟用抗鋸齒
  pixelRatio: 2,                    // 最高 2x 解析度 (Retina)
  maxLights: 4,                     // 最多 4 個光源
  ambientOcclusion: true,           // 啟用 AO
}

/**
 * 偵測裝置資訊
 *
 * @returns 裝置資訊物件
 *
 * @example
 * ```ts
 * const device = detectDeviceInfo()
 * console.log(`Memory: ${device.memory}GB, Cores: ${device.cores}`)
 * ```
 */
export function detectDeviceInfo(): DeviceInfo {
  // SSR 環境返回預設值
  if (typeof window === 'undefined') {
    return {
      memory: 4,
      cores: 4,
      gpuVendor: 'unknown',
      gpuRenderer: 'unknown',
      isMobile: false,
      isTouch: false,
      devicePixelRatio: 1,
      userAgent: '',
    }
  }

  // 偵測記憶體 (Device Memory API)
  // 注意：僅 Chrome/Edge 支援
  const memory = (navigator as any).deviceMemory || 4

  // 偵測 CPU 核心數 (Hardware Concurrency API)
  const cores = navigator.hardwareConcurrency || 4

  // 偵測 GPU 資訊 (WebGL Debug Renderer Info)
  let gpuVendor = 'unknown'
  let gpuRenderer = 'unknown'

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (gl && 'getParameter' in gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const webglContext = gl as WebGLRenderingContext
        gpuVendor =
          webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown'
        gpuRenderer =
          webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown'
      }
    }
  } catch (e) {
    console.warn('[Device Detection] Failed to detect GPU info:', e)
  }

  // 偵測行動裝置
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)

  // 偵測觸控裝置
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0

  // 螢幕像素密度
  const devicePixelRatio = window.devicePixelRatio || 1

  // 使用者代理字串
  const userAgent = navigator.userAgent

  return {
    memory,
    cores,
    gpuVendor,
    gpuRenderer,
    isMobile,
    isTouch,
    devicePixelRatio,
    userAgent,
  }
}

/**
 * 根據裝置資訊計算效能分級
 *
 * @param device - 裝置資訊 (可選，未提供時自動偵測)
 * @returns 效能分級 (low/medium/high)
 *
 * **分級邏輯**:
 * - **Low**: Memory < 4GB OR Cores < 4 OR 低階 GPU
 * - **Medium**: 4GB ≤ Memory < 8GB AND 4 ≤ Cores < 8
 * - **High**: Memory ≥ 8GB AND Cores ≥ 8 AND 高階 GPU
 *
 * @example
 * ```ts
 * const tier = calculatePerformanceTier()
 * console.log(`Performance tier: ${tier}`) // 'low' | 'medium' | 'high'
 * ```
 */
export function calculatePerformanceTier(
  device?: DeviceInfo
): PerformanceTier {
  const info = device || detectDeviceInfo()

  // 低階 GPU 判斷 (簡化版，實際可擴展更多規則)
  const isLowEndGPU =
    info.gpuRenderer.toLowerCase().includes('swiftshader') || // 軟體渲染
    info.gpuRenderer.toLowerCase().includes('llvmpipe') || // Mesa 軟體渲染
    info.gpuRenderer.toLowerCase().includes('intel hd 3000') || // 老舊 Intel 集顯
    info.gpuRenderer.toLowerCase().includes('intel hd 4000')

  // 高階 GPU 判斷
  const isHighEndGPU =
    info.gpuRenderer.toLowerCase().includes('nvidia') ||
    info.gpuRenderer.toLowerCase().includes('radeon') ||
    info.gpuRenderer.toLowerCase().includes('geforce') ||
    info.gpuRenderer.toLowerCase().includes('apple m1') ||
    info.gpuRenderer.toLowerCase().includes('apple m2') ||
    info.gpuRenderer.toLowerCase().includes('apple m3')

  // 分級邏輯
  if (info.memory < 4 || info.cores < 4 || isLowEndGPU) {
    return 'low'
  }

  if (
    info.memory >= 8 &&
    info.cores >= 8 &&
    (isHighEndGPU || !info.isMobile)
  ) {
    return 'high'
  }

  return 'medium'
}

/**
 * 獲取效能配置
 *
 * @param tier - 效能分級 (可選，未提供時自動偵測)
 * @param customPixelRatio - 自訂像素密度 (可選)
 * @returns 效能配置物件
 *
 * @example
 * ```ts
 * const config = getPerformanceConfig()
 * console.log(`Shadows: ${config.shadows}, Antialias: ${config.antialias}`)
 * ```
 */
export function getPerformanceConfig(
  tier?: PerformanceTier,
  customPixelRatio?: number
): PerformanceConfig {
  const performanceTier = tier || calculatePerformanceTier()

  let config: PerformanceConfig

  switch (performanceTier) {
    case 'low':
      config = { ...LOW_END_CONFIG }
      break
    case 'high':
      config = { ...HIGH_END_CONFIG }
      break
    case 'medium':
    default:
      config = { ...MEDIUM_CONFIG }
  }

  // 自訂像素密度
  if (customPixelRatio !== undefined) {
    config.pixelRatio = customPixelRatio
  } else if (typeof window !== 'undefined') {
    // 限制最大像素密度 (避免過度消耗)
    const maxPixelRatio = config.tier === 'high' ? 2 : 1.5
    config.pixelRatio = Math.min(window.devicePixelRatio, maxPixelRatio)
  }

  return config
}

/**
 * 偵測是否為低效能裝置
 *
 * @returns true 如果是低效能裝置
 *
 * @example
 * ```ts
 * if (isLowPerformanceDevice()) {
 *   // 使用 2D Avatar 替代方案
 * }
 * ```
 */
export function isLowPerformanceDevice(): boolean {
  return calculatePerformanceTier() === 'low'
}

/**
 * 偵測是否為高效能裝置
 *
 * @returns true 如果是高效能裝置
 *
 * @example
 * ```ts
 * if (isHighPerformanceDevice()) {
 *   // 啟用進階視覺效果
 * }
 * ```
 */
export function isHighPerformanceDevice(): boolean {
  return calculatePerformanceTier() === 'high'
}

/**
 * 格式化裝置資訊為易讀字串 (用於除錯)
 *
 * @param device - 裝置資訊 (可選)
 * @returns 格式化後的裝置資訊字串
 *
 * @example
 * ```ts
 * console.log(formatDeviceInfo())
 * // Output:
 * // Device Info:
 * //   Memory: 8GB
 * //   Cores: 8
 * //   GPU: NVIDIA GeForce RTX 3080
 * //   ...
 * ```
 */
export function formatDeviceInfo(device?: DeviceInfo): string {
  const info = device || detectDeviceInfo()
  const tier = calculatePerformanceTier(info)

  return `
Device Info:
  Memory: ${info.memory}GB
  Cores: ${info.cores}
  GPU: ${info.gpuVendor} ${info.gpuRenderer}
  Mobile: ${info.isMobile ? 'Yes' : 'No'}
  Touch: ${info.isTouch ? 'Yes' : 'No'}
  DPR: ${info.devicePixelRatio}x
  Performance Tier: ${tier.toUpperCase()}
  `.trim()
}

/**
 * 記錄裝置資訊到 console (除錯用)
 *
 * @example
 * ```ts
 * logDeviceInfo()
 * ```
 */
export function logDeviceInfo(): void {
  if (typeof window === 'undefined') return

  console.group('🔍 Device Detection')
  console.log(formatDeviceInfo())
  console.log('Performance Config:', getPerformanceConfig())
  console.groupEnd()
}
