# shadcn/ui 安裝指南
**Smart AI Avatar Agent - Sprint 1 UI 系統升級**

## 文件資訊
- **目的**: 將專案升級至完整的 Radix UI + shadcn/ui 設計系統
- **時程**: Sprint 1 Day 1 下午（2-3 小時）
- **狀態**: 待執行
- **最後更新**: 2025-10-15

---

## 目錄

1. [為什麼選擇 shadcn/ui](#為什麼選擇-shadcnui)
2. [當前狀態評估](#當前狀態評估)
3. [安裝步驟](#安裝步驟)
4. [組件安裝清單](#組件安裝清單)
5. [驗證測試](#驗證測試)
6. [故障排除](#故障排除)

---

## 為什麼選擇 shadcn/ui

### 核心優勢

1. **企業級品質**
   - 基於 Radix UI（無障礙標準 ARIA）
   - 完整的鍵盤導航支援
   - 焦點管理與螢幕閱讀器優化

2. **技術堆疊一致性**
   - 與您的另一個專案相同技術架構
   - 可共享組件和設計模式
   - 團隊學習成本低

3. **開發效率**
   - 複製即用（Copy & Paste）
   - 完整的 TypeScript 支援
   - 豐富的組件庫（40+ 組件）

4. **設計系統完整性**
   - CSS 變數驅動的主題系統
   - HSL 色彩系統（已內建於專案）
   - 暗色模式開箱即用

### 與其他方案比較

| 特性 | shadcn/ui | Material-UI | Ant Design | Chakra UI |
|------|-----------|-------------|------------|-----------|
| **檔案大小** | ⭐⭐⭐⭐⭐ (僅安裝所需) | ⭐⭐ (重) | ⭐⭐ (重) | ⭐⭐⭐ (中) |
| **客製化** | ⭐⭐⭐⭐⭐ (完全控制) | ⭐⭐⭐ (Theme) | ⭐⭐⭐ (Less) | ⭐⭐⭐⭐ (Theme) |
| **無障礙** | ⭐⭐⭐⭐⭐ (Radix UI) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **TypeScript** | ⭐⭐⭐⭐⭐ (完整) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **學習曲線** | ⭐⭐⭐⭐ (簡單) | ⭐⭐⭐ (中) | ⭐⭐⭐ (中) | ⭐⭐⭐⭐ (簡單) |

---

## 當前狀態評估

### ✅ 已完成（專案已內建）

```json
// package.json - 已安裝的核心工具
{
  "class-variance-authority": "^0.7.1",  // CVA for component variants
  "clsx": "^2.1.1",                      // Conditional className
  "tailwind-merge": "^3.3.1",            // Merge Tailwind classes
  "tailwindcss-animate": "^1.0.7"        // Animation utilities
}
```

**Tailwind 配置** (`tailwind.config.ts`):
- ✅ CSS 變數色彩系統
- ✅ 語義化命名（primary, secondary, destructive 等）
- ✅ 暗色模式支援（`darkMode: 'class'`）
- ✅ Container 系統
- ✅ 動畫系統（accordion-down/up）

**全域樣式** (`app/globals.css`):
- ✅ 16+ HSL 色彩變數
- ✅ 亮色/暗色主題完整定義
- ✅ 自訂滾動條樣式

**現有組件**:
- ✅ `components/ui/Button.tsx`（CVA 驅動的 variant 系統）
- ✅ `components/ui/input.tsx`（forwardRef + error 狀態）

### ❌ 需要安裝

1. **Radix UI 核心組件**（無樣式的 headless 組件）
2. **shadcn/ui 組件**（有樣式的完整組件）
3. **表單處理**（React Hook Form + Zod）

---

## 安裝步驟

### Step 1: 檢查 Node.js 版本

shadcn/ui 要求 Node.js ≥ 18

```bash
node -v
# 應顯示 v18.x.x 或更高版本
```

如果版本過舊，請升級：
```bash
# 使用 nvm（推薦）
nvm install 18
nvm use 18

# 或從 nodejs.org 下載安裝
```

---

### Step 2: 安裝表單處理套件

```bash
npm install react-hook-form zod @hookform/resolvers
```

**套件說明**:
- `react-hook-form`: 高效能表單處理（Uncontrolled Components）
- `zod`: TypeScript-first Schema 驗證
- `@hookform/resolvers`: React Hook Form 與 Zod 的整合套件

**預期輸出**:
```
added 3 packages, and audited 62 packages in 5s
```

---

### Step 3: 初始化 shadcn/ui

```bash
npx shadcn-ui@latest init
```

**互動式設定流程**:

```
√ Which style would you like to use? » Default
√ Which color would you like to use as base color? » Slate
√ Would you like to use CSS variables for colors? » yes (預設已是)
```

**說明**:
- ✅ **Style**: 選擇 "Default"（經典設計）
- ✅ **Base Color**: 選擇 "Slate"（中性灰，適合各種品牌色）
- ✅ **CSS Variables**: 選擇 "yes"（專案已使用 CSS 變數，保持一致）

**此步驟會做什麼**:
1. 在專案根目錄建立 `components.json`（shadcn/ui 配置檔）
2. 更新 `tailwind.config.ts`（新增 shadcn/ui 的路徑別名）
3. 更新 `lib/utils.ts`（確保 `cn()` 函數正確）

**預期生成的檔案** (`components.json`):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

### Step 4: 安裝 Sprint 1 必要組件

#### 4.1 核心組件（認證系統必需）

```bash
# 一次性安裝所有核心組件
npx shadcn-ui@latest add button input label form toast dropdown-menu dialog
```

**組件說明**:

| 組件 | 用途 | Sprint 1 使用場景 |
|------|------|-------------------|
| `button` | 按鈕 | 登入、註冊、送出表單 |
| `input` | 輸入框 | Email、密碼輸入 |
| `label` | 標籤 | 表單欄位標籤 |
| `form` | 表單容器 | React Hook Form 整合 |
| `toast` | 通知訊息 | 成功/錯誤訊息提示 |
| `dropdown-menu` | 下拉選單 | 使用者選單（登出、設定） |
| `dialog` | 對話框 | 密碼重設確認 |

**安裝過程**:
```
√ Which components would you like to add? » button input label form toast dropdown-menu dialog
√ Checking registry...
√ Installing dependencies...
√ Installing components...

✓ button installed
✓ input installed
✓ label installed
✓ form installed
✓ toast installed
✓ dropdown-menu installed
✓ dialog installed
```

#### 4.2 額外實用組件（可選，但推薦）

```bash
# 增強使用者體驗的組件
npx shadcn-ui@latest add card separator avatar skeleton
```

**組件說明**:

| 組件 | 用途 | 使用場景 |
|------|------|----------|
| `card` | 卡片容器 | 登入/註冊表單背景 |
| `separator` | 分隔線 | "或使用" OAuth 分隔線 |
| `avatar` | 頭像 | 使用者選單頭像 |
| `skeleton` | 骨架屏 | Loading 狀態 |

---

### Step 5: 驗證安裝結果

#### 5.1 檢查檔案結構

```bash
# 應看到新增的組件檔案
ls components/ui
```

**預期輸出**:
```
avatar.tsx
button.tsx
card.tsx
dialog.tsx
dropdown-menu.tsx
form.tsx
input.tsx
label.tsx
separator.tsx
skeleton.tsx
toast.tsx
toaster.tsx
```

#### 5.2 檢查依賴套件

```bash
# 檢查 package.json 是否包含 Radix UI 套件
cat package.json | grep "@radix-ui"
```

**預期輸出** (部分):
```json
"@radix-ui/react-dialog": "^1.0.5",
"@radix-ui/react-dropdown-menu": "^2.0.6",
"@radix-ui/react-label": "^2.0.2",
"@radix-ui/react-toast": "^1.1.5",
"@radix-ui/react-slot": "^1.0.2"
```

#### 5.3 測試 TypeScript 編譯

```bash
npx tsc --noEmit
```

**預期輸出**:
```
# 無錯誤訊息（或僅有既有的錯誤）
```

---

## 組件安裝清單

### 認證系統專用組件（Sprint 1 必需）

#### ✅ Form Component

**檔案**: `components/ui/form.tsx`

**功能**:
- React Hook Form 整合
- Zod Schema 驗證
- 自動錯誤訊息顯示
- 無障礙標籤關聯

**使用範例**:
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(8, '密碼至少 8 字元'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密碼</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">登入</Button>
      </form>
    </Form>
  )
}
```

---

#### ✅ Toast Component

**檔案**: `components/ui/toast.tsx`, `components/ui/toaster.tsx`

**功能**:
- 成功/錯誤/警告訊息通知
- 自動消失（可設定時間）
- 可關閉
- 堆疊顯示多個通知

**設定步驟**:

1. 在 `app/layout.tsx` 中加入 Toaster:
```tsx
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <SessionProvider>
          <Header />
          {children}
          <Toaster /> {/* 加入此行 */}
        </SessionProvider>
      </body>
    </html>
  )
}
```

2. 使用 Toast:
```tsx
import { useToast } from '@/components/ui/use-toast'

export function RegisterPage() {
  const { toast } = useToast()

  const handleSubmit = async (data) => {
    try {
      // 註冊邏輯
      toast({
        title: '註冊成功',
        description: '您的帳號已建立，正在為您登入...',
      })
    } catch (error) {
      toast({
        title: '註冊失敗',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

#### ✅ Dropdown Menu Component

**檔案**: `components/ui/dropdown-menu.tsx`

**功能**:
- 使用者選單
- 鍵盤導航支援
- 自動定位（避免超出視窗）
- 分隔線與子選單支援

**使用範例**（Header 使用者選單）:
```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function UserMenu() {
  const { data: session } = useSession()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={session?.user?.image} />
            <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>我的帳號</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">設定</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

#### ✅ Dialog Component

**檔案**: `components/ui/dialog.tsx`

**功能**:
- 模態對話框
- 背景遮罩（點擊關閉）
- ESC 鍵關閉
- 焦點陷阱（無障礙）
- 動畫效果

**使用範例**（密碼重設確認）:
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function PasswordResetConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">忘記密碼？</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重設密碼</DialogTitle>
          <DialogDescription>
            我們會發送重設連結到您的 Email 信箱。
          </DialogDescription>
        </DialogHeader>
        {/* 表單內容 */}
      </DialogContent>
    </Dialog>
  )
}
```

---

### 輔助組件（提升 UX）

#### ✅ Card Component

**使用場景**: 登入/註冊表單的容器

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登入</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 登入表單 */}
        </CardContent>
      </Card>
    </div>
  )
}
```

#### ✅ Separator Component

**使用場景**: OAuth 分隔線

```tsx
import { Separator } from '@/components/ui/separator'

<div className="space-y-4">
  <Button>使用 Email 登入</Button>

  <div className="relative">
    <Separator />
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">
      或使用
    </span>
  </div>

  <Button variant="outline">使用 Google 登入</Button>
</div>
```

#### ✅ Skeleton Component

**使用場景**: Loading 狀態

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-24" />
    </div>
  )
}
```

---

## 驗證測試

### Test 1: Button Component

建立測試檔案 `app/test-ui/page.tsx`:

```tsx
import { Button } from '@/components/ui/button'

export default function TestUIPage() {
  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">shadcn/ui 組件測試</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
        <div className="flex gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>
      </section>
    </div>
  )
}
```

**驗收標準**:
- ✅ 訪問 `http://localhost:3000/test-ui` 可看到測試頁面
- ✅ 所有按鈕正確顯示
- ✅ Hover 效果正常
- ✅ 無 TypeScript 錯誤

---

### Test 2: Form Component

在測試頁面新增:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

const formSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z.string().min(8, '密碼至少 8 字元'),
})

export function TestForm() {
  const { toast } = useToast()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: '表單已送出',
      description: `Email: ${values.email}`,
    })
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Form 測試</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="test@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>密碼</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">送出</Button>
        </form>
      </Form>
    </section>
  )
}
```

**驗收標準**:
- ✅ 輸入無效 Email → 顯示錯誤訊息
- ✅ 密碼少於 8 字元 → 顯示錯誤訊息
- ✅ 送出表單 → 顯示 Toast 通知
- ✅ 表單驗證即時生效

---

### Test 3: Toast Component

在測試頁面新增:

```tsx
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export function TestToast() {
  const { toast } = useToast()

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Toast 測試</h2>
      <div className="flex gap-4">
        <Button
          onClick={() =>
            toast({
              title: '成功',
              description: '操作已完成',
            })
          }
        >
          成功通知
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            toast({
              title: '錯誤',
              description: '操作失敗，請重試',
              variant: 'destructive',
            })
          }
        >
          錯誤通知
        </Button>
      </div>
    </section>
  )
}
```

**驗收標準**:
- ✅ 點擊按鈕 → Toast 顯示在螢幕右下角
- ✅ Toast 自動消失（5 秒後）
- ✅ 可點擊 X 手動關閉
- ✅ 多個 Toast 堆疊顯示

---

## 故障排除

### 問題 1: `npx shadcn-ui@latest init` 失敗

**錯誤訊息**:
```
Error: Could not find a valid Next.js project in the current directory.
```

**解決方案**:
```bash
# 確認在專案根目錄執行（有 package.json 的位置）
pwd
# 應顯示: C:\smart-ai-avatar-agent

# 確認 Next.js 已安裝
npm list next
# 應顯示: next@15.5.5
```

---

### 問題 2: TypeScript 錯誤 - 找不到模組

**錯誤訊息**:
```
Cannot find module '@/components/ui/button' or its corresponding type declarations.
```

**解決方案**:

1. 檢查 `tsconfig.json` 路徑別名:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. 重啟 TypeScript Server:
   - VSCode: Ctrl+Shift+P → "TypeScript: Restart TS Server"

3. 重新安裝依賴:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### 問題 3: Radix UI 套件版本衝突

**錯誤訊息**:
```
ERESOLVE unable to resolve dependency tree
```

**解決方案**:
```bash
# 使用 --legacy-peer-deps 標誌
npm install --legacy-peer-deps

# 或使用 --force（不推薦）
npm install --force
```

---

### 問題 4: Toast 不顯示

**症狀**: 呼叫 `toast()` 後沒有任何通知

**檢查清單**:
1. ✅ `app/layout.tsx` 有加入 `<Toaster />`
2. ✅ `useToast()` 從正確路徑 import
3. ✅ Toast 沒有被其他元素遮擋（z-index 問題）

**解決方案**:
```tsx
// app/layout.tsx
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster /> {/* 必須加在這裡 */}
      </body>
    </html>
  )
}
```

---

### 問題 5: CSS 變數未生效

**症狀**: 組件顏色不正確或顯示為黑色

**檢查清單**:
1. ✅ `app/globals.css` 有定義所有 CSS 變數
2. ✅ `:root` 和 `.dark` 都有定義
3. ✅ Tailwind 配置有 extend colors

**解決方案**:

確認 `app/globals.css` 包含完整色彩定義（已在專案中，無需修改）:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... 其他變數 */
}
```

如果仍有問題，清除 Next.js 快取:
```bash
rm -rf .next
npm run dev
```

---

### 問題 6: Form 表單驗證不即時

**症狀**: 輸入錯誤後，離焦才顯示錯誤訊息

**解決方案**:

在 `useForm()` 設定 `mode`:
```tsx
const form = useForm({
  resolver: zodResolver(formSchema),
  mode: 'onChange', // 即時驗證
  // 或 mode: 'onBlur' // 離焦驗證（預設）
})
```

---

## 完成檢查清單

### 安裝階段

- [ ] Node.js 版本 ≥ 18
- [ ] 安裝 React Hook Form + Zod
- [ ] 執行 `npx shadcn-ui@latest init`
- [ ] 生成 `components.json`
- [ ] 安裝 7 個核心組件（button, input, label, form, toast, dropdown-menu, dialog）
- [ ] 安裝 4 個輔助組件（card, separator, avatar, skeleton）

### 測試階段

- [ ] 建立 `app/test-ui/page.tsx` 測試頁面
- [ ] Button Component 測試通過
- [ ] Form Component 測試通過（驗證生效）
- [ ] Toast Component 測試通過（顯示 & 消失）
- [ ] Dropdown Menu 測試通過
- [ ] 無 TypeScript 錯誤
- [ ] 無 ESLint 錯誤

### 整合階段

- [ ] 在 `app/layout.tsx` 加入 `<Toaster />`
- [ ] 刪除測試頁面 `app/test-ui`（或保留供日後測試）
- [ ] 更新 Sprint 1 Day 2 開始使用新組件
- [ ] 更新 `.gitignore` 確認不包含 `components/ui`（應提交至 Git）

---

## 時程估算

| 階段 | 預估時間 | 說明 |
|------|---------|------|
| **Step 1-2**: 安裝套件 | 15 分鐘 | npm install |
| **Step 3**: 初始化 shadcn/ui | 5 分鐘 | 互動式設定 |
| **Step 4**: 安裝組件 | 20 分鐘 | 11 個組件 |
| **Step 5**: 驗證測試 | 30 分鐘 | 建立測試頁面 |
| **除錯緩衝時間** | 30 分鐘 | 處理意外問題 |
| **總計** | **1.5-2 小時** | 包含測試與除錯 |

---

## 下一步行動

### 完成此指南後

1. **更新 Sprint 1 Day 1 時程**:
   - 原 Day 1（1 天）→ 新 Day 1（1.5 天）
   - 上午：認證套件 + Azure PostgreSQL 設定
   - 下午：shadcn/ui 安裝與測試

2. **從 Day 2 開始使用新組件**:
   - 註冊頁面使用 `Form` + `Card` + `Toast`
   - 登入頁面使用 `Separator`（OAuth 分隔線）
   - Header 使用 `DropdownMenu` + `Avatar`

3. **刪除舊組件**（可選）:
   - 保留 `components/ui/Button.tsx`（shadcn 版本功能更完整）
   - 保留 `components/ui/input.tsx`（作為對比參考）
   - Sprint 1 結束後統一清理

---

**文件維護**: Development Team
**最後更新**: 2025-10-15
**狀態**: 待執行（Sprint 1 Day 1）
