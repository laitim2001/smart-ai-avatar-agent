const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')

/**
 * Content Security Policy (CSP) 配置
 * 遵循 OWASP 最佳實踐，允許必要的外部資源載入
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https: https://replicate.delivery;
  font-src 'self' data: https://cdn.jsdelivr.net;
  media-src 'self' data: blob: https://replicate.delivery;
  connect-src 'self' blob:
    https://*.openai.azure.com
    https://*.cognitiveservices.azure.com
    https://*.in.applicationinsights.azure.com
    https://models.readyplayer.me
    https://api.readyplayer.me
    https://*.readyplayer.me
    https://api.replicate.com
    https://replicate.delivery
    https://cdn.jsdelivr.net;
  worker-src 'self' blob:;
  child-src 'self' blob: https://*.readyplayer.me;
  frame-src 'self' blob: https://*.readyplayer.me;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()

/**
 * 安全性 Headers 配置
 * 包含 CSP、HSTS、X-Frame-Options 等防護機制
 */
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
    value: 'camera=(self "https://*.readyplayer.me"), microphone=(self "https://*.readyplayer.me"), geolocation=(), interest-cohort=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 隱藏 Next.js 開發工具圖示（修復：使用 Next.js 15 正確配置）
  devIndicators: {
    appIsrStatus: false, // 隱藏 ISR 狀態指示器
    position: 'bottom-right', // 開發指示器位置
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'models.readyplayer.me',
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: {
        loader: 'file-loader',
      },
    });
    return config;
  },
  /**
   * 套用安全性 Headers 到所有路由
   */
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
};

module.exports = withNextIntl(nextConfig);
