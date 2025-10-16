/**
 * 檢查Azure OpenAI Deployment配置
 * 用於診斷deployment名稱問題
 */

import { AzureOpenAI } from 'openai'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 載入環境變數
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function checkDeployment() {
  console.log('\n========================================')
  console.log('Azure OpenAI Deployment 檢查工具')
  console.log('========================================\n')

  // 1. 檢查環境變數
  console.log('1. 環境變數配置：')
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4-turbo'

  console.log(`   端點：${endpoint ? '✓ 已設定' : '✗ 未設定'}`)
  console.log(`   API Key：${apiKey ? '✓ 已設定' : '✗ 未設定'}`)
  console.log(`   Deployment：${deployment}\n`)

  if (!endpoint || !apiKey) {
    console.error('❌ 環境變數配置不完整\n')
    return
  }

  // 2. 測試連接
  console.log('2. 測試Azure OpenAI連接：')

  try {
    const client = new AzureOpenAI({
      endpoint,
      apiKey,
      apiVersion: '2024-02-01',
    })

    // 嘗試呼叫API
    console.log(`   嘗試使用deployment: ${deployment}`)

    const response = await client.chat.completions.create({
      model: deployment,
      messages: [{ role: 'user', content: 'Say "test"' }],
      max_tokens: 10,
    })

    console.log('   ✅ 連接成功！')
    console.log(`   回應：${response.choices[0]?.message?.content}\n`)

    console.log('========================================')
    console.log('✅ Deployment配置正確！')
    console.log(`正確的deployment名稱：${deployment}`)
    console.log('========================================\n')
  } catch (error: any) {
    console.log('   ❌ 連接失敗\n')

    console.log('3. 錯誤診斷：')

    if (error.code === 'DeploymentNotFound' || error.status === 404) {
      console.log('   ❌ Deployment不存在')
      console.log(`   您配置的deployment名稱：${deployment}`)
      console.log('   此deployment在Azure OpenAI資源中不存在\n')

      console.log('   解決方案：')
      console.log('   1. 登入Azure Portal')
      console.log('   2. 進入您的Azure OpenAI資源')
      console.log('   3. 左側選單 → Model deployments')
      console.log('   4. 查看實際的deployment名稱')
      console.log('   5. 更新 .env.local 中的 AZURE_OPENAI_DEPLOYMENT\n')

      console.log('   常見的deployment名稱：')
      console.log('   - gpt-4-turbo')
      console.log('   - gpt-4')
      console.log('   - gpt-35-turbo')
      console.log('   - gpt-4o\n')
    } else if (error.code === 'Unauthorized' || error.status === 401) {
      console.log('   ❌ API Key無效')
      console.log('   請檢查 AZURE_OPENAI_API_KEY 是否正確\n')
    } else if (error.code === 'InvalidURL' || error.message?.includes('URL')) {
      console.log('   ❌ Endpoint URL無效')
      console.log('   請檢查 AZURE_OPENAI_ENDPOINT 格式是否正確\n')
      console.log('   正確格式範例：')
      console.log('   https://your-resource-name.openai.azure.com/\n')
    } else {
      console.log(`   錯誤類型：${error.code || error.status || 'Unknown'}`)
      console.log(`   錯誤訊息：${error.message}\n`)
    }

    console.log('========================================')
    console.log('❌ Deployment配置有誤')
    console.log('請根據上述診斷資訊修正配置')
    console.log('========================================\n')
  }
}

// 執行檢查
checkDeployment().catch(console.error)
