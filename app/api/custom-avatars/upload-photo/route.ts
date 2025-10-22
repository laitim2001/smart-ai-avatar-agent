import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

/**
 * POST /api/custom-avatars/upload-photo
 *
 * Upload photo to Ready Player Me and generate custom 3D avatar
 *
 * @param request - FormData with photo file
 * @returns Avatar URL and metadata
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      )
    }

    // 2. Get form data
    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      return NextResponse.json(
        { error: '未提供照片' },
        { status: 400 }
      )
    }

    // 3. Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: '不支援的檔案格式。請上傳 JPG 或 PNG 格式的照片' },
        { status: 400 }
      )
    }

    // 4. Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: '照片檔案過大。最大支援 10MB' },
        { status: 400 }
      )
    }

    console.log('[Custom Avatar Upload] Processing photo:', {
      name: photo.name,
      type: photo.type,
      size: `${(photo.size / 1024).toFixed(2)} KB`,
      user: session.user.email,
    })

    // 5. Convert photo to base64
    const photoBuffer = await photo.arrayBuffer()
    const photoBase64 = Buffer.from(photoBuffer).toString('base64')
    const base64Image = `data:${photo.type};base64,${photoBase64}`

    // 6. Prepare request body for Ready Player Me API v2
    const apiKey = process.env.READYPLAYERME_API_KEY
    if (!apiKey) {
      console.error('[Custom Avatar Upload] Missing READYPLAYERME_API_KEY')
      return NextResponse.json(
        { error: '服務配置錯誤' },
        { status: 500 }
      )
    }

    // Get user ID for Ready Player Me
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

    const requestBody = {
      data: {
        userId: user.id,
        partner: process.env.READYPLAYERME_SUBDOMAIN || 'default',
        bodyType: 'fullbody' as const,
        assets: {
          // 基本設定，讓 AI 根據照片自動生成
        },
        base64Image: base64Image,
      },
    }

    console.log('[Custom Avatar Upload] Calling Ready Player Me API...')

    // 7. Call Ready Player Me API
    const rpmResponse = await fetch('https://api.readyplayer.me/v2/avatars', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!rpmResponse.ok) {
      const errorText = await rpmResponse.text()
      console.error('[Custom Avatar Upload] Ready Player Me API error:', {
        status: rpmResponse.status,
        statusText: rpmResponse.statusText,
        error: errorText,
      })

      return NextResponse.json(
        { error: `Avatar 生成失敗: ${rpmResponse.statusText}` },
        { status: rpmResponse.status }
      )
    }

    const rpmData = await rpmResponse.json()

    console.log('[Custom Avatar Upload] Avatar generated successfully:', {
      id: rpmData.data?.id,
      glbUrl: rpmData.data?.url,
      response: rpmData,
    })

    // 8. Extract avatar data from response
    const avatarId = rpmData.data?.id || rpmData.id
    const avatarUrl = rpmData.data?.url || rpmData.url

    if (!avatarId || !avatarUrl) {
      console.error('[Custom Avatar Upload] Invalid response structure:', rpmData)
      return NextResponse.json(
        { error: 'Avatar 生成失敗：無效的回應格式' },
        { status: 500 }
      )
    }

    // 9. Return avatar data
    return NextResponse.json({
      success: true,
      avatar: {
        id: avatarId,
        url: avatarUrl,
        // GLB model URL (add .glb extension if not present)
        glbUrl: avatarUrl.endsWith('.glb') ? avatarUrl : `${avatarUrl}.glb`,
      },
      message: 'Avatar 生成成功！',
    })

  } catch (error) {
    console.error('[Custom Avatar Upload] Unexpected error:', error)
    return NextResponse.json(
      {
        error: '生成 Avatar 時發生錯誤',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
