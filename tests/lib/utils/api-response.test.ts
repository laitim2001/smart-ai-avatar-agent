/**
 * API Response Utilities Tests
 * 測試統一 API 回應格式工具
 */

import { describe, it, expect, vi } from 'vitest'
import { NextResponse } from 'next/server'
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  serviceUnavailableResponse,
  handleApiError,
  type SuccessResponse,
  type ErrorResponse,
} from '@/lib/utils/api-response'

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('應該建立成功回應（僅 success 標記）', async () => {
      const response = successResponse()
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({
        success: true,
      })
    })

    it('應該建立成功回應（包含 data）', async () => {
      const data = { userId: 'user_123', name: 'Test User' }
      const response = successResponse(data)
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({
        success: true,
        data,
      })
    })

    it('應該建立成功回應（包含 message）', async () => {
      const response = successResponse(undefined, '操作成功')
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({
        success: true,
        message: '操作成功',
      })
    })

    it('應該建立成功回應（包含 data 和 message）', async () => {
      const data = { count: 5 }
      const response = successResponse(data, '查詢成功')
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json).toEqual({
        success: true,
        data,
        message: '查詢成功',
      })
    })

    it('應該支援自訂 HTTP 狀態碼', async () => {
      const response = successResponse({ created: true }, '建立成功', 201)
      const json = await response.json()

      expect(response.status).toBe(201)
      expect(json).toEqual({
        success: true,
        data: { created: true },
        message: '建立成功',
      })
    })

    it('應該正確處理複雜的 data 類型', async () => {
      const complexData = {
        users: [
          { id: '1', name: 'User 1' },
          { id: '2', name: 'User 2' },
        ],
        pagination: {
          total: 100,
          page: 1,
          limit: 10,
        },
      }

      const response = successResponse(complexData)
      const json = await response.json()

      expect(json.data).toEqual(complexData)
    })

    it('應該處理 null 和 undefined data', async () => {
      const responseNull = successResponse(null)
      const jsonNull = await responseNull.json()

      // null 被視為有效的 data 值
      expect(jsonNull).toEqual({
        success: true,
        data: null,
      })

      const responseUndefined = successResponse(undefined)
      const jsonUndefined = await responseUndefined.json()

      // undefined 不會包含 data 欄位
      expect(jsonUndefined).toEqual({
        success: true,
      })
    })
  })

  describe('errorResponse', () => {
    it('應該建立錯誤回應（基本）', async () => {
      const response = errorResponse('發生錯誤')
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        error: '發生錯誤',
      })
    })

    it('應該建立錯誤回應（包含 code）', async () => {
      const response = errorResponse('驗證失敗', 400, 'VALIDATION_ERROR')
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        error: '驗證失敗',
        code: 'VALIDATION_ERROR',
      })
    })

    it('應該建立錯誤回應（包含 details）', async () => {
      const details = {
        email: '電子郵件格式不正確',
        password: '密碼長度不足',
      }

      const response = errorResponse(
        '驗證失敗',
        400,
        'VALIDATION_ERROR',
        details
      )
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        error: '驗證失敗',
        code: 'VALIDATION_ERROR',
        details,
      })
    })

    it('應該支援各種 HTTP 錯誤狀態碼', async () => {
      const statusCodes = [400, 401, 403, 404, 500, 503]

      for (const status of statusCodes) {
        const response = errorResponse('錯誤', status)
        expect(response.status).toBe(status)
      }
    })
  })

  describe('便捷錯誤回應函數', () => {
    it('validationErrorResponse 應該返回 400 驗證錯誤', async () => {
      const response = validationErrorResponse('驗證失敗')
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        error: '驗證失敗',
        code: 'VALIDATION_ERROR',
      })
    })

    it('validationErrorResponse 應該支援 details', async () => {
      const details = { field: 'email', reason: '格式不正確' }
      const response = validationErrorResponse('驗證失敗', details)
      const json = await response.json()

      expect(json.details).toEqual(details)
    })

    it('unauthorizedResponse 應該返回 401 未授權', async () => {
      const response = unauthorizedResponse()
      const json = await response.json()

      expect(response.status).toBe(401)
      expect(json).toEqual({
        success: false,
        error: '未授權，請先登入',
        code: 'UNAUTHORIZED',
      })
    })

    it('unauthorizedResponse 應該支援自訂錯誤訊息', async () => {
      const response = unauthorizedResponse('Token 已過期')
      const json = await response.json()

      expect(json.error).toBe('Token 已過期')
    })

    it('forbiddenResponse 應該返回 403 禁止訪問', async () => {
      const response = forbiddenResponse()
      const json = await response.json()

      expect(response.status).toBe(403)
      expect(json).toEqual({
        success: false,
        error: '您無權執行此操作',
        code: 'FORBIDDEN',
      })
    })

    it('forbiddenResponse 應該支援自訂錯誤訊息', async () => {
      const response = forbiddenResponse('管理員權限不足')
      const json = await response.json()

      expect(json.error).toBe('管理員權限不足')
    })

    it('notFoundResponse 應該返回 404 資源未找到', async () => {
      const response = notFoundResponse()
      const json = await response.json()

      expect(response.status).toBe(404)
      expect(json).toEqual({
        success: false,
        error: '找不到請求的資源',
        code: 'NOT_FOUND',
      })
    })

    it('notFoundResponse 應該支援自訂錯誤訊息', async () => {
      const response = notFoundResponse('使用者不存在')
      const json = await response.json()

      expect(json.error).toBe('使用者不存在')
    })

    it('serverErrorResponse 應該返回 500 伺服器錯誤', async () => {
      const response = serverErrorResponse()
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({
        success: false,
        error: '伺服器錯誤，請稍後再試',
        code: 'SERVER_ERROR',
      })
    })

    it('serverErrorResponse 應該支援自訂錯誤訊息', async () => {
      const response = serverErrorResponse('資料庫連線失敗')
      const json = await response.json()

      expect(json.error).toBe('資料庫連線失敗')
    })

    it('serviceUnavailableResponse 應該返回 503 服務不可用', async () => {
      const response = serviceUnavailableResponse()
      const json = await response.json()

      expect(response.status).toBe(503)
      expect(json).toEqual({
        success: false,
        error: '服務暫時不可用，請稍後再試',
        code: 'SERVICE_UNAVAILABLE',
      })
    })

    it('serviceUnavailableResponse 應該支援自訂錯誤訊息', async () => {
      const response = serviceUnavailableResponse('系統維護中')
      const json = await response.json()

      expect(json.error).toBe('系統維護中')
    })
  })

  describe('handleApiError', () => {
    it('應該處理 Error 物件', async () => {
      const error = new Error('Test error message')
      const response = handleApiError(error)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({
        success: false,
        error: 'Test error message',
        code: 'SERVER_ERROR',
      })
    })

    it('應該識別 Prisma 錯誤', async () => {
      const prismaError = new Error('Prisma Client Error: Connection failed')
      const response = handleApiError(prismaError)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({
        success: false,
        error: '資料庫錯誤，請稍後再試',
        code: 'SERVER_ERROR',
      })
    })

    it('應該識別驗證錯誤', async () => {
      const validationError = new Error('validation failed: email is required')
      const response = handleApiError(validationError)
      const json = await response.json()

      expect(response.status).toBe(400)
      expect(json).toEqual({
        success: false,
        error: 'validation failed: email is required',
        code: 'VALIDATION_ERROR',
      })
    })

    it('應該處理非 Error 物件', async () => {
      const unknownError = 'String error'
      const response = handleApiError(unknownError)
      const json = await response.json()

      expect(response.status).toBe(500)
      expect(json).toEqual({
        success: false,
        error: '伺服器錯誤，請稍後再試',
        code: 'SERVER_ERROR',
      })
    })

    it('應該使用自訂 log prefix', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const error = new Error('Test error')
      handleApiError(error, '[Custom Prefix]')

      expect(consoleErrorSpy).toHaveBeenCalledWith('[Custom Prefix]', error)

      consoleErrorSpy.mockRestore()
    })

    it('應該預設使用 [API Error] prefix', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const error = new Error('Test error')
      handleApiError(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('[API Error]', error)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('TypeScript 類型檢查', () => {
    it('SuccessResponse 應該有正確的類型', () => {
      const response: SuccessResponse<{ id: string }> = {
        success: true,
        data: { id: 'test' },
      }

      expect(response.success).toBe(true)
      expect(response.data?.id).toBe('test')
    })

    it('ErrorResponse 應該有正確的類型', () => {
      const response: ErrorResponse = {
        success: false,
        error: 'Error message',
        code: 'ERROR_CODE',
        details: { field: 'value' },
      }

      expect(response.success).toBe(false)
      expect(response.error).toBe('Error message')
      expect(response.code).toBe('ERROR_CODE')
    })

    it('應該支援泛型類型的 data', async () => {
      interface User {
        id: string
        name: string
        email: string
      }

      const user: User = {
        id: 'user_123',
        name: 'Test User',
        email: 'test@example.com',
      }

      const response = successResponse<User>(user)
      const json = await response.json()

      expect(json.data).toEqual(user)
    })
  })

  describe('邊界情況', () => {
    it('應該處理空字串錯誤訊息', async () => {
      const response = errorResponse('')
      const json = await response.json()

      expect(json.error).toBe('')
    })

    it('應該處理非常長的錯誤訊息', async () => {
      const longMessage = 'Error: ' + 'x'.repeat(1000)
      const response = errorResponse(longMessage)
      const json = await response.json()

      expect(json.error).toBe(longMessage)
      expect(json.error.length).toBeGreaterThan(1000)
    })

    it('應該處理特殊字元的錯誤訊息', async () => {
      const specialMessage = '錯誤 <>&"\'`\n\t\r'
      const response = errorResponse(specialMessage)
      const json = await response.json()

      expect(json.error).toBe(specialMessage)
    })

    it('應該處理 circular reference 的 details (JSON.stringify 限制)', () => {
      // 注意：NextResponse.json() 在處理 circular reference 時會拋出錯誤
      // 這是 JSON.stringify 的限制，實際使用時應避免傳入此類 details
      const obj: any = { a: 1 }
      obj.self = obj // circular reference

      // 建立 response 時會立即序列化，所以會拋出 TypeError
      expect(() => {
        errorResponse('Circular reference test', 400, 'TEST', obj)
      }).toThrow(TypeError)

      // 建議：實際使用時應該過濾或簡化 details 避免 circular reference
    })
  })
})
