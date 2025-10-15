/**
 * Avatar Animation System
 *
 * Provides procedural animation controllers for idle animations:
 * - Breathing animation (chest scale variation)
 * - Blinking animation (eyesClosed blendshape control)
 *
 * @module lib/avatar/animations
 */

/**
 * Calculate breathing animation scale value using sine wave
 *
 * Uses smooth sine wave to simulate natural breathing rhythm.
 * The scale value oscillates around 1.0, creating subtle expansion/contraction.
 *
 * @param time - Current elapsed time in seconds
 * @param breathingRate - Duration of one complete breath cycle (seconds)
 * @param amplitude - Scale variation amount (0.03 = 3% change)
 * @returns Scale multiplier (e.g., 1.03 = 3% larger, 0.97 = 3% smaller)
 *
 * @example
 * ```typescript
 * const time = 2.5;
 * const scale = calculateBreathingScale(time);
 * chestNode.scale.setScalar(scale);
 * ```
 */
export function calculateBreathingScale(
  time: number,
  breathingRate: number = 4,
  amplitude: number = 0.03
): number {
  // Convert time to cycle position (0 to 2π)
  const cycle = (time / breathingRate) * Math.PI * 2

  // Sine wave: -1 to +1, centered at 1.0
  // Result: (1 - amplitude) to (1 + amplitude)
  return 1 + Math.sin(cycle) * amplitude
}

/**
 * Blink Animation Controller
 *
 * Manages blinking state machine with randomized intervals and smooth easing.
 * Simulates natural human blinking behavior (15-20 blinks per minute).
 *
 * State machine:
 * [Open] → (wait 2-5s) → [Blinking] → (0.15s) → [Open]
 *
 * @example
 * ```typescript
 * const controller = new BlinkController();
 *
 * // In animation loop
 * useFrame((state) => {
 *   const time = state.clock.getElapsedTime();
 *   const eyesClosedValue = controller.update(time);
 *   headMesh.morphTargetInfluences[eyesClosedIndex] = eyesClosedValue;
 * });
 * ```
 */
export class BlinkController {
  /** Timestamp of last blink start (seconds) */
  private lastBlinkTime: number = 0

  /** Randomly generated delay until next blink (seconds) */
  private nextBlinkDelay: number = 3

  /** Whether a blink is currently in progress */
  private isBlinking: boolean = false

  /** Timestamp when current blink started (seconds) */
  private blinkStartTime: number = 0

  /** Duration of one complete blink (close + open) */
  private readonly blinkDuration: number = 0.15

  /** Minimum interval between blinks (seconds) */
  private readonly minBlinkInterval: number = 2

  /** Maximum interval between blinks (seconds) */
  private readonly maxBlinkInterval: number = 5

  /**
   * Update blink state and calculate eyesClosed blendshape value
   *
   * Should be called every frame with current elapsed time.
   * Returns 0 (eyes open) to 1 (eyes closed).
   *
   * @param currentTime - Current elapsed time in seconds
   * @returns eyesClosed blendshape value (0-1)
   */
  update(currentTime: number): number {
    // Check if it's time to start a new blink
    if (!this.isBlinking && currentTime - this.lastBlinkTime >= this.nextBlinkDelay) {
      this.startBlink(currentTime)
    }

    // Process ongoing blink
    if (this.isBlinking) {
      return this.calculateBlinkValue(currentTime)
    }

    // Eyes open (default state)
    return 0
  }

  /**
   * Start a new blink and schedule next one
   * @private
   */
  private startBlink(currentTime: number): void {
    this.isBlinking = true
    this.blinkStartTime = currentTime
    this.lastBlinkTime = currentTime

    // Randomize next blink delay (2-5 seconds)
    this.nextBlinkDelay =
      this.minBlinkInterval +
      Math.random() * (this.maxBlinkInterval - this.minBlinkInterval)
  }

  /**
   * Calculate current blink progress value
   * @private
   */
  private calculateBlinkValue(currentTime: number): number {
    const elapsed = currentTime - this.blinkStartTime
    const progress = elapsed / this.blinkDuration

    // Blink complete, return to open state
    if (progress >= 1) {
      this.isBlinking = false
      return 0
    }

    // Symmetric easing: close (0→0.5), then open (0.5→1)
    // Uses ease-in-out curve for smooth, natural motion
    if (progress < 0.5) {
      // Closing phase (0 → 1)
      return this.easeInOut(progress * 2)
    } else {
      // Opening phase (1 → 0)
      return this.easeInOut((1 - progress) * 2)
    }
  }

  /**
   * Ease-in-out timing function for smooth acceleration/deceleration
   *
   * Creates natural-looking motion:
   * - Starts slow (ease in)
   * - Speeds up in middle
   * - Ends slow (ease out)
   *
   * @param t - Progress value (0-1)
   * @returns Eased value (0-1)
   * @private
   */
  private easeInOut(t: number): number {
    // Quadratic ease-in-out formula
    // t < 0.5: accelerate (2t²)
    // t ≥ 0.5: decelerate (-1 + (4 - 2t) * t)
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t
  }

  /**
   * Reset controller state
   * Useful when avatar changes or needs to restart animation
   */
  reset(): void {
    this.lastBlinkTime = 0
    this.nextBlinkDelay = 3
    this.isBlinking = false
    this.blinkStartTime = 0
  }
}

/**
 * Animation configuration interface
 * For customizing animation behavior per avatar or context
 */
export interface AnimationConfig {
  /** Breathing animation settings */
  breathing: {
    /** Enabled state */
    enabled: boolean
    /** Breath cycle duration (seconds) */
    rate: number
    /** Scale variation amount */
    amplitude: number
  }

  /** Blinking animation settings */
  blinking: {
    /** Enabled state */
    enabled: boolean
    /** Minimum interval between blinks (seconds) */
    minInterval: number
    /** Maximum interval between blinks (seconds) */
    maxInterval: number
    /** Blink duration (seconds) */
    duration: number
  }
}

/**
 * Default animation configuration
 * Provides natural, subtle idle animations
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  breathing: {
    enabled: true,
    rate: 4,
    amplitude: 0.03
  },
  blinking: {
    enabled: true,
    minInterval: 2,
    maxInterval: 5,
    duration: 0.15
  }
}

/**
 * Expression Animation Controller
 *
 * 管理臉部表情動畫（如微笑、皺眉等）的平滑過渡。
 * 使用 Ease-In-Out Cubic 曲線確保表情變化自然流暢。
 *
 * @example
 * ```typescript
 * const smileController = new ExpressionController();
 *
 * // 觸發微笑動畫
 * smileController.trigger(1.0, 0.5); // 完全微笑，0.5秒
 *
 * // 在動畫迴圈中更新
 * useFrame((state) => {
 *   const time = state.clock.getElapsedTime();
 *   const smileValue = smileController.update(time);
 *   headMesh.morphTargetInfluences[smileIndex] = smileValue;
 * });
 * ```
 */
export class ExpressionController {
  /** 目標表情值 (0-1) */
  private targetValue: number = 0

  /** 當前表情值 (0-1) */
  private currentValue: number = 0

  /** 動畫持續時間（秒） */
  private animationDuration: number = 0.5

  /** 動畫開始時間（秒） */
  private startTime: number = 0

  /** 是否正在播放動畫 */
  private isAnimating: boolean = false

  /**
   * 觸發表情動畫
   *
   * @param value - 目標表情值 (0-1)，0 = 無表情，1 = 完全表情
   * @param duration - 動畫時長（秒），預設 0.5 秒
   *
   * @example
   * ```typescript
   * // 淺笑
   * controller.trigger(0.5, 0.5);
   *
   * // 大笑
   * controller.trigger(1.0, 0.5);
   *
   * // 恢復中性表情
   * controller.trigger(0, 0.3);
   * ```
   */
  trigger(value: number, duration: number = 0.5): void {
    this.targetValue = Math.max(0, Math.min(1, value)) // 限制在 0-1 範圍
    this.animationDuration = duration
    this.startTime = performance.now() / 1000
    this.isAnimating = true
  }

  /**
   * 更新表情值並返回當前值
   *
   * Should be called every frame in animation loop.
   *
   * @param currentTime - 當前時間（秒）
   * @returns 當前 Blendshape 值 (0-1)
   */
  update(currentTime: number): number {
    if (!this.isAnimating) {
      return this.currentValue
    }

    const elapsed = currentTime - this.startTime
    const progress = Math.min(elapsed / this.animationDuration, 1)

    // Ease-In-Out Cubic 曲線插值
    const easedProgress = this.easeInOutCubic(progress)
    const startValue = this.currentValue
    this.currentValue = startValue + (this.targetValue - startValue) * easedProgress

    // 動畫完成
    if (progress >= 1) {
      this.isAnimating = false
      this.currentValue = this.targetValue
    }

    return this.currentValue
  }

  /**
   * Ease-In-Out Cubic 緩動函數
   *
   * 提供平滑的加速和減速效果：
   * - 前半段：加速（ease in）
   * - 後半段：減速（ease out）
   *
   * @param t - 進度值 (0-1)
   * @returns 緩動後的值 (0-1)
   * @private
   */
  private easeInOutCubic(t: number): number {
    // t < 0.5: 加速階段 4t³
    // t ≥ 0.5: 減速階段 1 - (-2t + 2)³ / 2
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * 重置控制器狀態
   */
  reset(): void {
    this.targetValue = 0
    this.currentValue = 0
    this.isAnimating = false
    this.startTime = 0
  }

  /**
   * 獲取當前是否正在播放動畫
   */
  get isPlaying(): boolean {
    return this.isAnimating
  }
}

/**
 * Head Nod Animation Controller
 *
 * 管理頭部點頭動畫，使用正弦波模擬自然的點頭動作。
 * 點頭動作：頭部向下傾斜再回到原位。
 *
 * @example
 * ```typescript
 * const nodController = new HeadNodController();
 *
 * // 觸發點頭動畫
 * nodController.trigger(1.0); // 1秒完成一次點頭
 *
 * // 在動畫迴圈中更新
 * useFrame((state) => {
 *   const time = state.clock.getElapsedTime();
 *   const nodAngle = nodController.update(time);
 *   headBone.rotation.x = nodAngle; // 控制頭部 X 軸旋轉
 * });
 * ```
 */
export class HeadNodController {
  /** 是否正在點頭 */
  private isNodding: boolean = false

  /** 點頭開始時間（秒） */
  private nodStartTime: number = 0

  /** 點頭持續時間（秒） */
  private nodDuration: number = 1.0

  /** 最大點頭角度（弧度） */
  private maxAngle: number = 0.3 // 約 17 度

  /**
   * 觸發點頭動畫
   *
   * @param duration - 點頭時長（秒），預設 1.0 秒
   * @param angle - 最大點頭角度（弧度），預設 0.3（約 17 度）
   *
   * @example
   * ```typescript
   * // 標準點頭
   * controller.trigger(1.0);
   *
   * // 快速點頭
   * controller.trigger(0.6);
   *
   * // 大幅度點頭
   * controller.trigger(1.0, 0.4);
   * ```
   */
  trigger(duration: number = 1.0, angle: number = 0.3): void {
    this.isNodding = true
    this.nodStartTime = performance.now() / 1000
    this.nodDuration = duration
    this.maxAngle = angle
  }

  /**
   * 更新點頭動畫並返回頭部旋轉角度
   *
   * @param currentTime - 當前時間（秒）
   * @returns X 軸旋轉角度（弧度），0 = 直立，正值 = 向下
   */
  update(currentTime: number): number {
    if (!this.isNodding) {
      return 0
    }

    const elapsed = currentTime - this.nodStartTime
    const progress = elapsed / this.nodDuration

    // 動畫完成
    if (progress >= 1) {
      this.isNodding = false
      return 0
    }

    // 使用正弦波模擬點頭（向下再向上）
    // sin(progress * π) 的值域為 [0, 1, 0]
    // progress = 0.0 → angle = 0（起始）
    // progress = 0.5 → angle = maxAngle（最低點）
    // progress = 1.0 → angle = 0（回到原位）
    const angle = Math.sin(progress * Math.PI) * this.maxAngle

    return angle
  }

  /**
   * 重置控制器狀態
   */
  reset(): void {
    this.isNodding = false
    this.nodStartTime = 0
  }

  /**
   * 獲取當前是否正在點頭
   */
  get isPlaying(): boolean {
    return this.isNodding
  }
}
