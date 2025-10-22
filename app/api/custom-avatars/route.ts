import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

/**
 * GET /api/custom-avatars
 *
 * Get all custom avatars for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      )
    }

    // Get all custom avatars for the user
    const customAvatars = await prisma.customAvatar.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      avatars: customAvatars,
      count: customAvatars.length,
    })

  } catch (error) {
    console.error('[Custom Avatars GET] Error:', error)
    return NextResponse.json(
      { error: '獲取 Avatar 列表失敗' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/custom-avatars
 *
 * Save a new custom avatar to the database
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      )
    }

    // Get request body
    const body = await request.json()
    const { name, url, rpmId, description, thumbnailUrl, sourcePhoto } = body

    // Validate required fields
    if (!name || !url) {
      return NextResponse.json(
        { error: '缺少必要欄位 (name, url)' },
        { status: 400 }
      )
    }

    // Create custom avatar
    const customAvatar = await prisma.customAvatar.create({
      data: {
        userId: user.id,
        name,
        url,
        rpmId,
        description,
        thumbnailUrl,
        sourcePhoto,
        isActive: false,
        usageCount: 0,
      },
    })

    console.log('[Custom Avatars POST] Avatar created:', {
      id: customAvatar.id,
      name: customAvatar.name,
      user: session.user.email,
    })

    return NextResponse.json({
      success: true,
      avatar: customAvatar,
      message: 'Avatar 儲存成功！',
    })

  } catch (error) {
    console.error('[Custom Avatars POST] Error:', error)
    return NextResponse.json(
      { error: '儲存 Avatar 失敗' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/custom-avatars
 *
 * Delete a custom avatar by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: '用戶不存在' },
        { status: 404 }
      )
    }

    // Get avatar ID from query params
    const { searchParams } = new URL(request.url)
    const avatarId = searchParams.get('id')

    if (!avatarId) {
      return NextResponse.json(
        { error: '缺少 Avatar ID' },
        { status: 400 }
      )
    }

    // Verify ownership and delete
    const customAvatar = await prisma.customAvatar.findFirst({
      where: {
        id: avatarId,
        userId: user.id,
      },
    })

    if (!customAvatar) {
      return NextResponse.json(
        { error: 'Avatar 不存在或無權刪除' },
        { status: 404 }
      )
    }

    await prisma.customAvatar.delete({
      where: { id: avatarId },
    })

    console.log('[Custom Avatars DELETE] Avatar deleted:', {
      id: avatarId,
      user: session.user.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Avatar 已刪除',
    })

  } catch (error) {
    console.error('[Custom Avatars DELETE] Error:', error)
    return NextResponse.json(
      { error: '刪除 Avatar 失敗' },
      { status: 500 }
    )
  }
}
