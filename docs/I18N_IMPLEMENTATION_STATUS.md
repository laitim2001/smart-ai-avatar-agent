# i18n 多語言化實作狀態

**最後更新**: 2025-10-21
**狀態**: 🟡 部分完成 - 基礎設施完成，內容多語言化進行中

---

## ✅ 已完成項目

### 1. 基礎設施 (100% 完成)

**Hydration 錯誤修復** (2025-10-21):
- ✅ 移除 `app/[locale]/layout.tsx` 中的嵌套 HTML 結構
- ✅ 更新根 `app/layout.tsx` 以動態設定 `lang` 屬性
- ✅ 增強 `middleware.ts` 設定 `x-locale` header
- ✅ 語言切換功能完全正常運作

**配置檔案**:
- ✅ `i18n/request.ts` - 語言配置 (zh-TW, en, ja)
- ✅ `middleware.ts` - next-intl middleware 整合
- ✅ `next.config.js` - withNextIntl 插件配置

**翻譯檔案結構**:
```
locales/
├── zh-TW/common.json  ✅ 完整翻譯鍵值
├── en/common.json     ✅ 完整翻譯鍵值
└── ja/common.json     ✅ 完整翻譯鍵值
```

### 2. UI 元件多語言化 (100% 完成)

**導航元件**:
- ✅ `components/layout/LanguageSwitcher.tsx` - 語言切換器
- ✅ `components/layout/DashboardNav.tsx` - 導航列

**完成的頁面**:
- ✅ `app/[locale]/(dashboard)/dashboard/page.tsx` - Dashboard 頁面

---

## 🟡 進行中項目

### 需要多語言化的頁面 (1/17 完成)

#### 對話相關
- [ ] `app/[locale]/(dashboard)/conversations/page.tsx` - 對話記錄頁面
- [ ] `app/[locale]/(dashboard)/prompts/page.tsx` - 對話主題頁面

#### Avatar 相關
- [ ] `app/[locale]/(dashboard)/custom-avatar/page.tsx` - 自訂 Avatar 頁面
- [ ] `app/[locale]/(dashboard)/avatar-lip-sync-test/page.tsx` - Lip Sync 測試頁面

#### 知識庫管理
- [ ] `app/[locale]/(dashboard)/knowledge/page.tsx` - 知識庫總覽
- [ ] `app/[locale]/(dashboard)/knowledge/persona/page.tsx` - Persona 定義
- [ ] `app/[locale]/(dashboard)/knowledge/faq/page.tsx` - FAQ 管理
- [ ] `app/[locale]/(dashboard)/knowledge/kpi/page.tsx` - KPI 字典
- [ ] `app/[locale]/(dashboard)/knowledge/decisions/page.tsx` - 決策日誌
- [ ] `app/[locale]/(dashboard)/knowledge/meetings/page.tsx` - 會議摘要
- [ ] `app/[locale]/(dashboard)/knowledge/pov/page.tsx` - 觀點管理

#### 設定頁面
- [ ] `app/[locale]/(dashboard)/settings/page.tsx` - 設定主頁
- [ ] `app/[locale]/(dashboard)/settings/preferences/page.tsx` - 偏好設定
- [ ] `app/[locale]/(dashboard)/settings/avatar/page.tsx` - Avatar 設定
- [ ] `app/[locale]/(dashboard)/settings/security/page.tsx` - 安全性設定
- [ ] `app/[locale]/(dashboard)/settings/activity/page.tsx` - 活動記錄

---

## 📝 實作指南

### 標準化流程

每個頁面的多語言化遵循以下步驟：

#### 1. 更新頁面元件

```typescript
// 1. 引入 useTranslations
import { useTranslations } from 'next-intl'

export default function MyPage() {
  // 2. 初始化翻譯 hook
  const t = useTranslations('myPage') // 使用對應的命名空間

  // 3. 替換硬編碼文字
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

#### 2. 更新翻譯文件

**locales/zh-TW/common.json**:
```json
{
  "myPage": {
    "title": "我的頁面",
    "description": "這是頁面描述"
  }
}
```

**locales/en/common.json**:
```json
{
  "myPage": {
    "title": "My Page",
    "description": "This is the page description"
  }
}
```

**locales/ja/common.json**:
```json
{
  "myPage": {
    "title": "私のページ",
    "description": "これはページの説明です"
  }
}
```

#### 3. 測試檢查清單

- [ ] 切換到繁體中文，確認文字正確顯示
- [ ] 切換到英文，確認文字正確顯示
- [ ] 切換到日文，確認文字正確顯示
- [ ] 確認無 TypeScript 錯誤
- [ ] 確認無翻譯鍵值缺失錯誤（Console 檢查）

---

## 🎯 優先順序建議

### Phase 1: 核心功能頁面 (高優先級)

1. **對話相關**:
   - `conversations/page.tsx` - 用戶最常用的功能
   - `prompts/page.tsx` - 對話主題管理

2. **Avatar 相關**:
   - `custom-avatar/page.tsx` - 核心功能之一

### Phase 2: 知識庫管理 (中優先級)

3. **知識庫頁面**:
   - `knowledge/page.tsx` - 總覽頁面
   - `knowledge/persona/page.tsx` - Persona 定義
   - `knowledge/faq/page.tsx` - FAQ 管理
   - `knowledge/kpi/page.tsx` - KPI 字典

### Phase 3: 設定與進階功能 (低優先級)

4. **設定頁面**:
   - `settings/page.tsx` - 設定主頁
   - `settings/preferences/page.tsx` - 偏好設定
   - 其他設定子頁面

5. **進階功能**:
   - `avatar-lip-sync-test/page.tsx` - 測試頁面
   - `knowledge/decisions/page.tsx` - 決策日誌
   - `knowledge/meetings/page.tsx` - 會議摘要

---

## 🔧 技術細節

### 翻譯鍵值命名規範

**階層結構**:
```
頁面/功能區塊/元素/屬性
```

**範例**:
```json
{
  "dashboard": {
    "welcome": "歡迎回來",
    "stats": {
      "conversations": "對話次數",
      "totalTime": "總對話時長"
    },
    "quickStart": {
      "title": "快速開始",
      "startButton": "開始對話"
    }
  }
}
```

### 動態內容處理

**變數插值**:
```typescript
// 翻譯文件
{
  "greeting": "歡迎回來，{name}！"
}

// 元件中
<h1>{t('greeting', { name: userName })}</h1>
```

**複數形式**:
```typescript
// 翻譯文件
{
  "messageCount": "{count, plural, =0 {無訊息} =1 {1 則訊息} other {# 則訊息}}"
}

// 元件中
<p>{t('messageCount', { count: messageCount })}</p>
```

### 日期時間本地化

```typescript
import { useLocale } from 'next-intl'

const locale = useLocale()
const date = new Date()

// 本地化日期格式
const formattedDate = date.toLocaleDateString(locale, {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

---

## 📊 完成度統計

### 整體進度

```
基礎設施: ████████████████████ 100% (5/5)
UI 元件:  ████████████████████ 100% (2/2)
頁面內容: █░░░░░░░░░░░░░░░░░░░   6% (1/17)
────────────────────────────────────
總計:     ███░░░░░░░░░░░░░░░░░  33% (8/24)
```

### 各語言翻譯完整度

- 繁體中文 (zh-TW): ████████████████████ 100%
- 英文 (en):       ████████████████████ 100%
- 日文 (ja):       ████████████████████ 100%

---

## 🚀 下一步行動

### 立即可執行

1. **完成 conversations 頁面多語言化**
   - 檔案: `app/[locale]/(dashboard)/conversations/page.tsx`
   - 預估時間: 30 分鐘
   - 影響範圍: 高（核心功能）

2. **完成 custom-avatar 頁面多語言化**
   - 檔案: `app/[locale]/(dashboard)/custom-avatar/page.tsx`
   - 預估時間: 20 分鐘
   - 影響範圍: 高（核心功能）

### 批次處理建議

**知識庫頁面** (可批次處理):
- 所有知識庫相關頁面使用類似的 UI 模式
- 可建立共用的翻譯鍵值結構
- 預估總時間: 2-3 小時

**設定頁面** (可批次處理):
- 設定頁面結構相似
- 共用表單驗證訊息
- 預估總時間: 1.5-2 小時

---

## 🐛 已知問題

### 已解決

- ✅ Hydration 錯誤（嵌套 HTML 結構）
- ✅ 語言切換後頁面不更新
- ✅ Dashboard 頁面硬編碼中文

### 待解決

- ⏳ 其他 16 個頁面尚未多語言化
- ⏳ 某些元件（如 Modal、Toast）可能包含硬編碼文字

---

## 📚 參考資源

### 官方文件

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### 專案文件

- `docs/I18N_HYDRATION_FIX.md` - Hydration 錯誤修復記錄
- `CLAUDE.md` - 專案開發指南

### 相關檔案

- `i18n/request.ts` - 語言配置
- `middleware.ts` - Middleware 設定
- `components/layout/LanguageSwitcher.tsx` - 語言切換器

---

## 💡 最佳實踐

### Do's ✅

1. **使用語義化的鍵值名稱**
   ```json
   // Good
   { "welcomeMessage": "歡迎回來" }

   // Bad
   { "msg1": "歡迎回來" }
   ```

2. **保持翻譯文件同步**
   - 新增鍵值時同步更新所有語言文件
   - 避免某個語言缺少翻譯鍵值

3. **使用命名空間組織翻譯**
   ```typescript
   const t = useTranslations('dashboard')
   const tCommon = useTranslations('common')
   ```

4. **提供預設值**
   ```typescript
   {conversation.title || t('defaultTitle')}
   ```

### Don'ts ❌

1. **不要硬編碼文字**
   ```typescript
   // Bad
   <h1>歡迎回來</h1>

   // Good
   <h1>{t('welcome')}</h1>
   ```

2. **不要在翻譯文件中使用 HTML**
   ```json
   // Bad
   { "message": "<strong>重要</strong>訊息" }

   // Good - 使用 rich text 或分離鍵值
   { "message": "重要訊息" }
   ```

3. **不要忽略複數形式**
   ```typescript
   // Bad
   {count} 則訊息

   // Good
   {t('messageCount', { count })}
   ```

---

## 總結

目前 i18n 基礎設施已經完全建立，語言切換功能正常運作。下一步需要系統化地將所有頁面的硬編碼文字替換為翻譯鍵值。

建議按照優先順序分階段完成，先處理核心功能頁面，再逐步完成其他頁面的多語言化。
