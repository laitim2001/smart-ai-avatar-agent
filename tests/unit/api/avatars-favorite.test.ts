/**
 * Avatar Favorite API Unit Tests
 * Sprint 5 Phase 4: 測試收藏 API routes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, DELETE } from '@/app/api/avatars/[id]/favorite/route'
import { GET as GetRecommended } from '@/app/api/avatars/recommended/route'
import { GET as GetUserFavorites } from '@/app/api/user/favorites/route'

// Mock auth
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}))

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    avatar: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userFavoriteAvatar: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

describe('Avatar Favorite API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/avatars/[id]/favorite', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'POST',
      })

      const response = await POST(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('Avatar 不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.avatar.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/avatars/invalid/favorite', {
        method: 'POST',
      })

      const response = await POST(request, { params: { id: 'invalid' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Avatar 不存在')
    })

    it('使用者不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.avatar.findUnique as any).mockResolvedValueOnce({
        id: 'alex',
        name: 'Alex',
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'POST',
      })

      const response = await POST(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('使用者不存在')
    })

    it('已收藏的 Avatar 應該返回 400', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.avatar.findUnique as any).mockResolvedValueOnce({
        id: 'alex',
        name: 'Alex',
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.userFavoriteAvatar.findUnique as any).mockResolvedValueOnce({
        id: 'fav1',
        userId: 'user1',
        avatarId: 'alex',
      })

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'POST',
      })

      const response = await POST(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('已經收藏')
    })

    it('成功新增收藏應該返回 200', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.avatar.findUnique as any).mockResolvedValueOnce({
        id: 'alex',
        name: 'Alex',
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.userFavoriteAvatar.findUnique as any).mockResolvedValueOnce(null)

      const mockFavorite = {
        id: 'fav1',
        userId: 'user1',
        avatarId: 'alex',
        createdAt: new Date(),
        avatar: {
          id: 'alex',
          name: 'Alex',
          thumbnail: '🧑',
        },
      }

      ;(prisma.userFavoriteAvatar.create as any).mockResolvedValueOnce(mockFavorite)

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'POST',
      })

      const response = await POST(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.favorite.avatarId).toBe('alex')
    })
  })

  describe('DELETE /api/avatars/[id]/favorite', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('未收藏的 Avatar 應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.userFavoriteAvatar.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('尚未收藏')
    })

    it('成功取消收藏應該返回 200', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.userFavoriteAvatar.findUnique as any).mockResolvedValueOnce({
        id: 'fav1',
        userId: 'user1',
        avatarId: 'alex',
      })

      ;(prisma.userFavoriteAvatar.delete as any).mockResolvedValueOnce({
        id: 'fav1',
      })

      const request = new NextRequest('http://localhost/api/avatars/alex/favorite', {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: 'alex' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('已取消收藏')
    })
  })

  describe('GET /api/avatars/recommended', () => {
    it('未登入使用者應該返回熱門 Avatar', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const mockAvatars = [
        { id: 'alex', name: 'Alex', featured: true, popularity: 100 },
        { id: 'jordan', name: 'Jordan', featured: true, popularity: 90 },
      ]

      ;(prisma.avatar.findMany as any).mockResolvedValueOnce(mockAvatars)

      const request = new NextRequest('http://localhost/api/avatars/recommended')

      const response = await GetRecommended(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.avatars).toHaveLength(2)
      expect(data.avatars[0].featured).toBe(true)
    })

    it('已登入但無收藏應該返回熱門 Avatar', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
        favoriteAvatars: [],
      })

      const mockAvatars = [
        { id: 'alex', name: 'Alex', featured: true, popularity: 100 },
      ]

      ;(prisma.avatar.findMany as any).mockResolvedValueOnce(mockAvatars)

      const request = new NextRequest('http://localhost/api/avatars/recommended')

      const response = await GetRecommended(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.avatars).toHaveLength(1)
    })

    it('已登入且有收藏應該返回個人化推薦', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        favoriteAvatars: [
          {
            avatarId: 'alex',
            avatar: {
              id: 'alex',
              category: 'male',
              tags: ['professional', 'casual'],
            },
          },
        ],
      }

      ;(prisma.user.findUnique as any).mockResolvedValueOnce(mockUser)

      const mockRecommendedAvatars = [
        { id: 'jordan', name: 'Jordan', category: 'male', tags: ['professional'] },
      ]

      ;(prisma.avatar.findMany as any).mockResolvedValueOnce(mockRecommendedAvatars)

      const request = new NextRequest('http://localhost/api/avatars/recommended')

      const response = await GetRecommended(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.avatars).toBeDefined()
    })
  })

  describe('GET /api/user/favorites', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/user/favorites')

      const response = await GetUserFavorites(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('使用者不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/user/favorites')

      const response = await GetUserFavorites(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('使用者不存在')
    })

    it('成功返回收藏列表', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      const mockUser = {
        id: 'user1',
        email: 'test@example.com',
        favoriteAvatars: [
          {
            id: 'fav1',
            avatarId: 'alex',
            createdAt: new Date(),
            avatar: {
              id: 'alex',
              name: 'Alex',
              description: 'Test avatar',
              url: 'https://example.com/alex.glb',
              thumbnail: '🧑',
              category: 'male',
              tags: ['professional'],
              featured: true,
              popularity: 100,
            },
          },
        ],
      }

      ;(prisma.user.findUnique as any).mockResolvedValueOnce(mockUser)

      const request = new NextRequest('http://localhost/api/user/favorites')

      const response = await GetUserFavorites(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.favorites).toHaveLength(1)
      expect(data.favorites[0].avatarId).toBe('alex')
      expect(data.count).toBe(1)
    })
  })
})
