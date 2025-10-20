/**
 * Avatar Control Panel
 *
 * 測試 UI 控制面板，用於觸發 Avatar 的表情與動作動畫。
 * POC 階段用於驗證動畫功能，正式版可移除或保留為開發工具。
 */

'use client'

import { AvatarAnimationControls } from '@/types/avatar'

interface AvatarControlPanelProps {
  avatarRef: React.RefObject<AvatarAnimationControls | null>
}

export default function AvatarControlPanel({ avatarRef }: AvatarControlPanelProps) {
  const handleSmile = () => {
    avatarRef.current?.smile(1.0, 0.5)
  }

  const handleNod = () => {
    avatarRef.current?.nod(1.0)
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-xl">
        <h3 className="text-white text-sm font-semibold mb-3">Avatar Controls</h3>
        <div className="flex gap-3">
          <button
            onClick={handleSmile}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium"
            aria-label="Trigger smile animation"
          >
            😊 Smile
          </button>
          <button
            onClick={handleNod}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm font-medium"
            aria-label="Trigger nod animation"
          >
            👍 Nod
          </button>
        </div>
      </div>
    </div>
  )
}
