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
