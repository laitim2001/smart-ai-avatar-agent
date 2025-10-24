/**
 * Prisma Seed Script
 * Sprint 5: Avatar Gallery 種子資料
 * Sprint 9: Prompt Template 系統種子資料
 *
 * 執行方式：
 * npx prisma db seed
 *
 * 或在 package.json 中添加：
 * "prisma": {
 *   "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
 * }
 */

import { PrismaClient } from '../lib/generated/prisma'
import { AVATARS_METADATA } from '../lib/avatar/constants'
import { PROMPT_TEMPLATES } from '../lib/prompt/constants'
import {
  SEED_PERSONAS,
  SEED_AI_AGENTS,
  SEED_KNOWLEDGE_BASES,
} from '../lib/knowledge/seed-data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 開始種子資料植入...')

  // 清除現有的 Avatar 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 Avatar 資料...')
    await prisma.avatar.deleteMany()
  }

  // 植入 Avatar 資料
  console.log('📝 植入 Avatar 資料...')

  for (const avatar of AVATARS_METADATA) {
    await prisma.avatar.upsert({
      where: { id: avatar.id },
      update: {
        name: `${avatar.name} (${avatar.nameEn})`,
        description: `${avatar.description}\n${avatar.descriptionEn}`,
        url: avatar.url,
        thumbnail: avatar.thumbnail,
        category: avatar.category,
        tags: avatar.tags,
        featured: avatar.featured,
        popularity: avatar.popularity,
      },
      create: {
        id: avatar.id,
        name: `${avatar.name} (${avatar.nameEn})`,
        description: `${avatar.description}\n${avatar.descriptionEn}`,
        url: avatar.url,
        thumbnail: avatar.thumbnail,
        category: avatar.category,
        tags: avatar.tags,
        featured: avatar.featured,
        popularity: avatar.popularity,
      },
    })
    console.log(`  ✅ ${avatar.name} (${avatar.nameEn}) - ${avatar.category}`)
  }

  console.log('✅ Avatar 資料植入完成！')
  console.log(`📊 總計: ${AVATARS_METADATA.length} 個 Avatar`)
  console.log(`   - Female: ${AVATARS_METADATA.filter(a => a.category === 'female').length}`)
  console.log(`   - Male: ${AVATARS_METADATA.filter(a => a.category === 'male').length}`)
  console.log(`   - Neutral: ${AVATARS_METADATA.filter(a => a.category === 'neutral').length}`)
  console.log(`   - Featured: ${AVATARS_METADATA.filter(a => a.featured).length}`)

  // === Sprint 9: Prompt Template 資料 ===
  console.log('\n📝 植入 Prompt Template 資料...')

  // 清除現有的 Prompt Template 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 Prompt Template 資料...')
    await prisma.promptTemplate.deleteMany({ where: { isSystem: true } })
  }

  for (const template of PROMPT_TEMPLATES) {
    await prisma.promptTemplate.upsert({
      where: { id: template.id },
      update: {
        title: template.title,
        description: template.description,
        content: template.content,
        category: template.category,
        tags: template.tags,
        isSystem: true,
        featured: template.featured,
        popularity: template.popularity,
      },
      create: {
        id: template.id,
        title: template.title,
        description: template.description,
        content: template.content,
        category: template.category,
        tags: template.tags,
        isSystem: true,
        featured: template.featured,
        popularity: template.popularity,
      },
    })
    console.log(`  ✅ ${template.title} - ${template.category}`)
  }

  console.log('✅ Prompt Template 資料植入完成！')
  console.log(`📊 總計: ${PROMPT_TEMPLATES.length} 個 Prompt Template`)
  console.log(`   - Learning: ${PROMPT_TEMPLATES.filter(t => t.category === 'learning').length}`)
  console.log(`   - Work: ${PROMPT_TEMPLATES.filter(t => t.category === 'work').length}`)
  console.log(`   - Creative: ${PROMPT_TEMPLATES.filter(t => t.category === 'creative').length}`)
  console.log(`   - Entertainment: ${PROMPT_TEMPLATES.filter(t => t.category === 'entertainment').length}`)
  console.log(`   - Professional: ${PROMPT_TEMPLATES.filter(t => t.category === 'professional').length}`)
  console.log(`   - Daily: ${PROMPT_TEMPLATES.filter(t => t.category === 'daily').length}`)
  console.log(`   - Featured: ${PROMPT_TEMPLATES.filter(t => t.featured).length}`)

  // === Sprint 11: Persona 資料 ===
  console.log('\n📝 植入 Persona 資料...')

  // 清除現有的 Persona 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 Persona 資料...')
    await prisma.persona.deleteMany()
  }

  for (const persona of SEED_PERSONAS) {
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
    console.log(`  ✅ ${persona.name} - ${persona.role}`)
  }

  console.log('✅ Persona 資料植入完成！')
  console.log(`📊 總計: ${SEED_PERSONAS.length} 個 Persona`)

  // === Sprint 11: KnowledgeBase 資料 ===
  console.log('\n📝 植入 KnowledgeBase 資料...')

  // 清除現有的 KnowledgeBase 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 KnowledgeBase 資料...')
    await prisma.knowledgeBase.deleteMany()
  }

  for (const kb of SEED_KNOWLEDGE_BASES) {
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
    console.log(`  ✅ ${kb.name} - ${kb.type}`)
  }

  console.log('✅ KnowledgeBase 資料植入完成！')
  console.log(`📊 總計: ${SEED_KNOWLEDGE_BASES.length} 個 KnowledgeBase`)

  // === Sprint 11: AIAgent 資料 ===
  console.log('\n📝 植入 AIAgent 資料...')

  // 清除現有的 AIAgent 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 AIAgent 資料...')
    await prisma.aIAgent.deleteMany()
  }

  for (const agent of SEED_AI_AGENTS) {
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
    console.log(`  ✅ ${agent.name} - ${agent.category}`)
  }

  console.log('✅ AIAgent 資料植入完成！')
  console.log(`📊 總計: ${SEED_AI_AGENTS.length} 個 AIAgent`)
  console.log(`   - Work: ${SEED_AI_AGENTS.filter(a => a.category === 'work').length}`)
  console.log(`   - Creative: ${SEED_AI_AGENTS.filter(a => a.category === 'creative').length}`)
  console.log(`   - Learning: ${SEED_AI_AGENTS.filter(a => a.category === 'learning').length}`)

  // === 建立 Agent 和 KnowledgeBase 的關聯 ===
  console.log('\n📝 建立 Agent-KnowledgeBase 關聯...')

  // CDO Advisor 連結知識庫
  const cdoAgent = await prisma.aIAgent.findUnique({
    where: { id: 'agent-cdo-advisor' },
  })

  if (cdoAgent) {
    // 連結 FAQ
    await prisma.agentKnowledgeBase.upsert({
      where: {
        agentId_knowledgeBaseId: {
          agentId: 'agent-cdo-advisor',
          knowledgeBaseId: 'kb-cdo-faq',
        },
      },
      update: {
        priority: 1,
        isRequired: true,
      },
      create: {
        agentId: 'agent-cdo-advisor',
        knowledgeBaseId: 'kb-cdo-faq',
        priority: 1,
        isRequired: true,
      },
    })

    // 連結 KPI
    await prisma.agentKnowledgeBase.upsert({
      where: {
        agentId_knowledgeBaseId: {
          agentId: 'agent-cdo-advisor',
          knowledgeBaseId: 'kb-cdo-kpi',
        },
      },
      update: {
        priority: 2,
        isRequired: true,
      },
      create: {
        agentId: 'agent-cdo-advisor',
        knowledgeBaseId: 'kb-cdo-kpi',
        priority: 2,
        isRequired: true,
      },
    })

    console.log('  ✅ CDO Advisor 已連結 2 個知識庫')
  }

  console.log('\n🎉 所有種子資料植入完成！')
  console.log('\n📦 資料摘要：')
  console.log(`   - ${AVATARS_METADATA.length} 個 Avatar`)
  console.log(`   - ${PROMPT_TEMPLATES.length} 個 Prompt Template`)
  console.log(`   - ${SEED_PERSONAS.length} 個 Persona`)
  console.log(`   - ${SEED_KNOWLEDGE_BASES.length} 個 KnowledgeBase`)
  console.log(`   - ${SEED_AI_AGENTS.length} 個 AIAgent`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 種子資料植入失敗:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
