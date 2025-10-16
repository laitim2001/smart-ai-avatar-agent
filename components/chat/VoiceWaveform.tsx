/**
 * VoiceWaveform Component
 *
 * 語音波形視覺化組件
 * 使用 Canvas 繪製即時音訊波形
 */

'use client'

import { useRef, useEffect } from 'react'

interface VoiceWaveformProps {
  /** 波形資料（0-255 的音量陣列） */
  waveformData: Uint8Array
  /** Canvas 寬度 */
  width?: number
  /** Canvas 高度 */
  height?: number
  /** 波形顏色 */
  color?: string
  /** 背景顏色 */
  backgroundColor?: string
  /** 自訂樣式 */
  className?: string
}

/**
 * VoiceWaveform 組件
 */
export function VoiceWaveform({
  waveformData,
  width = 300,
  height = 60,
  color = '#ef4444', // red-500
  backgroundColor = 'transparent',
  className = '',
}: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空 Canvas
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    if (waveformData.length === 0) {
      // 沒有資料時顯示靜態線
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()
      return
    }

    // 繪製波形
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    const sliceWidth = width / waveformData.length
    let x = 0

    for (let i = 0; i < waveformData.length; i++) {
      // 正規化音量值（0-255 → 0-1）
      const v = waveformData[i] / 255.0
      // 轉換為 Canvas 座標
      const y = v * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()
  }, [waveformData, width, height, color, backgroundColor])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded ${className}`}
    />
  )
}
