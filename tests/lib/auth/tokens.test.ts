/**
 * Token Utilities Unit Tests
 *
 * 測試 Email 驗證 token 功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generateVerificationToken } from '@/lib/auth/tokens'

describe('Token Utilities', () => {
  describe('generateVerificationToken', () => {
    it('應該產生 64 個字元的十六進位 token', () => {
      const token = generateVerificationToken()
      expect(token).toHaveLength(64)
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('每次產生的 token 應該不同', () => {
      const token1 = generateVerificationToken()
      const token2 = generateVerificationToken()
      const token3 = generateVerificationToken()

      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    it('應該產生加密安全的隨機 token', () => {
      const tokens = new Set()
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        tokens.add(generateVerificationToken())
      }

      // 100 次應該產生 100 個不同的 token
      expect(tokens.size).toBe(iterations)
    })
  })

  // Note: createVerificationToken, verifyToken, sendVerificationEmail
  // 需要資料庫連接，應該在整合測試中測試
  // 或使用 mock Prisma client
})
