'use client'

/**
 * Avatar Preview Modal Component
 * Sprint 5 Phase 3: 360° 預覽模式 - 全螢幕 Avatar 預覽
 */

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { X, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import AvatarModel from './AvatarModel'
import { AvatarLoader, AvatarError } from './AvatarLoadingState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AvatarAnimationControls } from '@/types/avatar'
import { type AvatarMetadata } from '@/stores/avatarStore'

interface AvatarPreviewModalProps {
  /** Avatar 元數據 */
  avatar: AvatarMetadata
  /** 是否開啟 */
  isOpen: boolean
  /** 關閉回調 */
  onClose: () => void
}

export default function AvatarPreviewModal({
  avatar,
  isOpen,
  onClose,
}: AvatarPreviewModalProps) {
  const avatarRef = useRef<AvatarAnimationControls>(null)
  const controlsRef = useRef<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 鍵盤快捷鍵處理
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 關閉
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (!controlsRef.current) return

      const rotateSpeed = 0.1
      const zoomSpeed = 0.2

      switch (e.key) {
        case 'ArrowLeft':
          // 左箭頭：向左旋轉
          e.preventDefault()
          controlsRef.current.setAzimuthalAngle(
            controlsRef.current.getAzimuthalAngle() + rotateSpeed
          )
          break

        case 'ArrowRight':
          // 右箭頭：向右旋轉
          e.preventDefault()
          controlsRef.current.setAzimuthalAngle(
            controlsRef.current.getAzimuthalAngle() - rotateSpeed
          )
          break

        case 'ArrowUp':
          // 上箭頭：向上旋轉
          e.preventDefault()
          controlsRef.current.setPolarAngle(
            Math.max(
              0,
              controlsRef.current.getPolarAngle() - rotateSpeed
            )
          )
          break

        case 'ArrowDown':
          // 下箭頭：向下旋轉
          e.preventDefault()
          controlsRef.current.setPolarAngle(
            Math.min(
              Math.PI,
              controlsRef.current.getPolarAngle() + rotateSpeed
            )
          )
          break

        case '+':
        case '=':
          // 放大
          e.preventDefault()
          controlsRef.current.dollyIn(zoomSpeed)
          controlsRef.current.update()
          break

        case '-':
          // 縮小
          e.preventDefault()
          controlsRef.current.dollyOut(zoomSpeed)
          controlsRef.current.update()
          break

        case 'r':
        case 'R':
          // 重置視角
          e.preventDefault()
          controlsRef.current.reset()
          break

        case 'f':
        case 'F':
          // 切換全螢幕
          e.preventDefault()
          setIsFullscreen(!isFullscreen)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isFullscreen])

  // 重置視角
  const handleReset = () => {
    controlsRef.current?.reset()
  }

  // 放大
  const handleZoomIn = () => {
    controlsRef.current?.dollyIn(0.2)
    controlsRef.current?.update()
  }

  // 縮小
  const handleZoomOut = () => {
    controlsRef.current?.dollyOut(0.2)
    controlsRef.current?.update()
  }

  // 動畫觸發
  const handleSmile = () => avatarRef.current?.smile(1.0, 0.5)
  const handleNod = () => avatarRef.current?.nod(1.0, 0.3)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" data-testid="preview-modal">
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        title="關閉 (ESC)"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* 控制工具列 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          title="重置視角 (R)"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          title="放大 (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          title="縮小 (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          title="切換全螢幕 (F)"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* 動畫控制面板 */}
      <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 p-4 bg-white/10 backdrop-blur-md border-white/20">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSmile}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            😊 微笑
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNod}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            👍 點頭
          </Button>
        </div>
      </Card>

      {/* 快捷鍵說明 */}
      <Card className="absolute bottom-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-md border-white/20 text-white text-xs">
        <div className="space-y-1">
          <p className="font-semibold mb-2">快捷鍵</p>
          <p>← → ↑ ↓: 旋轉</p>
          <p>+ -: 縮放</p>
          <p>R: 重置視角</p>
          <p>F: 全螢幕</p>
          <p>ESC: 關閉</p>
        </div>
      </Card>

      {/* Avatar 資訊 */}
      <Card className="absolute top-4 left-4 z-10 p-3 bg-white/10 backdrop-blur-md border-white/20 text-white">
        <h3 className="font-semibold text-lg">{avatar.name}</h3>
        {avatar.nameEn && (
          <p className="text-sm text-white/80">{avatar.nameEn}</p>
        )}
        {avatar.description && (
          <p className="text-xs text-white/70 mt-2 max-w-xs">
            {avatar.description.split('\n')[0]}
          </p>
        )}
      </Card>

      {/* 3D Canvas */}
      <div
        className={`${
          isFullscreen ? 'w-full h-full' : 'w-[90vw] h-[90vh]'
        } transition-all duration-300`}
      >
        <Canvas
          shadows
          camera={{
            position: [0, 1.5, 2],
            fov: 50,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
        >
          {/* 燈光 */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          {/* OrbitControls */}
          <OrbitControls
            ref={controlsRef}
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            enableDamping={true}
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            minDistance={1}
            maxDistance={5}
            target={[0, 1, 0]}
          />

          {/* Avatar */}
          <Suspense fallback={<AvatarLoader />}>
            {loadError ? (
              <AvatarError message={loadError} />
            ) : (
              <AvatarModel
                ref={avatarRef}
                modelUrl={avatar.url}
                position={[0, -1, 0]}
                scale={1}
                onLoad={(model) => {
                  console.log('[PreviewModal] Avatar loaded:', avatar.name)
                  setLoadError(null)
                }}
                onError={(error) => {
                  console.error('[PreviewModal] Avatar load error:', error)
                  setLoadError(error.message)
                }}
              />
            )}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}
