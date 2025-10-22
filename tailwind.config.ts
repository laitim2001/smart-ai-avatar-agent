/**
 * ================================================================
 * Smart AI Avatar Agent - Tailwind CSS 配置
 * ================================================================
 *
 * 設計系統基於 ai-webapp-template v5.0
 * 完整的色彩系統、容器佈局、動畫支援
 *
 * 主要特點：
 * - CSS 變數驅動的動態主題系統
 * - 語義化色彩命名 (primary, secondary, destructive 等)
 * - 響應式設計支援 (2xl: 1400px 最大寬度)
 * - 完整的動畫系統 (accordion 等)
 */

import type { Config } from 'tailwindcss'

const config: Config = {
  // 暗色模式：透過 class 控制
  darkMode: 'class',

  // 內容掃描：自動偵測使用 Tailwind 類別的檔案
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // 主題設定
  theme: {
    // 響應式斷點：Mobile-First 設計策略
    screens: {
      'xs': '375px',    // 小型手機 (iPhone SE)
      'sm': '640px',    // 標準手機
      'md': '768px',    // 平板直向
      'lg': '1024px',   // 平板橫向 / 小型桌面
      'xl': '1280px',   // 標準桌面
      '2xl': '1536px',  // 大型桌面
    },

    // 容器佈局：統一的頁面寬度與響應式設定
    container: {
      center: true,           // 自動置中
      padding: {
        DEFAULT: '1rem',      // 預設 16px (行動裝置)
        'sm': '1.5rem',       // 24px (標準手機)
        'md': '2rem',         // 32px (平板)
        'lg': '2.5rem',       // 40px (小型桌面)
        'xl': '3rem',         // 48px (標準桌面)
        '2xl': '3.5rem',      // 56px (大型桌面)
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',      // 最大寬度限制
      },
    },

    // 擴展預設主題
    extend: {
      // 色彩系統：基於 CSS 變數的動態主題色彩
      colors: {
        // 基礎色彩
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // 主要色彩：品牌色與重要按鈕
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // 次要色彩：輔助按鈕與區塊
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },

        // 破壞性色彩：危險操作與錯誤狀態
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        // 靜音色彩：低對比的次要內容
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        // 強調色彩：突出顯示與提示
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },

        // 彈出視窗：下拉選單與對話框
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // 卡片元件：內容容器與面板
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // 字體系統：繁中 + 英數支援
      fontFamily: {
        sans: [
          'var(--font-noto-sans-tc)',
          'var(--font-inter)',
          'system-ui',
          'sans-serif',
        ],
      },

      // 圓角半徑：基於 CSS 變數的動態圓角系統
      borderRadius: {
        lg: 'var(--radius)',                    // 大圓角 (8px)
        md: 'calc(var(--radius) - 2px)',       // 中圓角 (6px)
        sm: 'calc(var(--radius) - 4px)',       // 小圓角 (4px)
      },

      // 關鍵影格：自訂動畫效果定義
      keyframes: {
        // 手風琴展開動畫
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        // 手風琴收合動畫
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },

      // 動畫工具類：可直接在 HTML 中使用的動畫效果
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },

  // 外掛程式
  plugins: [
    require('tailwindcss-animate'),
  ],
}

export default config
