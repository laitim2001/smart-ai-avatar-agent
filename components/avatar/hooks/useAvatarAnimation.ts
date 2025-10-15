/**
 * useAvatarAnimation Hook
 *
 * Custom React Hook for managing Avatar idle animations:
 * - Breathing animation (chest scale variation)
 * - Blinking animation (eyesClosed blendshape)
 *
 * Automatically plays animations when Avatar is loaded.
 * Uses useFrame from @react-three/fiber for 60fps animation loop.
 *
 * @module components/avatar/hooks/useAvatarAnimation
 */

'use client'

import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Group, Object3D, SkinnedMesh } from 'three'
import {
  calculateBreathingScale,
  BlinkController,
  ExpressionController,
  HeadNodController
} from '@/lib/avatar/animations'
import { BLENDSHAPES } from '@/lib/avatar/constants'
import { AvatarAnimationControls } from '@/types/avatar'

/**
 * Animation configuration options
 */
export interface UseAvatarAnimationOptions {
  /** Enable/disable breathing animation */
  enableBreathing?: boolean
  /** Enable/disable blinking animation */
  enableBlinking?: boolean
  /** Breathing rate in seconds (default: 4) */
  breathingRate?: number
  /** Breathing amplitude (default: 0.03) */
  breathingAmplitude?: number
}

/**
 * Custom Hook for Avatar idle animations
 *
 * Manages breathing and blinking animations using procedural animation.
 * Automatically handles node references and caching for optimal performance.
 *
 * @param avatarRef - Ref to Avatar Group (containing scene hierarchy)
 * @param options - Animation configuration options
 *
 * @example
 * ```typescript
 * function AvatarModel({ modelUrl }: AvatarModelProps) {
 *   const avatarRef = useRef<Group>(null);
 *
 *   // Enable idle animations
 *   useAvatarAnimation(avatarRef, {
 *     enableBreathing: true,
 *     enableBlinking: true
 *   });
 *
 *   return (
 *     <group ref={avatarRef}>
 *       <primitive object={scene} />
 *     </group>
 *   );
 * }
 * ```
 */
export function useAvatarAnimation(
  avatarRef: React.RefObject<Group>,
  options: UseAvatarAnimationOptions = {}
) {
  const {
    enableBreathing = true,
    enableBlinking = true,
    breathingRate = 4,
    breathingAmplitude = 0.03
  } = options

  // Animation controller instances (persisted across renders)
  const blinkController = useRef(new BlinkController())
  const smileController = useRef(new ExpressionController())
  const headNodController = useRef(new HeadNodController())

  // Cached node references (avoid repeated scene traversal)
  const chestNodeRef = useRef<Object3D | null>(null)
  const headMeshRef = useRef<SkinnedMesh | null>(null)
  const headBoneRef = useRef<Object3D | null>(null)
  const eyesClosedIndexRef = useRef<number | null>(null)
  const smileIndexRef = useRef<number | null>(null)

  // Initialize node references when Avatar loads
  useEffect(() => {
    if (!avatarRef.current) return

    // Find chest node for breathing animation
    if (enableBreathing) {
      const chestNode = avatarRef.current.getObjectByName('Spine2')
        || avatarRef.current.getObjectByName('Chest')
        || avatarRef.current.getObjectByName('Spine1')

      if (chestNode) {
        chestNodeRef.current = chestNode
        console.log('[useAvatarAnimation] Chest node found:', chestNode.name)
      } else {
        console.warn('[useAvatarAnimation] Chest node not found, breathing animation disabled')
      }
    }

    // Find head mesh for blinking and facial animations
    if (enableBlinking) {
      const headMesh = avatarRef.current.getObjectByName('Wolf3D_Head') as SkinnedMesh
        || avatarRef.current.getObjectByName('Head') as SkinnedMesh

      if (headMesh && headMesh.morphTargetDictionary && headMesh.morphTargetInfluences) {
        headMeshRef.current = headMesh

        // Find eyesClosed blendshape index
        const eyesClosedIndex = headMesh.morphTargetDictionary[BLENDSHAPES.EYES_CLOSED]

        if (eyesClosedIndex !== undefined) {
          eyesClosedIndexRef.current = eyesClosedIndex
          console.log('[useAvatarAnimation] eyesClosed blendshape found at index:', eyesClosedIndex)
        } else {
          console.warn('[useAvatarAnimation] eyesClosed blendshape not found')
        }

        // Find smile blendshape index
        const smileIndex = headMesh.morphTargetDictionary[BLENDSHAPES.SMILE]

        if (smileIndex !== undefined) {
          smileIndexRef.current = smileIndex
          console.log('[useAvatarAnimation] mouthSmile blendshape found at index:', smileIndex)
        } else {
          console.warn('[useAvatarAnimation] mouthSmile blendshape not found')
        }
      } else {
        console.warn('[useAvatarAnimation] Head mesh not found, blinking animation disabled')
      }
    }

    // Find head bone for nodding animation
    const headBone = avatarRef.current.getObjectByName('Head')

    if (headBone) {
      headBoneRef.current = headBone
      console.log('[useAvatarAnimation] Head bone found for nodding')
    } else {
      console.warn('[useAvatarAnimation] Head bone not found, nodding animation disabled')
    }
  }, [avatarRef, enableBreathing, enableBlinking])

  // Animation loop (runs every frame at 60fps)
  useFrame((state) => {
    if (!avatarRef.current) return

    const time = state.clock.getElapsedTime()

    // 1. Breathing Animation (chest scale variation)
    if (enableBreathing && chestNodeRef.current) {
      const breathScale = calculateBreathingScale(time, breathingRate, breathingAmplitude)
      chestNodeRef.current.scale.set(breathScale, breathScale, breathScale)
    }

    // 2. Blinking Animation (eyesClosed blendshape)
    if (enableBlinking && headMeshRef.current && eyesClosedIndexRef.current !== null) {
      const blinkValue = blinkController.current.update(time)

      // Update eyesClosed blendshape
      if (headMeshRef.current.morphTargetInfluences) {
        headMeshRef.current.morphTargetInfluences[eyesClosedIndexRef.current] = blinkValue
      }
    }

    // 3. Smile Animation (mouthSmile blendshape)
    if (headMeshRef.current && smileIndexRef.current !== null) {
      const smileValue = smileController.current.update(time)

      // Update mouthSmile blendshape
      if (headMeshRef.current.morphTargetInfluences) {
        headMeshRef.current.morphTargetInfluences[smileIndexRef.current] = smileValue
      }
    }

    // 4. Nod Animation (head bone rotation)
    if (headBoneRef.current) {
      const nodAngle = headNodController.current.update(time)
      headBoneRef.current.rotation.x = nodAngle
    }
  })

  // Cleanup on unmount (useFrame auto-cleanup by React Three Fiber)
  // No manual cleanup needed

  // Animation control functions
  const controls: AvatarAnimationControls = {
    smile: (intensity: number = 1.0, duration: number = 0.5) => {
      smileController.current.trigger(intensity, duration)
    },
    nod: (duration: number = 1.0, angle: number = 0.3) => {
      headNodController.current.trigger(duration, angle)
    }
  }

  return controls
}
