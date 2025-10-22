import { NextRequest, NextResponse } from 'next/server'
import { generateLipSyncVideo } from '@/lib/replicate/client'

export const runtime = 'nodejs'
export const maxDuration = 200 // Wav2Lip 可能需要較長時間（最多 2 分鐘 + 緩衝）

/**
 * POST /api/avatar/lip-sync
 *
 * 使用 Wav2Lip 生成 Avatar Lip Sync 影片
 *
 * @param request - 包含 Avatar 圖片 URL 和音訊 URL 的請求
 * @returns Lip Sync 影片 URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { avatarImageUrl, audioUrl } = body

    // 驗證必要欄位
    if (!avatarImageUrl) {
      return NextResponse.json(
        { error: '缺少 Avatar 圖片 URL (avatarImageUrl)' },
        { status: 400 }
      )
    }

    if (!audioUrl) {
      return NextResponse.json(
        { error: '缺少音訊 URL (audioUrl)' },
        { status: 400 }
      )
    }

    console.log('[Avatar Lip Sync] Processing request:', {
      avatarImageUrl: avatarImageUrl.substring(0, 50) + '...',
      audioUrl: audioUrl.substring(0, 50) + '...'
    })

    const startTime = Date.now()

    // 呼叫 Replicate Wav2Lip API 生成 Lip Sync 影片
    const videoUrl = await generateLipSyncVideo(avatarImageUrl, audioUrl)

    const duration = Date.now() - startTime

    console.log('[Avatar Lip Sync] Success:', {
      duration: `${duration}ms`,
      videoUrl: videoUrl.substring(0, 50) + '...'
    })

    return NextResponse.json({
      success: true,
      videoUrl,
      duration,
      message: 'Lip Sync 影片生成成功'
    })

  } catch (error) {
    console.error('[Avatar Lip Sync] Error:', error)

    return NextResponse.json(
      {
        error: 'Lip Sync 影片生成失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/avatar/lip-sync
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
