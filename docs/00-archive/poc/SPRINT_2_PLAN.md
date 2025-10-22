# Sprint 2 開發計劃

> **Sprint 目標**: 使用者個人資料管理與 Avatar 偏好設定
> **時程**: 預計 2-3 天 (根據 Sprint 1 效率)
> **Story Points**: 預估 8-10 SP

---

## 📊 Sprint 概覽

### Sprint 資訊
- **Sprint 編號**: Sprint 2
- **開始日期**: 2025-10-16
- **預計結束**: 2025-10-19
- **主要目標**: 完成使用者個人資料管理與 Avatar 系統整合

### 前置條件
- ✅ Sprint 1 已完成（認證系統）
- ✅ Dashboard 基礎架構已建立
- ✅ 測試框架已就緒

---

## 🎯 Sprint 目標

### 1. 使用者個人資料管理 (4 SP)
完整的個人資料編輯與管理功能

**功能需求**:
- ✅ 個人資料頁面 UI
- ✅ 個人資料編輯表單
- ✅ 頭像上傳功能
- ✅ 密碼變更功能
- ✅ 帳號設定選項

### 2. Avatar 偏好設定 (3 SP)
整合 3D Avatar 系統與使用者偏好

**功能需求**:
- ✅ Avatar 選擇介面
- ✅ Avatar 預覽功能
- ✅ 使用者偏好儲存
- ✅ 預設 Avatar 設定

### 3. 功能增強與優化 (2 SP)
提升使用者體驗與系統穩定性

**功能需求**:
- ✅ Email 通知服務整合
- ✅ 使用者活動記錄
- ✅ 效能優化
- ✅ 錯誤處理改善

### 4. 測試與文件 (1 SP)
確保品質與可維護性

**功能需求**:
- ✅ 單元測試擴充
- ✅ E2E 測試新增
- ✅ API 文件更新
- ✅ 使用者指南

---

## 📅 每日計劃

### Day 1-2: 使用者個人資料管理

#### 後端開發
**API Routes**:
- ✅ `PATCH /api/user/profile` - 更新個人資料（已完成）
- ✅ `GET /api/user/profile` - 獲取個人資料（已完成）
- 🔲 `POST /api/user/avatar` - 上傳頭像
- 🔲 `PATCH /api/user/password` - 變更密碼
- 🔲 `GET /api/user/settings` - 使用者設定
- 🔲 `PATCH /api/user/settings` - 更新設定

**資料庫**:
- 🔲 UserSettings 模型（偏好、通知設定）
- 🔲 ActivityLog 模型（使用者活動記錄）

#### 前端開發
**頁面**:
- ✅ `/settings` - 設定頁面骨架（已完成）
- 🔲 `/settings/profile` - 個人資料編輯
- 🔲 `/settings/avatar` - Avatar 選擇
- 🔲 `/settings/preferences` - 偏好設定
- 🔲 `/settings/security` - 安全設定

**元件**:
- 🔲 ProfileForm - 個人資料表單
- 🔲 AvatarUploader - 頭像上傳
- 🔲 PasswordChangeForm - 密碼變更
- 🔲 PreferencesPanel - 偏好設定面板

### Day 3-4: Avatar 偏好設定

#### 後端開發
**API Routes**:
- 🔲 `GET /api/avatars` - 可用 Avatar 列表
- 🔲 `POST /api/user/preferences/avatar` - 設定預設 Avatar
- 🔲 `GET /api/user/preferences` - 獲取使用者偏好

**整合**:
- 🔲 Avatar Store 與 Database 同步
- 🔲 Session 包含 Avatar 偏好
- 🔲 預設 Avatar 設定邏輯

#### 前端開發
**元件**:
- 🔲 AvatarGallery - Avatar 圖庫
- 🔲 AvatarPreview - 3D 預覽
- 🔲 AvatarCard - Avatar 卡片
- 🔲 整合現有 AvatarSelector

**狀態管理**:
- 🔲 同步 avatarStore 與 API
- 🔲 持久化使用者偏好
- 🔲 快取優化

### Day 5: 功能增強與測試

#### Email 通知服務
- 🔲 Resend 整合
- 🔲 Email 模板（歡迎、密碼變更、設定變更）
- 🔲 通知偏好設定

#### 測試
- 🔲 個人資料 API 單元測試
- 🔲 Avatar 偏好 API 單元測試
- 🔲 E2E 測試（個人資料編輯流程）
- 🔲 E2E 測試（Avatar 選擇流程）

#### 文件
- 🔲 API 文件更新
- 🔲 使用者指南
- 🔲 Sprint 2 總結

---

## 🏗️ 技術架構

### 新增資料模型

```prisma
model UserSettings {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Avatar 偏好
  defaultAvatarId    String?
  defaultAvatarUrl   String?

  // 通知設定
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(false)

  // 介面偏好
  theme              String  @default("system")
  language           String  @default("zh-TW")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  action    String   // "login", "logout", "profile_update", "avatar_change"
  metadata  Json?    // 額外資訊
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

### API 端點規劃

#### 使用者個人資料
```
GET    /api/user/me            - 當前使用者資訊（已完成）
GET    /api/user/profile       - 個人資料詳細（已完成）
PATCH  /api/user/profile       - 更新個人資料（已完成）
POST   /api/user/avatar        - 上傳頭像
PATCH  /api/user/password      - 變更密碼
DELETE /api/user/account       - 刪除帳號（可選）
```

#### 使用者設定
```
GET    /api/user/settings      - 獲取設定
PATCH  /api/user/settings      - 更新設定
GET    /api/user/preferences   - 獲取偏好
PATCH  /api/user/preferences   - 更新偏好
```

#### Avatar 管理
```
GET    /api/avatars            - 可用 Avatar 列表
POST   /api/user/preferences/avatar - 設定預設 Avatar
```

#### 活動記錄
```
GET    /api/user/activity      - 使用者活動記錄
```

---

## ✅ Definition of Done (DoD)

### 功能性
- [ ] 所有 API 端點正常運作
- [ ] 個人資料可正常編輯與儲存
- [ ] Avatar 選擇與預覽正常
- [ ] Email 通知正常發送
- [ ] 所有表單驗證正確

### 品質
- [ ] TypeScript 類型檢查通過
- [ ] ESLint 無錯誤
- [ ] 單元測試覆蓋率 > 80%
- [ ] E2E 測試通過

### 文件
- [ ] API 文件完整
- [ ] 程式碼註解清晰
- [ ] 使用者指南更新
- [ ] Sprint 總結完成

### 部署
- [ ] 開發環境測試通過
- [ ] Production build 成功
- [ ] 效能指標達標

---

## 🎯 成功指標

### 功能指標
- ✅ 使用者可完整編輯個人資料
- ✅ 使用者可選擇與預覽 Avatar
- ✅ 使用者可設定偏好選項
- ✅ Email 通知正常運作

### 品質指標
- ✅ 測試覆蓋率 > 80%
- ✅ 無 P1/P2 Bug
- ✅ 效能無明顯降級

### 效率指標
- ✅ 在 3 天內完成（參考 Sprint 1 效率）
- ✅ 技術債務 = 0
- ✅ 文件完整度 100%

---

## 🚧 風險與依賴

### 技術風險
- **低風險**: 頭像上傳（使用 Uploadthing 或 Cloudinary）
- **低風險**: Email 服務（Resend 整合簡單）
- **低風險**: Avatar 整合（POC 已驗證）

### 外部依賴
- ✅ Resend Email Service
- ✅ 圖片儲存服務（Uploadthing/Cloudinary）
- ✅ Ready Player Me Avatar URLs

### 緩解策略
- Email 服務失敗 → 降級為 console.log
- 圖片上傳失敗 → 使用預設頭像
- Avatar 載入失敗 → fallback 到預設模型

---

## 📝 備註

### 延後項目（Sprint 3+）
- OAuth Provider 整合（Google/Microsoft）
- 兩步驟驗證 (2FA)
- 使用者角色與權限
- 進階通知中心

### 參考文件
- Sprint 1 計劃: `docs/SPRINT_1_PLAN.md`
- Sprint 1 總結: `docs/MVP_PROGRESS.md`
- POC 報告: `docs/POC_TEST_REPORT.md`

---

**Last Updated**: 2025-10-16
**Status**: 📋 規劃中
**Assigned To**: Development Team
