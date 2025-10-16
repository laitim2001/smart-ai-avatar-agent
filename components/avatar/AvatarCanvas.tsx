'use client'

import { Suspense, useState, useRef, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import AvatarModel from './AvatarModel'
import AvatarControlPanel from './AvatarControlPanel'
import { AvatarLoader, AvatarError } from './AvatarLoadingState'
import { useAvatarStore } from '@/stores/avatarStore'
import { AvatarAnimationControls } from '@/types/avatar'
import { getPerformanceConfig, logDeviceInfo } from '@/lib/device/detection'

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
  // 從 Zustand Store 取得當前 Avatar URL
  const currentAvatarUrl = useAvatarStore((state) => state.currentAvatarUrl)

  // 錯誤狀態
  const [loadError, setLoadError] = useState<string | null>(null)

  // Avatar 動畫控制 ref
  const avatarModelRef = useRef<AvatarAnimationControls>(null)

  // 淡入淡出過渡效果狀態
  const [isTransitioning, setIsTransitioning] = useState(false)

  // 效能配置 (根據裝置自動調整)
  const performanceConfig = useMemo(() => {
    return getPerformanceConfig()
  }, [])

  // 記錄裝置資訊 (僅開發環境)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logDeviceInfo()
    }
  }, [])

  // Avatar URL 變更時觸發過渡效果
  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 300) // 300ms 淡入淡出

    return () => clearTimeout(timer)
  }, [currentAvatarUrl])

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 relative">
      <Canvas
        className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        shadows={performanceConfig.shadows}
        camera={{
          position: [0, 1.5, 2],
          fov: 50
        }}
        dpr={performanceConfig.pixelRatio}
        gl={{
          antialias: performanceConfig.antialias,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* 環境光 - 提供均勻基礎照明，避免場景過暗 */}
        <ambientLight intensity={0.6} />

        {/* 方向光 - 模擬主光源，根據效能等級調整陰影解析度 */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow={performanceConfig.shadows}
          shadow-mapSize={[performanceConfig.shadowMapSize, performanceConfig.shadowMapSize]}
          shadow-camera-far={15}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* OrbitControls - 支援桌面與觸控操作 */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}              // 禁用 Pan (避免誤觸)
          enableRotate={true}
          enableDamping={true}            // 啟用慣性滑動
          dampingFactor={0.05}            // 慣性因子
          rotateSpeed={performanceConfig.tier === 'low' ? 0.3 : 0.5}  // 低階裝置降低速度
          zoomSpeed={0.5}                 // 縮放速度
          minDistance={1}
          maxDistance={5}
          target={[0, 1, 0]}
          touches={{
            ONE: 2,    // TOUCH.ROTATE - 單指旋轉
            TWO: 3,    // TOUCH.DOLLY - 雙指捏合縮放
          }}
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
              key={currentAvatarUrl}  // URL 變更時強制重新掛載組件
              ref={avatarModelRef}
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

      {/* Avatar 動畫控制面板 */}
      <AvatarControlPanel avatarRef={avatarModelRef} />
    </div>
  )
}
