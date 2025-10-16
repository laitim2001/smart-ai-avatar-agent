/**
 * NextAuth.js API Route Handler
 *
 * 處理所有 NextAuth.js 相關的 API 請求
 * Routes: /api/auth/*
 */

import { handlers } from '@/lib/auth/config'

export const { GET, POST } = handlers
