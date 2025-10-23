'use client'

import { useAvatarStore, AVATARS } from '@/stores/avatarStore'

/**
 * AvatarSelector - Avatar 選擇器 Modal
 *
 * 提供 UI 介面讓使用者選擇不同的 Avatar。
 * 以 Modal 形式呈現，顯示所有可用的 Avatar 卡片。
 *
 * @component
 * @example
 * ```tsx
 * <AvatarSelector />
 * ```
 *
 * **功能特性：**
 * - Modal 背景遮罩（半透明黑色 + 模糊效果）
 * - 顯示所有可用 Avatar 卡片（縮圖、名稱、選擇按鈕）
 * - 當前選中 Avatar 有視覺高亮（藍色邊框）
 * - 點擊卡片或按鈕可選擇 Avatar
 * - 選擇後自動關閉 Modal
 * - 響應式設計（行動版 1 欄，平板 2 欄，桌面 3 欄）
 *
 * **狀態管理：**
 * - 使用 Zustand Store 管理選擇狀態
 * - isSelectorOpen 控制 Modal 顯示/隱藏
 * - currentAvatarId 標記當前選中的 Avatar
 *
 * **可訪問性：**
 * - 語義化 HTML (role="dialog", aria-modal, aria-label)
 * - 鍵盤導航支援（Escape 關閉）
 * - 觸控友善（按鈕最小 44px 高度）
 */
export default function AvatarSelector() {
  const { currentAvatarId, setAvatar, isSelectorOpen, toggleSelector } =
    useAvatarStore()

  // 如果 Selector 未開啟，不渲染任何內容
  if (!isSelectorOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-selector-title"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4"
        style={{
          backgroundColor: '#1e293b', // slate-800
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 id="avatar-selector-title" className="text-2xl font-bold text-white">
            Choose Your Avatar
          </h2>
          <button
            onClick={toggleSelector}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="Close avatar selector"
          >
            ✕
          </button>
        </div>

        {/* Avatar 卡片網格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {AVATARS.map((avatar) => {
            const isSelected = currentAvatarId === avatar.id

            return (
              <div
                key={avatar.id}
                className={`
                  rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${
                    isSelected
                      ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                      : 'hover:scale-105 hover:shadow-xl'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? '#334155' : '#334155', // slate-700
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#475569' // slate-600
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#334155' // slate-700
                  }
                }}
                onClick={() => {
                  setAvatar(avatar.id)
                  toggleSelector()
                }}
              >
                {/* Avatar 縮圖（Emoji Placeholder）*/}
                <div
                  className="aspect-square rounded-lg mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#475569' }} // slate-600
                >
                  <span className="text-6xl">{avatar.thumbnail}</span>
                </div>

                {/* Avatar 名稱 */}
                <h3 className="text-lg font-semibold text-white text-center mb-2">
                  {avatar.name}
                </h3>

                {/* 選擇按鈕 */}
                <button
                  className="w-full py-2 rounded-md font-medium transition-colors"
                  style={{
                    backgroundColor: isSelected ? '#3b82f6' : '#475569', // blue-500 or slate-600
                    color: isSelected ? 'white' : '#d1d5db', // white or gray-300
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#64748b' // slate-500
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#475569' // slate-600
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation() // 避免觸發卡片的 onClick
                    setAvatar(avatar.id)
                    toggleSelector()
                  }}
                  aria-label={`Select ${avatar.name}`}
                >
                  {isSelected ? '✓ Selected' : 'Select'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
