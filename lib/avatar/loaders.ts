import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Group } from 'three'

/**
 * 載入 Ready Player Me GLB 模型
 *
 * 此函式使用 Three.js 的 GLTFLoader 載入 Ready Player Me 的 GLB 格式 Avatar 模型。
 * 載入完成後會自動設定模型的陰影屬性，以便在場景中正確顯示陰影效果。
 *
 * @param url - Ready Player Me GLB 模型的完整 URL
 * @returns Promise<Group> - Three.js Group 物件，包含完整的 Avatar 模型
 *
 * @throws Error - 當模型載入失敗時拋出錯誤
 *
 * @example
 * ```typescript
 * try {
 *   const model = await loadAvatarModel('https://models.readyplayer.me/xxxxx.glb');
 *   scene.add(model);
 * } catch (error) {
 *   console.error('Failed to load avatar:', error);
 * }
 * ```
 */
export async function loadAvatarModel(url: string): Promise<Group> {
  const loader = new GLTFLoader()

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene

        // 設定模型的陰影屬性
        // Ready Player Me 模型包含多個 Mesh（頭部、身體、服裝、頭髮等）
        // 需要遍歷所有子物件並啟用陰影渲染
        model.traverse((child) => {
          // 檢查是否為 Mesh 物件
          if ('isMesh' in child && (child as { isMesh: boolean }).isMesh) {
            child.castShadow = true    // 模型會投射陰影
            child.receiveShadow = true // 模型會接收陰影
          }
        })

        resolve(model)
      },
      (progress) => {
        // 載入進度回調
        // progress.loaded: 已載入的位元組數
        // progress.total: 總位元組數
        const percentComplete = progress.total > 0
          ? (progress.loaded / progress.total) * 100
          : 0

        console.log(`[Avatar Loader] Loading model: ${percentComplete.toFixed(2)}%`)
      },
      (error) => {
        // 載入錯誤回調
        console.error('[Avatar Loader] Error loading avatar model:', error)
        reject(new Error(`Failed to load avatar model from ${url}`))
      }
    )
  })
}

/**
 * 批次預載入多個 Avatar 模型
 *
 * 此函式可用於在應用程式啟動時預先載入多個 Avatar 模型，
 * 以減少後續切換 Avatar 時的等待時間。
 *
 * @param urls - Avatar GLB URL 陣列
 * @returns Promise<Group[]> - 載入完成的模型陣列
 *
 * @example
 * ```typescript
 * const urls = [
 *   'https://models.readyplayer.me/xxxxx.glb',
 *   'https://models.readyplayer.me/yyyyy.glb',
 * ];
 * const models = await preloadAvatars(urls);
 * console.log(`Preloaded ${models.length} avatars`);
 * ```
 */
export async function preloadAvatars(urls: string[]): Promise<Group[]> {
  console.log(`[Avatar Loader] Preloading ${urls.length} avatars...`)

  try {
    const models = await Promise.all(
      urls.map((url) => loadAvatarModel(url))
    )

    console.log(`[Avatar Loader] Successfully preloaded ${models.length} avatars`)
    return models
  } catch (error) {
    console.error('[Avatar Loader] Failed to preload avatars:', error)
    throw error
  }
}
