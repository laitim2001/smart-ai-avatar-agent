import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AVATARS_METADATA, type AvatarMetadata } from '@/lib/avatar/constants'

/**
 * Avatar 資訊介面
 * @deprecated 使用 AvatarMetadata 替代
 */
export interface AvatarInfo {
  id: string
  name: string
  url: string
  thumbnail: string
  description?: string
  category?: 'male' | 'female' | 'neutral'
  tags?: string[]
  featured?: boolean
  popularity?: number
}

/**
 * Re-export AvatarMetadata for convenience
 */
export type { AvatarMetadata }

/**
 * Avatar 狀態介面
 * Sprint 5: 擴充支援完整 Avatar 元數據與收藏功能
 */
export interface AvatarState {
  /** 當前選中的 Avatar ID */
  currentAvatarId: string
  /** 當前選中的 Avatar URL */
  currentAvatarUrl: string
  /** 可用的 Avatar 列表 */
  availableAvatars: AvatarMetadata[]
  /** 已收藏的 Avatar IDs (Sprint 5 Phase 2.2) */
  favoriteAvatarIds: string[]
  /** Selector 是否開啟 */
  isSelectorOpen: boolean
  /** 是否正在載入 */
  isLoading: boolean
  /** 是否正在處理收藏操作 */
  isFavoriteLoading: boolean
  /** 設定 Avatar */
  setAvatar: (avatarId: string, saveToServer?: boolean) => Promise<void>
  /** 載入 Avatar 列表 */
  loadAvatars: () => Promise<void>
  /** 從伺服器載入使用者偏好 */
  loadUserPreferences: () => Promise<void>
  /** 載入使用者收藏列表 (Sprint 5 Phase 2.2) */
  loadFavorites: () => Promise<void>
  /** 切換收藏狀態 (Sprint 5 Phase 2.2) */
  toggleFavorite: (avatarId: string) => Promise<void>
  /** 檢查是否已收藏 (Sprint 5 Phase 2.2) */
  isFavorite: (avatarId: string) => boolean
  /** 切換 Selector 顯示/隱藏 */
  toggleSelector: () => void
}

/**
 * Avatar 清單
 * Sprint 5: 使用 AVATARS_METADATA (11 個 Avatar)
 *
 * @deprecated 直接使用 AVATARS_METADATA 替代
 */
export const AVATARS: AvatarMetadata[] = AVATARS_METADATA

/**
 * Avatar Zustand Store
 *
 * 管理 Avatar 選擇狀態，包含狀態持久化（localStorage）與伺服器同步。
 *
 * @example
 * ```typescript
 * // 訂閱當前 Avatar URL
 * const currentAvatarUrl = useAvatarStore((state) => state.currentAvatarUrl);
 *
 * // 載入 Avatar 列表
 * const loadAvatars = useAvatarStore((state) => state.loadAvatars);
 * await loadAvatars();
 *
 * // 切換 Avatar (自動同步到伺服器)
 * const setAvatar = useAvatarStore((state) => state.setAvatar);
 * await setAvatar('alex', true);
 * ```
 */
export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => {
      // 檢查並清除舊的無效 Avatar URL
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('avatar-storage')
          if (stored) {
            const parsed = JSON.parse(stored)
            const state = parsed.state

            // 檢查是否包含舊的無效 URL
            if (state?.currentAvatarUrl && state.currentAvatarUrl.includes('65c3d4e5f6a7b8c9d0e1f2a3')) {
              console.log('[AvatarStore] 偵測到無效的舊 Avatar URL,正在清除快取...')
              localStorage.removeItem('avatar-storage')
            }
          }
        } catch (error) {
          console.error('[AvatarStore] 清除舊快取失敗:', error)
        }
      }

      return {
        // 初始狀態
        currentAvatarId: AVATARS_METADATA[0].id,
        currentAvatarUrl: AVATARS_METADATA[0].url,
        availableAvatars: AVATARS_METADATA,
        favoriteAvatarIds: [], // Sprint 5 Phase 2.2
        isSelectorOpen: false,
        isLoading: false,
        isFavoriteLoading: false, // Sprint 5 Phase 2.2

      // Actions
      /**
       * 設定 Avatar
       * @param avatarId - Avatar ID
       * @param saveToServer - 是否儲存到伺服器 (預設 false)
       */
      setAvatar: async (avatarId: string, saveToServer = false) => {
        const { availableAvatars } = get()
        const avatar = availableAvatars.find((a) => a.id === avatarId)

        if (!avatar) {
          console.warn(`[AvatarStore] Avatar ID "${avatarId}" not found`)
          return
        }

        // 更新本地狀態
        set({
          currentAvatarId: avatarId,
          currentAvatarUrl: avatar.url,
        })

        // 如果需要,同步到伺服器
        if (saveToServer) {
          try {
            const response = await fetch('/api/user/preferences', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                defaultAvatarId: avatarId,
                defaultAvatarUrl: avatar.url,
              }),
            })

            if (!response.ok) {
              throw new Error('儲存 Avatar 偏好失敗')
            }
          } catch (error) {
            console.error('[AvatarStore] 儲存失敗:', error)
          }
        }
      },

      /**
       * 從 API 載入 Avatar 列表
       */
      loadAvatars: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/avatars')
          const data = await response.json()

          if (response.ok && data.avatars) {
            set({ availableAvatars: data.avatars })
          }
        } catch (error) {
          console.error('[AvatarStore] 載入 Avatar 列表失敗:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * 從伺服器載入使用者偏好設定
       */
      loadUserPreferences: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch('/api/user/preferences')
          const data = await response.json()

          if (
            response.ok &&
            data.preferences?.defaultAvatarId &&
            data.preferences?.defaultAvatarUrl
          ) {
            set({
              currentAvatarId: data.preferences.defaultAvatarId,
              currentAvatarUrl: data.preferences.defaultAvatarUrl,
            })
          }
        } catch (error) {
          console.error('[AvatarStore] 載入使用者偏好失敗:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      /**
       * 載入使用者收藏列表 (Sprint 5 Phase 2.2)
       */
      loadFavorites: async () => {
        try {
          const response = await fetch('/api/user/favorites')
          const data = await response.json()

          if (response.ok && data.favorites) {
            const favoriteIds = data.favorites.map(
              (fav: { avatarId: string }) => fav.avatarId
            )
            set({ favoriteAvatarIds: favoriteIds })
          }
        } catch (error) {
          console.error('[AvatarStore] 載入收藏列表失敗:', error)
        }
      },

      /**
       * 切換收藏狀態 (Sprint 5 Phase 2.2)
       */
      toggleFavorite: async (avatarId: string) => {
        const { favoriteAvatarIds } = get()
        const isFavorited = favoriteAvatarIds.includes(avatarId)

        // 樂觀更新 UI
        set({
          isFavoriteLoading: true,
          favoriteAvatarIds: isFavorited
            ? favoriteAvatarIds.filter((id) => id !== avatarId)
            : [...favoriteAvatarIds, avatarId],
        })

        try {
          const response = await fetch(`/api/avatars/${avatarId}/favorite`, {
            method: isFavorited ? 'DELETE' : 'POST',
          })

          if (!response.ok) {
            // 如果失敗,還原狀態
            set({ favoriteAvatarIds })
            throw new Error('收藏操作失敗')
          }
        } catch (error) {
          console.error('[AvatarStore] 收藏操作失敗:', error)
          // 還原狀態
          set({ favoriteAvatarIds })
        } finally {
          set({ isFavoriteLoading: false })
        }
      },

      /**
       * 檢查是否已收藏 (Sprint 5 Phase 2.2)
       */
      isFavorite: (avatarId: string) => {
        const { favoriteAvatarIds } = get()
        return favoriteAvatarIds.includes(avatarId)
      },

        toggleSelector: () => {
          set((state) => ({ isSelectorOpen: !state.isSelectorOpen }))
        },
      }
    },
    {
      name: 'avatar-storage', // localStorage key
      // 只持久化必要狀態
      partialize: (state) => ({
        currentAvatarId: state.currentAvatarId,
        currentAvatarUrl: state.currentAvatarUrl,
      }),
    }
  )
)
