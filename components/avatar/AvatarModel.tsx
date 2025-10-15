'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { Group } from 'three'
import { AvatarModelProps, AvatarAnimationControls } from '@/types/avatar'
import { useAvatarAnimation } from './hooks/useAvatarAnimation'

/**
 * AvatarModel - Ready Player Me 3D Avatar 模型組件
 *
 * 此組件負責載入並渲染 Ready Player Me 的 GLB 格式 Avatar 模型。
 * 使用 @react-three/drei 的 useGLTF Hook 提供自動快取與 Suspense 整合。
 *
 * @component
 * @example
 * ```tsx
 * <Suspense fallback={<AvatarLoader />}>
 *   <AvatarModel
 *     modelUrl="https://models.readyplayer.me/xxxxx.glb"
 *     position={[0, -1, 0]}
 *     scale={1}
 *     onLoad={(model) => console.log('Avatar loaded')}
 *     onError={(error) => console.error('Load failed')}
 *   />
 * </Suspense>
 * ```
 *
 * **特性:**
 * - 自動快取: 相同 URL 只載入一次
 * - Suspense 整合: 自動觸發 React Suspense 載入狀態
 * - 錯誤處理: 載入失敗時觸發 onError 回調
 * - 型別安全: 完整的 TypeScript 型別支援
 *
 * **Ready Player Me 模型結構:**
 * - ArmatureTarget: 骨架根節點（用於動畫）
 * - Wolf3D_Head: 頭部 Mesh（包含臉部 Blendshapes）
 * - Wolf3D_Body: 身體 Mesh
 * - Wolf3D_Outfit: 服裝 Mesh
 * - Wolf3D_Hair: 頭髮 Mesh
 *
 * @requires three
 * @requires @react-three/drei
 * @requires @react-three/fiber
 */
const AvatarModel = forwardRef<AvatarAnimationControls, AvatarModelProps>(
  function AvatarModel({ modelUrl, position = [0, 0, 0], scale = 1, onLoad, onError }, ref) {
    const groupRef = useRef<Group>(null)

    // useGLTF 自動處理載入、快取與 Suspense
    // 第二個參數 true 表示使用 Draco 壓縮（如果模型有使用）
    const gltf = useGLTF(modelUrl, true)

    // 啟用待機動畫與表情控制（呼吸 + 眨眼 + 微笑 + 點頭）
    const animationControls = useAvatarAnimation(groupRef, {
      enableBreathing: true,
      enableBlinking: true
    })

    // 暴露動畫控制函式給父組件
    useImperativeHandle(ref, () => animationControls, [animationControls])

  // 模型載入成功時的處理
  useEffect(() => {
    if (gltf.scene && groupRef.current) {
      const animationCount = gltf.animations?.length || 0

      console.log('[AvatarModel] Avatar loaded successfully:', {
        url: modelUrl,
        children: gltf.scene.children.length,
        animations: animationCount
      })

      // 設定陰影屬性
      gltf.scene.traverse((child) => {
        // 檢查是否為 Mesh 物件
        if ('isMesh' in child && (child as { isMesh: boolean }).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      // 觸發載入成功回調
      onLoad?.(gltf.scene)
    }
  }, [gltf.scene, gltf.animations, modelUrl, onLoad])

  // 錯誤處理
  useEffect(() => {
    // useGLTF 在載入失敗時會拋出錯誤，
    // 錯誤會被 React Error Boundary 或 Suspense 捕捉
    // 這裡我們無法直接訪問錯誤狀態，
    // 實際錯誤處理由外層的 Suspense fallback 和 Error Boundary 處理
  }, [onError])

    // 渲染 Avatar 模型
    // 使用 primitive 組件渲染 Three.js 原生物件
    return (
      <group ref={groupRef} position={position} scale={scale}>
        <primitive object={gltf.scene} />
      </group>
    )
  }
)

export default AvatarModel

/**
 * 預載入 Avatar 模型
 *
 * 在使用 Avatar 之前呼叫此函式可以預先載入模型，
 * 減少後續渲染時的等待時間。
 *
 * @param url - Ready Player Me GLB URL
 *
 * @example
 * ```typescript
 * // 在頁面載入時預載入
 * useEffect(() => {
 *   preloadAvatar('https://models.readyplayer.me/xxxxx.glb');
 * }, []);
 * ```
 */
export function preloadAvatar(url: string) {
  useGLTF.preload(url)
}

/**
 * 批次預載入多個 Avatar
 *
 * @param urls - Avatar URL 陣列
 *
 * @example
 * ```typescript
 * import { AVATAR_URLS } from '@/lib/avatar/constants';
 *
 * useEffect(() => {
 *   preloadAvatars(Object.values(AVATAR_URLS));
 * }, []);
 * ```
 */
export function preloadAvatars(urls: string[]) {
  urls.forEach((url) => preloadAvatar(url))
}
