/**
 * Knowledge Base 種子資料腳本
 * @description 掃描並匯入所有知識庫文件到資料庫
 * @usage npx tsx scripts/seed-knowledge-bases.ts
 * @created 2025-10-22
 */

import { PrismaClient } from '../lib/generated/prisma'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

/**
 * 知識庫文件對應表
 */
interface KnowledgeFileMapping {
  agentId: string
  files: Array<{
    filePath: string
    name: string
    type: string
    category: string
    priority?: number
    isRequired?: boolean
  }>
}

/**
 * 讀取 Markdown 文件內容
 */
async function readMarkdownFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`❌ 無法讀取檔案: ${filePath}`, error)
    return ''
  }
}

/**
 * 從檔案路徑提取知識類型
 */
function extractKnowledgeType(fileName: string): string {
  if (fileName.includes('persona')) return 'persona'
  if (fileName.includes('faq')) return 'faq'
  if (fileName.includes('kpi')) return 'kpi'
  if (fileName.includes('decision')) return 'decision'
  if (fileName.includes('meeting')) return 'meeting'
  if (fileName.includes('pov')) return 'pov'
  if (fileName.includes('company_info')) return 'company'
  return 'document'
}

/**
 * 建立或更新 KnowledgeBase
 */
async function upsertKnowledgeBase(data: {
  id: string
  name: string
  description?: string
  type: string
  category: string
  language: string
  content: string
  filePath: string
  isPublic?: boolean
}) {
  return await prisma.knowledgeBase.upsert({
    where: { id: data.id },
    update: {
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      language: data.language,
      content: data.content,
      filePath: data.filePath,
      isPublic: data.isPublic || false,
      version: '1.0.0',
      isActive: true,
    },
    create: {
      id: data.id,
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      language: data.language,
      content: data.content,
      filePath: data.filePath,
      isPublic: data.isPublic || false,
      version: '1.0.0',
      isActive: true,
      usageCount: 0,
    },
  })
}

/**
 * 建立 Agent ↔ KnowledgeBase 關聯
 */
async function createAgentKnowledgeLink(
  agentId: string,
  knowledgeBaseId: string,
  priority: number = 0,
  isRequired: boolean = false
) {
  // 檢查關聯是否已存在
  const existing = await prisma.agentKnowledgeBase.findFirst({
    where: {
      agentId,
      knowledgeBaseId,
    },
  })

  if (existing) {
    console.log(`   ⏭️  關聯已存在: ${agentId} ↔ ${knowledgeBaseId}`)
    return existing
  }

  return await prisma.agentKnowledgeBase.create({
    data: {
      agentId,
      knowledgeBaseId,
      priority,
      isRequired,
    },
  })
}

/**
 * 主要執行函數
 */
async function main() {
  console.log('🌱 開始建立 Knowledge Base 資料...\n')

  const agentBrainDir = path.join(process.cwd(), 'docs', 'agent-brain')

  try {
    // ═══════════════════════════════════════════════════════════════════
    // 1. 建立共用知識庫
    // ═══════════════════════════════════════════════════════════════════
    console.log('📚 建立共用知識庫...\n')

    const companyInfoPath = path.join(agentBrainDir, 'shared', 'company_info.md')
    const companyInfoContent = await readMarkdownFile(companyInfoPath)

    const companyInfoKB = await upsertKnowledgeBase({
      id: 'kb-shared-company-info',
      name: '公司基本資訊',
      description: '公司簡介、業務範圍、技術棧、聯絡資訊等共用知識',
      type: 'company',
      category: 'general',
      language: 'zh-TW',
      content: companyInfoContent,
      filePath: 'docs/agent-brain/shared/company_info.md',
      isPublic: true,
    })
    console.log(`✅ ${companyInfoKB.name} (${companyInfoKB.id})`)
    console.log(`   - 類型: ${companyInfoKB.type}`)
    console.log(`   - 內容長度: ${companyInfoKB.content.length} 字元\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 2. 建立 CDO 商務顧問知識庫
    // ═══════════════════════════════════════════════════════════════════
    console.log('1️⃣ 建立 CDO 商務顧問知識庫...\n')

    const cdoFiles = [
      {
        file: 'faq.md',
        id: 'kb-cdo-faq',
        name: 'CDO FAQ 問答集',
        type: 'faq',
      },
      {
        file: 'kpi_dictionary.md',
        id: 'kb-cdo-kpi',
        name: 'CDO KPI 字典',
        type: 'kpi',
      },
      {
        file: 'decisions/project_phoenix.md',
        id: 'kb-cdo-decision-phoenix',
        name: 'CDO 決策日誌 - Project Phoenix',
        type: 'decision',
      },
      {
        file: 'meetings/q4_strategy_review.md',
        id: 'kb-cdo-meeting-q4',
        name: 'CDO 會議摘要 - Q4 策略覆盤',
        type: 'meeting',
      },
      {
        file: 'pov/generative_ai_strategy.md',
        id: 'kb-cdo-pov-ai',
        name: 'CDO POV - Generative AI 策略',
        type: 'pov',
      },
    ]

    const cdoKBs: any[] = []

    for (const fileInfo of cdoFiles) {
      const filePath = path.join(agentBrainDir, 'agents', 'cdo-advisor', fileInfo.file)
      const content = await readMarkdownFile(filePath)

      const kb = await upsertKnowledgeBase({
        id: fileInfo.id,
        name: fileInfo.name,
        type: fileInfo.type,
        category: 'business',
        language: 'zh-TW',
        content,
        filePath: `docs/agent-brain/agents/cdo-advisor/${fileInfo.file}`,
        isPublic: false,
      })

      cdoKBs.push(kb)
      console.log(`✅ ${kb.name}`)
      console.log(`   - 內容長度: ${kb.content.length} 字元`)
    }

    console.log(`\n✅ CDO 商務顧問知識庫建立完成 (${cdoKBs.length} 個文件)\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 3. 建立 Agent ↔ KnowledgeBase 關聯
    // ═══════════════════════════════════════════════════════════════════
    console.log('🔗 建立 Agent ↔ KnowledgeBase 關聯...\n')

    // 所有 Agent 都關聯共用知識庫
    const allAgents = [
      'system-cdo-advisor',
      'system-language-tutor',
      'system-tech-consultant',
      'system-creative-writer',
      'system-data-analyst',
    ]

    console.log('📌 關聯共用知識庫到所有 Agent...')
    for (const agentId of allAgents) {
      await createAgentKnowledgeLink(agentId, companyInfoKB.id, 0, true)
    }
    console.log(`✅ 共用知識庫已關聯到 ${allAgents.length} 個 Agent\n`)

    // CDO Agent 關聯專屬知識庫
    console.log('📌 關聯 CDO 專屬知識庫...')
    for (let i = 0; i < cdoKBs.length; i++) {
      await createAgentKnowledgeLink('system-cdo-advisor', cdoKBs[i].id, i + 1, true)
      console.log(`   ✅ ${cdoKBs[i].name}`)
    }
    console.log(`✅ CDO Agent 已關聯 ${cdoKBs.length} 個專屬知識庫\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 4. 統計資訊
    // ═══════════════════════════════════════════════════════════════════
    const totalKBs = await prisma.knowledgeBase.count()
    const totalLinks = await prisma.agentKnowledgeBase.count()

    // 統計每個 Agent 的知識庫數量
    console.log('═══════════════════════════════════════════════════════════')
    console.log('📊 Knowledge Base 統計:\n')

    for (const agentId of allAgents) {
      const agent = await prisma.aIAgent.findUnique({
        where: { id: agentId },
        include: {
          knowledgeBases: {
            include: {
              knowledgeBase: true,
            },
          },
        },
      })

      if (agent) {
        console.log(`🤖 ${agent.name}:`)
        console.log(`   - 知識庫數量: ${agent.knowledgeBases.length}`)
        agent.knowledgeBases.forEach((link) => {
          console.log(
            `   - ${link.knowledgeBase.name} (${link.knowledgeBase.type}) [優先級: ${link.priority}]`
          )
        })
        console.log()
      }
    }

    console.log('═══════════════════════════════════════════════════════════')
    console.log('📊 總計統計:')
    console.log(`   ✅ Knowledge Base 總數: ${totalKBs}`)
    console.log(`   ✅ Agent-Knowledge 關聯總數: ${totalLinks}`)
    console.log('═══════════════════════════════════════════════════════════')

    console.log('\n🎉 Knowledge Base 資料建立完成！')
    console.log('\n下一步: 實作 AgentKnowledgeLoader 類別')
  } catch (error) {
    console.error('❌ Knowledge Base 資料建立失敗:', error)
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
