'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'

/**
 * AvatarCanvas - Three.js 3D 場景容器組件
 *
 * 提供 3D Avatar 渲染場景，包含基本燈光、相機設定與互動控制。
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

        {/* 測試立方體 - 驗證 3D 渲染正常運作 */}
        {/* 注意: 此為臨時測試物件，後續將替換為 Avatar 模型 (Story 2.2) */}
        <Box args={[1, 1, 1]} position={[0, 1, 0]}>
          <meshStandardMaterial color="hotpink" />
        </Box>
      </Canvas>
    </div>
  )
}
