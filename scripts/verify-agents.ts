/**
 * Agent 資料驗證腳本
 * @description 驗證系統預設 AI Agent 和 Persona 的完整性
 * @usage npx tsx scripts/verify-agents.ts
 */

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 開始驗證多 Agent 系統資料...\n')

  try {
    // ═══════════════════════════════════════════════════════════════════
    // 1. 檢查 Persona 資料
    // ═══════════════════════════════════════════════════════════════════
    console.log('📚 檢查 Persona 資料...')
    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: 'asc' },
    })

    console.log(`\n找到 ${personas.length} 個 Persona:\n`)
    personas.forEach((persona, index) => {
      console.log(`${index + 1}. ${persona.name} (${persona.id})`)
      console.log(`   - 角色: ${persona.role}`)
      console.log(`   - 語言: ${persona.language}`)
      console.log(`   - 語氣: ${persona.tone}`)
      console.log(`   - 能力: ${persona.capabilities.join(', ')}`)
      console.log(`   - 限制: ${persona.restrictions.join(', ')}`)
      console.log(`   - 版本: ${persona.version}`)
      console.log(`   - 狀態: ${persona.isActive ? '✅ 啟用' : '❌ 停用'}`)
      console.log(`   - System Prompt 長度: ${persona.systemPrompt.length} 字元\n`)
    })

    // ═══════════════════════════════════════════════════════════════════
    // 2. 檢查 AI Agent 資料
    // ═══════════════════════════════════════════════════════════════════
    console.log('🤖 檢查 AI Agent 資料...')
    const agents = await prisma.aIAgent.findMany({
      include: {
        persona: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    console.log(`\n找到 ${agents.length} 個 AI Agent:\n`)
    agents.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.name} (${agent.id})`)
      console.log(`   - 描述: ${agent.description}`)
      console.log(`   - 類別: ${agent.category}`)
      console.log(`   - Persona: ${agent.persona.name}`)
      console.log(`   - 主要語言: ${agent.primaryLanguage}`)
      console.log(`   - 支援語言: ${agent.supportedLanguages.join(', ')}`)
      console.log(`   - 系統預設: ${agent.isSystem ? '✅ 是' : '❌ 否'}`)
      console.log(`   - 公開: ${agent.isPublic ? '✅ 是' : '❌ 否'}`)
      console.log(`   - 狀態: ${agent.isActive ? '✅ 啟用' : '❌ 停用'}`)
      console.log(`   - 使用次數: ${agent.usageCount}`)
      console.log(`   - 人氣: ${agent.popularity}\n`)
    })

    // ═══════════════════════════════════════════════════════════════════
    // 3. 檢查資料完整性
    // ═══════════════════════════════════════════════════════════════════
    console.log('✅ 資料完整性檢查:')

    const expectedAgents = [
      'system-cdo-advisor',
      'system-language-tutor',
      'system-tech-consultant',
      'system-creative-writer',
      'system-data-analyst',
    ]

    const expectedPersonas = [
      'persona-cdo-advisor',
      'persona-language-tutor',
      'persona-tech-consultant',
      'persona-creative-writer',
      'persona-data-analyst',
    ]

    const missingAgents = expectedAgents.filter(
      (id) => !agents.find((a) => a.id === id)
    )
    const missingPersonas = expectedPersonas.filter(
      (id) => !personas.find((p) => p.id === id)
    )

    if (missingAgents.length > 0) {
      console.log(`\n❌ 缺少以下 Agent:`)
      missingAgents.forEach((id) => console.log(`   - ${id}`))
    } else {
      console.log('\n✅ 所有預設 Agent 都已建立')
    }

    if (missingPersonas.length > 0) {
      console.log(`\n❌ 缺少以下 Persona:`)
      missingPersonas.forEach((id) => console.log(`   - ${id}`))
    } else {
      console.log('✅ 所有預設 Persona 都已建立')
    }

    // ═══════════════════════════════════════════════════════════════════
    // 4. 統計資訊
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════')
    console.log('📊 系統統計:')
    console.log(`   ✅ Persona 總數: ${personas.length}`)
    console.log(`   ✅ AI Agent 總數: ${agents.length}`)
    console.log(
      `   ✅ 系統預設 Agent: ${agents.filter((a) => a.isSystem).length}`
    )
    console.log(`   ✅ 公開 Agent: ${agents.filter((a) => a.isPublic).length}`)
    console.log(`   ✅ 啟用 Agent: ${agents.filter((a) => a.isActive).length}`)
    console.log('═══════════════════════════════════════════════════════════')

    console.log('\n🎉 驗證完成！')
  } catch (error) {
    console.error('❌ 驗證失敗:', error)
    throw error
  }
}

// 執行主函數
main()
  .catch((error) => {
    console.error('❌ 執行錯誤:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
