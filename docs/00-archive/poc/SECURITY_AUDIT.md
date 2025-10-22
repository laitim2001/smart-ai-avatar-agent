# 安全性稽核報告

**專案**: Smart AI Avatar Agent
**稽核日期**: 2025-10-17
**稽核範圍**: OWASP Top 10, 依賴漏洞, CSP/CORS 配置
**稽核人員**: Claude Code

---

## 執行摘要

本報告涵蓋 Sprint 11 Phase 3 的完整安全性稽核，包括：
- OWASP Top 10 (2021) 檢查
- 依賴漏洞掃描 (npm audit)
- CSP (Content Security Policy) 設定
- CORS (Cross-Origin Resource Sharing) 配置

### 整體安全狀態

**總體評分**: ✅ **良好** (8/10)

**關鍵發現**:
- ✅ 8 項 OWASP Top 10 風險已妥善處理
- ⚠️ 2 項需要額外配置 (CSP, 日誌監控完整化)
- ⚠️ 4 個低風險依賴漏洞 (測試工具相關，非生產環境)

---

## 1. OWASP Top 10 (2021) 檢查

### A01:2021 - Broken Access Control ✅

**狀態**: **已防護**

**實作措施**:
- ✅ NextAuth.js v5 session 管理
- ✅ Middleware 路由保護 (`middleware.ts`)
- ✅ API Route 權限檢查 (透過 `auth()` helper)
- ✅ Protected routes 自動重導向到 `/login`

**程式碼參考**:
```typescript
// middleware.ts
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
    }
    return
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  }
})
```

**建議**: 無，已妥善實作

---

### A02:2021 - Cryptographic Failures ✅

**狀態**: **已防護**

**實作措施**:
- ✅ bcryptjs 雜湊密碼 (12 rounds salt)
- ✅ NextAuth.js 安全 session 管理
- ✅ HTTPS 強制執行 (production)
- ✅ 環境變數安全儲存 (`.env.local` gitignored)

**程式碼參考**:
```typescript
// lib/auth/password.ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
```

**建議**: 無，已妥善實作

---

### A03:2021 - Injection ✅

**狀態**: **已防護**

**實作措施**:
- ✅ Prisma ORM 參數化查詢 (自動防止 SQL Injection)
- ✅ React 自動 XSS 防護 (JSX escaping)
- ✅ Zod schema 驗證 (輸入清理)
- ✅ 無直接 SQL 查詢

**程式碼參考**:
```typescript
// Prisma 參數化查詢範例
const user = await db.user.findUnique({
  where: { email },  // 自動參數化，防止 SQL Injection
})

// Zod 驗證範例
const registerSchema = z.object({
  name: z.string().min(1, '姓名為必填').max(50),
  email: z.string().email('無效的 Email 格式'),
  password: z.string().min(8, '密碼至少 8 個字元'),
})
```

**建議**: 無，已妥善實作

---

### A04:2021 - Insecure Design ✅

**狀態**: **已防護**

**實作措施**:
- ✅ Rate limiting (Upstash Redis + middleware)
- ✅ Password reset token 過期機制 (24 小時)
- ✅ Email verification token 過期機制 (24 小時)
- ✅ CSRF 保護 (NextAuth.js 內建)

**程式碼參考**:
```typescript
// lib/redis/rate-limit.ts
export async function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60000
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, Math.floor(windowMs / 1000))
  }

  const isAllowed = count <= maxRequests
  const remaining = Math.max(0, maxRequests - count)

  return { isAllowed, remaining, reset: Date.now() + windowMs }
}
```

**建議**: 無，已妥善實作

---

### A05:2021 - Security Misconfiguration ⚠️

**狀態**: **部分實作**

**已實作**:
- ✅ 環境變數分離 (`.env` 不提交)
- ✅ HTTPS only (production)
- ✅ Secure headers (Next.js 預設)

**待加強**:
- ⚠️ **CSP (Content Security Policy) 未完整設定**
- ⚠️ CORS 配置需要明確定義

**建議**:

1. **設定 CSP Headers** (在 `next.config.js` 或 `middleware.ts`):
```typescript
// next.config.js (建議)
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.openai.azure.com https://*.cognitiveservices.azure.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

2. **設定 CORS** (API Routes):
```typescript
// lib/api/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}
```

**優先級**: **高** (建議在 Sprint 12 實作)

---

### A06:2021 - Vulnerable and Outdated Components ⚠️

**狀態**: **部分風險**

**npm audit 結果**:
```
4 low severity vulnerabilities

Package: tmp (<=0.2.3)
Risk: Low
Impact: 測試工具依賴，不影響生產環境
Path: @lhci/cli > inquirer > external-editor > tmp
```

**分析**:
- ✅ 核心生產依賴無漏洞
- ✅ React, Next.js, Prisma 皆為最新穩定版本
- ⚠️ 4 個低風險漏洞皆為開發/測試工具 (@lhci/cli)
- ✅ 不影響生產環境安全性

**建議**:
- **短期**: 可接受，僅影響開發環境
- **中期**: 監控 @lhci/cli 更新，待官方修復後升級
- **長期**: 定期執行 `npm audit` (建議每週)

**優先級**: **低**

---

### A07:2021 - Identification and Authentication Failures ✅

**狀態**: **已防護**

**實作措施**:
- ✅ NextAuth.js v5 session 管理
- ✅ 密碼強度驗證 (最少 8 字元)
- ✅ Email verification 流程
- ✅ Password reset 安全流程
- ✅ Rate limiting 防暴力破解
- ✅ Session 過期機制

**程式碼參考**:
```typescript
// Zod password validation
const passwordSchema = z
  .string()
  .min(8, '密碼至少 8 個字元')
  .regex(/[A-Z]/, '密碼必須包含至少一個大寫字母')
  .regex(/[a-z]/, '密碼必須包含至少一個小寫字母')
  .regex(/[0-9]/, '密碼必須包含至少一個數字')
```

**建議**: 無，已妥善實作

---

### A08:2021 - Software and Data Integrity Failures ✅

**狀態**: **已防護**

**實作措施**:
- ✅ package-lock.json 鎖定依賴版本
- ✅ Prisma schema 版本控制
- ✅ Database migration 追蹤
- ✅ 無使用 CDN 第三方腳本

**建議**: 無，已妥善實作

---

### A09:2021 - Security Logging and Monitoring Failures ⚠️

**狀態**: **部分實作**

**已實作**:
- ✅ Application Insights 基礎整合
- ✅ 錯誤追蹤 (`trackException`)
- ✅ 自訂事件追蹤 (`trackEvent`)
- ✅ 效能指標追蹤 (`trackMetric`)

**待加強**:
- ⚠️ **登入失敗紀錄不完整**
- ⚠️ **權限變更紀錄缺失**
- ⚠️ **敏感操作審計日誌待完善**

**建議**:

1. **增強登入失敗紀錄**:
```typescript
// app/api/auth/login/route.ts
if (!user || !isValidPassword) {
  // 追蹤登入失敗
  trackEvent('auth:login:failed', {
    email,
    reason: !user ? 'user_not_found' : 'invalid_password',
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })
}
```

2. **權限變更審計**:
```typescript
// 當使用者權限變更時
trackEvent('auth:permission:changed', {
  userId,
  oldRole,
  newRole,
  changedBy: adminUserId,
})
```

3. **敏感操作紀錄**:
```typescript
// 密碼重置、Email 變更等
trackEvent('auth:sensitive:operation', {
  operation: 'password_reset',
  userId,
  ip,
  timestamp,
})
```

**優先級**: **中** (建議在 Sprint 12 完成)

---

### A10:2021 - Server-Side Request Forgery (SSRF) ✅

**狀態**: **已防護**

**實作措施**:
- ✅ 無使用者控制的外部請求
- ✅ Azure OpenAI/Speech Services URL 固定 (環境變數)
- ✅ 無檔案上傳功能 (暫無 SSRF 風險)

**建議**: 無，已妥善實作

---

## 2. 依賴漏洞掃描

### npm audit 報告

**執行時間**: 2025-10-17
**掃描結果**: 4 low severity vulnerabilities

#### 漏洞詳情

| 套件 | 版本 | 嚴重性 | 影響範圍 | 建議 |
|-----|------|--------|---------|-----|
| tmp | <=0.2.3 | Low | 開發/測試工具 | 監控上游修復 |
| inquirer | 3.0.0 - 9.3.7 | Low | 開發/測試工具 | 監控上游修復 |
| external-editor | >=1.1.1 | Low | 開發/測試工具 | 監控上游修復 |
| @lhci/cli | * | Low | 開發/測試工具 | 監控上游修復 |

**風險評估**:
- ✅ **生產環境**: 無影響
- ⚠️ **開發環境**: 低風險
- ✅ **部署流程**: 不受影響

**處理建議**:
- **不建議** 使用 `npm audit fix --force` (會安裝 breaking change 版本)
- **建議** 定期監控 @lhci/cli 更新
- **建議** 每週執行 `npm audit` 檢查

---

## 3. CSP (Content Security Policy) 設定

### 當前狀態

**狀態**: ⚠️ **未完整設定**

### 建議 CSP 配置

```typescript
// next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self'
    https://*.openai.azure.com
    https://*.cognitiveservices.azure.com
    https://*.in.applicationinsights.azure.com;
  worker-src 'self' blob:;
  child-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 特殊考量

1. **Three.js (3D Avatar)**:
   - `script-src 'unsafe-eval'` - Three.js 需要 eval
   - `worker-src 'self' blob:` - Web Workers 支援

2. **Azure Services**:
   - `connect-src` 包含 Azure OpenAI, Speech Services, Application Insights

3. **開發環境**:
   - `unsafe-inline` 用於開發 HMR (Hot Module Replacement)
   - Production 建議移除

---

## 4. CORS 配置

### 當前狀態

**狀態**: ⚠️ **需要明確定義**

### API Routes CORS 配置

```typescript
// lib/api/cors.ts
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS,
    })
  }
  return null
}

// 使用範例
export async function POST(req: Request) {
  const corsResponse = handleCORS(req)
  if (corsResponse) return corsResponse

  // ... API logic

  return new Response(JSON.stringify(data), {
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
```

### Azure Services CORS

**Azure OpenAI**:
- ✅ 已在 Azure Portal 設定允許來源
- ✅ API Key 認證，不依賴 CORS

**Azure Speech Services**:
- ✅ 已在 Azure Portal 設定允許來源
- ✅ Subscription Key 認證

---

## 5. 額外安全建議

### 5.1 環境變數安全

**當前狀態**: ✅ **良好**

- ✅ `.env.local` 已在 `.gitignore`
- ✅ 敏感資料不提交到版本控制
- ✅ Production 環境變數在 Azure Portal 設定

### 5.2 API Rate Limiting

**當前狀態**: ✅ **已實作**

- ✅ Upstash Redis rate limiting
- ✅ 登入 API: 5 requests / 60 seconds
- ✅ 註冊 API: 3 requests / 60 seconds
- ✅ 密碼重置: 3 requests / 60 seconds

### 5.3 Database Security

**當前狀態**: ✅ **良好**

- ✅ Prisma ORM 參數化查詢
- ✅ Connection string 環境變數
- ✅ PostgreSQL password 加密連線

### 5.4 Input Validation

**當前狀態**: ✅ **良好**

- ✅ Zod schema 驗證 (client + server)
- ✅ React Hook Form 前端驗證
- ✅ API routes 後端二次驗證

---

## 6. 行動計劃

### 立即執行 (Sprint 11)

- [x] **完成 OWASP Top 10 檢查**
- [x] **執行 npm audit 掃描**
- [x] **生成安全性稽核報告**

### 優先執行 (Sprint 12)

- [ ] **設定 CSP Headers** (優先級: 高)
- [ ] **完善 CORS 配置** (優先級: 高)
- [ ] **增強登入失敗紀錄** (優先級: 中)
- [ ] **建立權限變更審計日誌** (優先級: 中)

### 持續監控

- [ ] **每週執行 npm audit**
- [ ] **監控 @lhci/cli 漏洞修復**
- [ ] **定期檢查 OWASP Top 10 更新**
- [ ] **Application Insights 異常監控**

---

## 7. 結論

### 整體安全評估

**評分**: ✅ **8/10 良好**

**優點**:
- ✅ 核心安全措施已完整實作 (認證、加密、防注入)
- ✅ Rate limiting 有效防止暴力攻擊
- ✅ 依賴漏洞風險低 (僅開發工具)

**待改進**:
- ⚠️ CSP 配置需要完成 (高優先級)
- ⚠️ 日誌監控可再加強 (中優先級)
- ⚠️ CORS 需要明確定義 (高優先級)

### 建議

1. **Sprint 12 優先項目**:
   - 設定完整 CSP headers
   - 完善 CORS 配置
   - 增強安全日誌

2. **長期維護**:
   - 定期 npm audit (每週)
   - OWASP Top 10 年度複查
   - 定期安全性培訓

---

**稽核完成日期**: 2025-10-17
**下次稽核建議**: Sprint 12 結束前
