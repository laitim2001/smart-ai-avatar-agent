/**
 * Azure Application Insights 監控初始化
 * @module lib/monitoring/appinsights
 * @description Sprint 10 Part B: Application Insights 整合
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web'

/**
 * Application Insights 實例（單例）
 */
let appInsights: ApplicationInsights | null = null

/**
 * 初始化 Application Insights
 * @returns Application Insights 實例
 */
export function initializeAppInsights(): ApplicationInsights | null {
  // SSR 環境不初始化
  if (typeof window === 'undefined') {
    return null
  }

  // 已初始化則直接返回
  if (appInsights) {
    return appInsights
  }

  // 取得 Connection String
  const connectionString =
    process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING

  // 如果未設定 Connection String，記錄警告但不中斷應用
  if (!connectionString) {
    console.warn(
      '[Application Insights] NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING not set, monitoring disabled'
    )
    return null
  }

  try {
    // 建立 Application Insights 實例
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        // 自動收集設定
        enableAutoRouteTracking: true, // 自動追蹤路由變更 (SPA)
        enableCorsCorrelation: true, // 啟用 CORS 關聯
        enableRequestHeaderTracking: true, // 追蹤請求標頭
        enableResponseHeaderTracking: true, // 追蹤回應標頭
        enableAjaxErrorStatusText: true, // 追蹤 AJAX 錯誤狀態
        enableUnhandledPromiseRejectionTracking: true, // 追蹤未處理的 Promise 拒絕
        // 取樣設定（Production 建議設定，降低成本）
        samplingPercentage: 100, // 100% 取樣（開發階段），Production 可調整為 10-50%
        // 效能設定
        disableFetchTracking: false, // 追蹤 Fetch API
        disableAjaxTracking: false, // 追蹤 AJAX
        disableExceptionTracking: false, // 追蹤例外
        disableTelemetry: false, // 啟用遙測
        // Cookie 設定
        isCookieUseDisabled: false, // 使用 Cookie 儲存 Session ID
        cookieDomain: undefined, // 自動偵測
        // 其他設定
        disableInstrumentationKeyValidation: false, // 驗證 Instrumentation Key
      },
    })

    // 載入 Application Insights
    appInsights.loadAppInsights()

    // 追蹤頁面瀏覽
    appInsights.trackPageView()

    console.log('[Application Insights] Initialized successfully')

    return appInsights
  } catch (error) {
    console.error('[Application Insights] Initialization failed:', error)
    return null
  }
}

/**
 * 取得 Application Insights 實例
 * @returns Application Insights 實例，如果未初始化則返回 null
 */
export function getAppInsights(): ApplicationInsights | null {
  return appInsights
}

/**
 * 追蹤自訂事件
 * @param name - 事件名稱
 * @param properties - 自訂屬性
 * @param measurements - 自訂度量
 */
export function trackEvent(
  name: string,
  properties?: Record<string, string>,
  measurements?: Record<string, number>
): void {
  if (!appInsights) {
    console.warn('[Application Insights] Not initialized, event not tracked:', name)
    return
  }

  try {
    appInsights.trackEvent({ name }, properties, measurements)
  } catch (error) {
    console.error('[Application Insights] Failed to track event:', error)
  }
}

/**
 * 追蹤自訂度量
 * @param name - 度量名稱
 * @param average - 平均值
 * @param properties - 自訂屬性
 */
export function trackMetric(
  name: string,
  average: number,
  properties?: Record<string, string>
): void {
  if (!appInsights) {
    console.warn('[Application Insights] Not initialized, metric not tracked:', name)
    return
  }

  try {
    appInsights.trackMetric({ name, average }, properties)
  } catch (error) {
    console.error('[Application Insights] Failed to track metric:', error)
  }
}

/**
 * 追蹤例外
 * @param exception - 例外物件
 * @param severityLevel - 嚴重程度 (0: Verbose, 1: Information, 2: Warning, 3: Error, 4: Critical)
 * @param properties - 自訂屬性
 */
export function trackException(
  exception: Error,
  severityLevel?: number,
  properties?: Record<string, string>
): void {
  if (!appInsights) {
    console.warn('[Application Insights] Not initialized, exception not tracked:', exception)
    return
  }

  try {
    appInsights.trackException(
      { exception, severityLevel: severityLevel ?? 3 },
      properties
    )
  } catch (error) {
    console.error('[Application Insights] Failed to track exception:', error)
  }
}

/**
 * 追蹤追蹤記錄
 * @param message - 訊息
 * @param severityLevel - 嚴重程度 (0: Verbose, 1: Information, 2: Warning, 3: Error, 4: Critical)
 * @param properties - 自訂屬性
 */
export function trackTrace(
  message: string,
  severityLevel?: number,
  properties?: Record<string, string>
): void {
  if (!appInsights) {
    return
  }

  try {
    appInsights.trackTrace(
      { message, severityLevel: severityLevel ?? 1 },
      properties
    )
  } catch (error) {
    console.error('[Application Insights] Failed to track trace:', error)
  }
}

/**
 * 設定使用者 ID
 * @param userId - 使用者 ID
 */
export function setUserId(userId: string): void {
  if (!appInsights) {
    return
  }

  try {
    appInsights.setAuthenticatedUserContext(userId)
  } catch (error) {
    console.error('[Application Insights] Failed to set user ID:', error)
  }
}

/**
 * 清除使用者 ID
 */
export function clearUserId(): void {
  if (!appInsights) {
    return
  }

  try {
    appInsights.clearAuthenticatedUserContext()
  } catch (error) {
    console.error('[Application Insights] Failed to clear user ID:', error)
  }
}

/**
 * 手動 Flush 遙測資料
 * @description 在關鍵操作完成後手動發送資料
 */
export function flush(): void {
  if (!appInsights) {
    return
  }

  try {
    appInsights.flush()
  } catch (error) {
    console.error('[Application Insights] Failed to flush:', error)
  }
}
