/**
 * Common types for Remotion animations
 */

/**
 * Base props that all animation compositions can extend
 */
export type BaseAnimationProps = {
  /** Background color of the composition */
  backgroundColor?: string;
};

/**
 * Direction options for directional animations
 */
export type Direction = 'left' | 'right' | 'top' | 'bottom';

/**
 * Wipe direction options for mask/reveal animations
 */
export type WipeDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

/**
 * Animation type for logo animations
 */
export type LogoAnimationType = 'fade' | 'scale' | 'bounce' | 'slide' | 'rotate' | 'wipe' | 'glitch';

/**
 * Text animation type options
 */
export type TextAnimationType = 'fade' | 'slide' | 'typewriter' | 'stagger' | 'pop' | 'glitch';

/**
 * Spring configuration for natural motion
 */
export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass?: number;
  overshootClamping?: boolean;
};

/**
 * Common spring presets
 */
export const SPRING_PRESETS: Record<string, SpringConfig> = {
  /** Subtle, professional feel */
  subtle: { damping: 15, stiffness: 100 },
  /** Moderate bounce (recommended default) */
  moderate: { damping: 10, stiffness: 100 },
  /** Very bouncy, playful */
  bouncy: { damping: 7, stiffness: 150 },
  /** Fast, snappy response */
  snappy: { damping: 12, stiffness: 200 },
} as const;

/**
 * Frame timing constants at 60fps
 */
export const TIMING = {
  /** Quick animation: 0.25-0.33s */
  quick: { min: 15, max: 20 },
  /** Standard animation: 0.5-0.75s */
  standard: { min: 30, max: 45 },
  /** Logo reveal: 0.75-1.5s */
  logoReveal: { min: 45, max: 90 },
  /** Total animation duration: 1.5-5s */
  total: { min: 90, max: 300 },
} as const;

/**
 * Standard composition dimensions
 */
export const DIMENSIONS = {
  fullHd: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  fourK: { width: 3840, height: 2160 },
} as const;

/**
 * Standard frame rates
 */
export const FPS = {
  standard: 30,
  smooth: 60,
} as const;
