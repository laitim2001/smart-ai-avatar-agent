/**
 * Personas API Routes
 * @module app/api/personas
 * @description Persona 列表 API - 用於 Agent 表單選擇
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/personas - 列出所有可用 Persona
 *
 * @example
 * GET /api/personas
 */
export async function GET(request: NextRequest) {
  try {
    // 查詢所有啟用的 Persona
    const personas = await prisma.persona.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        description: true,
        language: true,
        tone: true,
        capabilities: true,
        version: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: personas,
      total: personas.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/personas Error]', error)
    console.error('[GET /api/personas Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch personas',
        code: 'FETCH_ERROR',
        details: (error as any).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
