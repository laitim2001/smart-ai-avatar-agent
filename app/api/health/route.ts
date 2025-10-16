/**
 * ================================================================
 * API 健康檢查端點 (app/api/health/route.ts)
 * ================================================================
 *
 * 檢查 API 服務健康狀態
 *
 * @endpoint GET /api/health
 *
 * @returns 標準 API 回應格式，包含健康檢查資料
 *
 * @example 成功回應
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "status": "ok",
 *     "timestamp": "2025-10-15T12:00:00.000Z",
 *     "version": "1.0.0"
 *   },
 *   "timestamp": "2025-10-15T12:00:00.000Z"
 * }
 * ```
 *
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: 檢查 API 服務健康狀態
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */

import { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  handleError,
} from '@/lib/utils/error-handler'
import type { HealthCheckResponse } from '@/types/api'

/**
 * Health Check API
 * GET /api/health
 *
 * 檢查 API 服務健康狀態
 */
export async function GET(_request: NextRequest) {
  try {
    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }

    return createSuccessResponse(response)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Runtime Configuration
 * 使用 Edge Runtime 以獲得更快的冷啟動
 */
export const runtime = 'edge'
