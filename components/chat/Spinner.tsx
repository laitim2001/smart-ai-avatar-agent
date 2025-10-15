/**
 * Loading Spinner 組件
 *
 * 顯示旋轉動畫的 Loading 指示器，用於表示處理中的狀態。
 * 採用 SVG 實作，支援深色模式，尺寸為 20x20 像素。
 *
 * @component
 * @example
 * ```tsx
 * import Spinner from '@/components/chat/Spinner'
 *
 * export default function Button() {
 *   return (
 *     <button disabled>
 *       <Spinner />
 *       <span>載入中...</span>
 *     </button>
 *   )
 * }
 * ```
 */
export default function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
