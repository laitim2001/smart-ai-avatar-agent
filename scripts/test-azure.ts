/**
 * ================================================================
 * Azure 服務連接測試腳本 (scripts/test-azure.ts)
 * ================================================================
 *
 * 用途：驗證 Azure OpenAI 和 Azure Speech Services 的配置和連接
 *
 * 執行方式：
 * ```bash
 * npm run test:azure
 * ```
 *
 * 測試內容：
 * 1. 環境變數檢查
 * 2. Azure OpenAI 連接測試（簡單的 completion 請求）
 * 3. Azure Speech Services 配置驗證
 *
 * 注意：
 * - 此腳本需要有效的 Azure 服務金鑰
 * - 請確保已在 .env.local 中配置所有必要的環境變數
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// 載入環境變數
config({ path: resolve(process.cwd(), '.env.local') })

// 動態導入以支援 TypeScript
async function testAzureServices() {
  console.log('🚀 開始測試 Azure 服務連接...\n')

  // ================================================================
  // 1. 環境變數檢查
  // ================================================================
  console.log('📋 步驟 1/3: 檢查環境變數配置')
  console.log('━'.repeat(60))

  const requiredEnvVars = {
    'Azure OpenAI': {
      AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
      AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
    },
    'Azure Speech': {
      AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
    },
  }

  let allConfigured = true

  for (const [service, vars] of Object.entries(requiredEnvVars)) {
    console.log(`\n${service}:`)
    for (const [key, value] of Object.entries(vars)) {
      if (value) {
        // 顯示部分值以保護隱私
        const displayValue =
          key.includes('KEY') || key.includes('API_KEY')
            ? `${value.substring(0, 8)}...`
            : value.length > 40
              ? `${value.substring(0, 40)}...`
              : value
        console.log(`  ✅ ${key}: ${displayValue}`)
      } else {
        console.log(`  ❌ ${key}: 未設定`)
        allConfigured = false
      }
    }
  }

  if (!allConfigured) {
    console.log('\n❌ 配置不完整！')
    console.log('💡 請檢查 .env.local 檔案並填入缺少的環境變數')
    console.log('💡 參考 .env.local.example 檔案查看範例配置\n')
    process.exit(1)
  }

  console.log('\n✅ 所有環境變數已配置\n')

  // ================================================================
  // 2. Azure OpenAI 連接測試
  // ================================================================
  console.log('📋 步驟 2/3: 測試 Azure OpenAI 連接')
  console.log('━'.repeat(60))

  try {
    const {
      getOpenAIClient,
      DEPLOYMENT_NAME,
      getConfigSummary,
    } = await import('../lib/azure/openai')

    console.log('\n配置摘要：')
    const openaiSummary = getConfigSummary()
    console.log(`  部署名稱: ${openaiSummary.deployment}`)
    console.log(`  API 版本: ${openaiSummary.apiVersion}`)
    console.log(`  端點: ${openaiSummary.endpoint}`)
    console.log(`  API 金鑰: ${openaiSummary.apiKey}`)

    console.log('\n正在測試 OpenAI API 連接...')

    const client = getOpenAIClient()

    // 發送簡單的測試請求
    const response = await client.chat.completions.create({
      model: DEPLOYMENT_NAME,
      messages: [
        {
          role: 'system',
          content: '你是一個友善的助手。請用繁體中文回答。',
        },
        {
          role: 'user',
          content: '請說"測試成功"三個字。',
        },
      ],
      max_tokens: 50,
    })

    const reply = response.choices[0]?.message?.content || '無回應'

    console.log(`\n✅ Azure OpenAI 連接成功！`)
    console.log(`📝 測試回應: "${reply.trim()}"`)
    console.log(`📊 使用 token: ${response.usage?.total_tokens || 0}`)
  } catch (error) {
    console.log('\n❌ Azure OpenAI 連接失敗')
    console.log(`錯誤訊息: ${error instanceof Error ? error.message : String(error)}`)
    console.log('\n💡 請檢查：')
    console.log('   1. Azure OpenAI 端點是否正確')
    console.log('   2. API 金鑰是否有效')
    console.log('   3. 部署名稱是否與 Azure OpenAI Studio 中的名稱一致')
    console.log('   4. Azure 訂閱是否處於活動狀態\n')
    process.exit(1)
  }

  // ================================================================
  // 3. Azure Speech Services 配置驗證
  // ================================================================
  console.log('\n📋 步驟 3/3: 驗證 Azure Speech Services 配置')
  console.log('━'.repeat(60))

  try {
    const {
      getSpeechConfig,
      getConfigSummary: getSpeechSummary,
      AVAILABLE_ZH_TW_VOICES,
    } = await import('../lib/azure/speech')

    console.log('\n配置摘要：')
    const speechSummary = getSpeechSummary()
    console.log(`  預設語音: ${speechSummary.defaultVoice}`)
    console.log(`  預設語言: ${speechSummary.defaultLanguage}`)
    console.log(`  區域: ${speechSummary.region}`)
    console.log(`  訂閱金鑰: ${speechSummary.subscriptionKey}`)

    console.log('\n正在驗證 Speech SDK 配置...')
    const config = getSpeechConfig()

    console.log('\n✅ Azure Speech Services 配置成功！')
    console.log('\n可用的繁體中文語音：')
    AVAILABLE_ZH_TW_VOICES.forEach((voice, index) => {
      console.log(`  ${index + 1}. ${voice.name} (${voice.gender}) - ${voice.description}`)
    })

    console.log('\n💡 注意：Speech SDK 的實際連接測試需要瀏覽器環境或音頻設備')
    console.log('   此腳本僅驗證配置的完整性')
  } catch (error) {
    console.log('\n❌ Azure Speech Services 配置驗證失敗')
    console.log(`錯誤訊息: ${error instanceof Error ? error.message : String(error)}`)
    console.log('\n💡 請檢查：')
    console.log('   1. Azure Speech 訂閱金鑰是否正確')
    console.log('   2. 區域設定是否正確（應為小寫，如 eastasia）')
    console.log('   3. Azure 訂閱是否處於活動狀態\n')
    process.exit(1)
  }

  // ================================================================
  // 測試完成
  // ================================================================
  console.log('\n' + '━'.repeat(60))
  console.log('🎉 所有 Azure 服務測試通過！')
  console.log('━'.repeat(60))
  console.log('\n✅ Azure OpenAI: 連接成功')
  console.log('✅ Azure Speech Services: 配置正確')
  console.log('\n🚀 你的環境已準備就緒，可以開始開發了！\n')
}

// 執行測試
testAzureServices().catch((error) => {
  console.error('\n💥 測試過程中發生未預期的錯誤：')
  console.error(error)
  process.exit(1)
})
