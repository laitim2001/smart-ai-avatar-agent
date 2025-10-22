# Sprint 5 計劃：Avatar 角色庫擴充

> **Sprint Goal**: 提供更多 Avatar 選擇，實作完整的 Avatar 管理系統
> **Sprint 期間**: Week 9-10 (2025-10-17 ~ 2025-10-??)
> **Story Points**: 5 SP (調整為 8 SP 以包含完整實作)
> **狀態**: ⏳ 規劃中

---

## 📊 Sprint 概覽

### Story Points 分配

| Phase | 任務 | Story Points | 優先級 |
|-------|------|--------------|--------|
| Phase 1 | Avatar 模型準備與資料模型 | 2 SP | P0 |
| Phase 2 | Avatar 選擇器 UI 優化 | 2 SP | P0 |
| Phase 3 | Avatar 預覽與切換優化 | 2 SP | P0 |
| Phase 4 | 測試與文件 | 2 SP | P0 |
| **總計** | **4 個階段** | **8 SP** | - |

**注意**: 原計劃 5 SP，調整為 8 SP 以包含完整的實作與測試。

### 當前狀態檢視

根據 Sprint 2 的開發結果，我們已經有：
- ✅ AvatarGallery 組件 (響應式網格佈局)
- ✅ AvatarPreview 組件 (React Three Fiber 3D 預覽)
- ✅ GET /api/avatars API (含分類與標籤篩選)
- ✅ avatarStore 狀態管理 (Server-Client 雙向同步)
- ✅ 3 個預設 Avatar (Alex, Jordan, Casey)

**Sprint 5 重點**: 擴充 Avatar 數量至 10+，優化選擇器 UI，增強預覽功能

---

## 🎯 Phase 1: Avatar 模型準備與資料模型 (2 SP)

**目標**: 準備 10 個 Ready Player Me Avatar 模型並擴充資料結構

### 任務 1.1: Ready Player Me Avatar 準備 (1 SP)

**步驟**:
1. **Avatar 模型選擇**
   - 訪問 Ready Player Me Hub
   - 選擇 10 個不同風格的 Avatar
   - 確保性別與風格多樣性:
     - Male: 3-4 個
     - Female: 3-4 個
     - Neutral: 2-3 個

2. **Avatar 模型下載**
   - 下載 GLB 格式
   - 確保包含完整骨架與 morph targets
   - 檔案大小優化 (< 5MB per avatar)

3. **Avatar 元數據建立**
   - 為每個 Avatar 準備縮圖 (512x512)
   - 定義分類 (male/female/neutral)
   - 定義標籤 (casual, professional, fantasy, etc.)
   - 撰寫描述文字 (繁體中文 + 英文)

**交付物**:
- [ ] 10 個 GLB Avatar 模型檔案
- [ ] 10 個縮圖圖片 (512x512 PNG)
- [ ] Avatar 元數據 JSON 檔案

### 任務 1.2: 資料模型擴充 (1 SP)

**步驟**:
1. **更新 Prisma Schema**
   - 擴充 Avatar 模型欄位
   - 新增 featured, popularity 欄位
   - 新增 createdAt, updatedAt 時間戳記

2. **建立 Avatar Seed Data**
   - 準備 10 個 Avatar 的 Seed 資料
   - 包含 URL, thumbnail, category, tags, description
   - 執行 Prisma migration

3. **更新 TypeScript 類型**
   - 更新 AvatarMetadata 介面
   - 新增 AvatarCategory, AvatarTag 型別
   - 確保型別安全

**交付物**:
- [ ] 更新後的 prisma/schema.prisma
- [ ] Avatar seed data 腳本
- [ ] 更新的 TypeScript 類型定義

---

## 🎨 Phase 2: Avatar 選擇器 UI 優化 (2 SP)

**目標**: 優化 AvatarGallery 組件，提供更好的使用者體驗

### 任務 2.1: 分類篩選優化 (1 SP)

**步驟**:
1. **分類按鈕設計**
   - 使用 shadcn/ui Tabs 組件
   - 顯示每個分類的 Avatar 數量
   - 加入 "全部" 選項

2. **標籤篩選功能**
   - 實作多選標籤篩選
   - 使用 shadcn/ui Checkbox 或 Toggle 組件
   - 即時更新 Avatar 清單

3. **搜尋功能**
   - 實作 Avatar 名稱搜尋
   - 使用 shadcn/ui Input 組件
   - 即時搜尋結果更新

**交付物**:
- [ ] 優化的 AvatarGallery 組件
- [ ] 分類篩選 UI
- [ ] 標籤篩選 UI
- [ ] 搜尋功能

### 任務 2.2: 收藏與推薦功能 (1 SP)

**步驟**:
1. **收藏功能**
   - 實作收藏按鈕 (Heart icon)
   - 儲存到 UserPreferences
   - "我的收藏" 篩選選項

2. **推薦 Avatar**
   - 顯示 "推薦" 標籤
   - 根據 featured 欄位排序
   - 預設顯示推薦 Avatar

3. **Avatar 排序**
   - 實作排序選項 (最新、熱門、名稱)
   - 使用 shadcn/ui Select 組件
   - 排序結果即時更新

**交付物**:
- [ ] 收藏功能實作
- [ ] 推薦 Avatar 顯示
- [ ] 排序功能

---

## 🔍 Phase 3: Avatar 預覽與切換優化 (2 SP)

**目標**: 優化 Avatar 預覽功能，提升切換效能

### 任務 3.1: 預覽功能增強 (1 SP)

**步驟**:
1. **360度旋轉預覽**
   - 自動旋轉動畫
   - 滑鼠拖曳控制
   - 觸控手勢支援

2. **動畫預覽**
   - 預覽 Avatar 動畫 (揮手、點頭)
   - 動畫切換按鈕
   - 動畫循環播放

3. **放大/縮小功能**
   - 滑鼠滾輪縮放
   - 雙指捏合縮放 (觸控)
   - 縮放限制 (0.5x ~ 3x)

**交付物**:
- [ ] 360度旋轉預覽
- [ ] 動畫預覽功能
- [ ] 縮放功能

### 任務 3.2: 切換效能優化 (1 SP)

**步驟**:
1. **Avatar 預載入**
   - 實作 Avatar 模型預載入機制
   - 使用 React Suspense 管理載入狀態
   - 顯示載入進度條

2. **切換動畫**
   - 淡入淡出過渡效果
   - 平滑的模型切換
   - 避免閃爍問題

3. **快取機制**
   - 實作 Avatar 模型快取
   - 使用 useGLTF 的快取功能
   - 記憶體管理優化

**交付物**:
- [ ] Avatar 預載入機制
- [ ] 切換動畫效果
- [ ] 快取機制實作

---

## 🧪 Phase 4: 測試與文件 (2 SP)

**目標**: 完整的測試覆蓋與文件建立

### 任務 4.1: 單元測試 (1 SP)

**測試範圍**:
1. **AvatarGallery 組件測試**
   - 分類篩選功能測試
   - 標籤篩選功能測試
   - 搜尋功能測試
   - 排序功能測試
   - 收藏功能測試

2. **AvatarPreview 組件測試**
   - 3D 預覽渲染測試
   - 旋轉功能測試
   - 縮放功能測試
   - 動畫預覽測試

3. **API 端點測試**
   - GET /api/avatars 測試
   - 篩選參數測試
   - 排序參數測試
   - 回應格式測試

**交付物**:
- [ ] AvatarGallery 單元測試
- [ ] AvatarPreview 單元測試
- [ ] API 端點測試
- [ ] 測試覆蓋率 > 80%

### 任務 4.2: E2E 測試與文件 (1 SP)

**E2E 測試場景**:
1. **Avatar 選擇流程**
   - 開啟 Avatar 選擇器
   - 分類篩選操作
   - Avatar 預覽
   - Avatar 選擇與儲存
   - 驗證選擇結果

2. **收藏功能流程**
   - 收藏 Avatar
   - 查看收藏清單
   - 取消收藏
   - 驗證收藏狀態

**文件建立**:
1. **API 文件**
   - GET /api/avatars 完整文件
   - 請求參數說明
   - 回應格式說明
   - 範例程式碼

2. **使用者指南**
   - Avatar 選擇器使用說明
   - 分類與篩選功能介紹
   - 收藏功能說明
   - 預覽功能介紹

**交付物**:
- [ ] E2E 測試腳本
- [ ] API 文件 (docs/API_REFERENCE_SPRINT5.md)
- [ ] 使用者指南
- [ ] Sprint 5 總結文件

---

## 📋 驗收標準 (Definition of Done)

### 功能性標準
- [ ] 10+ Avatar 可選擇
- [ ] 分類篩選運作正常
- [ ] 標籤篩選運作正常
- [ ] 搜尋功能運作正常
- [ ] 排序功能運作正常
- [ ] 收藏功能運作正常
- [ ] 360度預覽功能運作正常
- [ ] 動畫預覽功能運作正常
- [ ] Avatar 切換流暢 (< 1秒)

### 品質標準
- [ ] TypeScript 類型檢查通過 (0 errors)
- [ ] ESLint 檢查通過
- [ ] 單元測試覆蓋率 > 80%
- [ ] E2E 測試通過
- [ ] 所有 API 端點正常運作

### 效能標準
- [ ] Avatar 模型檔案 < 5MB
- [ ] 縮圖載入時間 < 500ms
- [ ] Avatar 切換時間 < 1秒
- [ ] 3D 預覽幀率 ≥ 30 FPS
- [ ] 記憶體使用 < 500 MB

### 文件標準
- [ ] API 文件完整
- [ ] 程式碼註解清晰
- [ ] 使用者指南完整
- [ ] Sprint 5 總結文件完成

---

## 🚀 技術架構

### 資料模型

```prisma
model Avatar {
  id          String   @id @default(cuid())
  name        String
  description String?
  url         String   // GLB model URL
  thumbnail   String   // Thumbnail image URL
  category    String   // male, female, neutral
  tags        String[] // casual, professional, fantasy, etc.
  featured    Boolean  @default(false)
  popularity  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API 端點

**GET /api/avatars**
- Query Parameters:
  - `category`: string (male/female/neutral)
  - `tags`: string[] (comma-separated)
  - `search`: string
  - `sort`: string (newest/popular/name)
  - `featured`: boolean

**回應格式**:
```typescript
{
  avatars: Avatar[]
  total: number
  categories: { category: string, count: number }[]
  tags: { tag: string, count: number }[]
}
```

### UI 組件

**AvatarGallery 組件增強**:
- Tabs 分類篩選
- Checkbox 標籤篩選
- Input 搜尋功能
- Select 排序選項
- Toggle 收藏篩選

**AvatarPreview 組件增強**:
- 自動旋轉動畫
- 滑鼠拖曳控制
- 動畫預覽功能
- 縮放功能

---

## 📅 時間規劃

### Week 9 (Day 1-3)
- ✅ Day 1: Avatar 模型準備與下載
- ✅ Day 2: 資料模型擴充與 Seed Data
- ✅ Day 3: 分類篩選 UI 優化

### Week 9 (Day 4-5)
- ⏳ Day 4: 標籤篩選與搜尋功能
- ⏳ Day 5: 收藏與推薦功能

### Week 10 (Day 1-3)
- ⏳ Day 1: Avatar 預覽功能增強
- ⏳ Day 2: 切換效能優化
- ⏳ Day 3: 單元測試撰寫

### Week 10 (Day 4-5)
- ⏳ Day 4: E2E 測試與文件
- ⏳ Day 5: Sprint 5 總結與驗收

---

## ⚠️ 風險與緩解策略

### 風險 1: Avatar 模型檔案過大
- **影響**: 載入時間過長，影響使用者體驗
- **機率**: Medium
- **緩解策略**:
  - 優化 GLB 檔案大小 (< 5MB)
  - 實作預載入機制
  - 使用 CDN 加速

### 風險 2: 3D 預覽效能問題
- **影響**: 低階裝置預覽卡頓
- **機率**: Medium
- **緩解策略**:
  - 使用 Sprint 4 的效能分級系統
  - 低階裝置降低 3D 品質
  - 提供 2D 縮圖替代方案

### 風險 3: Ready Player Me 服務限制
- **影響**: 無法取得足夠的 Avatar 模型
- **機率**: Low
- **緩解策略**:
  - 提前確認 Ready Player Me Hub 可用性
  - 準備備用 Avatar 來源
  - 考慮自訂 Avatar 生成

---

## 📊 相依性

### 前置需求
- ✅ Sprint 2 完成 (AvatarGallery, AvatarPreview 組件)
- ✅ Sprint 4 完成 (響應式設計與效能優化)
- ✅ Prisma + PostgreSQL 設定完成
- ✅ avatarStore 狀態管理

### 後續 Sprint
- Sprint 6: 多語言支援 (Avatar 描述多語言化)
- Sprint 7: 對話主題 (Avatar 與主題關聯)

---

## 📝 備註

### Sprint 2 已實作功能回顧

根據 Sprint 2 的開發結果，我們已經有：

1. **AvatarGallery 組件** (`components/avatar/AvatarGallery.tsx`)
   - ✅ 響應式網格佈局 (1/2/3 欄位)
   - ✅ Category 篩選按鈕 (all/male/female/neutral)
   - ✅ Selection mode 支援
   - ✅ Loading 和 Empty state 處理

2. **AvatarPreview 組件** (`components/avatar/AvatarPreview.tsx`)
   - ✅ React Three Fiber 3D 預覽
   - ✅ 完整的光源系統
   - ✅ 陰影支援
   - ✅ OrbitControls 互動控制

3. **Avatar API** (`app/api/avatars/route.ts`)
   - ✅ GET /api/avatars
   - ✅ Category 篩選 (male/female/neutral)
   - ✅ Tag 篩選
   - ✅ 完整 Avatar 元數據

4. **avatarStore** (`stores/avatarStore.ts`)
   - ✅ availableAvatars 狀態
   - ✅ Server-Client 雙向同步
   - ✅ localStorage 持久化
   - ✅ loadAvatars(), loadUserPreferences() 方法

**Sprint 5 重點**:
- 擴充 Avatar 數量至 10+
- 優化選擇器 UI (搜尋、排序、收藏)
- 增強預覽功能 (360度旋轉、動畫預覽、縮放)
- 優化切換效能 (預載入、快取)

---

**Last Updated**: 2025-10-17
**Status**: ⏳ 規劃中
**Next Review**: Sprint 5 啟動時
