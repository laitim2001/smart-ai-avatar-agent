/**
 * Viseme 相關型別定義
 *
 * Viseme（視位）是語音中對應視覺的基本單位
 * Azure Speech Service 提供 21 種 viseme ID 對應不同的嘴型
 */

/**
 * Azure Speech Viseme ID
 *
 * @see https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
 */
export type VisemeId =
  | 0  // 靜音
  | 1  // æ, ax, ah (cat, about)
  | 2  // aa (hot)
  | 3  // ao (thought)
  | 4  // ey (ate)
  | 5  // eh (bed)
  | 6  // er (bird)
  | 7  // y, iy, ih, ix (happy, seat, sit)
  | 8  // w, uw (too)
  | 9  // ow (go)
  | 10 // aw (how)
  | 11 // oy (toy)
  | 12 // ay (ice)
  | 13 // h (help)
  | 14 // r (red)
  | 15 // l (lid)
  | 16 // s, z (sit, zoo)
  | 17 // sh, ch, jh, zh (ship, chip, jump)
  | 18 // th, dh (thing, this)
  | 19 // f, v (fit, view)
  | 20 // d, t, n (dog, top, no)
  | 21 // k, g, ng (cap, gap, sing)

/**
 * Viseme 事件資料
 */
export interface VisemeEvent {
  /** Viseme ID (0-21) */
  visemeId: VisemeId
  /** 音訊偏移時間（100 奈秒為單位） */
  audioOffset: number
  /** 音訊偏移時間（毫秒） */
  audioOffsetMs: number
}

/**
 * TTS with Viseme 回應
 */
export interface TTSWithVisemeResponse {
  /** 音訊檔案 URL（Blob Storage）*/
  audioUrl: string
  /** 音訊時長（毫秒）*/
  duration: number
  /** Viseme 事件陣列 */
  visemes: VisemeEvent[]
  /** 文字內容 */
  text: string
}

/**
 * Viseme 到 Three.js Morph Target 的映射
 *
 * Ready Player Me GLB 模型使用的 morph target 名稱
 */
export const VISEME_TO_MORPH_TARGET: Record<VisemeId, string | null> = {
  0: null,                    // 靜音
  1: 'mouthOpen',            // æ, ax, ah
  2: 'mouthOpen',            // aa
  3: 'mouthFunnel',          // ao (rounded O)
  4: 'mouthSmile',           // ey
  5: 'mouthOpen',            // eh
  6: 'mouthFunnel',          // er
  7: 'mouthSmile',           // y, iy, ih, ix
  8: 'mouthPucker',          // w, uw (lips rounded)
  9: 'mouthFunnel',          // ow
  10: 'mouthOpen',           // aw
  11: 'mouthPucker',         // oy
  12: 'mouthOpen',           // ay
  13: 'mouthOpen',           // h
  14: 'mouthFunnel',         // r
  15: 'mouthOpen',           // l
  16: 'mouthSmile',          // s, z
  17: 'mouthPucker',         // sh, ch, jh, zh
  18: 'mouthOpen',           // th, dh
  19: 'mouthFunnel',         // f, v
  20: 'mouthOpen',           // d, t, n
  21: 'mouthOpen',           // k, g, ng
}

/**
 * Viseme 強度映射
 *
 * 不同 viseme 對應不同的嘴型開合程度
 */
export const VISEME_INTENSITY: Record<VisemeId, number> = {
  0: 0.0,   // 靜音
  1: 0.6,   // æ, ax, ah - 中開
  2: 0.8,   // aa - 大開
  3: 0.5,   // ao - 圓形
  4: 0.4,   // ey - 微笑
  5: 0.6,   // eh - 中開
  6: 0.5,   // er - 圓形
  7: 0.3,   // y, iy, ih, ix - 微笑
  8: 0.5,   // w, uw - 嘟嘴
  9: 0.5,   // ow - 圓形
  10: 0.7,  // aw - 大開
  11: 0.5,  // oy - 嘟嘴
  12: 0.7,  // ay - 大開
  13: 0.4,  // h - 小開
  14: 0.5,  // r - 圓形
  15: 0.5,  // l - 中開
  16: 0.3,  // s, z - 微笑閉合
  17: 0.5,  // sh, ch, jh, zh - 嘟嘴
  18: 0.4,  // th, dh - 小開
  19: 0.5,  // f, v - 圓形
  20: 0.5,  // d, t, n - 中開
  21: 0.4,  // k, g, ng - 小開
}
