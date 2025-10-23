/**
 * Personas API Routes
 * @module app/api/personas
 * @description Persona 列表 API - 用於 Agent 表單選擇與 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * Persona 建立驗證 Schema
 */
const personaCreateSchema = z.object({
  name: z.string().min(1, '名稱不能為空').max(100, '名稱不能超過 100 字元'),
  role: z.string().min(1, '角色不能為空').max(100, '角色不能超過 100 字元'),
  description: z.string().min(10, '描述至少需要 10 字元').max(1000, '描述不能超過 1000 字元'),
  systemPrompt: z.string().min(100, 'System Prompt 至少需要 100 字元'),
  language: z.enum(['zh-TW', 'en', 'ja'], {
    errorMap: () => ({ message: '語言必須是 zh-TW, en 或 ja' }),
  }),
  tone: z.enum(['professional', 'friendly', 'casual', 'academic'], {
    errorMap: () => ({ message: '語氣必須是 professional, friendly, casual 或 academic' }),
  }),
  style: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  restrictions: z.array(z.string()).default([]),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, '版本號必須符合 Semantic Versioning (如 1.0.0)').default('1.0.0'),
})

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

/**
 * POST /api/personas - 建立新 Persona
 *
 * @example
 * POST /api/personas
 * Body: {
 *   "name": "技術架構師",
 *   "role": "Technical Architect",
 *   "description": "專注於系統設計與架構規劃...",
 *   "systemPrompt": "你是一位資深技術架構師...",
 *   "language": "zh-TW",
 *   "tone": "professional",
 *   "style": ["analytical", "systematic"],
 *   "capabilities": ["system design", "architecture planning"],
 *   "restrictions": ["no politics"],
 *   "version": "1.0.0"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 驗證資料
    const validation = personaCreateSchema.safeParse(body)
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

    // 建立 Persona
    const newPersona = await prisma.persona.create({
      data: validation.data,
      select: {
        id: true,
        name: true,
        role: true,
        description: true,
        language: true,
        tone: true,
        version: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: newPersona,
      message: 'Persona 已建立',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[POST /api/personas Error]', error)
    console.error('[POST /api/personas Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: '建立 Persona 失敗',
          details: (error as any).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
