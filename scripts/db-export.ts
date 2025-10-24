/**
 * 資料庫匯出腳本
 * 將當前資料庫的 Persona, AIAgent, KnowledgeBase 資料匯出為 JSON 檔案
 *
 * 執行方式：
 * npm run db:export
 */

import { PrismaClient } from '../lib/generated/prisma'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ExportData {
  exportDate: string
  personas: any[]
  agents: any[]
  knowledgeBases: any[]
  agentKnowledgeLinks: any[]
}

async function exportDatabase() {
  console.log('📦 開始匯出資料庫...')

  try {
    // 匯出 Personas
    console.log('📝 匯出 Persona 資料...')
    const personas = await prisma.persona.findMany({
      orderBy: { createdAt: 'asc' },
    })
    console.log(`  ✅ ${personas.length} 個 Persona`)

    // 匯出 KnowledgeBases
    console.log('📝 匯出 KnowledgeBase 資料...')
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      orderBy: { createdAt: 'asc' },
    })
    console.log(`  ✅ ${knowledgeBases.length} 個 KnowledgeBase`)

    // 匯出 AIAgents
    console.log('📝 匯出 AIAgent 資料...')
    const agents = await prisma.aIAgent.findMany({
      where: {
        isSystem: true, // 只匯出系統預設的 Agent
      },
      orderBy: { createdAt: 'asc' },
    })
    console.log(`  ✅ ${agents.length} 個 AIAgent (系統預設)`)

    // 匯出 Agent-Knowledge 關聯
    console.log('📝 匯出 Agent-KnowledgeBase 關聯...')
    const agentKnowledgeLinks = await prisma.agentKnowledgeBase.findMany({
      where: {
        agent: {
          isSystem: true,
        },
      },
      orderBy: { createdAt: 'asc' },
    })
    console.log(`  ✅ ${agentKnowledgeLinks.length} 個關聯`)

    // 準備匯出資料
    const exportData: ExportData = {
      exportDate: new Date().toISOString(),
      personas,
      agents,
      knowledgeBases,
      agentKnowledgeLinks,
    }

    // 建立 exports 目錄
    const exportsDir = path.join(process.cwd(), 'exports')
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir)
    }

    // 產生檔案名稱（包含時間戳記）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const filename = `db-export-${timestamp}.json`
    const filepath = path.join(exportsDir, filename)

    // 寫入檔案
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf-8')

    console.log('\n✅ 資料庫匯出完成！')
    console.log(`📁 檔案位置: ${filepath}`)
    console.log('\n📊 匯出摘要:')
    console.log(`   - ${personas.length} 個 Persona`)
    console.log(`   - ${knowledgeBases.length} 個 KnowledgeBase`)
    console.log(`   - ${agents.length} 個 AIAgent (系統預設)`)
    console.log(`   - ${agentKnowledgeLinks.length} 個 Agent-Knowledge 關聯`)
    console.log('\n💡 使用 npm run db:import 來匯入此檔案')
  } catch (error) {
    console.error('❌ 匯出失敗:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportDatabase()
