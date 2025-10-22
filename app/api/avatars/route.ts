/**
 * Avatars API Route
 * Sprint 5: Avatar Gallery 擴充
 *
 * GET /api/avatars - 獲取可用的 Avatar 列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

/**
 * Avatar 資料定義
 * @deprecated 使用 Prisma Avatar model
 */
export interface AvatarData {
  id: string
  name: string
  url: string
  thumbnail: string
  description: string | null
  category: string
  tags: string[]
  featured: boolean
  popularity: number
  createdAt: Date
  updatedAt: Date
}

/**
 * GET /api/avatars
 * 獲取所有可用的 Avatar 列表，支援篩選、搜尋、排序
 *
 * Query Parameters:
 * - category: 篩選特定類別 (male/female/neutral/all)
 * - tags: 篩選特定標籤 (逗號分隔，例如: professional,business)
 * - search: 搜尋 Avatar 名稱
 * - sort: 排序方式 (newest/popular/name)
 * - featured: 是否只顯示推薦 Avatar (true/false)
 *
 * Response:
 * {
 *   avatars: Avatar[]       // Avatar 列表
 *   total: number           // 總數量
 *   categories: Array<{ category: string, count: number }>  // 分類統計
 *   tags: Array<{ tag: string, count: number }>            // 標籤統計
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tagsParam = searchParams.get('tags')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const featuredParam = searchParams.get('featured')

    // 建構 Prisma 查詢條件
    const where: any = {}

    // 類別篩選
    if (category && category !== 'all') {
      where.category = category
    }

    // 標籤篩選 (支援多個標籤, OR 邏輯)
    if (tagsParam) {
      const tags = tagsParam.split(',').map((tag) => tag.trim())
      where.tags = {
        hasSome: tags,
      }
    }

    // 搜尋功能 (名稱模糊搜尋)
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Featured 篩選
    if (featuredParam === 'true') {
      where.featured = true
    }

    // 排序邏輯
    let orderBy: any
    switch (sort) {
      case 'popular':
        orderBy = { popularity: 'desc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    // 查詢 Avatar 列表
    const avatars = await prisma.avatar.findMany({
      where,
      orderBy,
    })

    // 獲取所有 Avatar 用於統計 (不受篩選影響)
    const allAvatars = await prisma.avatar.findMany()

    // 計算分類統計
    const categoryStats = allAvatars.reduce((acc, avatar) => {
      const existing = acc.find((c) => c.category === avatar.category)
      if (existing) {
        existing.count++
      } else {
        acc.push({ category: avatar.category, count: 1 })
      }
      return acc
    }, [] as Array<{ category: string; count: number }>)

    // 計算標籤統計
    const tagStats = allAvatars
      .flatMap((avatar) => avatar.tags)
      .reduce((acc, tag) => {
        const existing = acc.find((t) => t.tag === tag)
        if (existing) {
          existing.count++
        } else {
          acc.push({ tag, count: 1 })
        }
        return acc
      }, [] as Array<{ tag: string; count: number }>)
      .sort((a, b) => b.count - a.count) // 依使用頻率排序

    return NextResponse.json({
      avatars,
      total: avatars.length,
      categories: categoryStats,
      tags: tagStats,
    })
  } catch (error) {
    console.error('[Get Avatars Error]', error)
    return NextResponse.json(
      { error: '伺服器錯誤', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
