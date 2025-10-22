import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'edge'

/**
 * POST /api/avatars/[id]/favorite
 * 將 Avatar 加入使用者收藏
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權：請先登入' },
        { status: 401 }
      )
    }

    const avatarId = (await params).id

    // 驗證 Avatar 是否存在
    const avatar = await prisma.avatar.findUnique({
      where: { id: avatarId },
    })

    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar 不存在' },
        { status: 404 }
      )
    }

    // 取得使用者
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    // 檢查是否已收藏
    const existingFavorite = await prisma.userFavoriteAvatar.findUnique({
      where: {
        userId_avatarId: {
          userId: user.id,
          avatarId: avatarId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: '已經收藏此 Avatar' },
        { status: 400 }
      )
    }

    // 創建收藏記錄
    const favorite = await prisma.userFavoriteAvatar.create({
      data: {
        userId: user.id,
        avatarId: avatarId,
      },
      include: {
        avatar: true,
      },
    })

    return NextResponse.json({
      success: true,
      favorite: {
        id: favorite.id,
        avatarId: favorite.avatarId,
        createdAt: favorite.createdAt,
        avatar: {
          id: favorite.avatar.id,
          name: favorite.avatar.name,
          thumbnail: favorite.avatar.thumbnail,
        },
      },
    })
  } catch (error) {
    console.error('[Favorite Avatar Error]', error)
    return NextResponse.json(
      { error: '收藏失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/avatars/[id]/favorite
 * 將 Avatar 從使用者收藏中移除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權：請先登入' },
        { status: 401 }
      )
    }

    const avatarId = (await params).id

    // 取得使用者
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    // 檢查收藏是否存在
    const existingFavorite = await prisma.userFavoriteAvatar.findUnique({
      where: {
        userId_avatarId: {
          userId: user.id,
          avatarId: avatarId,
        },
      },
    })

    if (!existingFavorite) {
      return NextResponse.json(
        { error: '尚未收藏此 Avatar' },
        { status: 404 }
      )
    }

    // 刪除收藏記錄
    await prisma.userFavoriteAvatar.delete({
      where: {
        id: existingFavorite.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: '已取消收藏',
    })
  } catch (error) {
    console.error('[Unfavorite Avatar Error]', error)
    return NextResponse.json(
      { error: '取消收藏失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
