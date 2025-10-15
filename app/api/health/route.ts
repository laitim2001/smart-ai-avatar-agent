/**
 * ================================================================
 * API 健康檢查端點 (app/api/health/route.ts)
 * ================================================================
 *
 * 提供 Azure 服務配置狀態的健康檢查 API
 *
 * 端點：GET /api/health
 *
 * 回應範例：
 * ```json
 * {
 *   "status": "ok",
 *   "timestamp": "2025-10-15T12:00:00.000Z",
 *   "services": {
 *     "openai": {
 *       "configured": true,
 *       "deployment": "gpt-4-turbo",
 *       "apiVersion": "2024-02-01"
 *     },
 *     "speech": {
 *       "configured": true,
 *       "defaultVoice": "zh-TW-HsiaoChenNeural",
 *       "region": "eastasia"
 *     }
 *   }
 * }
 * ```
 */

import { NextResponse } from 'next/server'
import { getConfigSummary as getOpenAIConfig } from '@/lib/azure/openai'
import { getConfigSummary as getSpeechConfig } from '@/lib/azure/speech'

export async function GET() {
  try {
    // 獲取配置摘要（安全，不暴露敏感資訊）
    const openaiConfig = getOpenAIConfig()
    const speechConfig = getSpeechConfig()

    // 判斷整體狀態
    const allConfigured = openaiConfig.configured && speechConfig.configured
    const status = allConfigured ? 'ok' : 'partial'

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        openai: {
          configured: openaiConfig.configured,
          deployment: openaiConfig.deployment,
          apiVersion: openaiConfig.apiVersion,
          endpoint: openaiConfig.endpoint,
        },
        speech: {
          configured: speechConfig.configured,
          defaultVoice: speechConfig.defaultVoice,
          defaultLanguage: speechConfig.defaultLanguage,
          region: speechConfig.region,
        },
      },
      message: allConfigured
        ? 'All Azure services are configured'
        : 'Some Azure services are not configured',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to check Azure services configuration',
      },
      { status: 500 }
    )
  }
}
