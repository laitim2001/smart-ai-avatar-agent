/**
 * Upstash Redis Client Configuration
 *
 * 用於 Rate Limiting 和快取功能
 */

import { Redis } from '@upstash/redis'

/**
 * 檢查 Redis 是否可用
 */
export const isRedisAvailable =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

/**
 * Upstash Redis 客戶端實例
 * 使用 REST API 方式連接，適合 Edge Runtime
 * 在開發環境中如果未配置 Redis，會返回 null
 */
export const redis = isRedisAvailable
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

/**
 * Redis Key 命名空間
 */
export const REDIS_KEYS = {
  RATE_LIMIT: (identifier: string) => `rate_limit:${identifier}`,
  SESSION: (sessionId: string) => `session:${sessionId}`,
  CACHE: (key: string) => `cache:${key}`,
} as const

/**
 * 測試 Redis 連線
 */
export async function testRedisConnection() {
  if (!isRedisAvailable || !redis) {
    console.warn('[Redis] Not configured, skipping connection test')
    return false
  }

  try {
    const testKey = 'health_check'
    await redis.set(testKey, 'ok', { ex: 10 })
    const result = await redis.get(testKey)
    await redis.del(testKey)
    return result === 'ok'
  } catch (error) {
    console.error('[Redis Connection Test Failed]', error)
    return false
  }
}
