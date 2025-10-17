/**
 * CORS (Cross-Origin Resource Sharing) 配置
 *
 * 根據 OWASP 最佳實踐，限制 API 存取來源，防止未授權的跨域請求
 *
 * 使用範例：
 * ```typescript
 * export async function POST(req: Request) {
 *   const corsResponse = handleCORS(req)
 *   if (corsResponse) return corsResponse
 *
 *   // API logic here
 *
 *   return new Response(JSON.stringify(data), {
 *     headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
 *   })
 * }
 * ```
 */

/**
 * CORS Headers 配置
 *
 * - Access-Control-Allow-Origin: 只允許來自指定來源的請求
 * - Access-Control-Allow-Methods: 允許的 HTTP 方法
 * - Access-Control-Allow-Headers: 允許的請求標頭
 * - Access-Control-Allow-Credentials: 允許攜帶認證資訊 (cookies, authorization headers)
 * - Access-Control-Max-Age: Preflight 請求的快取時間 (24小時)
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 小時
}

/**
 * 處理 CORS Preflight 請求 (OPTIONS)
 *
 * 瀏覽器在發送跨域請求前，會先發送 OPTIONS 請求來確認是否允許該請求。
 * 此函式會檢查請求方法，若為 OPTIONS 則直接返回 CORS headers。
 *
 * @param req - Request 物件
 * @returns Response 物件 (若為 OPTIONS 請求) 或 null (非 OPTIONS 請求)
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   // 處理 CORS preflight
 *   const corsResponse = handleCORS(req)
 *   if (corsResponse) return corsResponse
 *
 *   // 正常 API 邏輯
 *   const data = await processRequest(req)
 *   return NextResponse.json(data, { headers: CORS_HEADERS })
 * }
 * ```
 */
export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    })
  }
  return null
}

/**
 * 建立帶有 CORS headers 的 Response
 *
 * 簡化建立 API response 的流程，自動加入 CORS headers
 *
 * @param data - Response data (會被轉換為 JSON)
 * @param options - Response 選項 (status, headers 等)
 * @returns Response 物件
 *
 * @example
 * ```typescript
 * export async function GET(req: Request) {
 *   const data = { message: 'Success' }
 *   return createCORSResponse(data)
 * }
 *
 * // 自訂 status code
 * export async function POST(req: Request) {
 *   const data = { id: 123 }
 *   return createCORSResponse(data, { status: 201 })
 * }
 * ```
 */
export function createCORSResponse<T = unknown>(
  data: T,
  options: {
    status?: number
    headers?: Record<string, string>
  } = {}
): Response {
  const { status = 200, headers = {} } = options

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * 驗證請求來源 (Origin)
 *
 * 檢查請求的 Origin header 是否在允許清單中，防止未授權的跨域請求
 *
 * @param req - Request 物件
 * @returns 是否為合法來源
 *
 * @example
 * ```typescript
 * export async function POST(req: Request) {
 *   if (!isValidOrigin(req)) {
 *     return new Response('Forbidden', { status: 403 })
 *   }
 *   // 處理請求
 * }
 * ```
 */
export function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get('Origin')

  // 若無 Origin header，視為同源請求 (允許)
  if (!origin) return true

  // 允許的來源清單
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ]

  // 生產環境額外檢查
  if (process.env.NODE_ENV === 'production') {
    // 只允許 HTTPS 來源 (除了 localhost)
    if (!origin.startsWith('https://') && !origin.includes('localhost')) {
      return false
    }
  }

  return allowedOrigins.some(allowed => origin === allowed)
}

/**
 * 建立 CORS 錯誤 Response
 *
 * 當請求來源不合法時，返回 403 Forbidden 錯誤
 *
 * @returns Response 物件
 */
export function createCORSErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: 'Origin not allowed',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
