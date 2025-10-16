/**
 * Password Hashing Utilities
 *
 * 使用 bcryptjs 進行密碼雜湊與驗證
 */

import bcrypt from 'bcryptjs'

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // 較高的安全性等級
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Password strength validation
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('密碼長度至少需要 8 個字元')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('密碼需包含至少一個大寫字母')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('密碼需包含至少一個小寫字母')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('密碼需包含至少一個數字')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
