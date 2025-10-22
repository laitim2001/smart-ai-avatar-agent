import { NextRequest, NextResponse } from 'next/server'
import { stylizePhotoToAvatar } from '@/lib/replicate/client'

export const runtime = 'nodejs'
export const maxDuration = 200 // 照片風格化可能需要較長時間（最多 3 分鐘 + 緩衝）

/**
 * POST /api/avatar/stylize
 *
 * 將真人照片風格化為 Avatar 風格圖片
 *
 * @param request - 包含照片 URL 或 Base64 的請求
 * @returns 風格化後的 Avatar 圖片 URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photoUrl, style = 'cartoon' } = body

    // 驗證必要欄位
    if (!photoUrl) {
      return NextResponse.json(
        { error: '缺少照片 URL (photoUrl)' },
        { status: 400 }
      )
    }

    // 驗證 style 參數
    const validStyles = ['cartoon', 'anime', 'illustration']
    if (!validStyles.includes(style)) {
      return NextResponse.json(
        { error: `無效的風格參數。允許的值：${validStyles.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('[Avatar Stylize] Processing request:', {
      photoUrl: photoUrl.substring(0, 50) + '...',
      style
    })

    const startTime = Date.now()

    // 呼叫 Replicate API 進行風格化
    const avatarImageUrl = await stylizePhotoToAvatar(photoUrl, style)

    const duration = Date.now() - startTime

    console.log('[Avatar Stylize] Success:', {
      duration: `${duration}ms`,
      avatarImageUrl: avatarImageUrl.substring(0, 50) + '...'
    })

    return NextResponse.json({
      success: true,
      avatarImageUrl,
      style,
      duration,
      message: 'Avatar 風格化成功'
    })

  } catch (error) {
    console.error('[Avatar Stylize] Error:', error)

    return NextResponse.json(
      {
        error: 'Avatar 風格化失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/avatar/stylize
 *
 * 測試端點，檢查 Replicate API 連線狀態
 */
export async function GET() {
  try {
    const { checkReplicateConnection } = await import('@/lib/replicate/client')
    const result = await checkReplicateConnection()

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `連線測試失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}
