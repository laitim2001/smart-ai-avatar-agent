/**
 * Persona Detail API Routes
 * @module app/api/personas/[id]
 * @description GET/PUT/DELETE 單一 Persona 的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * Persona 更新驗證 Schema
 */
const personaUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  description: z.string().min(10).max(1000).optional(),
  systemPrompt: z.string().min(100).optional(),
  language: z.enum(['zh-TW', 'en', 'ja']).optional(),
  tone: z.enum(['professional', 'friendly', 'casual', 'academic']).optional(),
  style: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).optional(), // Semantic Versioning
  isActive: z.boolean().optional(),
})

/**
 * GET /api/personas/[id] - 獲取單一 Persona 詳情
 *
 * @example
 * GET /api/personas/clxxx
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            isActive: true,
            usageCount: true,
          },
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            agents: true,
          },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERSONA_NOT_FOUND',
            message: '找不到指定的 Persona',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: persona,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[GET /api/personas/[id] Error]`, error)
    console.error('[Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '獲取 Persona 失敗',
          details: (error as any).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/personas/[id] - 更新 Persona
 *
 * @example
 * PUT /api/personas/clxxx
 * Body: {
 *   "name": "CDO 商務顧問 (更新)",
 *   "description": "更新後的描述...",
 *   "version": "1.1.0"
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // 驗證資料
    const validation = personaUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '資料驗證失敗',
            details: validation.error.format(),
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 檢查 Persona 是否存在
    const existingPersona = await prisma.persona.findUnique({
      where: { id },
    })

    if (!existingPersona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERSONA_NOT_FOUND',
            message: '找不到指定的 Persona',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 更新 Persona
    const updatedPersona = await prisma.persona.update({
      where: { id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        role: true,
        description: true,
        version: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedPersona,
      message: 'Persona 已更新',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[PUT /api/personas/[id] Error]`, error)
    console.error('[Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: '更新 Persona 失敗',
          details: (error as any).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/personas/[id] - 刪除 Persona
 *
 * ⚠️ 重要：如果 Persona 被任何 Agent 使用，將無法刪除
 *
 * @example
 * DELETE /api/personas/clxxx
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. 檢查 Persona 是否存在
    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        agents: {
          select: {
            id: true,
            name: true,
            category: true,
            isActive: true,
          },
        },
      },
    })

    if (!persona) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERSONA_NOT_FOUND',
            message: '找不到指定的 Persona',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 2. 檢查關聯的 Agent
    if (persona.agents.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PERSONA_IN_USE',
            message: '此 Persona 正被使用，無法刪除',
            details: {
              linkedAgents: persona.agents,
              agentCount: persona.agents.length,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 3. 執行刪除
    await prisma.persona.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Persona 已刪除',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[DELETE /api/personas/[id] Error]`, error)
    console.error('[Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: '刪除 Persona 失敗',
          details: (error as any).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
