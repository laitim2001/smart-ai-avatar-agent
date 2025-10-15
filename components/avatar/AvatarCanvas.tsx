'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AvatarModel from './AvatarModel'
import { AvatarLoader, AvatarError } from './AvatarLoadingState'
import { DEFAULT_AVATAR_URL } from '@/lib/avatar/constants'

/**
 * AvatarCanvas - Three.js 3D 場景容器組件
 *
 * 提供 3D Avatar 渲染場景，包含基本燈光、相機設定與互動控制。
 * 整合 Ready Player Me Avatar 模型載入與錯誤處理。
 *
 * @component
 * @example
 * ```tsx
 * <AvatarCanvas />
 * ```
 *
 * **場景配置:**
 * - 相機位置: [0, 1.5, 2] - 模擬視訊通話視角
 * - FOV: 50 度 - 自然視角
 * - 燈光: 環境光 + 方向光 - 提供柔和照明與陰影
 * - 控制: OrbitControls - 開發階段用於檢視不同角度
 *
 * **Avatar 配置:**
 * - 位置: [0, -1, 0] - 將 Avatar 下移，使頭部在視野中心
 * - 縮放: 1 - 預設尺寸
 * - 載入狀態: Suspense 整合，自動顯示載入 Spinner
 * - 錯誤處理: 載入失敗時顯示錯誤訊息
 *
 * **效能優化:**
 * - powerPreference: 'high-performance' - 優先使用獨立 GPU
 * - Shadow map: 1024x1024 - 平衡品質與效能
 * - Antialias: true - 提升邊緣平滑度
 *
 * @requires three
 * @requires @react-three/fiber
 * @requires @react-three/drei
 */
export default function AvatarCanvas() {
  // Avatar 狀態管理
  const [currentAvatarUrl] = useState(DEFAULT_AVATAR_URL)
  const [loadError, setLoadError] = useState<string | null>(null)

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        shadows
        camera={{
          position: [0, 1.5, 2],
          fov: 50
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        {/* 環境光 - 提供均勻基礎照明，避免場景過暗 */}
        <ambientLight intensity={0.5} />

        {/* 方向光 - 模擬主光源（如太陽光），從右上方照射 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />

        {/* OrbitControls - 開發階段用於旋轉、縮放視角 */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={1}
          maxDistance={5}
          target={[0, 1, 0]}
        />

        {/* Avatar 模型載入 */}
        {/* Suspense 提供載入狀態管理，fallback 顯示載入 Spinner */}
        <Suspense fallback={<AvatarLoader />}>
          {loadError ? (
            // 載入失敗時顯示錯誤訊息
            <AvatarError message={loadError} />
          ) : (
            // Ready Player Me Avatar 模型
            <AvatarModel
              modelUrl={currentAvatarUrl}
              position={[0, -1, 0]}  // Y軸下移1單位，使頭部在視野中心
              scale={1}              // 預設縮放，可依實際需求調整
              onLoad={(model) => {
                console.log('[AvatarCanvas] Avatar loaded successfully:', {
                  children: model.children.length,
                  position: model.position,
                })
                setLoadError(null)
              }}
              onError={(error) => {
                console.error('[AvatarCanvas] Avatar load error:', error)
                setLoadError(error.message)
              }}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
