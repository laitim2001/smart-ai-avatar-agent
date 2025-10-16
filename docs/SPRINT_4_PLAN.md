# Sprint 4 計劃：行動裝置響應式設計

> **Sprint Goal**: 實作完整的行動裝置響應式設計，確保 3D Avatar 對話系統在各種螢幕尺寸和裝置上都能流暢運行
> **Sprint 期間**: 2025-10-17 ~ 2025-10-18 (預計 2 天)
> **Story Points**: 11 SP
> **優先級**: P0

---

## 📋 Sprint 目標

### 主要目標
1. ✅ 支援行動裝置 (375px+) 響應式佈局
2. ✅ 優化 3D 渲染效能 (目標 FPS ≥ 24)
3. ✅ 實作觸控操作優化
4. ✅ 確保 iOS Safari 和 Android Chrome 兼容性

### 驗收標準
- ✅ 行動裝置 (375px) 正常顯示
- ✅ 3D Avatar FPS ≥ 24 on 行動裝置
- ✅ 觸控操作流暢
- ✅ iOS Safari 和 Android Chrome 測試通過
- ✅ 所有頁面響應式完整

---

## 🎯 Sprint 階段

### Phase 1: Tailwind Responsive Breakpoints 配置 (2 SP)
**目標**: 建立完整的響應式斷點系統

**任務清單**:
- [ ] 擴展 tailwind.config.ts 斷點配置
  - `xs: 375px` (iPhone SE)
  - `sm: 640px` (標準)
  - `md: 768px` (平板)
  - `lg: 1024px` (小型桌面)
  - `xl: 1280px` (標準桌面)
  - `2xl: 1536px` (大型桌面)
- [ ] 建立響應式工具類別
- [ ] 建立行動優先設計指南文件

**交付物**:
- tailwind.config.ts 更新
- docs/RESPONSIVE_DESIGN_GUIDE.md

---

### Phase 2: 行動裝置佈局實作 (3 SP)
**目標**: 重構主要頁面為行動優先佈局

**任務清單**:
- [ ] 首頁 (app/page.tsx) 響應式重構
  - 行動裝置: 垂直堆疊 (Avatar 上 + Chat 下)
  - 平板: 雙欄佈局
  - 桌面: 保持現有雙欄佈局
- [ ] Dashboard 響應式重構
  - Sidebar: 行動裝置收合為抽屜
  - Navigation: 行動裝置漢堡選單
  - Content: 響應式卡片佈局
- [ ] Settings 頁面響應式重構
  - Sidebar: 行動裝置改為頁籤導航
  - Form: 單欄佈局

**交付物**:
- 行動優先佈局組件
- 響應式 Sidebar/Navigation 組件

---

### Phase 3: Three.js 效能優化 (3 SP)
**目標**: 優化 3D 渲染效能，確保行動裝置流暢運行

**任務清單**:
- [ ] 實作 LOD (Level of Detail) 系統
  - 低階裝置: 簡化模型幾何
  - 高階裝置: 完整品質
- [ ] 實作裝置偵測與自動降級
  - GPU 偵測 (WebGL capabilities)
  - RAM 偵測 (navigator.deviceMemory)
  - 效能分級 (low/medium/high)
- [ ] 優化 3D 場景設定
  - 行動裝置: 關閉陰影或降低解析度
  - 行動裝置: 簡化光源設定
  - 行動裝置: 降低材質品質

**交付物**:
- lib/device/detection.ts (裝置偵測)
- lib/three/performance.ts (效能分級)
- components/avatar/AvatarCanvas.tsx (效能優化)

---

### Phase 4: 觸控操作優化 (2 SP)
**目標**: 優化行動裝置觸控體驗

**任務清單**:
- [ ] OrbitControls 觸控優化
  - 單指滑動: 旋轉視角
  - 雙指捏合: 縮放
  - 禁用 Pan (避免誤觸)
- [ ] 觸控目標大小優化 (≥ 44x44px)
  - 按鈕尺寸
  - 連結點擊區域
  - 表單輸入框
- [ ] 虛擬鍵盤處理
  - 輸入框自動 scroll to view
  - 鍵盤彈出時避免遮擋內容

**交付物**:
- 優化的觸控互動組件
- 虛擬鍵盤處理 hook (useKeyboardAware)

---

### Phase 5: 瀏覽器兼容性測試 (1 SP)
**目標**: 確保 iOS Safari 和 Android Chrome 完整兼容

**任務清單**:
- [ ] iOS Safari 測試
  - 3D 渲染測試
  - 音訊播放測試
  - 觸控操作測試
  - viewport meta 配置
- [ ] Android Chrome 測試
  - 3D 渲染測試
  - 音訊播放測試
  - 效能測試
- [ ] 修復發現的兼容性問題

**交付物**:
- 兼容性測試報告
- Bug 修復清單

---

## 📁 預期創建檔案

### 配置檔案
- `tailwind.config.ts` (更新 - breakpoints)
- `next.config.ts` (更新 - viewport meta)

### 工具函數
- `lib/device/detection.ts` (新建 - 裝置偵測)
- `lib/three/performance.ts` (新建 - 效能分級)
- `hooks/useKeyboardAware.ts` (新建 - 虛擬鍵盤處理)
- `hooks/useMediaQuery.ts` (新建 - Media Query hook)

### 組件更新
- `app/page.tsx` (更新 - 響應式佈局)
- `components/avatar/AvatarCanvas.tsx` (更新 - 效能優化)
- `components/layout/DashboardLayout.tsx` (更新 - 響應式 Sidebar)
- `components/layout/Sidebar.tsx` (更新 - 行動抽屜)
- `components/layout/Navigation.tsx` (更新 - 漢堡選單)
- `components/chat/ChatInterface.tsx` (更新 - 響應式佈局)
- `app/(dashboard)/settings/layout.tsx` (更新 - 響應式導航)

### 文件
- `docs/RESPONSIVE_DESIGN_GUIDE.md` (新建 - 響應式設計指南)
- `docs/SPRINT_4_TEST_REPORT.md` (新建 - 測試報告)

---

## 🎨 響應式設計原則

### 1. Mobile-First 設計
```css
/* 預設: 行動裝置 */
.element { width: 100%; }

/* 平板以上 */
@media (min-width: 768px) {
  .element { width: 50%; }
}

/* 桌面以上 */
@media (min-width: 1024px) {
  .element { width: 33.33%; }
}
```

### 2. 斷點策略
| 斷點 | 寬度 | 裝置類型 | 佈局策略 |
|------|------|----------|---------|
| `xs` | 375px+ | iPhone SE, 小螢幕手機 | 單欄垂直堆疊 |
| `sm` | 640px+ | 標準手機 | 單欄，較大間距 |
| `md` | 768px+ | 平板直向 | 開始雙欄佈局 |
| `lg` | 1024px+ | 平板橫向, 小筆電 | 完整雙欄佈局 |
| `xl` | 1280px+ | 標準桌面 | 多欄佈局 |
| `2xl` | 1536px+ | 大螢幕 | 最大寬度限制 |

### 3. 觸控目標尺寸
- 最小觸控區域: **44x44px** (iOS Human Interface Guidelines)
- 按鈕間距: 至少 **8px**
- 重要操作按鈕: 至少 **48x48px**

### 4. 字體縮放
```css
/* 行動裝置 */
h1 { font-size: 1.5rem; }  /* 24px */
h2 { font-size: 1.25rem; } /* 20px */
body { font-size: 0.875rem; } /* 14px */

/* 桌面 */
@media (min-width: 1024px) {
  h1 { font-size: 2.25rem; }  /* 36px */
  h2 { font-size: 1.875rem; } /* 30px */
  body { font-size: 1rem; }     /* 16px */
}
```

---

## ⚡ 效能優化策略

### 1. LOD (Level of Detail) 配置
```typescript
interface PerformanceTier {
  tier: 'low' | 'medium' | 'high'
  shadows: boolean
  shadowMapSize: number
  antialiasing: boolean
  pixelRatio: number
  maxLights: number
}

const LOW_END: PerformanceTier = {
  tier: 'low',
  shadows: false,
  shadowMapSize: 256,
  antialiasing: false,
  pixelRatio: 1,
  maxLights: 2,
}

const MEDIUM: PerformanceTier = {
  tier: 'medium',
  shadows: true,
  shadowMapSize: 512,
  antialiasing: false,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  maxLights: 3,
}

const HIGH_END: PerformanceTier = {
  tier: 'high',
  shadows: true,
  shadowMapSize: 1024,
  antialiasing: true,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  maxLights: 4,
}
```

### 2. 裝置偵測邏輯
```typescript
function detectPerformanceTier(): PerformanceTier {
  // 1. 檢查 RAM (deviceMemory API)
  const deviceMemory = (navigator as any).deviceMemory || 4

  // 2. 檢查 GPU (WebGL capabilities)
  const gl = document.createElement('canvas').getContext('webgl')
  const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo ? gl!.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ''

  // 3. 檢查硬體並發 (logical cores)
  const hardwareConcurrency = navigator.hardwareConcurrency || 2

  // 4. 分級邏輯
  if (deviceMemory >= 8 && hardwareConcurrency >= 8) {
    return HIGH_END
  } else if (deviceMemory >= 4 && hardwareConcurrency >= 4) {
    return MEDIUM
  } else {
    return LOW_END
  }
}
```

---

## 🧪 測試計劃

### 1. 單元測試
- [ ] lib/device/detection.test.ts
- [ ] lib/three/performance.test.ts
- [ ] hooks/useMediaQuery.test.ts
- [ ] hooks/useKeyboardAware.test.ts

### 2. E2E 測試
- [ ] 行動裝置佈局測試 (Playwright mobile viewport)
- [ ] 觸控操作測試
- [ ] 3D 渲染效能測試

### 3. 手動測試
- [ ] iPhone SE (375x667) - iOS Safari
- [ ] iPhone 12 Pro (390x844) - iOS Safari
- [ ] iPad (768x1024) - iOS Safari
- [ ] Samsung Galaxy S21 (360x800) - Android Chrome
- [ ] Pixel 5 (393x851) - Android Chrome

---

## 🚨 已知風險與緩解策略

### 風險 1: 行動裝置 3D 效能不足
**影響**: 高 - 可能導致 FPS < 24, 使用者體驗差
**機率**: 中 - 低階行動裝置效能有限

**緩解策略**:
1. 實作自動降級機制 (關閉陰影、降低解析度)
2. 提供 2D Avatar 替代方案 (靜態圖片 + 動畫)
3. 效能監控與警告 (FPS < 20 時提示使用者)

### 風險 2: iOS Safari Web Audio API 限制
**影響**: 中 - 音訊播放可能受限
**機率**: 高 - iOS Safari 已知限制

**緩解策略**:
1. 要求使用者互動後才播放音訊
2. 提供視覺提示 (點擊播放音訊)
3. Fallback 到原生 <audio> 元素

### 風險 3: 觸控操作誤觸
**影響**: 中 - 使用者體驗下降
**機率**: 中 - 觸控螢幕操作誤差

**緩解策略**:
1. 增大觸控目標尺寸 (≥ 44x44px)
2. 增加操作間距 (≥ 8px)
3. 禁用 OrbitControls 的 Pan 功能

---

## 📊 效能目標

| 指標 | 桌面目標 | 行動目標 | 測量方式 |
|------|----------|----------|---------|
| 3D 渲染 FPS | ≥ 60 | ≥ 24 | Chrome DevTools Performance |
| 首次載入時間 | ≤ 2s | ≤ 3s | Lighthouse |
| 互動延遲 | ≤ 100ms | ≤ 200ms | User Timing API |
| 記憶體使用 | ≤ 500MB | ≤ 300MB | Chrome DevTools Memory |

---

## 📝 完成標準 (Definition of Done)

- [x] 所有程式碼通過 TypeScript 類型檢查
- [x] 所有程式碼通過 ESLint 檢查
- [x] 所有單元測試通過 (≥ 80% 覆蓋率)
- [x] 所有 E2E 測試通過
- [x] 行動裝置實機測試完成 (iOS + Android)
- [x] 效能測試達標 (FPS ≥ 24)
- [x] 文件完整 (API 文件 + 測試報告)
- [x] Git commit 並 push 到 feature branch
- [x] MVP_PROGRESS.md 更新

---

## 🔗 相關文件

- **MVP 計劃**: `docs/MVP_DEVELOPMENT_PLAN.md`
- **Sprint 1 計劃**: `docs/SPRINT_1_PLAN.md`
- **Sprint 2 計劃**: `docs/SPRINT_2_PLAN.md`
- **Sprint 3 計劃**: `docs/SPRINT_3_PLAN.md`
- **MVP 進度**: `docs/MVP_PROGRESS.md`
- **測試指南**: `tests/README.md`

---

**Last Updated**: 2025-10-17
**Status**: 🔄 進行中
**Current Phase**: Phase 1 - Tailwind Responsive Breakpoints 配置
