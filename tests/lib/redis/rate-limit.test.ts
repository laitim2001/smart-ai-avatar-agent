/**
 * Rate Limit Utilities Unit Tests
 *
 * 測試 Rate Limiting 功能
 */

import { describe, it, expect } from 'vitest'
import { getClientIp, RATE_LIMIT_CONFIGS } from '@/lib/redis/rate-limit'

describe('Rate Limit Utilities', () => {
  describe('getClientIp', () => {
    it('應該從 x-forwarded-for header 提取 IP', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('應該從 x-real-ip header 提取 IP', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.2')
    })

    it('x-forwarded-for 應該優先於 x-real-ip', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('沒有 IP headers 時應該返回 unknown', () => {
      const request = new Request('http://localhost:3000')
      const ip = getClientIp(request)
      expect(ip).toBe('unknown')
    })

    it('應該正確處理帶空格的 x-forwarded-for', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  , 10.0.0.1',
        },
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })
  })

  describe('RATE_LIMIT_CONFIGS', () => {
    it('AUTH 配置應該是 5 次 / 15 分鐘', () => {
      expect(RATE_LIMIT_CONFIGS.AUTH.max).toBe(5)
      expect(RATE_LIMIT_CONFIGS.AUTH.window).toBe(15 * 60)
    })

    it('API 配置應該是 100 次 / 1 分鐘', () => {
      expect(RATE_LIMIT_CONFIGS.API.max).toBe(100)
      expect(RATE_LIMIT_CONFIGS.API.window).toBe(60)
    })

    it('EMAIL 配置應該是 3 次 / 1 小時', () => {
      expect(RATE_LIMIT_CONFIGS.EMAIL.max).toBe(3)
      expect(RATE_LIMIT_CONFIGS.EMAIL.window).toBe(60 * 60)
    })
  })

  // Note: rateLimit() 函數需要 Redis 連接
  // 應該在整合測試中測試或使用 mock Redis client
})
