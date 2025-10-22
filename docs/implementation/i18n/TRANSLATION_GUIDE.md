# 翻譯指南 (Translation Guide)

## 概述

本專案使用 `next-intl` 實現多語言支援,目前支援以下語言:

- **繁體中文** (zh-TW) - 預設語言
- **English** (en) - 英文
- **日本語** (ja) - 日文

## 檔案結構

```
locales/
├── zh-TW/
│   └── common.json      # 繁體中文翻譯
├── en/
│   └── common.json      # 英文翻譯
└── ja/
    └── common.json      # 日文翻譯
```

## 翻譯內容結構

每個語言的 `common.json` 包含以下翻譯類別:

### 1. 導航 (nav)
- 頁面導航相關文字 (首頁、控制台、對話記錄等)

### 2. 認證 (auth)
- 登入、註冊、密碼重設相關文字

### 3. 按鈕 (button)
- 通用按鈕文字 (提交、取消、儲存等)

### 4. 表單 (form)
- 表單驗證錯誤訊息

### 5. 錯誤 (error)
- 系統錯誤訊息

### 6. 成功 (success)
- 操作成功訊息

### 7. 控制台 (dashboard)
- 控制台頁面文字

### 8. 設定 (settings)
- 設定頁面文字

### 9. 個人資料 (profile)
- 個人資料頁面文字

### 10. 對話 (chat)
- 對話介面文字

### 11. 虛擬角色 (avatar)
- Avatar 相關文字

### 12. 對話記錄 (conversation)
- 對話記錄頁面文字

### 13. 語言 (language)
- 語言切換相關文字

## 使用方式

### 在 Server Component 中使用

```tsx
import { useTranslations } from 'next-intl'

export default function MyPage() {
  const t = useTranslations('nav')

  return <h1>{t('home')}</h1>
}
```

### 在 Client Component 中使用

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('button')

  return <button>{t('submit')}</button>
}
```

### 使用參數化翻譯

```tsx
const t = useTranslations('conversation')

// 顯示: "5 則訊息" (zh-TW) 或 "5 messages" (en)
<p>{t('messageCount', { count: 5 })}</p>
```

## 語言切換

### LanguageSwitcher 組件

位於 `components/LanguageSwitcher.tsx`,提供下拉選單切換語言。

**使用方式:**

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function MyLayout() {
  return (
    <nav>
      <LanguageSwitcher />
    </nav>
  )
}
```

**功能特性:**

1. **localStorage 持久化**: 自動儲存使用者語言偏好
2. **伺服器端偵測**: 根據 `Accept-Language` header 自動偵測語言
3. **URL 路由**: 語言前綴自動加入 URL (例如 `/zh-TW/dashboard`)
4. **即時切換**: 無需重新載入頁面

## 路由結構

專案使用 Next.js App Router 的動態路由來處理多語言:

```
app/
└── [locale]/
    ├── layout.tsx          # 包含 NextIntlClientProvider
    ├── page.tsx            # 首頁
    ├── (dashboard)/        # Dashboard 路由組
    │   ├── dashboard/
    │   ├── conversations/
    │   ├── settings/
    │   └── profile/
    └── (auth)/             # 認證路由組
        ├── login/
        ├── register/
        └── reset-password/
```

所有路由自動包含語言前綴:
- `/zh-TW/dashboard`
- `/en/dashboard`
- `/ja/dashboard`

## Middleware 整合

`middleware.ts` 整合了 i18n 與認證邏輯:

1. **語言路由處理**: 自動在路由中加上語言前綴
2. **認證保護**: 未登入使用者重導向到登入頁 (保留語言前綴)
3. **語言偵測**: 根據 `Accept-Language` header 或 localStorage 自動偵測

## 新增翻譯步驟

### 1. 在翻譯檔案中新增 key

編輯 `locales/zh-TW/common.json`:

```json
{
  "myNewFeature": {
    "title": "我的新功能",
    "description": "功能描述"
  }
}
```

### 2. 在其他語言檔案中新增對應翻譯

編輯 `locales/en/common.json`:

```json
{
  "myNewFeature": {
    "title": "My New Feature",
    "description": "Feature description"
  }
}
```

編輯 `locales/ja/common.json`:

```json
{
  "myNewFeature": {
    "title": "新機能",
    "description": "機能説明"
  }
}
```

### 3. 在元件中使用

```tsx
const t = useTranslations('myNewFeature')

<div>
  <h2>{t('title')}</h2>
  <p>{t('description')}</p>
</div>
```

## 新增支援語言

### 1. 更新語言設定

編輯 `i18n.ts`:

```typescript
export const locales = ['zh-TW', 'en', 'ja', 'ko'] as const  // 新增 'ko' (韓文)
```

### 2. 建立翻譯檔案

```bash
mkdir locales/ko
cp locales/en/common.json locales/ko/common.json
```

### 3. 翻譯內容

編輯 `locales/ko/common.json` 並翻譯所有內容。

### 4. 更新 LanguageSwitcher

語言切換器會自動偵測 `locales` 陣列中的所有語言,無需修改。

### 5. 更新 Middleware

Middleware 會自動支援新語言,無需修改。

## 翻譯品質檢查

### 1. 確保所有語言檔案結構一致

```bash
# 使用 JSON 比對工具檢查
diff <(jq -S 'keys' locales/zh-TW/common.json) <(jq -S 'keys' locales/en/common.json)
```

### 2. 檢查遺漏的翻譯

確保每個語言檔案都包含相同的 key。

### 3. 測試參數化翻譯

確保包含參數的翻譯 (如 `{count}`, `{time}`) 在所有語言中都正確設定。

## 最佳實踐

### 1. 翻譯 Key 命名

- **使用語意化命名**: `auth.forgotPassword` 而非 `auth.fp`
- **分類清晰**: 按功能模組分組 (nav, auth, form 等)
- **避免重複**: 通用文字放在 `button` 或 `common` 類別

### 2. 參數化翻譯

使用參數而非字串拼接:

```json
// ✅ 正確
"messageCount": "{count} 則訊息"

// ❌ 錯誤
"messageCount": "則訊息"  // 然後在程式中拼接
```

### 3. 複數形式

next-intl 支援 ICU 格式的複數形式:

```json
{
  "items": "{count, plural, =0 {無項目} =1 {1 個項目} other {# 個項目}}"
}
```

### 4. 日期和時間

使用 `next-intl` 的 format utilities:

```tsx
import { useFormatter } from 'next-intl'

const format = useFormatter()
const dateTime = new Date('2025-10-17T10:30:00')

// 自動根據語言格式化
format.dateTime(dateTime, { dateStyle: 'medium', timeStyle: 'short' })
// zh-TW: "2025年10月17日 上午10:30"
// en: "Oct 17, 2025, 10:30 AM"
// ja: "2025年10月17日 10:30"
```

## 測試

### 1. 手動測試語言切換

1. 啟動開發伺服器: `npm run dev`
2. 開啟瀏覽器到 `http://localhost:3000`
3. 使用 LanguageSwitcher 切換語言
4. 確認所有文字正確翻譯

### 2. 測試語言持久化

1. 切換到非預設語言 (例如英文)
2. 重新整理頁面
3. 確認語言偏好被保留

### 3. 測試路由處理

確認以下 URL 都能正確運作:

- `/zh-TW/dashboard`
- `/en/dashboard`
- `/ja/dashboard`
- `/zh-TW/settings`
- `/en/settings`
- `/ja/settings`

## 疑難排解

### 問題: 翻譯未顯示

**可能原因:**
1. 翻譯 key 拼寫錯誤
2. 翻譯檔案 JSON 格式錯誤
3. 未正確 import `useTranslations`

**解決方法:**
1. 檢查 Console 錯誤訊息
2. 驗證 JSON 檔案格式: `npx jsonlint locales/zh-TW/common.json`
3. 確認 `useTranslations('category')` 的 category 名稱正確

### 問題: 語言切換後 URL 未更新

**可能原因:**
1. Middleware 配置錯誤
2. `localePrefix` 設定不正確

**解決方法:**
1. 檢查 `middleware.ts` 配置
2. 確認 `i18n.ts` 中的 `locales` 陣列包含該語言

### 問題: 伺服器端語言偵測失敗

**可能原因:**
1. `Accept-Language` header 未設定
2. Middleware 未正確執行

**解決方法:**
1. 檢查瀏覽器語言設定
2. 檢查 Middleware 執行順序

## 參考資源

- **next-intl 官方文件**: https://next-intl-docs.vercel.app/
- **ICU Message Format**: https://unicode-org.github.io/icu/userguide/format_parse/messages/
- **專案 i18n 配置**: `/i18n.ts`
- **Middleware 配置**: `/middleware.ts`

## 更新記錄

- **2025-10-17**: 初始版本 - 完成繁體中文、英文、日文翻譯
