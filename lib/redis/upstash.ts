/**
 * Upstash Redis Client Configuration
 *
 * 用於 Rate Limiting 和快取功能
 */

import { Redis } from '@upstash/redis'

// 檢查必要的環境變數
if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined')
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined')
}

/**
 * Upstash Redis 客戶端實例
 * 使用 REST API 方式連接，適合 Edge Runtime
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

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
