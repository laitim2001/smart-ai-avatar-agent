/**
 * Viseme 到 Blendshape 映射器
 * @module lib/lipsync/viseme-mapper
 * @description 將 Azure Speech SDK Viseme IDs 映射到 Ready Player Me Blendshape 名稱與權重
 */

import { BlendshapeTarget, VisemeBlendshapeMapping } from '@/types/lipsync'

/**
 * Azure Speech SDK Viseme ID 到 Ready Player Me Blendshape 映射表
 *
 * Azure Speech SDK 提供 22 個 Viseme IDs (0-21)
 * Ready Player Me 支援 Oculus ARKit 標準 Viseme Blendshapes
 *
 * 映射策略：
 * - 0: 靜音 (silence) -> 無嘴型變化
 * - 1-21: 各種發音 -> 對應的 viseme blendshape
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
 * @see https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets
 */
export const VISEME_BLENDSHAPE_MAP: VisemeBlendshapeMapping = {
  // 0: 靜音 (Silence)
  0: { name: 'viseme_sil', weight: 0 },

  // 1: ae, ax, ah (IPA: æ, ə, ʌ) - 開口元音
  // 對應：cat, about, but
  1: { name: 'viseme_aa', weight: 0.8 },

  // 2: aa (IPA: ɑ) - 大開口元音
  // 對應：father, hot
  2: { name: 'viseme_aa', weight: 1.0 },

  // 3: ao (IPA: ɔ) - 圓唇半開元音
  // 對應：caught, thought
  3: { name: 'viseme_O', weight: 0.9 },

  // 4: eh (IPA: ɛ) - 前半開元音
  // 對應：bet, red
  4: { name: 'viseme_E', weight: 0.8 },

  // 5: er (IPA: ɝ) - R 化元音
  // 對應：bird, hurt
  5: { name: 'viseme_E', weight: 0.7 },

  // 6: ey, ih, iy (IPA: eɪ, ɪ, i) - 前高元音
  // 對應：ate, it, eat
  6: { name: 'viseme_I', weight: 0.7 },

  // 7: ow (IPA: oʊ) - 圓唇半高元音
  // 對應：go, no
  7: { name: 'viseme_O', weight: 0.8 },

  // 8: uw (IPA: u) - 圓唇高元音
  // 對應：too, blue
  8: { name: 'viseme_U', weight: 0.9 },

  // 9: aw (IPA: aʊ) - 雙元音
  // 對應：cow, how
  9: { name: 'viseme_aa', weight: 0.9 },

  // 10: ay (IPA: aɪ) - 雙元音
  // 對應：ice, buy
  10: { name: 'viseme_aa', weight: 0.8 },

  // 11: h (IPA: h) - 氣音
  // 對應：help, ahead
  11: { name: 'viseme_aa', weight: 0.3 },

  // 12: r (IPA: ɹ) - 捲舌音
  // 對應：red, very
  12: { name: 'viseme_RR', weight: 0.8 },

  // 13: l (IPA: l) - 舌側音
  // 對應：lid, call
  13: { name: 'viseme_DD', weight: 0.7 },

  // 14: s, z (IPA: s, z) - 齒齦擦音
  // 對應：sit, zap
  14: { name: 'viseme_SS', weight: 0.8 },

  // 15: sh, zh (IPA: ʃ, ʒ) - 齶後擦音
  // 對應：she, measure
  15: { name: 'viseme_CH', weight: 0.8 },

  // 16: th (IPA: θ, ð) - 齒擦音
  // 對應：think, this
  16: { name: 'viseme_TH', weight: 0.7 },

  // 17: f, v (IPA: f, v) - 唇齒擦音
  // 對應：fill, very
  17: { name: 'viseme_FF', weight: 0.8 },

  // 18: d, t, n (IPA: d, t, n) - 齒齦塞音/鼻音
  // 對應：dog, top, no
  18: { name: 'viseme_DD', weight: 0.8 },

  // 19: k, g (IPA: k, ɡ) - 軟顎塞音
  // 對應：cat, go
  19: { name: 'viseme_kk', weight: 0.7 },

  // 20: p, b, m (IPA: p, b, m) - 雙唇塞音/鼻音
  // 對應：put, big, man
  20: { name: 'viseme_PP', weight: 0.9 },

  // 21: oy (IPA: ɔɪ) - 雙元音
  // 對應：toy, boy
  21: { name: 'viseme_O', weight: 0.85 },
}

/**
 * 取得指定 Viseme ID 的 Blendshape 目標
 *
 * @param visemeId - Azure Speech SDK Viseme ID (0-21)
 * @returns {BlendshapeTarget} Blendshape 名稱與權重
 *
 * @example
 * ```typescript
 * const target = getBlendshapeForViseme(20); // p, b, m
 * // Returns: { name: 'viseme_PP', weight: 0.9 }
 * ```
 */
export function getBlendshapeForViseme(visemeId: number): BlendshapeTarget {
  // 驗證 Viseme ID 範圍
  if (visemeId < 0 || visemeId > 21) {
    console.warn(`[VisemeMapper] 無效的 Viseme ID: ${visemeId}，返回靜音`)
    return VISEME_BLENDSHAPE_MAP[0]
  }

  return VISEME_BLENDSHAPE_MAP[visemeId] || VISEME_BLENDSHAPE_MAP[0]
}

/**
 * 批量轉換 Viseme 數據為 Blendshape 目標
 *
 * @param visemeIds - Viseme ID 數組
 * @returns {BlendshapeTarget[]} Blendshape 目標數組
 */
export function mapVisemesToBlendshapes(
  visemeIds: number[]
): BlendshapeTarget[] {
  return visemeIds.map((id) => getBlendshapeForViseme(id))
}

/**
 * 檢查 Avatar 是否支援 Viseme Blendshapes
 *
 * @param morphTargetDictionary - Avatar SkinnedMesh 的 morphTargetDictionary
 * @returns {boolean} 是否支援 Viseme Blendshapes
 *
 * @example
 * ```typescript
 * const headMesh = avatar.getObjectByName('Wolf3D_Head') as SkinnedMesh;
 * const supportsVisemes = checkVisemeSupport(headMesh.morphTargetDictionary);
 * ```
 */
export function checkVisemeSupport(
  morphTargetDictionary: { [key: string]: number } | undefined
): boolean {
  if (!morphTargetDictionary) return false

  // 檢查是否存在至少 5 個常見的 Viseme Blendshapes
  const commonVisemes = [
    'viseme_sil',
    'viseme_PP',
    'viseme_FF',
    'viseme_aa',
    'viseme_E',
  ]

  const supportedCount = commonVisemes.filter(
    (name) => morphTargetDictionary[name] !== undefined
  ).length

  return supportedCount >= 3 // 至少支援 3 個 Viseme Blendshapes
}

/**
 * 取得 Avatar 支援的所有 Viseme Blendshape 名稱
 *
 * @param morphTargetDictionary - Avatar SkinnedMesh 的 morphTargetDictionary
 * @returns {string[]} 支援的 Viseme Blendshape 名稱數組
 */
export function getSupportedVisemes(
  morphTargetDictionary: { [key: string]: number } | undefined
): string[] {
  if (!morphTargetDictionary) return []

  // 標準 Oculus ARKit Viseme Blendshapes
  const standardVisemes = [
    'viseme_sil', // 靜音
    'viseme_PP',  // p, b, m
    'viseme_FF',  // f, v
    'viseme_TH',  // th
    'viseme_DD',  // d, t, n
    'viseme_kk',  // k, g
    'viseme_CH',  // ch, j, sh
    'viseme_SS',  // s, z
    'viseme_nn',  // n, ng
    'viseme_RR',  // r
    'viseme_aa',  // aa
    'viseme_E',   // e
    'viseme_I',   // i
    'viseme_O',   // o
    'viseme_U',   // u
  ]

  return standardVisemes.filter(
    (name) => morphTargetDictionary[name] !== undefined
  )
}

/**
 * 取得 Viseme Blendshape 的索引
 *
 * @param morphTargetDictionary - Avatar SkinnedMesh 的 morphTargetDictionary
 * @param visemeName - Viseme Blendshape 名稱
 * @returns {number | null} Blendshape 索引，不存在則返回 null
 */
export function getVisemeIndex(
  morphTargetDictionary: { [key: string]: number } | undefined,
  visemeName: string
): number | null {
  if (!morphTargetDictionary) return null

  const index = morphTargetDictionary[visemeName]
  return index !== undefined ? index : null
}

/**
 * 建立 Viseme Blendshape 索引快取
 *
 * 用於優化運行時查找性能
 *
 * @param morphTargetDictionary - Avatar SkinnedMesh 的 morphTargetDictionary
 * @returns {Map<string, number>} Viseme 名稱到索引的映射
 */
export function buildVisemeIndexCache(
  morphTargetDictionary: { [key: string]: number } | undefined
): Map<string, number> {
  const cache = new Map<string, number>()

  if (!morphTargetDictionary) return cache

  const supportedVisemes = getSupportedVisemes(morphTargetDictionary)

  supportedVisemes.forEach((name) => {
    const index = morphTargetDictionary[name]
    if (index !== undefined) {
      cache.set(name, index)
    }
  })

  return cache
}

/**
 * 標準化 Blendshape 權重
 *
 * 確保權重在 0-1 範圍內
 *
 * @param weight - 原始權重
 * @returns {number} 標準化後的權重 (0-1)
 */
export function normalizeWeight(weight: number): number {
  return Math.max(0, Math.min(1, weight))
}

/**
 * 應用強度倍數到 Blendshape 權重
 *
 * @param weight - 原始權重
 * @param intensity - 強度倍數 (0-2)
 * @returns {number} 調整後的權重 (0-1)
 */
export function applyIntensity(weight: number, intensity: number): number {
  return normalizeWeight(weight * intensity)
}
