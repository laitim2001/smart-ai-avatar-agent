/**
 * Agent 種子資料腳本 (v2.0)
 * @description 建立 5 個系統預設的 AI Agent
 * @usage npx tsx scripts/seed-default-agents.ts
 * @updated 2025-10-22
 */

import { PrismaClient } from '../lib/generated/prisma'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

/**
 * 載入 Persona Markdown 檔案
 */
async function loadPersonaFile(agentName: string): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    'docs',
    'agent-brain',
    'agents',
    agentName,
    'persona.md'
  )
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`❌ 無法讀取檔案: ${agentName}/persona.md`, error)
    throw error
  }
}

/**
 * 建立或更新 Persona
 */
async function upsertPersona(data: {
  id: string
  name: string
  role: string
  description: string
  systemPrompt: string
  language?: string
  tone?: string
  style?: string[]
  capabilities?: string[]
  restrictions?: string[]
}) {
  return await prisma.persona.upsert({
    where: { id: data.id },
    update: {
      name: data.name,
      role: data.role,
      description: data.description,
      systemPrompt: data.systemPrompt,
      language: data.language || 'zh-TW',
      tone: data.tone || 'professional',
      style: data.style || [],
      capabilities: data.capabilities || [],
      restrictions: data.restrictions || [],
      version: '1.0.0',
      isActive: true,
    },
    create: {
      id: data.id,
      name: data.name,
      role: data.role,
      description: data.description,
      systemPrompt: data.systemPrompt,
      language: data.language || 'zh-TW',
      tone: data.tone || 'professional',
      style: data.style || [],
      capabilities: data.capabilities || [],
      restrictions: data.restrictions || [],
      version: '1.0.0',
      isActive: true,
    },
  })
}

/**
 * 建立或更新 AI Agent
 */
async function upsertAgent(data: {
  id: string
  name: string
  description: string
  category: string
  personaId: string
  avatarId?: string | null
  primaryLanguage: string
  supportedLanguages: string[]
}) {
  return await prisma.aIAgent.upsert({
    where: { id: data.id },
    update: {
      name: data.name,
      description: data.description,
      category: data.category,
      personaId: data.personaId,
      avatarId: data.avatarId || null,
      primaryLanguage: data.primaryLanguage,
      supportedLanguages: data.supportedLanguages,
      isSystem: true,
      isActive: true,
      isPublic: true,
    },
    create: {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      personaId: data.personaId,
      avatarId: data.avatarId || null,
      primaryLanguage: data.primaryLanguage,
      supportedLanguages: data.supportedLanguages,
      isSystem: true,
      isActive: true,
      isPublic: true,
      usageCount: 0,
      popularity: 0,
    },
  })
}

/**
 * 主要執行函數
 */
async function main() {
  console.log('🌱 開始建立 5 個系統預設 AI Agent...\n')

  try {
    // ═══════════════════════════════════════════════════════════════════
    // 1. CDO 商務顧問
    // ═══════════════════════════════════════════════════════════════════
    console.log('1️⃣ 建立 CDO 商務顧問...')
    const cdoPersonaContent = await loadPersonaFile('cdo-advisor')

    const cdoPersona = await upsertPersona({
      id: 'persona-cdo-advisor',
      name: 'CDO 商務顧問',
      role: '資深商務策略顧問',
      description: '專業的商務策略顧問，擅長數據驅動決策和組織轉型',
      systemPrompt: cdoPersonaContent,
      language: 'zh-TW',
      tone: 'professional',
      style: ['簡潔', '專業', '數據驅動'],
      capabilities: ['商務分析', '數據解讀', '策略規劃', '組織轉型'],
      restrictions: ['不討論政治', '不提供法律建議', '不提供投資建議'],
    })

    const cdoAgent = await upsertAgent({
      id: 'system-cdo-advisor',
      name: 'CDO 商務顧問',
      description: '專業的商務策略顧問，擅長數據驅動決策和組織轉型',
      category: 'professional',
      personaId: cdoPersona.id,
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en', 'ja'],
    })
    console.log(`✅ ${cdoAgent.name} 建立完成 (ID: ${cdoAgent.id})\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 2. 語言學習老師
    // ═══════════════════════════════════════════════════════════════════
    console.log('2️⃣ 建立語言學習老師...')
    const languagePersonaContent = await loadPersonaFile('language-tutor')

    const languagePersona = await upsertPersona({
      id: 'persona-language-tutor',
      name: '語言學習老師',
      role: '專業語言教學夥伴',
      description: '耐心專業的語言教師，提供個人化學習指導',
      systemPrompt: languagePersonaContent,
      language: 'zh-TW',
      tone: 'friendly',
      style: ['耐心', '鼓勵', '互動式'],
      capabilities: ['多語言教學', '語言學習方法', '跨文化溝通', '發音指導'],
      restrictions: [
        '不提供正式語言能力測驗評分',
        '不保證特定時間內達到某語言程度',
        '不提供學術論文翻譯服務',
      ],
    })

    const languageAgent = await upsertAgent({
      id: 'system-language-tutor',
      name: '語言學習老師',
      description: '耐心專業的語言教師，提供個人化學習指導',
      category: 'learning',
      personaId: languagePersona.id,
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en', 'ja'],
    })
    console.log(`✅ ${languageAgent.name} 建立完成 (ID: ${languageAgent.id})\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 3. 技術顧問
    // ═══════════════════════════════════════════════════════════════════
    console.log('3️⃣ 建立技術顧問...')
    const techPersonaContent = await loadPersonaFile('tech-consultant')

    const techPersona = await upsertPersona({
      id: 'persona-tech-consultant',
      name: '技術顧問',
      role: '資深軟體工程技術顧問',
      description: '經驗豐富的軟體工程師，提供架構設計和程式碼審查',
      systemPrompt: techPersonaContent,
      language: 'zh-TW',
      tone: 'professional',
      style: ['專業', '務實', '條理清晰'],
      capabilities: [
        '系統架構設計',
        '程式碼審查',
        '技術選型',
        '效能優化',
        'DevOps',
      ],
      restrictions: [
        '不直接撰寫完整生產代碼',
        '不進行實際系統部署操作',
        '不提供具體雲端帳號配置服務',
      ],
    })

    const techAgent = await upsertAgent({
      id: 'system-tech-consultant',
      name: '技術顧問',
      description: '經驗豐富的軟體工程師，提供架構設計和程式碼審查',
      category: 'professional',
      personaId: techPersona.id,
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en'],
    })
    console.log(`✅ ${techAgent.name} 建立完成 (ID: ${techAgent.id})\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 4. 創意寫作助手
    // ═══════════════════════════════════════════════════════════════════
    console.log('4️⃣ 建立創意寫作助手...')
    const writerPersonaContent = await loadPersonaFile('creative-writer')

    const writerPersona = await upsertPersona({
      id: 'persona-creative-writer',
      name: '創意寫作助手',
      role: '創意寫作夥伴',
      description: '富有想像力的故事創作者，協助構思和撰寫各種故事',
      systemPrompt: writerPersonaContent,
      language: 'zh-TW',
      tone: 'creative',
      style: ['想像力豐富', '結構清晰', '情感真摯'],
      capabilities: [
        '故事構思',
        '角色塑造',
        '情節設計',
        '寫作技巧指導',
        '創意激發',
      ],
      restrictions: [
        '不提供出版社媒合服務',
        '不保證作品商業成功',
        '不直接撰寫完整作品',
      ],
    })

    const writerAgent = await upsertAgent({
      id: 'system-creative-writer',
      name: '創意寫作助手',
      description: '富有想像力的故事創作者，協助構思和撰寫各種故事',
      category: 'creative',
      personaId: writerPersona.id,
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en'],
    })
    console.log(`✅ ${writerAgent.name} 建立完成 (ID: ${writerAgent.id})\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 5. 數據分析師
    // ═══════════════════════════════════════════════════════════════════
    console.log('5️⃣ 建立數據分析師...')
    const analystPersonaContent = await loadPersonaFile('data-analyst')

    const analystPersona = await upsertPersona({
      id: 'persona-data-analyst',
      name: '數據分析師',
      role: '專業數據分析顧問',
      description: '專業數據分析顧問，提供商業洞見和視覺化建議',
      systemPrompt: analystPersonaContent,
      language: 'zh-TW',
      tone: 'professional',
      style: ['數據驅動', '清晰簡潔', '務實導向'],
      capabilities: [
        '數據分析',
        '數據視覺化',
        '商業洞見',
        'SQL 與數據處理',
        '統計分析',
      ],
      restrictions: [
        '不進行實際資料庫操作',
        '不提供機器學習模型部署',
        '不保證預測結果絕對準確',
      ],
    })

    const analystAgent = await upsertAgent({
      id: 'system-data-analyst',
      name: '數據分析師',
      description: '專業數據分析顧問，提供商業洞見和視覺化建議',
      category: 'professional',
      personaId: analystPersona.id,
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en'],
    })
    console.log(`✅ ${analystAgent.name} 建立完成 (ID: ${analystAgent.id})\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 統計資訊
    // ═══════════════════════════════════════════════════════════════════
    const totalPersonas = await prisma.persona.count()
    const totalAgents = await prisma.aIAgent.count()
    const systemAgents = await prisma.aIAgent.count({
      where: { isSystem: true },
    })

    console.log('═══════════════════════════════════════════════════════════')
    console.log('📊 種子資料建立完成統計:')
    console.log(`   ✅ Persona 總數: ${totalPersonas}`)
    console.log(`   ✅ AI Agent 總數: ${totalAgents}`)
    console.log(`   ✅ 系統預設 Agent: ${systemAgents}`)
    console.log('═══════════════════════════════════════════════════════════')

    console.log('\n🎉 所有系統預設 AI Agent 建立完成！')
    console.log('\n下一步: 執行 npx tsx scripts/seed-knowledge-bases.ts 建立知識庫')
  } catch (error) {
    console.error('❌ 種子資料建立失敗:', error)
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
