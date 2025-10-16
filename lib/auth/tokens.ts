/**
 * Email Verification Token Utilities
 *
 * 產生和驗證 Email 驗證 token
 */

import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db/prisma'

/**
 * Generate a random verification token
 * @returns Random token string
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create and store a verification token for an email
 * @param email - User email
 * @returns Verification token
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = generateVerificationToken()

  // Token expires in 24 hours
  const expires = new Date()
  expires.setHours(expires.getHours() + 24)

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  })

  // Create new token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  })

  return token
}

/**
 * Verify a token for an email
 * @param email - User email
 * @param token - Verification token
 * @returns True if token is valid, false otherwise
 */
export async function verifyToken(
  email: string,
  token: string
): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: {
        identifier: email,
        token,
      },
    },
  })

  if (!verificationToken) {
    return false
  }

  // Check if token is expired
  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
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
  await prisma.verificationToken.delete({
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
 * Send verification email (Mock implementation for local dev)
 * @param email - User email
 * @param token - Verification token
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  // Mock email sending - log to console in development
  if (process.env.EMAIL_PROVIDER === 'console') {
    console.log('\n========================================')
    console.log('📧 Email 驗證信 (開發模式)')
    console.log('========================================')
    console.log(`收件者: ${email}`)
    console.log(`驗證連結: ${verificationUrl}`)
    console.log('========================================\n')
  } else {
    // TODO: Implement real email sending with Resend in production
    throw new Error('Email provider not configured')
  }
}
