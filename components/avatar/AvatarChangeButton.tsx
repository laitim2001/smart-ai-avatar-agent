'use client'

import { useAvatarStore } from '@/stores/avatarStore'

/**
 * AvatarChangeButton - 觸發 Avatar 選擇器的按鈕
 *
 * 顯示在畫面右上角，點擊後開啟 AvatarSelector Modal。
 *
 * @component
 * @example
 * ```tsx
 * <AvatarChangeButton />
 * ```
 *
 * **視覺設計：**
 * - 固定位置：畫面右上角
 * - 藍色背景，懸浮效果
 * - Emoji 圖示（🎭）+ 文字標籤
 * - 響應式設計（行動版縮小按鈕）
 *
 * **互動行為：**
 * - 點擊觸發 toggleSelector()
 * - 懸浮時顏色變深（視覺回饋）
 *
 * **可訪問性：**
 * - aria-label 提供語義化標籤
 * - 鍵盤可聚焦與操作
 */
export default function AvatarChangeButton() {
  const toggleSelector = useAvatarStore((state) => state.toggleSelector)

  return (
    <button
      onClick={toggleSelector}
      className="fixed top-6 right-6 z-40 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-colors font-medium"
      aria-label="Change avatar"
    >
      🎭 Change Avatar
    </button>
  )
}
