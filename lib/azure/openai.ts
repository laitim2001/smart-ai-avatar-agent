/**
 * ================================================================
 * Azure OpenAI 客戶端封裝 (lib/azure/openai.ts)
 * ================================================================
 *
 * 提供 Azure OpenAI Service 的統一客戶端初始化功能
 *
 * 功能：
 * - 工廠函數模式：getOpenAIClient() 獲取客戶端實例
 * - 環境變數驗證：啟動時檢查必要配置
 * - 錯誤處理：提供友好的錯誤訊息
 *
 * 使用範例：
 * ```typescript
 * import { getOpenAIClient, DEPLOYMENT_NAME } from '@/lib/azure/openai'
 *
 * const client = getOpenAIClient()
 * const response = await client.getChatCompletions(
 *   DEPLOYMENT_NAME,
 *   messages
 * )
 * ```
 */

import { AzureOpenAI } from 'openai'

/**
 * Azure OpenAI 部署名稱
 * 預設：gpt-4-turbo
 * 可透過環境變數 AZURE_OPENAI_DEPLOYMENT 覆寫
 */
export const DEPLOYMENT_NAME =
  process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-turbo'

/**
 * Azure OpenAI API 版本
 * 預設：2024-02-01
 * 可透過環境變數 AZURE_OPENAI_API_VERSION 覆寫
 */
export const API_VERSION =
  process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'

/**
 * 獲取 Azure OpenAI 客戶端實例
 *
 * @returns {AzureOpenAI} Azure OpenAI 客戶端
 * @throws {Error} 當環境變數未配置時拋出錯誤
 *
 * 環境變數要求：
 * - AZURE_OPENAI_ENDPOINT: Azure OpenAI 服務端點 URL
 * - AZURE_OPENAI_API_KEY: Azure OpenAI API 金鑰
 *
 * 範例：
 * ```typescript
 * try {
 *   const client = getOpenAIClient()
 *   // 使用客戶端進行 API 調用
 * } catch (error) {
 *   console.error('Azure OpenAI 客戶端初始化失敗:', error.message)
 * }
 * ```
 */
export function getOpenAIClient(): AzureOpenAI {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY

  // 驗證必要的環境變數
  if (!endpoint || !apiKey) {
    const missing = []
    if (!endpoint) missing.push('AZURE_OPENAI_ENDPOINT')
    if (!apiKey) missing.push('AZURE_OPENAI_API_KEY')

    throw new Error(
      `Azure OpenAI 配置不完整。缺少環境變數：${missing.join(', ')}\n` +
        '請在 .env.local 檔案中設定這些變數。\n' +
        '參考 .env.local.example 檔案查看範例配置。'
    )
  }

  // 驗證端點格式
  try {
    new URL(endpoint)
  } catch {
    throw new Error(
      `Azure OpenAI 端點格式無效：${endpoint}\n` +
        '端點應為完整的 URL，例如：https://your-resource.openai.azure.com/'
    )
  }

  // 建立並返回客戶端實例
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion: API_VERSION,
    deployment: DEPLOYMENT_NAME,
  })
}

/**
 * 驗證 Azure OpenAI 配置是否完整
 *
 * @returns {boolean} 配置是否完整
 *
 * 用途：在應用啟動時檢查配置狀態
 * 可用於顯示配置提示或跳過 OpenAI 功能
 */
export function isConfigured(): boolean {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY
  )
}

/**
 * 獲取 Azure OpenAI 配置摘要（安全）
 *
 * @returns {object} 配置摘要（不包含敏感資訊）
 *
 * 用途：除錯和日誌記錄
 * 不會暴露完整的 API 金鑰或端點
 */
export function getConfigSummary() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY

  return {
    configured: isConfigured(),
    deployment: DEPLOYMENT_NAME,
    apiVersion: API_VERSION,
    endpoint: endpoint
      ? `${endpoint.substring(0, 30)}...`
      : '未設定',
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : '未設定',
  }
}
