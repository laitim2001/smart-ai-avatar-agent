/**
 * useMediaQuery Hook
 *
 * 響應式 Media Query Hook，用於在 React 組件中動態偵測螢幕尺寸變化
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 * ```
 *
 * @param query - CSS Media Query 字串
 * @returns boolean - 當前是否符合 Media Query 條件
 */

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  // SSR 兼容: 伺服器端渲染時預設返回 false
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // 建立 MediaQueryList 物件
    const media = window.matchMedia(query)

    // 初始化狀態
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    // 監聽器函數
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // 註冊監聽器
    // 使用 addEventListener (現代瀏覽器)
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', listener)
    } else {
      // Fallback: 舊版 Safari (iOS < 14)
      media.addListener(listener)
    }

    // 清理監聽器
    return () => {
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', listener)
      } else {
        // Fallback: 舊版 Safari (iOS < 14)
        media.removeListener(listener)
      }
    }
  }, [query, matches])

  return matches
}

/**
 * 預定義的響應式斷點 Hooks
 * 對應 tailwind.config.ts 中的斷點配置
 */

/**
 * 檢查是否為小型手機 (≥ 375px)
 */
export function useIsXs(): boolean {
  return useMediaQuery('(min-width: 375px)')
}

/**
 * 檢查是否為標準手機 (≥ 640px)
 */
export function useIsSm(): boolean {
  return useMediaQuery('(min-width: 640px)')
}

/**
 * 檢查是否為平板 (≥ 768px)
 */
export function useIsMd(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

/**
 * 檢查是否為小型桌面 (≥ 1024px)
 */
export function useIsLg(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * 檢查是否為標準桌面 (≥ 1280px)
 */
export function useIsXl(): boolean {
  return useMediaQuery('(min-width: 1280px)')
}

/**
 * 檢查是否為大型桌面 (≥ 1536px)
 */
export function useIs2xl(): boolean {
  return useMediaQuery('(min-width: 1536px)')
}

/**
 * 檢查是否為行動裝置 (< 1024px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}

/**
 * 檢查是否為桌面裝置 (≥ 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

/**
 * 檢查是否為觸控裝置
 *
 * 注意：此方法不完全可靠，部分桌面裝置也支援觸控
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    )
  }, [])

  return isTouch
}

/**
 * 檢查是否為橫向方向 (landscape)
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)')
}

/**
 * 檢查是否為直向方向 (portrait)
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)')
}

/**
 * 獲取當前螢幕尺寸分類
 *
 * @returns 'mobile' | 'tablet' | 'desktop' | 'xl-desktop'
 */
export function useScreenSize(): 'mobile' | 'tablet' | 'desktop' | 'xl-desktop' {
  const isMobile = useIsMobile()
  const isMd = useIsMd()
  const isLg = useIsLg()
  const isXl = useIsXl()

  if (isXl) return 'xl-desktop'
  if (isLg) return 'desktop'
  if (isMd) return 'tablet'
  return 'mobile'
}
