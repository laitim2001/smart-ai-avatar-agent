'use client'

/**
 * 臨時的快取清除按鈕組件
 * 用於清除 localStorage 中的舊 Avatar 數據
 */

export function ClearCacheButton() {
  const handleClearCache = () => {
    try {
      // 清除 avatar-storage (Zustand persist)
      localStorage.removeItem('avatar-storage')

      // 清除其他可能的 Avatar 快取
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('avatar') || key.includes('Avatar'))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))

      console.log('✅ 已清除 localStorage 快取:', keysToRemove)
      alert('✅ 快取已清除，頁面即將重新整理...')

      // 重新整理頁面
      window.location.reload()
    } catch (error) {
      console.error('❌ 清除快取失敗:', error)
      alert('❌ 清除快取失敗，請手動重新整理頁面')
    }
  }

  return (
    <button
      onClick={handleClearCache}
      className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
      title="清除 Avatar 快取並重新載入"
    >
      🔄 清除快取
    </button>
  )
}
