/**
 * Rate Limiting Utilities
 *
 * 基於 Upstash Redis 的流量限制功能
 * 使用滑動視窗演算法（Sliding Window）
 */

import { redis, REDIS_KEYS } from './upstash'

export interface RateLimitConfig {
  /**
   * 時間視窗（秒）
   */
  window: number

  /**
   * 視窗內允許的最大請求數
   */
  max: number
}

export interface RateLimitResult {
  /**
   * 是否允許請求
   */
  success: boolean

  /**
   * 剩餘請求數
   */
  remaining: number

  /**
   * 總限制數
   */
  limit: number

  /**
   * 重置時間（Unix timestamp，秒）
   */
  reset: number

  /**
   * 是否被限制（超過限額）
   */
  limited: boolean
}

/**
 * 預設的 Rate Limit 配置
 */
export const RATE_LIMIT_CONFIGS = {
  /**
   * 認證相關 API（登入、註冊）
   * 5 次請求 / 15 分鐘
   */
  AUTH: {
    window: 15 * 60, // 15 分鐘
    max: 5,
  },

  /**
   * 一般 API
   * 100 次請求 / 分鐘
   */
  API: {
    window: 60, // 1 分鐘
    max: 100,
  },

  /**
   * Email 發送
   * 3 次請求 / 小時
   */
  EMAIL: {
    window: 60 * 60, // 1 小時
    max: 3,
  },
} as const

/**
 * Rate Limiting 檢查（滑動視窗演算法）
 *
 * @param identifier 識別符（通常是 IP 或使用者 ID）
 * @param config Rate Limit 配置
 * @returns Rate Limit 結果
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = REDIS_KEYS.RATE_LIMIT(identifier)
  const now = Math.floor(Date.now() / 1000) // 當前時間（秒）
  const windowStart = now - config.window

  try {
    // 使用 Redis Pipeline 執行多個命令
    const pipeline = redis.pipeline()

    // 1. 移除過期的請求記錄
    pipeline.zremrangebyscore(key, 0, windowStart)

    // 2. 計算當前視窗內的請求數
    pipeline.zcard(key)

    // 3. 添加當前請求
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })

    // 4. 設定 key 過期時間（視窗大小 + 緩衝）
    pipeline.expire(key, config.window + 10)

    const results = await pipeline.exec()

    // results[1] 是 zcard 的結果（當前請求數，不含本次）
    const currentCount = (results[1] as number) || 0
    const remaining = Math.max(0, config.max - currentCount - 1)
    const reset = now + config.window

    const result: RateLimitResult = {
      success: currentCount < config.max,
      remaining,
      limit: config.max,
      reset,
      limited: currentCount >= config.max,
    }

    return result
  } catch (error) {
    console.error('[Rate Limit Error]', error)

    // 發生錯誤時，允許請求通過（Fail Open）
    return {
      success: true,
      remaining: config.max,
      limit: config.max,
      reset: now + config.window,
      limited: false,
    }
  }
}

/**
 * 獲取客戶端 IP 位址
 */
export function getClientIp(request: Request): string {
  // 嘗試從不同的 headers 獲取真實 IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback
  return 'unknown'
}

/**
 * 產生 Rate Limit 錯誤回應
 */
export function createRateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({
      error: '請求過於頻繁，請稍後再試',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.reset - Math.floor(Date.now() / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString(),
      },
    }
  )
}
