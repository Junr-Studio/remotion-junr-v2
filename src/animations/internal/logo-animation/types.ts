/**
 * Types for Junr Logo Animation
 *
 * All types use `type` (not `interface`) for Remotion defaultProps type safety.
 * All props must be JSON-serializable for composition registration.
 */

import type { LogoAnimationType, SpringConfig } from '@/types/common';

/**
 * Props for the main Junr logo animation composition
 */
export type JunrLogoAnimationProps = {
  /** Background color of the composition */
  backgroundColor: string;
  /** Scale factor for the logo (1 = 100%) */
  logoScale: number;
  /** Type of animation to use for the logo entrance */
  animationType: LogoAnimationType;
  /** Optional custom spring configuration */
  springConfig?: SpringConfig;
  /** Optional tagline text to display below logo */
  tagline?: string;
  /** Optional tagline color */
  taglineColor?: string;
};

/**
 * Props for the Logo component
 */
export type LogoProps = {
  /** Scale factor for the logo */
  scale: number;
  /** Animation type to apply */
  animationType: LogoAnimationType;
  /** Optional spring configuration override */
  springConfig?: SpringConfig;
};

/**
 * Props for the Tagline component
 */
export type TaglineProps = {
  /** Text content */
  text: string;
  /** Text color */
  color: string;
  /** Delay in frames before animation starts */
  delay: number;
};

/**
 * Default values for Junr logo animation
 */
export const JUNR_DEFAULTS = {
  backgroundColor: '#000000',
  logoScale: 1,
  animationType: 'bounce' as const,
  taglineColor: '#ffffff',
  springConfig: {
    damping: 10,
    stiffness: 100,
  },
} as const;
