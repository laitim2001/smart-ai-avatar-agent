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
}

/**
 * Avatar 狀態介面
 */
export interface AvatarState {
  /** 當前選中的 Avatar ID */
  currentAvatarId: string
  /** 當前選中的 Avatar URL */
  currentAvatarUrl: string
  /** Selector 是否開啟 */
  isSelectorOpen: boolean
  /** 設定 Avatar */
  setAvatar: (avatarId: string) => void
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
 * 管理 Avatar 選擇狀態，包含狀態持久化（localStorage）。
 *
 * @example
 * ```typescript
 * // 訂閱當前 Avatar URL
 * const currentAvatarUrl = useAvatarStore((state) => state.currentAvatarUrl);
 *
 * // 訂閱特定 action
 * const setAvatar = useAvatarStore((state) => state.setAvatar);
 *
 * // 切換 Avatar
 * setAvatar('avatar2');
 * ```
 */
export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      // 初始狀態
      currentAvatarId: 'avatar1',
      currentAvatarUrl: AVATAR_URLS.avatar1,
      isSelectorOpen: false,

      // Actions
      setAvatar: (avatarId: string) => {
        const avatar = AVATARS.find((a) => a.id === avatarId)
        if (avatar) {
          set({
            currentAvatarId: avatarId,
            currentAvatarUrl: avatar.url,
          })
        } else {
          console.warn(`[AvatarStore] Avatar ID "${avatarId}" not found`)
        }
      },

      toggleSelector: () => {
        set((state) => ({ isSelectorOpen: !state.isSelectorOpen }))
      },
    }),
    {
      name: 'avatar-storage', // localStorage key
      // 只持久化 currentAvatarId，不持久化 isSelectorOpen
      partialize: (state) => ({
        currentAvatarId: state.currentAvatarId,
        currentAvatarUrl: state.currentAvatarUrl,
      }),
    }
  )
)
