# 知識庫管理系統 - 問題診斷與解決方案

> **文件版本**: 1.0.0
> **更新日期**: 2025-10-21
> **狀態**: 已解決

---

## 📋 問題總覽

本文件記錄知識庫管理系統開發過程中遇到的問題及其解決方案。

---

## 問題 #1: Persona 編輯器章節導航渲染錯誤

### 錯誤訊息

```
Error: Objects are not valid as a React child
(found: object with keys {title, content, wordCount, isComplete, warnings})
```

### 問題描述

訪問 `http://localhost:3002/zh-TW/knowledge/persona` 時，頁面拋出 React 渲染錯誤，無法正常顯示。

### 根本原因

**API 回傳結構與前端型別定義不一致**

API (`/api/knowledge/persona`) 回傳的 `structure.sections` 是**物件陣列**：

```typescript
sections: [
  {
    title: "核心身份",
    content: "(Core Identity)...",
    wordCount: 13,
    isComplete: false,
    warnings: ["內容過短，建議補充更多細節"]
  },
  // ...
]
```

但前端型別定義為**字串陣列**：

```typescript
// 錯誤的型別定義
structure: {
  sections: string[]  // ❌ 不正確
}
```

前端程式碼直接渲染物件：

```tsx
{personaData.structure.sections.map((section, idx) => (
  <div>{section}</div>  // ❌ 試圖渲染物件
))}
```

### 解決方案

**步驟 1: 新增正確的型別定義**

```typescript
// ✅ 新增 PersonaSection 介面
interface PersonaSection {
  title: string
  content: string
  wordCount: number
  isComplete: boolean
  warnings: string[]
}

interface PersonaData {
  // ...
  structure: {
    sections: PersonaSection[]  // ✅ 使用物件陣列
    completeness: number
    consistency: number
  }
}
```

**步驟 2: 修正渲染邏輯**

```tsx
// ✅ 只渲染 title 欄位
{personaData.structure.sections.map((section, idx) => (
  <div key={idx}>
    {section.title}  // ✅ 正確渲染字串
  </div>
))}
```

### 修改檔案

- `app/[locale]/(dashboard)/knowledge/persona/page.tsx`
  - 新增 `PersonaSection` 介面
  - 更新 `PersonaData` 介面
  - 修正章節導航渲染邏輯

### 驗證方式

1. 重新載入 `http://localhost:3002/zh-TW/knowledge/persona`
2. 確認章節導航顯示 10 個章節標題
3. 確認無 React 錯誤

---

## 問題 #2: Monaco Editor 內容顯示不完整

### 問題描述

Persona 編輯器中的 Markdown 編輯器只顯示部分內容，無法看到完整的 Persona 定義。

### 根本原因

**Placeholder 邏輯錯誤覆蓋實際內容**

在 `MarkdownEditor.tsx` 的 `handleEditorDidMount` 函數中：

```typescript
// ❌ 錯誤邏輯
if (!value && placeholder) {
  editor.setValue(placeholder)
  editor.setSelection(new monaco.Selection(1, 1, 100, 100))
}
```

問題：
1. 此邏輯在 `onMount` 時執行，但 `value` prop 可能尚未傳入
2. 即使有實際內容，也可能被 placeholder 覆蓋
3. `setSelection` 範圍不正確

### 解決方案

**移除手動設置邏輯，讓 Monaco Editor 自動處理**

```typescript
// ✅ 正確做法：不需要手動設置
// Monaco Editor 會透過 value prop 自動處理內容顯示
```

Monaco Editor 的 `value` prop 已經會自動處理初始內容和更新，不需要在 `onMount` 時手動設置。

### 修改檔案

- `components/knowledge/MarkdownEditor.tsx`
  - 移除 placeholder 手動設置邏輯
  - 保留 placeholder prop 供未來使用（可用於空狀態提示）

### 驗證方式

1. 訪問 Persona 編輯器
2. 確認可以看到完整的 11,542 字元內容
3. 確認滾動條正常運作
4. 確認可以編輯所有內容

---

## 問題 #3: 決策日誌頁面 404 錯誤

### 問題描述

訪問 `http://localhost:3002/zh-TW/knowledge/decisions` 時顯示 404 錯誤。

### 根本原因

**頁面尚未實作**

側邊欄導航已新增「決策日誌」入口，但對應的頁面檔案尚未建立。

### 解決方案

**建立佔位頁面**

建立 `app/[locale]/(dashboard)/knowledge/decisions/page.tsx`，顯示「即將推出」訊息。

```tsx
export default function DecisionsPage() {
  return (
    <div className="text-center">
      <Construction className="h-24 w-24" />
      <h1>決策日誌管理</h1>
      <p>此功能正在開發中，即將推出！</p>
      <ul>
        <li>時間線展示重要決策</li>
        <li>結構化表單編輯</li>
        <li>選項比較視圖</li>
      </ul>
      <Link href="/knowledge">返回知識庫總覽</Link>
    </div>
  )
}
```

### 修改檔案

- ✅ 新建 `app/[locale]/(dashboard)/knowledge/decisions/page.tsx`

### 預計完整實作時間

約 1.5 小時（包含時間線展示、結構化表單、選項比較視圖）

---

## 問題 #4: 會議摘要頁面 404 錯誤

### 問題描述

訪問 `http://localhost:3002/zh-TW/knowledge/meetings` 時顯示 404 錯誤。

### 根本原因

**頁面尚未實作**

側邊欄導航已新增「會議摘要」入口，但對應的頁面檔案尚未建立。

### 解決方案

**建立佔位頁面**

建立 `app/[locale]/(dashboard)/knowledge/meetings/page.tsx`，顯示「即將推出」訊息。

```tsx
export default function MeetingsPage() {
  return (
    <div className="text-center">
      <Construction className="h-24 w-24" />
      <h1>會議摘要管理</h1>
      <p>此功能正在開發中，即將推出！</p>
      <ul>
        <li>會議列表（分頁）</li>
        <li>待辦事項追蹤</li>
        <li>批次歸檔功能</li>
      </ul>
      <Link href="/knowledge">返回知識庫總覽</Link>
    </div>
  )
}
```

### 修改檔案

- ✅ 新建 `app/[locale]/(dashboard)/knowledge/meetings/page.tsx`

### 預計完整實作時間

約 1.5 小時（包含會議列表、待辦事項追蹤、批次歸檔）

---

## 預防措施

### 1. 型別定義與 API 回傳結構保持一致

**最佳實踐**：
- API 開發完成後，根據實際回傳結構定義 TypeScript 介面
- 使用 `curl` 或 Postman 測試 API，確認回傳格式
- 前端型別定義應完全匹配 API 回傳結構

**範例檢查**：
```bash
# 測試 API 回傳結構
curl -s http://localhost:3002/api/knowledge/persona | jq '.data.structure.sections[0]'

# 輸出應該包含完整的物件結構
{
  "title": "核心身份",
  "content": "...",
  "wordCount": 13,
  "isComplete": false,
  "warnings": [...]
}
```

### 2. 元件開發前測試 API

**開發流程**：
1. ✅ 完成 API 開發
2. ✅ 使用 curl/Postman 測試 API
3. ✅ 根據實際回傳定義型別
4. ✅ 開發前端元件
5. ✅ 整合測試

### 3. 導航項目與頁面同步

**檢查清單**：
- [ ] 側邊欄新增導航項目
- [ ] 建立對應的頁面檔案
- [ ] 測試導航連結可正常訪問
- [ ] 確認無 404 錯誤

### 4. Monaco Editor 使用注意事項

**正確用法**：
```tsx
<Editor
  value={content}           // ✅ 透過 prop 控制內容
  onChange={handleChange}   // ✅ 透過 callback 更新
  // ❌ 不要在 onMount 中手動 setValue
/>
```

**避免的做法**：
- ❌ 在 `onMount` 中使用 `editor.setValue()`
- ❌ 手動操作 editor 實例來設置內容
- ❌ 不正確的 selection 範圍

---

## 測試檢查清單

### Persona 編輯器

- [x] 頁面正常載入，無 React 錯誤
- [x] 章節導航顯示所有章節標題
- [x] Markdown 編輯器顯示完整內容
- [x] 即時預覽正常渲染
- [x] 儲存功能正常運作
- [x] Ctrl+S 快捷鍵正常

### FAQ 管理

- [x] 列表正常顯示（空狀態）
- [x] 新增 FAQ 表單正常
- [x] 搜尋功能正常
- [x] 標籤篩選正常

### KPI 管理

- [x] 列表正常顯示（空狀態）
- [x] 新增 KPI 表單正常
- [x] SQL 語法顯示正常
- [x] 篩選功能正常

### 導航測試

- [x] 知識庫總覽可訪問
- [x] Persona 編輯器可訪問
- [x] FAQ 管理可訪問
- [x] KPI 管理可訪問
- [x] 決策日誌顯示「即將推出」
- [x] 會議摘要顯示「即將推出」

---

## 總結

### 已解決問題

✅ **問題 #1**: Persona 章節導航渲染錯誤 - 已修正型別定義
✅ **問題 #2**: Monaco Editor 內容顯示不完整 - 已移除錯誤邏輯
✅ **問題 #3**: 決策日誌 404 錯誤 - 已建立佔位頁面
✅ **問題 #4**: 會議摘要 404 錯誤 - 已建立佔位頁面

### 系統狀態

🟢 **核心功能正常** - Persona、FAQ、KPI 管理完全可用
🟡 **進階功能開發中** - 決策日誌、會議摘要待實作
🟢 **無已知錯誤** - 所有測試通過

### 下次開發注意事項

1. **API 優先** - 先完成並測試 API，再開發前端
2. **型別一致** - 確保 TypeScript 型別與 API 回傳完全一致
3. **完整測試** - 每個功能完成後進行完整的瀏覽器測試
4. **導航同步** - 新增導航項目時同步建立頁面

---

**文件維護者**: AI Development Team
**最後驗證**: 2025-10-21 15:00
**系統版本**: 1.0.0
