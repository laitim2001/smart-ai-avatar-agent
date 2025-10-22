import Replicate from 'replicate'

/**
 * Replicate API Client
 *
 * 用於與 Replicate 託管的 AI 模型互動
 * 包含照片風格化（Stable Diffusion）和 Lip Sync（Wav2Lip/MuseTalk）
 */

/**
 * 獲取 Replicate 客戶端實例
 */
export function getReplicateClient(): Replicate {
  const apiToken = process.env.REPLICATE_API_TOKEN

  if (!apiToken) {
    throw new Error(
      'Missing REPLICATE_API_TOKEN environment variable. ' +
      'Please add it to your .env.local file.'
    )
  }

  return new Replicate({
    auth: apiToken,
  })
}

/**
 * 照片風格化為 Avatar 風格
 *
 * 使用 Stable Diffusion ControlNet 將真人照片轉換為 Avatar 風格圖片
 *
 * @param imageUrl - 原始照片 URL
 * @param style - Avatar 風格（cartoon, anime, illustration）
 * @returns 風格化後的圖片 URL
 */
export async function stylizePhotoToAvatar(
  imageUrl: string,
  style: 'cartoon' | 'anime' | 'illustration' = 'cartoon'
): Promise<string> {
  const replicate = getReplicateClient()

  const stylePrompts = {
    cartoon: 'professional avatar, cartoon style, clean illustration, high quality, clean background',
    anime: 'anime avatar, manga style, professional illustration, vibrant colors, clean background',
    illustration: 'digital illustration avatar, artistic style, professional artwork, clean background'
  }

  const prompt = stylePrompts[style]

  console.log('[Replicate] Stylizing photo to avatar:', {
    imageUrl,
    style,
    prompt
  })

  try {
    // 使用 predictions.create 以便有更好的錯誤處理和等待邏輯
    const prediction = await replicate.predictions.create({
      version: "aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613",
      input: {
        image: imageUrl,
        prompt: prompt,
        negative_prompt: 'realistic, photo, low quality, blurry, distorted face, multiple faces',
        num_inference_steps: 20,
        guidance_scale: 7.5,
        controlnet_conditioning_scale: 1.0,
      }
    })

    console.log('[Replicate] Prediction created:', prediction.id, 'Status:', prediction.status)

    // 等待結果完成（最多 180 秒 = 3 分鐘）
    let finalPrediction = prediction
    const maxWaitTime = 180000 // 180 seconds (3 minutes)
    const startTime = Date.now()

    while (
      finalPrediction.status !== 'succeeded' &&
      finalPrediction.status !== 'failed' &&
      finalPrediction.status !== 'canceled' &&
      (Date.now() - startTime) < maxWaitTime
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      finalPrediction = await replicate.predictions.get(prediction.id)
      console.log('[Replicate] Prediction status:', finalPrediction.status)
    }

    if (finalPrediction.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${finalPrediction.error}`)
    }

    if (finalPrediction.status === 'canceled') {
      throw new Error('Replicate prediction was canceled')
    }

    if (finalPrediction.status !== 'succeeded') {
      throw new Error(`Replicate prediction timeout after ${maxWaitTime}ms`)
    }

    // 取得輸出
    const output = finalPrediction.output

    console.log('[Replicate] Final output type:', typeof output)
    console.log('[Replicate] Final output is array?:', Array.isArray(output))
    console.log('[Replicate] Final output:', JSON.stringify(output))

    // Output 可能是陣列或單一URL字串
    let avatarImageUrl: string

    if (Array.isArray(output)) {
      // ControlNet 返回兩張圖片：
      // [0] = Canny edge detection 線稿
      // [1] = 最終風格化圖片
      // 我們需要第二張圖片（最終結果）
      const finalImageIndex = output.length > 1 ? 1 : 0

      if (typeof output[finalImageIndex] === 'string') {
        avatarImageUrl = output[finalImageIndex]
        console.log(`[Replicate] Using image ${finalImageIndex + 1} of ${output.length} from output array`)
      } else {
        throw new Error(`Output array element ${finalImageIndex} is not a string: ${typeof output[finalImageIndex]}`)
      }
    } else if (typeof output === 'string') {
      avatarImageUrl = output
    } else {
      throw new Error(`Unexpected output format: ${typeof output}`)
    }

    if (!avatarImageUrl || avatarImageUrl.trim() === '') {
      throw new Error(`Invalid avatar URL: empty or null`)
    }

    console.log('[Replicate] Avatar stylization completed:', avatarImageUrl)

    return avatarImageUrl
  } catch (error) {
    console.error('[Replicate] Stylization error:', error)
    throw new Error(
      `Failed to stylize photo: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * 使用 Wav2Lip 生成 Lip Sync 影片
 *
 * @param imageUrl - Avatar 圖片 URL
 * @param audioUrl - 音訊檔案 URL（支援 data: URL）
 * @returns Lip Sync 影片 URL
 */
export async function generateLipSyncVideo(
  imageUrl: string,
  audioUrl: string
): Promise<string> {
  const replicate = getReplicateClient()

  console.log('[Replicate Wav2Lip] Starting lip sync generation:', {
    imageUrl: imageUrl.substring(0, 50) + '...',
    audioUrl: audioUrl.substring(0, 50) + '...'
  })

  try {
    // 使用 Wav2Lip 模型
    const prediction = await replicate.predictions.create({
      version: "8d65e3f4f4298520e079198b493c25adfc43c058ffec924f2aefc8010ed25eef",
      input: {
        face: imageUrl,
        audio: audioUrl,
        // 使用 GAN 版本提升品質（稍慢但更好）
        pads: "0 10 0 0",  // 格式：top right bottom left（字串格式）
        wav2lip_gan: true,
        nosmooth: false
      }
    })

    console.log('[Replicate Wav2Lip] Prediction created:', prediction.id, 'Status:', prediction.status)

    // 等待結果完成（最多 120 秒）
    let finalPrediction = prediction
    const maxWaitTime = 120000 // 120 seconds (2 minutes)
    const startTime = Date.now()

    while (
      finalPrediction.status !== 'succeeded' &&
      finalPrediction.status !== 'failed' &&
      finalPrediction.status !== 'canceled' &&
      (Date.now() - startTime) < maxWaitTime
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      finalPrediction = await replicate.predictions.get(prediction.id)
      console.log('[Replicate Wav2Lip] Prediction status:', finalPrediction.status)
    }

    if (finalPrediction.status === 'failed') {
      throw new Error(`Wav2Lip prediction failed: ${finalPrediction.error}`)
    }

    if (finalPrediction.status === 'canceled') {
      throw new Error('Wav2Lip prediction was canceled')
    }

    if (finalPrediction.status !== 'succeeded') {
      throw new Error(`Wav2Lip prediction timeout after ${maxWaitTime}ms`)
    }

    // 取得輸出影片 URL
    const output = finalPrediction.output

    if (!output || typeof output !== 'string') {
      throw new Error(`Invalid output from Wav2Lip. Type: ${typeof output}, Value: ${JSON.stringify(output)}`)
    }

    console.log('[Replicate Wav2Lip] Video generation completed:', output)

    return output

  } catch (error) {
    console.error('[Replicate Wav2Lip] Error:', error)
    throw new Error(
      `Failed to generate lip sync video: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * 檢查 Replicate API 連線狀態
 *
 * @returns 連線狀態和訊息
 */
export async function checkReplicateConnection(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const replicate = getReplicateClient()

    // 嘗試列出模型（輕量測試）
    const models = await replicate.models.list()

    return {
      success: true,
      message: `Replicate API 連接成功。可用模型數：${models.results?.length || 0}`
    }
  } catch (error) {
    return {
      success: false,
      message: `Replicate API 連接失敗: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
