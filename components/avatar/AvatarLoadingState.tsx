'use client'

import { Html, useProgress } from '@react-three/drei'

/**
 * AvatarLoader - Avatar 載入中的 Spinner 組件
 *
 * 顯示在 3D 場景中的載入進度指示器。
 * 使用 @react-three/drei 的 useProgress Hook 追蹤載入進度。
 *
 * @component
 * @example
 * ```tsx
 * <Suspense fallback={<AvatarLoader />}>
 *   <AvatarModel modelUrl="..." />
 * </Suspense>
 * ```
 *
 * **特性:**
 * - 顯示載入百分比
 * - 旋轉動畫效果
 * - 自動置中於場景
 * - 半透明背景
 */
export function AvatarLoader() {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 min-w-[200px]">
        {/* 旋轉 Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>

        {/* 載入文字與進度 */}
        <div className="text-center bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
          <p className="text-card-foreground text-sm font-medium mb-1">
            載入 Avatar 模型中...
          </p>
          <p className="text-primary text-lg font-bold">
            {progress.toFixed(0)}%
          </p>
        </div>
      </div>
    </Html>
  )
}

/**
 * AvatarError - Avatar 載入錯誤的 Fallback 組件
 *
 * 當 Avatar 模型載入失敗時顯示錯誤訊息。
 *
 * @component
 * @example
 * ```tsx
 * {loadError ? (
 *   <AvatarError message={loadError} />
 * ) : (
 *   <AvatarModel modelUrl="..." />
 * )}
 * ```
 *
 * @param message - 錯誤訊息文字
 */
export function AvatarError({ message }: { message: string }) {
  return (
    <Html center>
      <div className="bg-destructive/10 backdrop-blur-sm border border-destructive rounded-lg p-6 text-center max-w-sm">
        {/* 錯誤圖示 */}
        <div className="text-5xl mb-3">⚠️</div>

        {/* 錯誤標題 */}
        <h3 className="text-destructive text-base font-semibold mb-2">
          Avatar 載入失敗
        </h3>

        {/* 錯誤訊息 */}
        <p className="text-destructive/80 text-sm mb-4">
          {message}
        </p>

        {/* 建議 */}
        <div className="text-muted-foreground text-xs space-y-1">
          <p>可能原因：</p>
          <ul className="text-left list-disc list-inside">
            <li>網路連線中斷</li>
            <li>Avatar URL 無效</li>
            <li>模型檔案損壞</li>
          </ul>
        </div>
      </div>
    </Html>
  )
}

/**
 * AvatarPlaceholder - Avatar 佔位符組件
 *
 * 在尚未選擇 Avatar 時顯示的佔位符。
 * 可用於 Avatar 選擇器介面。
 *
 * @component
 * @example
 * ```tsx
 * {!selectedAvatar && <AvatarPlaceholder />}
 * ```
 */
export function AvatarPlaceholder() {
  return (
    <Html center>
      <div className="bg-muted/50 backdrop-blur-sm border border-border rounded-lg p-8 text-center">
        {/* 圖示 */}
        <div className="text-6xl mb-4">👤</div>

        {/* 提示文字 */}
        <p className="text-muted-foreground text-sm">
          尚未載入 Avatar
        </p>
        <p className="text-muted-foreground text-xs mt-2">
          請選擇一個 Avatar 開始
        </p>
      </div>
    </Html>
  )
}
