# Smart AI Avatar Agent - 設計系統文檔

**版本**: 1.0.0
**基於**: ai-webapp-template v5.0
**最後更新**: 2025-10-15
**狀態**: 階段一完成 ✅

---

## 📊 概覽

本設計系統採用策略 C (混合方案)，結合了最新技術棧與成熟的企業級 UI 設計系統。

### 核心特點

- ✅ **16+ 語義化色彩變數** - 完整的 HSL 色彩系統
- ✅ **雙主題支援** - 亮色/暗色模式無縫切換
- ✅ **響應式容器** - 自動置中，最大寬度 1400px
- ✅ **動態圓角** - 基於 CSS 變數的可配置圓角
- ✅ **動畫系統** - accordion 等預定義動畫
- ✅ **最新技術棧** - Next.js 15 + React 19 + Tailwind 4

---

## 🎨 色彩系統

### 語義化色彩變數

| 變數名稱 | 用途 | 亮色模式 | 暗色模式 |
|---------|------|---------|---------|
| `--background` | 主背景色 | 純白 (0 0% 100%) | 深藍灰 (222.2 84% 4.9%) |
| `--foreground` | 主文字色 | 深藍灰 (222.2 84% 4.9%) | 近白 (210 40% 98%) |
| `--primary` | 品牌主色 | 藍色 (221.2 83.2% 53.3%) | 亮藍 (217.2 91.2% 59.8%) |
| `--secondary` | 次要色 | 淺灰藍 (210 40% 96%) | 深藍 (217.2 32.6% 17.5%) |
| `--muted` | 靜音色 | 淺灰 (210 40% 96%) | 深藍 (217.2 32.6% 17.5%) |
| `--accent` | 強調色 | 淺灰 (210 40% 96%) | 深藍 (217.2 32.6% 17.5%) |
| `--destructive` | 破壞性操作 | 紅色 (0 84.2% 60.2%) | 暗紅 (0 62.8% 30.6%) |
| `--border` | 邊框色 | 淺灰 (214.3 31.8% 91.4%) | 深藍 (217.2 32.6% 17.5%) |
| `--input` | 輸入框 | 淺灰 (214.3 31.8% 91.4%) | 深藍 (217.2 32.6% 17.5%) |
| `--ring` | 聚焦環 | 主藍 (221.2 83.2% 53.3%) | 亮藍白 (224.3 76.3% 94.1%) |
| `--card` | 卡片背景 | 白色 (0 0% 100%) | 深藍灰 (222.2 84% 4.9%) |
| `--popover` | 彈窗背景 | 白色 (0 0% 100%) | 深藍灰 (222.2 84% 4.9%) |

### 使用方式

```tsx
// 直接使用 Tailwind 類名
<div className="bg-primary text-primary-foreground">主色按鈕</div>
<div className="bg-secondary text-secondary-foreground">次要按鈕</div>
<div className="bg-destructive text-destructive-foreground">刪除按鈕</div>

// 卡片組件
<div className="bg-card text-card-foreground border border-border rounded-lg">
  卡片內容
</div>

// 靜音內容
<p className="text-muted-foreground">次要文字</p>
```

---

## 🎯 設計 Tokens

### 圓角系統

```css
--radius: 0.5rem;  /* 8px - 基礎圓角 */
```

| Tailwind 類名 | 計算值 | 實際大小 |
|--------------|--------|---------|
| `rounded-lg` | `var(--radius)` | 8px |
| `rounded-md` | `calc(var(--radius) - 2px)` | 6px |
| `rounded-sm` | `calc(var(--radius) - 4px)` | 4px |

### 容器系統

```tsx
// 自動置中，響應式內距
<div className="container">
  {/* 最大寬度 1400px (2xl 斷點) */}
  {/* 左右內距 32px */}
</div>
```

---

## 🎬 動畫系統

### Accordion 動畫

```tsx
// 展開動畫
<div className="animate-accordion-down">
  展開的內容
</div>

// 收合動畫
<div className="animate-accordion-up">
  收合的內容
</div>
```

**動畫參數**:
- 持續時間: 0.2s
- 緩動函數: ease-out

---

## 🌙 暗色模式

### 啟用方式

```tsx
// 在根元素添加 'dark' class
<html className="dark">
  {/* 所有組件自動切換到暗色模式 */}
</html>
```

### 實施建議

將來可以添加主題切換器：

```tsx
// components/theme-toggle.tsx (待建立)
'use client'

import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

---

## 🛠️ 工具函數

### cn() - 類名合併函數

位置: `lib/utils.ts`

```tsx
import { cn } from '@/lib/utils'

// 基礎用法
cn('px-2 py-1', 'bg-primary')
// 輸出: 'px-2 py-1 bg-primary'

// 條件類名
cn('px-2 py-1', { 'text-white': isActive })
// 輸出: 'px-2 py-1 text-white' (如果 isActive 為 true)

// 解決類名衝突
cn('px-2 py-1', 'px-4')
// 輸出: 'py-1 px-4' (px-4 覆蓋 px-2)
```

---

## 📦 已安裝的依賴

### UI 工具庫

```json
{
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1"
}
```

### 用途說明

- **tailwindcss-animate**: 提供預定義動畫效果
- **class-variance-authority**: 組件變體管理 (未來 UI 組件使用)
- **clsx**: 條件類名合併
- **tailwind-merge**: 智能解決 Tailwind 類名衝突

---

## 📋 響應式斷點

Tailwind CSS 預設斷點 + 自定義容器：

| 斷點 | 最小寬度 | 容器最大寬度 |
|------|---------|-------------|
| `sm` | 640px | 100% |
| `md` | 768px | 100% |
| `lg` | 1024px | 100% |
| `xl` | 1280px | 100% |
| `2xl` | 1536px | 1400px (自定義) |

### 使用範例

```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* 手機: 1列, 平板: 2列, 桌面: 3列 */}
</div>
```

---

## 🎯 最佳實踐

### 1. 使用語義化類名

✅ **正確**:
```tsx
<button className="bg-primary text-primary-foreground">主要按鈕</button>
<button className="bg-destructive text-destructive-foreground">刪除</button>
```

❌ **錯誤**:
```tsx
<button className="bg-blue-500 text-white">主要按鈕</button>
<button className="bg-red-500 text-white">刪除</button>
```

### 2. 使用 cn() 合併類名

✅ **正確**:
```tsx
import { cn } from '@/lib/utils'

<div className={cn('px-4 py-2', className)}>內容</div>
```

❌ **錯誤**:
```tsx
<div className={`px-4 py-2 ${className}`}>內容</div>
```

### 3. 保持一致的間距

使用 Tailwind 的間距系統：

```tsx
// 間距: 4, 8, 12, 16, 20, 24, 32...
<div className="p-4">     {/* 16px */}
<div className="p-6">     {/* 24px */}
<div className="p-8">     {/* 32px */}
```

### 4. 響應式優先

```tsx
// 手機優先，逐步增強
<div className="text-sm md:text-base lg:text-lg">
  響應式文字
</div>
```

---

## 🚀 下一步計劃

### 階段二 (Story 1.3)

計劃複製以下基礎 UI 組件：

- [ ] `components/ui/button.tsx` - 按鈕組件 (5種變體)
- [ ] `components/ui/input.tsx` - 輸入框組件
- [ ] `components/ui/card.tsx` - 卡片組件
- [ ] `components/ui/label.tsx` - 標籤組件
- [ ] `components/ui/skeleton.tsx` - 骨架屏 (loading)

### 階段三 (Story 2.x-3.x)

保持項目特色功能：

- [ ] `components/avatar/AvatarCanvas.tsx` - 3D Avatar 渲染
- [ ] `components/avatar/LipSyncController.tsx` - Lip Sync 控制
- [ ] `components/chat/ChatInterface.tsx` - 對話界面

---

## 📚 參考資源

### 內部文檔

- [UI/UX 比較分析](../claudedocs/UI-UX-COMPARISON-ANALYSIS.md)
- [AI Assistant Guide](../AI_ASSISTANT_GUIDE.md)
- [Project Index](../PROJECT_INDEX.md)

### 外部資源

- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/) (設計參考)

---

## 🔄 更新歷史

| 版本 | 日期 | 變更內容 |
|------|------|---------|
| 1.0.0 | 2025-10-15 | 階段一完成 - 設計系統升級 |

---

**維護者**: Dev Team
**最後更新**: 2025-10-15
