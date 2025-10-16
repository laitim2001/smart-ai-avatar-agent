/**
 * Password Utilities Unit Tests
 *
 * 測試密碼相關功能：
 * - 密碼強度驗證
 * - 密碼雜湊與驗證
 */

import { describe, it, expect } from 'vitest'
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from '@/lib/auth/password'

describe('Password Utilities', () => {
  describe('validatePasswordStrength', () => {
    it('應該拒絕過短的密碼', () => {
      const result = validatePasswordStrength('Short1!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密碼長度至少需要 8 個字元')
    })

    it('應該拒絕沒有大寫字母的密碼', () => {
      const result = validatePasswordStrength('password123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密碼需包含至少一個大寫字母')
    })

    it('應該拒絕沒有小寫字母的密碼', () => {
      const result = validatePasswordStrength('PASSWORD123!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密碼需包含至少一個小寫字母')
    })

    it('應該拒絕沒有數字的密碼', () => {
      const result = validatePasswordStrength('Password!')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('密碼需包含至少一個數字')
    })

    it('應該接受符合所有規則的密碼', () => {
      const result = validatePasswordStrength('SecurePass123')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('應該接受包含多種字符組合的密碼', () => {
      const validPasswords = [
        'Password123',
        'MySecurePass456',
        'TestAccount789',
      ]

      validPasswords.forEach((password) => {
        const result = validatePasswordStrength(password)
        expect(result.isValid).toBe(true)
      })
    })
  })

  describe('hashPassword and verifyPassword', () => {
    it('應該能夠雜湊密碼並成功驗證', async () => {
      const password = 'SecurePass123!'
      const hashedPassword = await hashPassword(password)

      expect(hashedPassword).toBeTruthy()
      expect(hashedPassword).not.toBe(password)
      // bcryptjs uses $2a$ or $2b$ prefix
      expect(
        hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')
      ).toBe(true)

      const isValid = await verifyPassword(password, hashedPassword)
      expect(isValid).toBe(true)
    })

    it('應該拒絕錯誤的密碼', async () => {
      const correctPassword = 'SecurePass123!'
      const wrongPassword = 'WrongPass456!'
      const hashedPassword = await hashPassword(correctPassword)

      const isValid = await verifyPassword(wrongPassword, hashedPassword)
      expect(isValid).toBe(false)
    })

    it('相同密碼的雜湊應該不同（使用隨機 salt）', async () => {
      const password = 'SecurePass123!'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)

      // 但兩個雜湊都應該能驗證原始密碼
      expect(await verifyPassword(password, hash1)).toBe(true)
      expect(await verifyPassword(password, hash2)).toBe(true)
    })
  })
})
