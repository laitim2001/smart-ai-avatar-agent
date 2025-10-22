'use client'

/**
 * Avatar Preview Component
 * 3D Avatar 預覽元件
 */

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import AvatarModel from './AvatarModel'

interface AvatarPreviewProps {
  /** Avatar URL */
  avatarUrl: string
  /** 預覽高度 */
  height?: number
  /** 是否顯示控制項 */
  showControls?: boolean
}

export default function AvatarPreview({
  avatarUrl,
  height = 400,
  showControls = false,
}: AvatarPreviewProps) {

  return (
    <div className="relative rounded-lg overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200">
      <Canvas
        style={{ height: `${height}px` }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 相機 */}
        <PerspectiveCamera makeDefault position={[0, 1.5, 2.5]} fov={50} />

        {/* 光源 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />

        {/* Avatar 模型 */}
        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial color="#cccccc" />
            </mesh>
          }
        >
          <AvatarModel modelUrl={avatarUrl} />
        </Suspense>

        {/* 地板 */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial opacity={0.2} />
        </mesh>

        {/* 軌道控制 */}
        {showControls && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1.5}
            maxDistance={5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
            target={[0, 1, 0]}
          />
        )}
      </Canvas>

      {/* 載入提示 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-600 shadow">
          {showControls
            ? '拖曳旋轉 • 滾輪縮放'
            : '3D Avatar 預覽'}
        </div>
      </div>
    </div>
  )
}
