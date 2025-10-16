/**
 * Vitest Global Setup
 *
 * 為所有測試配置全域環境和 matchers
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 每次測試後清理 React 元件
afterEach(() => {
  cleanup()
})

// Mock 環境變數
process.env.NEXTAUTH_SECRET = 'test-secret-key'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5435/test'
process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
