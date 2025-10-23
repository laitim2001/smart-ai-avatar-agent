/**
 * Persona Linked Agents API
 * @module app/api/personas/[id]/agents
 * @description 獲取與特定 Persona 關聯的所有 Agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/personas/[id]/agents - 獲取關聯的 Agent 列表
 *
 * @description 用於檢查 Persona 是否被使用，以及列出所有使用此 Persona 的 Agent
 *
 * @example
 * GET /api/personas/clxxx/agents
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "agent1",
 *       "name": "CDO 助理",
 *       "description": "商務數據分析助手",
 *       "category": "professional",
 *       "isActive": true,
 *       "usageCount": 150,
 *       "createdAt": "2025-01-01T..."
 *     }
 *   ],
 *   "total": 3,
 *   "timestamp": "2025-10-23T..."
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 1. 檢查 Persona 是否存在
    const persona = await prisma.persona.findUnique({
      where: { id },
      select: { id: true, name: true },
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

    // 2. 查詢關聯的 Agent
    const linkedAgents = await prisma.aIAgent.findMany({
      where: {
        personaId: id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        isActive: true,
        isSystem: true,
        isPublic: true,
        usageCount: true,
        popularity: true,
        createdAt: true,
        updatedAt: true,
        avatar: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: linkedAgents,
      total: linkedAgents.length,
      metadata: {
        personaId: persona.id,
        personaName: persona.name,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[GET /api/personas/[id]/agents Error]`, error)
    console.error('[Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: '獲取關聯 Agent 列表失敗',
          details: (error as any).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
