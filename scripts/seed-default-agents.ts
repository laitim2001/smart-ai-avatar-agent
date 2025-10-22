/**
 * Agent 種子資料腳本
 * @description 建立系統預設的 AI Agent
 * @usage npx tsx scripts/seed-default-agents.ts
 */

import { PrismaClient } from '../lib/generated/prisma'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

/**
 * 載入 Persona Markdown 檔案
 */
async function loadPersonaFile(filename: string): Promise<string> {
  // 新路徑：agent-brain/agents/cdo-advisor/persona.md
  const filePath = path.join(process.cwd(), 'agent-brain', 'agents', 'cdo-advisor', filename)
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`❌ 無法讀取檔案: ${filename}`, error)
    throw error
  }
}

/**
 * 建立或更新 Persona
 */
async function upsertPersona(
  id: string,
  name: string,
  role: string,
  description: string,
  systemPrompt: string,
  language: string = 'zh-TW',
  tone: string = 'professional'
) {
  return await prisma.persona.upsert({
    where: { id },
    update: {
      name,
      role,
      description,
      systemPrompt,
      language,
      tone,
      version: '1.0.0',
      isActive: true,
    },
    create: {
      id,
      name,
      role,
      description,
      systemPrompt,
      language,
      tone,
      style: ['簡潔', '專業', '數據驅動'],
      capabilities: ['商務分析', '數據解讀', '策略規劃'],
      restrictions: ['不討論政治', '不提供法律建議'],
      version: '1.0.0',
      isActive: true,
    },
  })
}

/**
 * 建立或更新 AI Agent
 */
async function upsertAgent(
  id: string,
  name: string,
  description: string,
  category: string,
  personaId: string,
  avatarId: string | null,
  primaryLanguage: string,
  supportedLanguages: string[]
) {
  return await prisma.aIAgent.upsert({
    where: { id },
    update: {
      name,
      description,
      category,
      personaId,
      avatarId,
      primaryLanguage,
      supportedLanguages,
      isSystem: true,
      isActive: true,
      isPublic: true,
    },
    create: {
      id,
      name,
      description,
      category,
      personaId,
      avatarId,
      primaryLanguage,
      supportedLanguages,
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
  console.log('🌱 開始建立系統預設 AI Agent...\n')

  try {
    // ═══════════════════════════════════════════════════════════════════
    // 1. 建立 CDO 商務顧問 Persona 和 Agent
    // ═══════════════════════════════════════════════════════════════════
    console.log('📚 載入 CDO Persona 檔案...')
    const cdoPersonaContent = await loadPersonaFile('persona.md')

    console.log('🎭 建立 CDO Persona...')
    const cdoPersona = await upsertPersona(
      'persona-cdo-advisor',
      'CDO 商務顧問',
      '資深商務策略顧問',
      '專業的商務策略顧問，擅長數據驅動決策和組織轉型',
      cdoPersonaContent,
      'zh-TW',
      'professional'
    )
    console.log(`✅ Persona 建立完成: ${cdoPersona.name}`)

    console.log('🤖 建立 CDO AI Agent...')
    const cdoAgent = await upsertAgent(
      'system-cdo-advisor',
      'CDO 商務顧問',
      '專業的商務策略顧問，擅長數據驅動決策和組織轉型',
      'professional',
      cdoPersona.id,
      null, // 暫時不指定 Avatar，稍後可以手動關聯
      'zh-TW',
      ['zh-TW', 'en', 'ja']
    )
    console.log(`✅ AI Agent 建立完成: ${cdoAgent.name}`)
    console.log(`   - ID: ${cdoAgent.id}`)
    console.log(`   - 類別: ${cdoAgent.category}`)
    console.log(`   - 主要語言: ${cdoAgent.primaryLanguage}`)
    console.log(`   - 支援語言: ${cdoAgent.supportedLanguages.join(', ')}\n`)

    // ═══════════════════════════════════════════════════════════════════
    // 2. 統計資訊
    // ═══════════════════════════════════════════════════════════════════
    const totalPersonas = await prisma.persona.count()
    const totalAgents = await prisma.aIAgent.count()
    const systemAgents = await prisma.aIAgent.count({
      where: { isSystem: true },
    })

    console.log('📊 種子資料建立完成統計:')
    console.log(`   - Persona 總數: ${totalPersonas}`)
    console.log(`   - AI Agent 總數: ${totalAgents}`)
    console.log(`   - 系統預設 Agent: ${systemAgents}`)

    console.log('\n🎉 系統預設 AI Agent 建立完成！')
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
