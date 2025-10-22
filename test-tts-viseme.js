/**
 * 測試 TTS API Viseme 資料返回
 *
 * 測試流程：
 * 1. 呼叫 TTS API 並驗證返回 Viseme 資料
 * 2. 檢查 Viseme 資料格式是否正確
 * 3. 驗證音訊和 Viseme 數量
 */

async function testTTSViseme() {
  console.log('='.repeat(60))
  console.log('📋 測試 TTS API Viseme 資料返回')
  console.log('='.repeat(60))

  const API_URL = 'http://localhost:3005/api/tts'
  const testText = '你好，我是智能 Avatar 助手。'

  try {
    console.log(`\n📝 測試文字: "${testText}"`)
    console.log(`🌐 API 端點: ${API_URL}`)

    // 1. 呼叫 TTS API
    console.log('\n⏳ 正在呼叫 TTS API...')
    const startTime = Date.now()

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
      }),
    })

    const elapsed = Date.now() - startTime
    console.log(`⏱️  API 回應時間: ${elapsed}ms`)

    // 2. 檢查 HTTP 狀態
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        `TTS API 失敗 (${response.status}): ${JSON.stringify(errorData)}`
      )
    }

    // 3. 解析回應
    const data = await response.json()

    console.log('\n✅ TTS API 回應成功')
    console.log('─'.repeat(60))

    // 4. 驗證返回的資料結構
    console.log('\n📊 資料結構驗證:')

    // 檢查音訊資料
    if (!data.audio || typeof data.audio !== 'string') {
      console.log('❌ 音訊資料: 缺失或格式錯誤')
      return false
    }
    console.log(`✅ 音訊資料: 存在 (base64, ${data.audio.length} 字元)`)

    // 檢查 Viseme 資料
    if (!data.visemes || !Array.isArray(data.visemes)) {
      console.log('❌ Viseme 資料: 缺失或格式錯誤')
      return false
    }
    console.log(`✅ Viseme 資料: 存在 (陣列, ${data.visemes.length} 個)`)

    // 檢查音訊時長
    if (typeof data.duration !== 'number' || data.duration <= 0) {
      console.log('❌ 音訊時長: 缺失或無效')
      return false
    }
    console.log(`✅ 音訊時長: ${data.duration.toFixed(2)} 秒`)

    // 5. 驗證 Viseme 資料格式
    console.log('\n📊 Viseme 資料分析:')

    if (data.visemes.length === 0) {
      console.log('⚠️  警告: Viseme 陣列為空！')
      console.log('   這表示 Speech SDK 沒有返回 Viseme 事件')
      return false
    }

    // 檢查前 5 個 Viseme 的格式
    console.log(`\n前 5 個 Viseme 資料:`)
    const sampleVisemes = data.visemes.slice(0, 5)
    sampleVisemes.forEach((viseme, index) => {
      if (
        typeof viseme.time !== 'number' ||
        typeof viseme.visemeId !== 'number'
      ) {
        console.log(
          `❌ Viseme ${index + 1}: 格式錯誤 - ${JSON.stringify(viseme)}`
        )
      } else {
        console.log(
          `✅ Viseme ${index + 1}: time=${viseme.time.toFixed(3)}s, visemeId=${viseme.visemeId}`
        )
      }
    })

    // 6. 統計 Viseme ID 分佈
    console.log(`\n📈 Viseme ID 分佈統計:`)
    const visemeIdCounts = {}
    data.visemes.forEach((v) => {
      visemeIdCounts[v.visemeId] = (visemeIdCounts[v.visemeId] || 0) + 1
    })

    const sortedIds = Object.keys(visemeIdCounts)
      .map(Number)
      .sort((a, b) => a - b)
    sortedIds.forEach((id) => {
      console.log(`   Viseme ID ${id}: ${visemeIdCounts[id]} 次`)
    })

    // 7. 驗證時間序列
    console.log(`\n⏱️  時間序列驗證:`)
    let isTimeOrdered = true
    for (let i = 1; i < data.visemes.length; i++) {
      if (data.visemes[i].time < data.visemes[i - 1].time) {
        isTimeOrdered = false
        console.log(
          `❌ 時間順序錯誤: Viseme ${i - 1} (${data.visemes[i - 1].time}s) > Viseme ${i} (${data.visemes[i].time}s)`
        )
        break
      }
    }

    if (isTimeOrdered) {
      console.log(
        `✅ 時間序列正確 (${data.visemes[0].time.toFixed(3)}s ~ ${data.visemes[data.visemes.length - 1].time.toFixed(3)}s)`
      )
    }

    // 8. 最終總結
    console.log('\n' + '='.repeat(60))
    console.log('🎉 測試總結')
    console.log('='.repeat(60))
    console.log(`✅ TTS API 正常運作`)
    console.log(`✅ Viseme 資料成功返回 (${data.visemes.length} 個)`)
    console.log(`✅ 音訊時長: ${data.duration.toFixed(2)} 秒`)
    console.log(`✅ API 回應時間: ${elapsed}ms`)
    console.log(`✅ Lip Sync 功能已完全啟用！`)
    console.log('='.repeat(60))

    return true
  } catch (error) {
    console.error('\n❌ 測試失敗:', error.message)
    console.error('\n錯誤詳情:', error)

    if (error.message.includes('ECONNREFUSED')) {
      console.error(
        '\n⚠️  提示: 請確保開發伺服器正在運行 (PORT=3005 npm run dev)'
      )
    }

    return false
  }
}

// 執行測試
testTTSViseme()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('測試執行錯誤:', error)
    process.exit(1)
  })
