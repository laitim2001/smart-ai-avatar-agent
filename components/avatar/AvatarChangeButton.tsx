'use client'

import { useAvatarStore } from '@/stores/avatarStore'

/**
 * AvatarChangeButton - 觸發 Avatar 選擇器的按鈕
 *
 * 顯示在 Avatar Canvas 底部，點擊後開啟 AvatarSelector Modal。
 *
 * @component
 * @example
 * ```tsx
 * <AvatarChangeButton />
 * ```
 *
 * **視覺設計：**
 * - 固定位置：Avatar Canvas 底部居中
 * - 藍色背景，懸浮效果
 * - Emoji 圖示（🎭）+ 文字標籤
 * - 響應式設計（行動版調整大小）
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
      className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-all hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
      aria-label="切換 Avatar"
    >
      <span>🎭</span>
      <span className="text-sm">切換 Avatar</span>
    </button>
  )
}
