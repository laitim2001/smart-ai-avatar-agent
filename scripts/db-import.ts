/**
 * 資料庫匯入腳本
 * 從 JSON 檔案匯入 Persona, AIAgent, KnowledgeBase 資料
 *
 * 執行方式：
 * npm run db:import exports/db-export-2025-10-24.json
 */

import { PrismaClient } from '../lib/generated/prisma'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ImportData {
  exportDate: string
  personas: any[]
  agents: any[]
  knowledgeBases: any[]
  agentKnowledgeLinks: any[]
}

async function importDatabase(filepath: string) {
  console.log('📥 開始匯入資料庫...')
  console.log(`📁 檔案位置: ${filepath}`)

  try {
    // 讀取 JSON 檔案
    if (!fs.existsSync(filepath)) {
      console.error(`❌ 檔案不存在: ${filepath}`)
      process.exit(1)
    }

    const fileContent = fs.readFileSync(filepath, 'utf-8')
    const importData: ImportData = JSON.parse(fileContent)

    console.log(`📅 匯出日期: ${importData.exportDate}`)
    console.log('\n📊 資料摘要:')
    console.log(`   - ${importData.personas.length} 個 Persona`)
    console.log(`   - ${importData.knowledgeBases.length} 個 KnowledgeBase`)
    console.log(`   - ${importData.agents.length} 個 AIAgent`)
    console.log(`   - ${importData.agentKnowledgeLinks.length} 個 Agent-Knowledge 關聯`)

    // 確認是否繼續
    console.log(
      '\n⚠️  警告: 此操作將使用 upsert 更新資料庫。相同 ID 的資料將被覆蓋。'
    )
    console.log('▶️  按 Ctrl+C 取消，或等待 3 秒自動繼續...\n')

    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 匯入 Personas
    console.log('📝 匯入 Persona 資料...')
    for (const persona of importData.personas) {
      await prisma.persona.upsert({
        where: { id: persona.id },
        update: {
          name: persona.name,
          role: persona.role,
          description: persona.description,
          systemPrompt: persona.systemPrompt,
          language: persona.language,
          tone: persona.tone,
          style: persona.style,
          capabilities: persona.capabilities,
          restrictions: persona.restrictions,
          version: persona.version,
          isActive: persona.isActive,
        },
        create: {
          id: persona.id,
          name: persona.name,
          role: persona.role,
          description: persona.description,
          systemPrompt: persona.systemPrompt,
          language: persona.language,
          tone: persona.tone,
          style: persona.style,
          capabilities: persona.capabilities,
          restrictions: persona.restrictions,
          version: persona.version,
          isActive: persona.isActive,
        },
      })
      console.log(`  ✅ ${persona.name}`)
    }

    // 匯入 KnowledgeBases
    console.log('\n📝 匯入 KnowledgeBase 資料...')
    for (const kb of importData.knowledgeBases) {
      await prisma.knowledgeBase.upsert({
        where: { id: kb.id },
        update: {
          name: kb.name,
          description: kb.description,
          type: kb.type,
          category: kb.category,
          language: kb.language,
          content: kb.content,
          metadata: kb.metadata,
          filePath: kb.filePath,
          version: kb.version,
          isActive: kb.isActive,
          isPublic: kb.isPublic,
          usageCount: kb.usageCount,
        },
        create: {
          id: kb.id,
          name: kb.name,
          description: kb.description,
          type: kb.type,
          category: kb.category,
          language: kb.language,
          content: kb.content,
          metadata: kb.metadata,
          filePath: kb.filePath,
          version: kb.version,
          isActive: kb.isActive,
          isPublic: kb.isPublic,
          usageCount: kb.usageCount,
        },
      })
      console.log(`  ✅ ${kb.name}`)
    }

    // 匯入 AIAgents
    console.log('\n📝 匯入 AIAgent 資料...')
    for (const agent of importData.agents) {
      await prisma.aIAgent.upsert({
        where: { id: agent.id },
        update: {
          name: agent.name,
          description: agent.description,
          category: agent.category,
          personaId: agent.personaId,
          avatarId: agent.avatarId,
          primaryLanguage: agent.primaryLanguage,
          supportedLanguages: agent.supportedLanguages,
          isActive: agent.isActive,
          isPublic: agent.isPublic,
          isSystem: agent.isSystem,
          usageCount: agent.usageCount,
          popularity: agent.popularity,
        },
        create: {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          category: agent.category,
          personaId: agent.personaId,
          avatarId: agent.avatarId,
          primaryLanguage: agent.primaryLanguage,
          supportedLanguages: agent.supportedLanguages,
          isActive: agent.isActive,
          isPublic: agent.isPublic,
          isSystem: agent.isSystem,
          usageCount: agent.usageCount,
          popularity: agent.popularity,
        },
      })
      console.log(`  ✅ ${agent.name}`)
    }

    // 匯入 Agent-Knowledge 關聯
    console.log('\n📝 匯入 Agent-KnowledgeBase 關聯...')
    for (const link of importData.agentKnowledgeLinks) {
      await prisma.agentKnowledgeBase.upsert({
        where: {
          agentId_knowledgeBaseId: {
            agentId: link.agentId,
            knowledgeBaseId: link.knowledgeBaseId,
          },
        },
        update: {
          priority: link.priority,
          isRequired: link.isRequired,
        },
        create: {
          agentId: link.agentId,
          knowledgeBaseId: link.knowledgeBaseId,
          priority: link.priority,
          isRequired: link.isRequired,
        },
      })
    }
    console.log(`  ✅ ${importData.agentKnowledgeLinks.length} 個關聯`)

    console.log('\n✅ 資料庫匯入完成！')
  } catch (error) {
    console.error('❌ 匯入失敗:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 從命令列參數取得檔案路徑
const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('❌ 請提供 JSON 檔案路徑')
  console.log('使用方式: npm run db:import exports/db-export-2025-10-24.json')
  process.exit(1)
}

const filepath = path.resolve(process.cwd(), args[0])
importDatabase(filepath)
