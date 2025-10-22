import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'edge'

/**
 * GET /api/avatars/recommended
 * 取得推薦的 Avatar 列表
 *
 * 推薦演算法：
 * 1. 如果使用者已登入且有收藏：基於收藏的 category 和 tags 推薦相似 Avatar
 * 2. 如果使用者未登入或無收藏：返回熱門 Avatar (featured + high popularity)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6', 10)

    let recommendedAvatars

    if (session?.user?.email) {
      // 已登入使用者：基於收藏的個人化推薦
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          favoriteAvatars: {
            include: {
              avatar: true,
            },
          },
        },
      })

      if (user && user.favoriteAvatars.length > 0) {
        // 分析使用者收藏的 category 和 tags
        const favoriteCategories = user.favoriteAvatars.map(
          (fav) => fav.avatar.category
        )
        const favoriteTags = user.favoriteAvatars.flatMap(
          (fav) => fav.avatar.tags
        )

        // 統計最常見的 category
        const categoryCount: Record<string, number> = {}
        favoriteCategories.forEach((cat) => {
          categoryCount[cat] = (categoryCount[cat] || 0) + 1
        })
        const topCategory = Object.entries(categoryCount).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0]

        // 統計最常見的 tags
        const tagCount: Record<string, number> = {}
        favoriteTags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
        const topTags = Object.entries(tagCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([tag]) => tag)

        // 取得已收藏的 Avatar IDs
        const favoriteAvatarIds = user.favoriteAvatars.map(
          (fav) => fav.avatarId
        )

        // 推薦相似 Avatar (相同 category 或有共同 tags，且未收藏)
        recommendedAvatars = await prisma.avatar.findMany({
          where: {
            id: {
              notIn: favoriteAvatarIds,
            },
            OR: [
              {
                category: topCategory,
              },
              {
                tags: {
                  hasSome: topTags,
                },
              },
            ],
          },
          orderBy: [
            { featured: 'desc' },
            { popularity: 'desc' },
          ],
          take: limit,
        })
      } else {
        // 使用者無收藏：返回熱門 Avatar
        recommendedAvatars = await prisma.avatar.findMany({
          where: {
            OR: [
              { featured: true },
              { popularity: { gte: 50 } },
            ],
          },
          orderBy: [
            { featured: 'desc' },
            { popularity: 'desc' },
          ],
          take: limit,
        })
      }
    } else {
      // 未登入使用者：返回熱門 Avatar
      recommendedAvatars = await prisma.avatar.findMany({
        where: {
          OR: [
            { featured: true },
            { popularity: { gte: 50 } },
          ],
        },
        orderBy: [
          { featured: 'desc' },
          { popularity: 'desc' },
        ],
        take: limit,
      })
    }

    return NextResponse.json({
      success: true,
      avatars: recommendedAvatars,
      count: recommendedAvatars.length,
    })
  } catch (error) {
    console.error('[Recommended Avatars Error]', error)
    return NextResponse.json(
      { error: '取得推薦失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
