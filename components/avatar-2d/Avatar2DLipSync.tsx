'use client'

import { useRef, useEffect, useState } from 'react'
import type { VisemeEvent } from '@/types/viseme'
import { VISEME_TO_MORPH_TARGET, VISEME_INTENSITY } from '@/types/viseme'

interface Avatar2DLipSyncProps {
  /** Avatar 圖片 URL */
  avatarImageUrl: string
  /** 音訊 URL（Base64 Data URL 或 HTTP URL） */
  audioUrl?: string
  /** Viseme 事件陣列 */
  visemes?: VisemeEvent[]
  /** 是否自動播放 */
  autoPlay?: boolean
  /** 播放完成回調 */
  onPlaybackComplete?: () => void
  /** 寬度 */
  width?: number
  /** 高度 */
  height?: number
}

/**
 * 2D Avatar Lip Sync Component
 *
 * 使用 Canvas 2D 嘴部區域變形技術實現即時 Lip Sync
 * 根據 Viseme 資料即時操控 Avatar 圖片的嘴部區域
 */
export default function Avatar2DLipSync({
  avatarImageUrl,
  audioUrl,
  visemes = [],
  autoPlay = false,
  onPlaybackComplete,
  width = 512,
  height = 512
}: Avatar2DLipSyncProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentViseme, setCurrentViseme] = useState<number>(0)
  const [mouthOpenness, setMouthOpenness] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const hasAutoPlayedRef = useRef(false)
  const prevVisemeRef = useRef<number>(0)

  /**
   * 繪製帶有嘴部變形的 Avatar 畫面
   * 使用 Canvas 2D transform 對嘴部區域進行垂直/水平縮放
   */
  const drawFrame = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    intensity: number,
    morphTarget: string
  ) => {
    const canvas = ctx.canvas

    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 如果沒有變形，直接繪製完整圖片
    if (intensity === 0 || !morphTarget) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      return
    }

    // 嘴部區域定義（相對於圖片的比例）
    // 調整為更精確的臉部比例
    const mouthRegion = {
      centerX: 0.5,    // 嘴部中心 X（圖片正中央）
      centerY: 0.72,   // 嘴部中心 Y（臉部下方約 72%）
      width: 0.25,     // 嘴部區域寬度（圖片寬度的 25%）
      height: 0.08     // 嘴部區域高度（圖片高度的 8%）
    }

    // 計算嘴部區域的實際像素位置
    const mouthCenterX = canvas.width * mouthRegion.centerX
    const mouthCenterY = canvas.height * mouthRegion.centerY
    const mouthWidth = canvas.width * mouthRegion.width
    const mouthHeight = canvas.height * mouthRegion.height

    // 嘴部區域的起始位置
    const mouthLeft = mouthCenterX - mouthWidth / 2
    const mouthTop = mouthCenterY - mouthHeight / 2

    // 根據 morphTarget 計算變形參數
    let scaleX = 1
    let scaleY = 1

    switch (morphTarget) {
      case 'mouthOpen':
        // 嘴巴張開：垂直拉伸
        scaleY = 1 + intensity * 0.5
        break
      case 'mouthSmile':
        // 微笑：水平拉伸，垂直壓縮
        scaleX = 1 + intensity * 0.2
        scaleY = 1 - intensity * 0.1
        break
      case 'mouthPucker':
        // 嘟嘴：水平和垂直壓縮
        scaleX = 1 - intensity * 0.2
        scaleY = 1 - intensity * 0.2
        break
      case 'mouthFunnel':
        // 圓嘴：垂直拉伸
        scaleY = 1 + intensity * 0.3
        scaleX = 1 - intensity * 0.1
        break
      default:
        break
    }

    // 計算變形後的嘴部區域大小
    const scaledWidth = mouthWidth * scaleX
    const scaledHeight = mouthHeight * scaleY

    // 先繪製完整的 Avatar 圖片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    // 然後在嘴部區域上方繪製變形後的嘴部
    ctx.save()

    // 清除原始嘴部區域
    ctx.clearRect(
      mouthCenterX - scaledWidth / 2,
      mouthCenterY - scaledHeight / 2,
      scaledWidth,
      scaledHeight
    )

    // 繪製變形後的嘴部
    ctx.translate(mouthCenterX, mouthCenterY)
    ctx.scale(scaleX, scaleY)
    ctx.translate(-mouthCenterX, -mouthCenterY)

    // 從原圖中提取嘴部區域並繪製
    const srcLeft = (img.width * mouthRegion.centerX) - (img.width * mouthRegion.width / 2)
    const srcTop = (img.height * mouthRegion.centerY) - (img.height * mouthRegion.height / 2)
    const srcWidth = img.width * mouthRegion.width
    const srcHeight = img.height * mouthRegion.height

    ctx.drawImage(
      img,
      srcLeft, srcTop, srcWidth, srcHeight,
      mouthLeft, mouthTop, mouthWidth, mouthHeight
    )

    ctx.restore()
  }

  // 載入 Avatar 圖片到 Canvas
  useEffect(() => {
    if (!avatarImageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 建立新圖片物件
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
      console.log('[Lip Sync] Avatar 圖片載入完成')

      // 初始繪製
      drawFrame(ctx, img, 0, 'mouthOpen')
    }

    img.onerror = (error) => {
      console.error('[Lip Sync] Avatar 圖片載入失敗:', error)
    }

    img.src = avatarImageUrl
  }, [avatarImageUrl, width, height])

  // 重置 autoPlay 追蹤當 audioUrl 改變時
  useEffect(() => {
    hasAutoPlayedRef.current = false
    prevVisemeRef.current = 0
  }, [audioUrl])

  // 播放音訊和 Viseme 動畫
  useEffect(() => {
    if (!audioUrl || !audioRef.current || visemes.length === 0 || !canvasRef.current || !imageRef.current) return

    const audio = audioRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    if (!ctx || !img) return

    const updateViseme = () => {
      const currentTime = audio.currentTime * 1000 // 轉換為毫秒

      // 找到當前時間對應的 Viseme
      const activeViseme = visemes.find((v, index) => {
        const nextViseme = visemes[index + 1]
        return currentTime >= v.audioOffsetMs &&
               (!nextViseme || currentTime < nextViseme.audioOffsetMs)
      })

      if (activeViseme) {
        const intensity = VISEME_INTENSITY[activeViseme.visemeId as keyof typeof VISEME_INTENSITY] || 0
        const morphTarget = VISEME_TO_MORPH_TARGET[activeViseme.visemeId as keyof typeof VISEME_TO_MORPH_TARGET] || 'mouthOpen'

        setCurrentViseme(activeViseme.visemeId)
        setMouthOpenness(intensity)

        // 即時繪製嘴部變形
        drawFrame(ctx, img, intensity, morphTarget)

        // Debug 日誌 - 只在 Viseme ID 變化時記錄
        if (intensity > 0 && activeViseme.visemeId !== prevVisemeRef.current) {
          prevVisemeRef.current = activeViseme.visemeId
          console.log(`[Lip Sync] Viseme Changed: ${activeViseme.visemeId} (${morphTarget}), Intensity: ${(intensity * 100).toFixed(0)}%, Time: ${currentTime.toFixed(0)}ms`)
        }
      }

      if (!audio.paused) {
        animationFrameRef.current = requestAnimationFrame(updateViseme)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      animationFrameRef.current = requestAnimationFrame(updateViseme)
      console.log('[Lip Sync] 播放開始')
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      console.log('[Lip Sync] 播放暫停')
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      console.log('[Lip Sync] 播放完成')
      onPlaybackComplete?.()
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    // 只在 autoPlay 為 true 且尚未自動播放過時執行
    if (autoPlay && !hasAutoPlayedRef.current && audio.paused && audio.currentTime === 0) {
      hasAutoPlayedRef.current = true
      audio.play().catch(console.error)
    }

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioUrl, visemes, autoPlay, onPlaybackComplete, imageLoaded])

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
  }

  const handleStop = () => {
    if (!audioRef.current || !canvasRef.current || !imageRef.current) return

    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentViseme(0)
    setMouthOpenness(0)

    // 重置為初始狀態（無變形）
    const ctx = canvasRef.current.getContext('2d')
    if (ctx && imageRef.current) {
      drawFrame(ctx, imageRef.current, 0, 'mouthOpen')
    }

    console.log('[Lip Sync] 停止播放')
  }

  const handleReplay = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(console.error)
  }

  return (
    <div className="relative" style={{ width, height }}>
      {/* Avatar Canvas（帶 Lip Sync 效果） */}
      <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          style={{
            display: imageLoaded ? 'block' : 'none'
          }}
        />

        {/* Loading 狀態 */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">載入 Avatar...</p>
            </div>
          </div>
        )}
      </div>

      {/* 音訊元素（隱藏） */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          loop={false}
        />
      )}

      {/* 播放控制 */}
      {audioUrl && imageLoaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-sm">
          <button
            type="button"
            onClick={handlePlayPause}
            className="hover:scale-110 transition-transform text-lg"
            title={isPlaying ? '暫停' : '播放'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="hover:scale-110 transition-transform text-lg"
            title="停止"
          >
            ⏹️
          </button>
          <button
            type="button"
            onClick={handleReplay}
            className="hover:scale-110 transition-transform text-lg"
            title="重播"
          >
            🔄
          </button>
          <div className="h-4 w-px bg-white/30" />
          <span className="text-xs font-mono">
            Viseme: {currentViseme} | {(mouthOpenness * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
