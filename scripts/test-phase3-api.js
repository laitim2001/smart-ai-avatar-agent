/**
 * Phase 3 API 測試腳本
 * 測試所有 Agent 和 Knowledge Base CRUD API
 *
 * 使用方法: node scripts/test-phase3-api.js
 *
 * 前置條件:
 * 1. npm run dev 開發伺服器已啟動 (localhost:3000)
 * 2. 資料庫已初始化並有測試資料
 */

const BASE_URL = 'http://localhost:3000'

// 測試結果統計
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
}

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60) + '\n')
}

function logTest(name, passed, details = '') {
  results.total++
  if (passed) {
    results.passed++
    log(`✅ ${name}`, 'green')
  } else {
    results.failed++
    log(`❌ ${name}`, 'red')
    results.errors.push({ test: name, details })
  }
  if (details) {
    console.log(`   ${details}`)
  }
}

async function makeRequest(method, path, body = null, expectAuth = false) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${path}`, options)
    const data = await response.json()

    return {
      status: response.status,
      ok: response.ok,
      data
    }
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    }
  }
}

// ========== Agent API 測試 ==========

async function testAgentsList() {
  logSection('1. Agent API - 列表查詢測試')

  // 測試 1: GET /api/agents
  const res1 = await makeRequest('GET', '/api/agents')
  logTest(
    'GET /api/agents - 取得所有 Agent',
    res1.ok && Array.isArray(res1.data.data),
    `狀態碼: ${res1.status}, 數量: ${res1.data.data?.length || 0}`
  )

  // 測試 2: GET /api/agents?isSystem=true
  const res2 = await makeRequest('GET', '/api/agents?isSystem=true')
  logTest(
    'GET /api/agents?isSystem=true - 篩選系統 Agent',
    res2.ok && res2.data.data.every(a => a.isSystem === true),
    `系統 Agent 數量: ${res2.data.data?.length || 0}`
  )

  // 測試 3: GET /api/agents?category=business
  const res3 = await makeRequest('GET', '/api/agents?category=business')
  logTest(
    'GET /api/agents?category=business - 依類別篩選',
    res3.ok,
    `Business Agent 數量: ${res3.data.data?.length || 0}`
  )

  return res1.data.data?.[0]?.id // 返回第一個 Agent ID 供後續測試使用
}

async function testAgentsDetail(agentId) {
  logSection('2. Agent API - 詳細資訊測試')

  if (!agentId) {
    logTest('GET /api/agents/[id] - 取得 Agent 詳情', false, '無可用的 Agent ID')
    return
  }

  // 測試 4: GET /api/agents/[id]
  const res = await makeRequest('GET', `/api/agents/${agentId}`)
  logTest(
    'GET /api/agents/[id] - 取得 Agent 詳情',
    res.ok && res.data.data.id === agentId,
    `Agent 名稱: ${res.data.data?.name || 'N/A'}`
  )

  // 測試 5: GET /api/agents/invalid-id (404 測試)
  const res2 = await makeRequest('GET', '/api/agents/invalid-id-123')
  logTest(
    'GET /api/agents/[id] - 不存在的 ID 應返回 404',
    res2.status === 404 && res2.data.code === 'AGENT_NOT_FOUND',
    `狀態碼: ${res2.status}`
  )
}

async function testAgentsCreate() {
  logSection('3. Agent API - 建立測試 (需要認證)')

  // 測試 6: POST /api/agents without auth
  const res1 = await makeRequest('POST', '/api/agents', {
    name: '測試 Agent',
    description: '這是一個測試 Agent',
    category: 'business',
    personaId: 'test-persona-id'
  })
  logTest(
    'POST /api/agents - 未認證應返回 401',
    res1.status === 401 && res1.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res1.status}`
  )

  // 測試 7: POST /api/agents with missing fields
  const res2 = await makeRequest('POST', '/api/agents', {
    name: '測試 Agent'
    // 缺少 description, category, personaId
  })
  logTest(
    'POST /api/agents - 缺少必要欄位應返回 400',
    res2.status === 400 || res2.status === 401,
    `狀態碼: ${res2.status}, 錯誤: ${res2.data.code}`
  )
}

async function testAgentsUpdate(agentId) {
  logSection('4. Agent API - 更新測試 (需要認證)')

  if (!agentId) {
    logTest('PUT /api/agents/[id] - 更新 Agent', false, '無可用的 Agent ID')
    return
  }

  // 測試 8: PUT /api/agents/[id] without auth
  const res = await makeRequest('PUT', `/api/agents/${agentId}`, {
    description: '更新後的描述'
  })
  logTest(
    'PUT /api/agents/[id] - 未認證應返回 401',
    res.status === 401 && res.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res.status}`
  )
}

async function testAgentsDelete(agentId) {
  logSection('5. Agent API - 刪除測試 (需要認證)')

  if (!agentId) {
    logTest('DELETE /api/agents/[id] - 刪除 Agent', false, '無可用的 Agent ID')
    return
  }

  // 測試 9: DELETE /api/agents/[id] without auth
  const res = await makeRequest('DELETE', `/api/agents/${agentId}`)
  logTest(
    'DELETE /api/agents/[id] - 未認證應返回 401',
    res.status === 401 && res.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res.status}`
  )
}

// ========== Knowledge Base API 測試 ==========

async function testKnowledgeList() {
  logSection('6. Knowledge Base API - 列表查詢測試')

  // 測試 10: GET /api/knowledge
  const res1 = await makeRequest('GET', '/api/knowledge')
  logTest(
    'GET /api/knowledge - 取得所有知識庫',
    res1.ok && Array.isArray(res1.data.data),
    `狀態碼: ${res1.status}, 數量: ${res1.data.data?.length || 0}`
  )

  // 測試 11: GET /api/knowledge?type=persona
  const res2 = await makeRequest('GET', '/api/knowledge?type=persona')
  logTest(
    'GET /api/knowledge?type=persona - 依類型篩選',
    res2.ok && res2.data.data.every(k => k.type === 'persona'),
    `Persona 知識庫數量: ${res2.data.data?.length || 0}`
  )

  // 測試 12: GET /api/knowledge?search=AI
  const res3 = await makeRequest('GET', '/api/knowledge?search=AI')
  logTest(
    'GET /api/knowledge?search=AI - 搜尋功能',
    res3.ok,
    `搜尋結果數量: ${res3.data.data?.length || 0}`
  )

  return res1.data.data?.[0]?.id // 返回第一個知識庫 ID
}

async function testKnowledgeDetail(knowledgeId) {
  logSection('7. Knowledge Base API - 詳細資訊測試')

  if (!knowledgeId) {
    logTest('GET /api/knowledge/[id] - 取得知識庫詳情', false, '無可用的知識庫 ID')
    return
  }

  // 測試 13: GET /api/knowledge/[id]
  const res = await makeRequest('GET', `/api/knowledge/${knowledgeId}`)
  logTest(
    'GET /api/knowledge/[id] - 取得知識庫詳情',
    res.ok && res.data.data.id === knowledgeId,
    `知識庫名稱: ${res.data.data?.name || 'N/A'}`
  )

  // 測試 14: GET /api/knowledge/invalid-id (404 測試)
  const res2 = await makeRequest('GET', '/api/knowledge/invalid-id-123')
  logTest(
    'GET /api/knowledge/[id] - 不存在的 ID 應返回 404',
    res2.status === 404 && res2.data.code === 'KNOWLEDGE_NOT_FOUND',
    `狀態碼: ${res2.status}`
  )
}

async function testKnowledgeCreate() {
  logSection('8. Knowledge Base API - 建立測試 (需要認證)')

  // 測試 15: POST /api/knowledge without auth
  const res1 = await makeRequest('POST', '/api/knowledge', {
    name: '測試知識庫',
    type: 'document',
    category: 'general',
    language: 'zh-TW',
    content: '這是測試內容'
  })
  logTest(
    'POST /api/knowledge - 未認證應返回 401',
    res1.status === 401 && res1.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res1.status}`
  )

  // 測試 16: POST /api/knowledge with invalid type
  const res2 = await makeRequest('POST', '/api/knowledge', {
    name: '測試知識庫',
    type: 'invalid-type',
    category: 'general',
    language: 'zh-TW',
    content: '測試內容'
  })
  logTest(
    'POST /api/knowledge - 無效的 type 應返回 400',
    res2.status === 400 || res2.status === 401,
    `狀態碼: ${res2.status}`
  )
}

async function testKnowledgeUpdate(knowledgeId) {
  logSection('9. Knowledge Base API - 更新測試 (需要認證)')

  if (!knowledgeId) {
    logTest('PUT /api/knowledge/[id] - 更新知識庫', false, '無可用的知識庫 ID')
    return
  }

  // 測試 17: PUT /api/knowledge/[id] without auth
  const res = await makeRequest('PUT', `/api/knowledge/${knowledgeId}`, {
    description: '更新後的描述'
  })
  logTest(
    'PUT /api/knowledge/[id] - 未認證應返回 401',
    res.status === 401 && res.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res.status}`
  )
}

async function testKnowledgeDelete(knowledgeId) {
  logSection('10. Knowledge Base API - 刪除測試 (需要認證)')

  if (!knowledgeId) {
    logTest('DELETE /api/knowledge/[id] - 刪除知識庫', false, '無可用的知識庫 ID')
    return
  }

  // 測試 18: DELETE /api/knowledge/[id] without auth
  const res = await makeRequest('DELETE', `/api/knowledge/${knowledgeId}`)
  logTest(
    'DELETE /api/knowledge/[id] - 未認證應返回 401',
    res.status === 401 && res.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res.status}`
  )
}

// ========== Agent-Knowledge Relationship API 測試 ==========

async function testAgentKnowledgeRelationship(agentId, knowledgeId) {
  logSection('11. Agent-Knowledge 關聯 API 測試')

  if (!agentId || !knowledgeId) {
    logTest('Agent-Knowledge API 測試', false, '缺少 Agent ID 或知識庫 ID')
    return
  }

  // 測試 19: GET /api/agents/[id]/knowledge
  const res1 = await makeRequest('GET', `/api/agents/${agentId}/knowledge`)
  logTest(
    'GET /api/agents/[id]/knowledge - 取得 Agent 的知識庫',
    res1.ok && Array.isArray(res1.data.data),
    `關聯的知識庫數量: ${res1.data.data?.length || 0}`
  )

  // 測試 20: POST /api/agents/[id]/knowledge without auth
  const res2 = await makeRequest('POST', `/api/agents/${agentId}/knowledge`, {
    knowledgeBaseId: knowledgeId,
    priority: 100,
    isRequired: false
  })
  logTest(
    'POST /api/agents/[id]/knowledge - 未認證應返回 401',
    res2.status === 401 && res2.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res2.status}`
  )

  // 測試 21: PUT /api/agents/[id]/knowledge/[knowledgeId] without auth
  const res3 = await makeRequest('PUT', `/api/agents/${agentId}/knowledge/${knowledgeId}`, {
    priority: 50
  })
  logTest(
    'PUT /api/agents/[id]/knowledge/[knowledgeId] - 未認證應返回 401',
    res3.status === 401 && res3.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res3.status}`
  )

  // 測試 22: DELETE /api/agents/[id]/knowledge/[knowledgeId] without auth
  const res4 = await makeRequest('DELETE', `/api/agents/${agentId}/knowledge/${knowledgeId}`)
  logTest(
    'DELETE /api/agents/[id]/knowledge/[knowledgeId] - 未認證應返回 401',
    res4.status === 401 && res4.data.code === 'UNAUTHORIZED',
    `狀態碼: ${res4.status}`
  )
}

// ========== 主要測試流程 ==========

async function runAllTests() {
  log('\n🚀 開始執行 Phase 3 API 測試\n', 'blue')
  log(`測試目標: ${BASE_URL}`, 'yellow')
  log('注意: 需要認證的測試預期會返回 401 錯誤\n', 'yellow')

  try {
    // Agent API 測試
    const agentId = await testAgentsList()
    await testAgentsDetail(agentId)
    await testAgentsCreate()
    await testAgentsUpdate(agentId)
    await testAgentsDelete(agentId)

    // Knowledge Base API 測試
    const knowledgeId = await testKnowledgeList()
    await testKnowledgeDetail(knowledgeId)
    await testKnowledgeCreate()
    await testKnowledgeUpdate(knowledgeId)
    await testKnowledgeDelete(knowledgeId)

    // Agent-Knowledge Relationship API 測試
    await testAgentKnowledgeRelationship(agentId, knowledgeId)

    // 輸出測試結果摘要
    logSection('測試結果摘要')
    log(`總測試數: ${results.total}`, 'cyan')
    log(`✅ 通過: ${results.passed}`, 'green')
    log(`❌ 失敗: ${results.failed}`, 'red')
    log(`成功率: ${((results.passed / results.total) * 100).toFixed(2)}%`, 'yellow')

    if (results.failed > 0) {
      console.log('\n失敗的測試:')
      results.errors.forEach((err, i) => {
        log(`${i + 1}. ${err.test}`, 'red')
        if (err.details) console.log(`   ${err.details}`)
      })
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // 設定退出碼
    process.exit(results.failed > 0 ? 1 : 0)

  } catch (error) {
    log(`\n❌ 測試執行錯誤: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  }
}

// 執行測試
runAllTests()
