import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AVATAR_URLS } from '@/lib/avatar/constants'

/**
 * Avatar 資訊介面
 */
export interface AvatarInfo {
  id: string
  name: string
  url: string
  thumbnail: string
  description?: string
  category?: 'male' | 'female' | 'neutral'
  tags?: string[]
}

/**
 * Avatar 狀態介面
 */
export interface AvatarState {
  /** 當前選中的 Avatar ID */
  currentAvatarId: string
  /** 當前選中的 Avatar URL */
  currentAvatarUrl: string
  /** 可用的 Avatar 列表 */
  availableAvatars: AvatarInfo[]
  /** Selector 是否開啟 */
  isSelectorOpen: boolean
  /** 是否正在載入 */
  isLoading: boolean
  /** 設定 Avatar */
  setAvatar: (avatarId: string, saveToServer?: boolean) => Promise<void>
  /** 載入 Avatar 列表 */
  loadAvatars: () => Promise<void>
  /** 從伺服器載入使用者偏好 */
  loadUserPreferences: () => Promise<void>
  /** 切換 Selector 顯示/隱藏 */
  toggleSelector: () => void
}

/**
 * Avatar 清單
 *
 * POC 階段使用 Emoji placeholder 作為縮圖。
 * 正式版可使用：
 * - Ready Player Me API 取得縮圖
 * - Three.js 渲染縮圖
 * - 手動截圖並上傳
 */
export const AVATARS: AvatarInfo[] = [
  {
    id: 'avatar1',
    name: 'Alex',
    url: AVATAR_URLS.avatar1,
    thumbnail: '👨', // Emoji placeholder
  },
  {
    id: 'avatar2',
    name: 'Jordan',
    url: AVATAR_URLS.avatar2,
    thumbnail: '👩', // Emoji placeholder
  },
  {
    id: 'avatar3',
    name: 'Casey',
    url: AVATAR_URLS.avatar3,
    thumbnail: '🧑', // Emoji placeholder
  },
]

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
    (set, get) => ({
      // 初始狀態
      currentAvatarId: 'avatar1',
      currentAvatarUrl: AVATAR_URLS.avatar1,
      availableAvatars: AVATARS,
      isSelectorOpen: false,
      isLoading: false,

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

      toggleSelector: () => {
        set((state) => ({ isSelectorOpen: !state.isSelectorOpen }))
      },
    }),
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
