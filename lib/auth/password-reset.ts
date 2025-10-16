/**
 * Password Reset Token Utilities
 *
 * 產生和驗證密碼重設 token
 */

import { prisma } from '@/lib/db/prisma'

/**
 * Generate a random password reset token
 * @returns Random token string
 */
export function generatePasswordResetToken(): string {
  // 使用 Web Crypto API (Edge Runtime 兼容)
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create and store a password reset token for an email
 * @param email - User email
 * @returns Password reset token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generatePasswordResetToken()

  // Token expires in 1 hour
  const expires = new Date()
  expires.setHours(expires.getHours() + 1)

  // Delete any existing password reset tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { identifier: email },
  })

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a password reset token for an email
 * @param email - User email
 * @param token - Password reset token
 * @returns True if token is valid, false otherwise
 */
export async function verifyPasswordResetToken(
  email: string,
  token: string
): Promise<boolean> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  if (!resetToken) {
    return false
  }

  // Check if token is expired
  if (resetToken.expires < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    })
    return false
  }

  // Delete used token
  await prisma.passwordResetToken.delete({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  return true
}

/**
 * Send password reset email (Mock implementation for local dev)
 * @param email - User email
 * @param token - Password reset token
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  // Mock email sending - log to console in development
  if (process.env.EMAIL_PROVIDER === 'console') {
    console.log('\n========================================')
    console.log('🔒 密碼重設信 (開發模式)')
    console.log('========================================')
    console.log(`收件者: ${email}`)
    console.log(`重設連結: ${resetUrl}`)
    console.log(`有效期限: 1 小時`)
    console.log('========================================\n')
  } else {
    // TODO: Implement real email sending with Resend in production
    throw new Error('Email provider not configured')
  }
}
