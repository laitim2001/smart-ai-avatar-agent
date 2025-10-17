import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'edge'

/**
 * GET /api/user/favorites
 * 取得使用者的收藏 Avatar 列表
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權：請先登入' },
        { status: 401 }
      )
    }

    // 取得使用者
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        favoriteAvatars: {
          include: {
            avatar: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      favorites: user.favoriteAvatars.map((fav) => ({
        id: fav.id,
        avatarId: fav.avatarId,
        createdAt: fav.createdAt,
        avatar: {
          id: fav.avatar.id,
          name: fav.avatar.name,
          description: fav.avatar.description,
          url: fav.avatar.url,
          thumbnail: fav.avatar.thumbnail,
          category: fav.avatar.category,
          tags: fav.avatar.tags,
          featured: fav.avatar.featured,
          popularity: fav.avatar.popularity,
        },
      })),
      count: user.favoriteAvatars.length,
    })
  } catch (error) {
    console.error('[User Favorites Error]', error)
    return NextResponse.json(
      { error: '取得收藏列表失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
