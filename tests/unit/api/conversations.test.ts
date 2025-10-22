/**
 * Conversations API Unit Tests
 * Sprint 6 Phase 3: Test conversation CRUD operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import {
  POST as CreateConversation,
  GET as GetConversations,
} from '@/app/api/conversations/route'
import {
  GET as GetConversationDetail,
  PATCH as UpdateConversation,
  DELETE as DeleteConversation,
} from '@/app/api/conversations/[id]/route'
import { POST as AddMessage } from '@/app/api/conversations/[id]/messages/route'

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
    conversation: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

describe('Conversations API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/conversations', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })

      const response = await CreateConversation(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('使用者不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
      })

      const response = await CreateConversation(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('使用者不存在')
    })

    it('成功建立對話應該返回 200', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      const mockConversation = {
        id: 'conv1',
        userId: 'user1',
        title: 'Test Conversation',
        avatarId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      ;(prisma.conversation.create as any).mockResolvedValueOnce(mockConversation)

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Conversation' }),
      })

      const response = await CreateConversation(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.conversation.id).toBe('conv1')
      expect(data.conversation.title).toBe('Test Conversation')
    })

    it('使用預設標題建立對話', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      const mockConversation = {
        id: 'conv1',
        userId: 'user1',
        title: '新對話',
        avatarId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      ;(prisma.conversation.create as any).mockResolvedValueOnce(mockConversation)

      const request = new NextRequest('http://localhost/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await CreateConversation(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.conversation.title).toBe('新對話')
    })
  })

  describe('GET /api/conversations', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations')

      const response = await GetConversations(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('成功返回對話列表', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      const mockConversations = [
        {
          id: 'conv1',
          userId: 'user1',
          title: 'Conversation 1',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          _count: { messages: 5 },
        },
        {
          id: 'conv2',
          userId: 'user1',
          title: 'Conversation 2',
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
          _count: { messages: 3 },
        },
      ]

      ;(prisma.conversation.findMany as any).mockResolvedValueOnce(mockConversations)
      ;(prisma.conversation.count as any).mockResolvedValueOnce(2)

      const request = new NextRequest('http://localhost/api/conversations')

      const response = await GetConversations(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.conversations).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
      expect(data.pagination.page).toBe(1)
    })

    it('支援分頁查詢', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findMany as any).mockResolvedValueOnce([])
      ;(prisma.conversation.count as any).mockResolvedValueOnce(50)

      const request = new NextRequest(
        'http://localhost/api/conversations?page=2&pageSize=10'
      )

      const response = await GetConversations(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(2)
      expect(data.pagination.pageSize).toBe(10)
      expect(data.pagination.total).toBe(50)
      expect(data.pagination.totalPages).toBe(5)
    })
  })

  describe('GET /api/conversations/[id]', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1')

      const response = await GetConversationDetail(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('對話不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1')

      const response = await GetConversationDetail(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('對話不存在')
    })

    it('成功返回對話詳情', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      const mockConversation = {
        id: 'conv1',
        userId: 'user1',
        title: 'Test Conversation',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [
          {
            id: 'msg1',
            role: 'user',
            content: 'Hello',
            timestamp: new Date(),
          },
          {
            id: 'msg2',
            role: 'assistant',
            content: 'Hi there!',
            timestamp: new Date(),
          },
        ],
      }

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce(
        mockConversation
      )

      const request = new NextRequest('http://localhost/api/conversations/conv1')

      const response = await GetConversationDetail(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.conversation.id).toBe('conv1')
      expect(data.conversation.messages).toHaveLength(2)
    })
  })

  describe('PATCH /api/conversations/[id]', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      })

      const response = await UpdateConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('對話不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated' }),
      })

      const response = await UpdateConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('對話不存在')
    })

    it('成功更新對話標題', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce({
        id: 'conv1',
        userId: 'user1',
        title: 'Old Title',
      })

      const updatedConversation = {
        id: 'conv1',
        userId: 'user1',
        title: 'Updated Title',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      }

      ;(prisma.conversation.update as any).mockResolvedValueOnce(
        updatedConversation
      )

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'PATCH',
        body: JSON.stringify({ title: 'Updated Title' }),
      })

      const response = await UpdateConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.conversation.title).toBe('Updated Title')
    })
  })

  describe('DELETE /api/conversations/[id]', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'DELETE',
      })

      const response = await DeleteConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('對話不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'DELETE',
      })

      const response = await DeleteConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('對話不存在')
    })

    it('成功刪除對話', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce({
        id: 'conv1',
        userId: 'user1',
        title: 'To Delete',
      })

      ;(prisma.conversation.delete as any).mockResolvedValueOnce({
        id: 'conv1',
      })

      const request = new NextRequest('http://localhost/api/conversations/conv1', {
        method: 'DELETE',
      })

      const response = await DeleteConversation(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('已刪除')
    })
  })

  describe('POST /api/conversations/[id]/messages', () => {
    it('未登入應該返回 401', async () => {
      ;(auth as any).mockResolvedValueOnce(null)

      const request = new NextRequest(
        'http://localhost/api/conversations/conv1/messages',
        {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: 'Hello' }),
        }
      )

      const response = await AddMessage(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('未授權')
    })

    it('對話不存在應該返回 404', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce(null)

      const request = new NextRequest(
        'http://localhost/api/conversations/conv1/messages',
        {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: 'Hello' }),
        }
      )

      const response = await AddMessage(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('對話不存在')
    })

    it('成功新增訊息', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce({
        id: 'conv1',
        userId: 'user1',
        title: 'Test',
      })

      const mockMessage = {
        id: 'msg1',
        conversationId: 'conv1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      }

      ;(prisma.message.create as any).mockResolvedValueOnce(mockMessage)
      ;(prisma.conversation.update as any).mockResolvedValueOnce({})

      const request = new NextRequest(
        'http://localhost/api/conversations/conv1/messages',
        {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: 'Hello' }),
        }
      )

      const response = await AddMessage(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message.content).toBe('Hello')
      expect(data.message.role).toBe('user')
    })

    it('role 格式錯誤應該返回 400', async () => {
      ;(auth as any).mockResolvedValueOnce({
        user: { email: 'test@example.com' },
      })

      ;(prisma.user.findUnique as any).mockResolvedValueOnce({
        id: 'user1',
        email: 'test@example.com',
      })

      ;(prisma.conversation.findUnique as any).mockResolvedValueOnce({
        id: 'conv1',
        userId: 'user1',
        title: 'Test',
      })

      const request = new NextRequest(
        'http://localhost/api/conversations/conv1/messages',
        {
          method: 'POST',
          body: JSON.stringify({ role: 'invalid', content: 'Hello' }),
        }
      )

      const response = await AddMessage(request, {
        params: { id: 'conv1' },
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('請求格式錯誤')
    })
  })
})
