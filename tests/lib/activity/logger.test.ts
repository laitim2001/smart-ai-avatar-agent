/**
 * Activity Logger Tests
 * 測試活動記錄工具函數
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ActivityAction } from '@/lib/activity/logger'

/**
 * Mock Prisma client for testing
 * 注意：這些測試主要驗證邏輯，不實際連接資料庫
 */
const mockPrismaActivityLog = {
  create: vi.fn(),
  findMany: vi.fn(),
  groupBy: vi.fn(),
  count: vi.fn(),
}

const mockPrisma = {
  activityLog: mockPrismaActivityLog,
}

// Mock @/lib/db/prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((name: string) => {
      // 模擬常見的 headers
      const mockHeaders: Record<string, string> = {
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
        'x-real-ip': '203.0.113.1',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
      return mockHeaders[name] || null
    }),
  })),
}))

describe('Activity Logger', () => {
  beforeEach(() => {
    // 清除所有 mock 的調用記錄
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('getIpAddress', () => {
    it('應該從 x-forwarded-for header 提取第一個 IP', async () => {
      const { getIpAddress } = await import('@/lib/activity/logger')
      const ip = await getIpAddress()

      expect(ip).toBe('203.0.113.1')
    })

    it('應該處理單一 IP 的 x-forwarded-for', async () => {
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn((name: string) => {
          if (name === 'x-forwarded-for') return '203.0.113.1'
          return null
        }),
      } as never)

      const { getIpAddress } = await import('@/lib/activity/logger')
      const ip = await getIpAddress()

      expect(ip).toBe('203.0.113.1')
    })

    it('應該 fallback 到 x-real-ip', async () => {
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn((name: string) => {
          if (name === 'x-real-ip') return '198.51.100.1'
          return null
        }),
      } as never)

      const { getIpAddress } = await import('@/lib/activity/logger')
      const ip = await getIpAddress()

      expect(ip).toBe('198.51.100.1')
    })

    it('應該 fallback 到 x-vercel-forwarded-for', async () => {
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn((name: string) => {
          if (name === 'x-vercel-forwarded-for') return '192.0.2.1'
          return null
        }),
      } as never)

      const { getIpAddress } = await import('@/lib/activity/logger')
      const ip = await getIpAddress()

      expect(ip).toBe('192.0.2.1')
    })

    it('應該在無 headers 時返回 undefined', async () => {
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn(() => null),
      } as never)

      const { getIpAddress } = await import('@/lib/activity/logger')
      const ip = await getIpAddress()

      expect(ip).toBeUndefined()
    })
  })

  describe('getUserAgent', () => {
    it('應該從 user-agent header 提取資訊', async () => {
      const { getUserAgent } = await import('@/lib/activity/logger')
      const userAgent = await getUserAgent()

      expect(userAgent).toBe(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      )
    })

    it('應該在無 user-agent 時返回 undefined', async () => {
      const { headers } = await import('next/headers')
      vi.mocked(headers).mockResolvedValueOnce({
        get: vi.fn(() => null),
      } as never)

      const { getUserAgent } = await import('@/lib/activity/logger')
      const userAgent = await getUserAgent()

      expect(userAgent).toBeUndefined()
    })
  })

  describe('logActivity', () => {
    it('應該成功記錄活動並返回 id 和 createdAt', async () => {
      const mockLog = {
        id: 'log_123',
        createdAt: new Date('2025-10-16T10:00:00Z'),
      }

      mockPrismaActivityLog.create.mockResolvedValueOnce(mockLog)

      const { logActivity } = await import('@/lib/activity/logger')
      const result = await logActivity({
        userId: 'user_123',
        action: 'login',
        metadata: { method: 'credentials' },
      })

      expect(result).toEqual(mockLog)
      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          action: 'login',
          metadata: { method: 'credentials' },
          ipAddress: '203.0.113.1',
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        select: {
          id: true,
          createdAt: true,
        },
      })
    })

    it('應該使用提供的 ipAddress 和 userAgent', async () => {
      const mockLog = {
        id: 'log_456',
        createdAt: new Date('2025-10-16T10:00:00Z'),
      }

      mockPrismaActivityLog.create.mockResolvedValueOnce(mockLog)

      const { logActivity } = await import('@/lib/activity/logger')
      await logActivity({
        userId: 'user_456',
        action: 'profile_update',
        ipAddress: '192.0.2.1',
        userAgent: 'CustomAgent/1.0',
      })

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_456',
          action: 'profile_update',
          metadata: undefined,
          ipAddress: '192.0.2.1',
          userAgent: 'CustomAgent/1.0',
        },
        select: {
          id: true,
          createdAt: true,
        },
      })
    })

    it('應該在發生錯誤時返回 null (fail-safe)', async () => {
      mockPrismaActivityLog.create.mockRejectedValueOnce(
        new Error('Database error')
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { logActivity } = await import('@/lib/activity/logger')
      const result = await logActivity({
        userId: 'user_789',
        action: 'logout',
      })

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Activity Logger Error]',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('應該支援所有定義的 action 類型', async () => {
      const actions: ActivityAction[] = [
        'login',
        'logout',
        'register',
        'profile_update',
        'avatar_change',
        'password_change',
        'email_verify',
        'password_reset_request',
        'password_reset_complete',
        'settings_update',
      ]

      mockPrismaActivityLog.create.mockResolvedValue({
        id: 'log_test',
        createdAt: new Date(),
      })

      const { logActivity } = await import('@/lib/activity/logger')

      for (const action of actions) {
        await logActivity({
          userId: 'user_test',
          action,
        })
      }

      expect(mockPrismaActivityLog.create).toHaveBeenCalledTimes(actions.length)
    })
  })

  describe('便捷函數', () => {
    beforeEach(() => {
      mockPrismaActivityLog.create.mockResolvedValue({
        id: 'log_convenience',
        createdAt: new Date(),
      })
    })

    it('logLogin 應該記錄登入活動', async () => {
      const { logLogin } = await import('@/lib/activity/logger')
      await logLogin('user_login', { method: 'oauth' })

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_login',
            action: 'login',
            metadata: { method: 'oauth' },
          }),
        })
      )
    })

    it('logLogout 應該記錄登出活動', async () => {
      const { logLogout } = await import('@/lib/activity/logger')
      await logLogout('user_logout')

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_logout',
            action: 'logout',
          }),
        })
      )
    })

    it('logProfileUpdate 應該記錄個人資料更新', async () => {
      const { logProfileUpdate } = await import('@/lib/activity/logger')
      await logProfileUpdate('user_profile', { field: 'name' })

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_profile',
            action: 'profile_update',
            metadata: { field: 'name' },
          }),
        })
      )
    })

    it('logAvatarChange 應該記錄 Avatar 變更', async () => {
      const { logAvatarChange } = await import('@/lib/activity/logger')
      await logAvatarChange('user_avatar', { avatarId: 'avatar_123' })

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_avatar',
            action: 'avatar_change',
            metadata: { avatarId: 'avatar_123' },
          }),
        })
      )
    })

    it('logPasswordChange 應該記錄密碼變更', async () => {
      const { logPasswordChange } = await import('@/lib/activity/logger')
      await logPasswordChange('user_password')

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_password',
            action: 'password_change',
          }),
        })
      )
    })

    it('logSettingsUpdate 應該記錄設定更新', async () => {
      const { logSettingsUpdate } = await import('@/lib/activity/logger')
      await logSettingsUpdate('user_settings', { setting: 'theme' })

      expect(mockPrismaActivityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_settings',
            action: 'settings_update',
            metadata: { setting: 'theme' },
          }),
        })
      )
    })
  })

  describe('getUserActivityLogs', () => {
    it('應該返回使用者的活動記錄（預設 limit 50）', async () => {
      const mockLogs = [
        {
          id: 'log_1',
          action: 'login',
          metadata: null,
          ipAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date('2025-10-16T10:00:00Z'),
        },
        {
          id: 'log_2',
          action: 'profile_update',
          metadata: { field: 'name' },
          ipAddress: '203.0.113.1',
          userAgent: 'Mozilla/5.0',
          createdAt: new Date('2025-10-16T09:00:00Z'),
        },
      ]

      mockPrismaActivityLog.findMany.mockResolvedValueOnce(mockLogs)

      const { getUserActivityLogs } = await import('@/lib/activity/logger')
      const result = await getUserActivityLogs('user_123')

      expect(result).toEqual(mockLogs)
      expect(mockPrismaActivityLog.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
        select: {
          id: true,
          action: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      })
    })

    it('應該支援自訂 limit 和 offset', async () => {
      mockPrismaActivityLog.findMany.mockResolvedValueOnce([])

      const { getUserActivityLogs } = await import('@/lib/activity/logger')
      await getUserActivityLogs('user_456', 10, 20)

      expect(mockPrismaActivityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user_456' },
          take: 10,
          skip: 20,
        })
      )
    })

    it('應該在發生錯誤時返回空陣列', async () => {
      mockPrismaActivityLog.findMany.mockRejectedValueOnce(
        new Error('Database error')
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { getUserActivityLogs } = await import('@/lib/activity/logger')
      const result = await getUserActivityLogs('user_error')

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Get Activity Logs Error]',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getUserActivityStats', () => {
    it('應該返回使用者的活動統計（預設 30 天）', async () => {
      const mockStats = [
        { action: 'login', _count: { action: 15 } },
        { action: 'profile_update', _count: { action: 3 } },
        { action: 'avatar_change', _count: { action: 2 } },
      ]

      mockPrismaActivityLog.groupBy.mockResolvedValueOnce(mockStats)

      const { getUserActivityStats } = await import('@/lib/activity/logger')
      const result = await getUserActivityStats('user_123')

      expect(result).toEqual({
        login: 15,
        profile_update: 3,
        avatar_change: 2,
      })
      expect(mockPrismaActivityLog.groupBy).toHaveBeenCalledWith({
        by: ['action'],
        where: {
          userId: 'user_123',
          createdAt: {
            gte: expect.any(Date),
          },
        },
        _count: {
          action: true,
        },
      })
    })

    it('應該支援自訂統計天數', async () => {
      mockPrismaActivityLog.groupBy.mockResolvedValueOnce([])

      const { getUserActivityStats } = await import('@/lib/activity/logger')
      await getUserActivityStats('user_456', 7)

      const call = mockPrismaActivityLog.groupBy.mock.calls[0][0]
      const createdAtGte = call.where.createdAt.gte as Date
      const daysDiff = Math.floor(
        (Date.now() - createdAtGte.getTime()) / (1000 * 60 * 60 * 24)
      )

      expect(daysDiff).toBeGreaterThanOrEqual(6)
      expect(daysDiff).toBeLessThanOrEqual(7)
    })

    it('應該在發生錯誤時返回空物件', async () => {
      mockPrismaActivityLog.groupBy.mockRejectedValueOnce(
        new Error('Database error')
      )

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { getUserActivityStats } = await import('@/lib/activity/logger')
      const result = await getUserActivityStats('user_error')

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Get Activity Stats Error]',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})
