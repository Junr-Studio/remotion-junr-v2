/**
 * Types for Internal Logo Animation - Gradient Wipe Reveal
 *
 * All types use `type` (not `interface`) for Remotion defaultProps type safety.
 * All props must be JSON-serializable for composition registration.
 */

/**
 * Props for the main gradient wipe logo animation composition
 */
export type GradientWipeLogoProps = {
  /** Background color of the composition */
  backgroundColor: string;
  /** Scale factor for the logo (1 = default 800px width) */
  logoScale: number;
  /** Duration of the reveal phase in frames */
  revealDuration: number;
  /** Duration of the hold phase in frames */
  holdDuration: number;
  /** Duration of the exit phase in frames */
  exitDuration: number;
};

/**
 * Props for the LogoReveal component
 */
export type LogoRevealProps = {
  /** Scale factor for the logo */
  scale: number;
  /** Duration of the reveal phase in frames */
  revealDuration: number;
  /** Duration of the hold phase in frames */
  holdDuration: number;
  /** Duration of the exit phase in frames */
  exitDuration: number;
  /** Enable organic speed effects (non-linear movement + deformation) */
  enableOrganicSpeed?: boolean;
  /** Maximum skew angle in degrees when moving fast (default: 15) */
  maxSkewAngle?: number;
  /** Maximum horizontal stretch factor when moving fast (default: 1.15) */
  maxStretch?: number;
  /** Enable motion blur simulation on trailing edge (default: true) */
  enableMotionBlur?: boolean;
};

/**
 * Default values for gradient wipe logo animation
 */
export const GRADIENT_WIPE_DEFAULTS = {
  backgroundColor: '#000000',
  logoScale: 1,
  revealDuration: 90,
  holdDuration: 60,
  exitDuration: 30,
} as const;

/**
 * Default values for organic speed effects
 */
export const ORGANIC_SPEED_DEFAULTS = {
  enableOrganicSpeed: true,
  maxSkewAngle: 15,
  maxStretch: 1.15,
  enableMotionBlur: true,
} as const;

/**
 * Props for the BouncingDot component
 */
export type BouncingDotProps = {
  /** Frame when dot starts falling */
  startFrame: number;
  /** Logo scale factor (matches LogoReveal) */
  scale: number;
  /** Logo width in pixels */
  logoWidth: number;
  /** Logo height in pixels */
  logoHeight: number;
  /** Logo left position in pixels */
  logoLeft: number;
  /** Logo top position in pixels */
  logoTop: number;
  /** Number of bounces (1-4, default: 3) */
  bounceCount?: number;
  /** Energy retention per bounce (0-1, default: 0.45) */
  energyRetention?: number;
  /** Maximum squash factor on impact (default: 0.6) */
  maxSquash?: number;
  /** Maximum stretch factor during motion (default: 1.25) */
  maxStretch?: number;
  /** Drop height in viewBox units (default: 200) */
  dropHeight?: number;
  /** Horizontal offset at start of fall in viewBox units (negative = left, default: -80) */
  startXOffset?: number;
  /** Exit animation start frame */
  exitStart: number;
  /** Exit animation duration in frames */
  exitDuration: number;
};

/**
 * Default values for bouncing dot animation
 */
export const BOUNCING_DOT_DEFAULTS = {
  bounceCount: 3,
  energyRetention: 0.55, // Softer decay = more organic feeling bounces
  maxSquash: 0.7, // Less extreme squash for subtler effect
  maxStretch: 1.2, // Less extreme stretch
  dropHeight: 200,
  startXOffset: -80, // Start 80 units to the left
} as const;
