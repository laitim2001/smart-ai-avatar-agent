# 響應式設計指南

> **文件目的**: 提供統一的響應式設計規範，確保所有組件在各種裝置上都能提供最佳體驗
> **Last Updated**: 2025-10-17
> **Sprint**: Sprint 4 - 行動裝置響應式設計

---

## 📐 設計原則

### 1. Mobile-First 設計
**理念**: 從行動裝置開始設計，逐步增強到桌面裝置

**實作方式**:
```tsx
// ✅ 正確：預設行動樣式，向上增強
<div className="w-full md:w-1/2 lg:w-1/3">

// ❌ 錯誤：預設桌面樣式，向下適配
<div className="w-1/3 lg:w-1/2 md:w-full">
```

### 2. 漸進增強 (Progressive Enhancement)
**理念**: 核心功能在所有裝置上都可用，進階功能逐步增加

**實作方式**:
```tsx
// 核心功能：文字對話 (所有裝置)
<ChatInterface />

// 進階功能：3D Avatar (效能足夠時)
{isDesktop && <AvatarCanvas quality="high" />}
{isMobile && <AvatarCanvas quality="low" />}
```

### 3. 觸控優先 (Touch-First)
**理念**: 所有互動元素都應該適合觸控操作

**實作方式**:
- 最小觸控區域：**44x44px**
- 按鈕間距：至少 **8px**
- 重要操作按鈕：至少 **48x48px**

---

## 📱 響應式斷點系統

### Tailwind 斷點配置

| 斷點代碼 | 最小寬度 | 裝置類型 | 使用場景 |
|---------|---------|---------|---------|
| `xs` | 375px | iPhone SE, 小螢幕手機 | 極小螢幕特殊處理 |
| `sm` | 640px | 標準手機 | 行動裝置優化 |
| `md` | 768px | 平板直向 | 開始雙欄佈局 |
| `lg` | 1024px | 平板橫向, 小型桌面 | 完整雙欄佈局 |
| `xl` | 1280px | 標準桌面 | 多欄佈局 |
| `2xl` | 1536px | 大型桌面 | 最大寬度限制 |

### 使用 Tailwind 斷點

```tsx
// 基本用法
<div className="text-sm md:text-base lg:text-lg">
  響應式文字大小
</div>

// 佈局切換
<div className="flex flex-col md:flex-row">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

// 顯示/隱藏
<div className="block md:hidden">僅行動裝置顯示</div>
<div className="hidden md:block">僅桌面顯示</div>
```

### 使用 React Hooks

```tsx
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'

function MyComponent() {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  )
}
```

---

## 🎨 響應式佈局模式

### 1. 垂直堆疊 → 雙欄 (Stack → Columns)

**適用場景**: Dashboard, Settings, Profile

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Column 1</div>
  <div>Column 2</div>
</div>
```

**視覺效果**:
```
行動裝置 (<768px):     平板以上 (≥768px):
┌─────────────┐        ┌──────┬──────┐
│  Column 1   │        │ Col1 │ Col2 │
├─────────────┤   →    │      │      │
│  Column 2   │        │      │      │
└─────────────┘        └──────┴──────┘
```

### 2. 全螢幕 → 側邊欄 (Full → Sidebar)

**適用場景**: Main Layout, Settings

```tsx
<div className="flex flex-col lg:flex-row">
  {/* Sidebar: 行動抽屜, 桌面固定 */}
  <aside className="w-full lg:w-64">
    <Sidebar />
  </aside>

  {/* Main Content */}
  <main className="flex-1">
    <Content />
  </main>
</div>
```

**視覺效果**:
```
行動裝置 (<1024px):    桌面 (≥1024px):
┌─────────────┐        ┌────┬─────────┐
│   Drawer    │        │Side│ Content │
└─────────────┘   →    │bar │         │
┌─────────────┐        │    │         │
│   Content   │        └────┴─────────┘
└─────────────┘
```

### 3. 單欄 → 多欄 (Single → Multi-Column)

**適用場景**: Dashboard Cards, Product Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

**視覺效果**:
```
行動 (<640px):  標準手機 (≥640px):  桌面 (≥1024px):     XL (≥1280px):
┌───┐          ┌───┬───┐          ┌───┬───┬───┐        ┌───┬───┬───┬───┐
│ 1 │          │ 1 │ 2 │          │ 1 │ 2 │ 3 │        │ 1 │ 2 │ 3 │ 4 │
├───┤    →     ├───┼───┤    →     ├───┼───┼───┤   →    ├───┼───┼───┼───┤
│ 2 │          │ 3 │ 4 │          │ 4 │ 5 │ 6 │        │ 5 │ 6 │ 7 │ 8 │
└───┘          └───┴───┘          └───┴───┴───┘        └───┴───┴───┴───┘
```

### 4. 3D + Chat 響應式佈局

**適用場景**: 首頁 (app/page.tsx)

```tsx
<div className="flex flex-col lg:flex-row h-screen">
  {/* Avatar: 行動裝置縮小高度 */}
  <div className="flex-1 h-1/2 lg:h-full">
    <AvatarCanvas />
  </div>

  {/* Chat: 行動裝置固定高度 */}
  <div className="w-full lg:w-96 h-1/2 lg:h-full">
    <ChatInterface />
  </div>
</div>
```

**視覺效果**:
```
行動裝置 (<1024px):    桌面 (≥1024px):
┌─────────────┐        ┌──────────┬───┐
│             │        │          │   │
│   Avatar    │        │  Avatar  │ C │
│             │   →    │          │ h │
├─────────────┤        │          │ a │
│    Chat     │        │          │ t │
└─────────────┘        └──────────┴───┘
```

---

## 🖱️ 觸控優化指南

### 1. 觸控目標尺寸

根據 iOS Human Interface Guidelines 和 Material Design:

| 元素類型 | 最小尺寸 | 建議尺寸 | Tailwind 類別 |
|---------|---------|---------|--------------|
| 按鈕 | 44x44px | 48x48px | `min-h-[44px] min-w-[44px]` |
| 連結 | 44x44px | 48x48px | `p-3` (12px padding) |
| Icon Button | 44x44px | 48x48px | `w-12 h-12` |
| Input | 44px 高 | 48px 高 | `h-12` |
| Checkbox/Radio | 24x24px | 28x28px | `w-6 h-6` |

### 2. 間距設計

```tsx
// ✅ 正確：足夠的按鈕間距 (≥8px)
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

// ❌ 錯誤：按鈕過近，容易誤觸
<div className="flex gap-0">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

### 3. OrbitControls 觸控配置

```tsx
<OrbitControls
  enableZoom={true}          // 允許雙指捏合縮放
  enablePan={false}          // 禁用 Pan (避免誤觸)
  enableRotate={true}        // 允許單指旋轉
  enableDamping={true}       // 啟用慣性滑動
  dampingFactor={0.05}       // 慣性因子
  rotateSpeed={0.5}          // 旋轉速度 (觸控較慢)
  zoomSpeed={0.5}            // 縮放速度
  minDistance={1}            // 最近距離
  maxDistance={5}            // 最遠距離
  touches={{
    ONE: THREE.TOUCH.ROTATE,   // 單指旋轉
    TWO: THREE.TOUCH.DOLLY,    // 雙指縮放
  }}
/>
```

---

## ⚡ 效能優化策略

### 1. 3D 渲染效能分級

根據裝置效能自動調整 3D 品質：

```tsx
import { useIsMobile } from '@/hooks/useMediaQuery'
import { detectPerformanceTier } from '@/lib/device/detection'

function AvatarCanvas() {
  const isMobile = useIsMobile()
  const tier = detectPerformanceTier()

  const config = {
    // 陰影設定
    shadows: tier === 'high',
    shadowMapSize: tier === 'high' ? 1024 : tier === 'medium' ? 512 : 256,

    // 抗鋸齒
    antialias: tier === 'high',

    // 像素密度
    pixelRatio: Math.min(
      window.devicePixelRatio,
      tier === 'high' ? 2 : 1
    ),
  }

  return (
    <Canvas
      shadows={config.shadows}
      gl={{
        antialias: config.antialias,
        pixelRatio: config.pixelRatio,
      }}
    >
      {/* 3D 場景 */}
    </Canvas>
  )
}
```

### 2. 條件載入

僅在必要時載入 3D 組件：

```tsx
import dynamic from 'next/dynamic'

// 動態載入 3D 組件，減少初始 Bundle
const AvatarCanvas = dynamic(
  () => import('@/components/avatar/AvatarCanvas'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  }
)

function HomePage() {
  const isDesktop = useIsDesktop()

  return (
    <div>
      {/* 桌面：完整 3D */}
      {isDesktop && <AvatarCanvas quality="high" />}

      {/* 行動：簡化或 2D 替代 */}
      {!isDesktop && <AvatarCanvas quality="low" />}
    </div>
  )
}
```

### 3. 圖片響應式載入

```tsx
<Image
  src="/avatar-thumbnail.jpg"
  alt="Avatar"
  // 行動裝置載入較小圖片
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  // srcSet 自動選擇最佳解析度
  width={400}
  height={400}
  priority={false}  // 非首屏圖片延遲載入
/>
```

---

## 📝 字體與排版

### 1. 響應式字體大小

使用 Tailwind 的響應式 utility classes：

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  標題
</h1>

<p className="text-sm md:text-base lg:text-lg">
  內文
</p>
```

**建議比例**:
| 元素 | 行動 (< 768px) | 平板 (768px+) | 桌面 (1024px+) |
|------|---------------|--------------|---------------|
| h1 | 1.5rem (24px) | 2rem (32px) | 2.25rem (36px) |
| h2 | 1.25rem (20px) | 1.5rem (24px) | 1.875rem (30px) |
| h3 | 1.125rem (18px) | 1.25rem (20px) | 1.5rem (24px) |
| body | 0.875rem (14px) | 0.9375rem (15px) | 1rem (16px) |
| small | 0.75rem (12px) | 0.8125rem (13px) | 0.875rem (14px) |

### 2. 行高與間距

```tsx
<p className="leading-relaxed md:leading-loose">
  較寬鬆的行高提升可讀性
</p>

<div className="space-y-4 md:space-y-6">
  段落間距隨螢幕尺寸調整
</div>
```

---

## 🧪 測試清單

### 視覺測試
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 Pro (390x844)
- [ ] iPad (768x1024)
- [ ] iPad Pro (1024x1366)
- [ ] Desktop (1920x1080)

### 功能測試
- [ ] 觸控操作流暢
- [ ] 按鈕可點擊 (無誤觸)
- [ ] 表單輸入正常
- [ ] 虛擬鍵盤不遮擋內容
- [ ] 3D 渲染正常
- [ ] 音訊播放正常

### 效能測試
- [ ] 3D FPS ≥ 24 (行動裝置)
- [ ] 首次載入時間 ≤ 3s (行動裝置)
- [ ] 互動延遲 ≤ 200ms (行動裝置)

---

## 🔧 開發工具

### 1. Chrome DevTools 行動模擬

```
1. 開啟 Chrome DevTools (F12)
2. 點擊 Toggle Device Toolbar (Ctrl+Shift+M)
3. 選擇裝置類型或自訂尺寸
4. 測試不同螢幕尺寸
```

### 2. 實機測試工具

- **iOS**: Safari Developer Tools (連接 iPhone)
- **Android**: Chrome Remote Debugging (USB)
- **BrowserStack**: 雲端真機測試

### 3. Tailwind CSS IntelliSense

VSCode 擴充功能，提供 Tailwind 類別自動完成和預覽。

---

## 📚 參考資源

### 設計規範
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://m3.material.io/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

### Tailwind CSS
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Configuration](https://tailwindcss.com/docs/configuration)

### React Hooks
- [useMediaQuery Hook Pattern](https://usehooks.com/useMediaQuery/)

---

**Last Updated**: 2025-10-17
**Author**: Claude Code
**Sprint**: Sprint 4
