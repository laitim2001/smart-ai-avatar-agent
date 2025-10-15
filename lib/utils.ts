/**
 * ================================================================
 * 工具函數庫 (lib/utils.ts)
 * ================================================================
 *
 * 提供通用的工具函數，特別是 Tailwind CSS 類名合併功能
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - 合併和優化 Tailwind CSS 類名
 *
 * 功能：
 * 1. 使用 clsx 合併條件類名
 * 2. 使用 tailwind-merge 解決類名衝突
 *
 * 使用範例：
 * ```tsx
 * cn('px-2 py-1', 'bg-primary', { 'text-white': isActive })
 * // 輸出: 'px-2 py-1 bg-primary text-white'
 *
 * cn('px-2 py-1', 'px-4') // tailwind-merge 解決衝突
 * // 輸出: 'py-1 px-4' (px-4 覆蓋 px-2)
 * ```
 *
 * @param inputs - 類名字串、物件或陣列
 * @returns 合併和優化後的類名字串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
