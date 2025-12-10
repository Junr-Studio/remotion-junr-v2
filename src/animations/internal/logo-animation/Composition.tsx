/**
 * Internal Logo Animation - Gradient Wipe Reveal
 *
 * A professional logo reveal animation where a gradient "paints" the logo
 * from left to right, progressively filling and revealing the JUNR. logotype.
 *
 * Animation sequence (180 frames at 60fps = 3 seconds):
 * - Phase 1: Reveal (0-90 frames) - Gradient wipes from left to right
 * - Phase 2: Hold (90-150 frames) - Logo fully visible for brand exposure
 * - Phase 3: Exit (150-180 frames) - Subtle fade out with scale reduction
 *
 * Quality Standards Applied:
 * - Uses useCurrentFrame() for all animations (NO CSS animations)
 * - Uses type (not interface) for props
 * - Memoizes expensive calculations
 * - All props are JSON-serializable
 * - Uses staticFile() for assets
 */

import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import type { GradientWipeLogoProps } from './types';
import { GRADIENT_WIPE_DEFAULTS } from './types';
import { LogoReveal } from './components';

/**
 * Main Gradient Wipe Logo Animation Composition
 *
 * @param props - Animation configuration props
 * @returns The complete logo animation composition
 */
const GradientWipeLogoAnimation: React.FC<GradientWipeLogoProps> = ({
  backgroundColor = GRADIENT_WIPE_DEFAULTS.backgroundColor,
  logoScale = GRADIENT_WIPE_DEFAULTS.logoScale,
  revealDuration = GRADIENT_WIPE_DEFAULTS.revealDuration,
  holdDuration = GRADIENT_WIPE_DEFAULTS.holdDuration,
  exitDuration = GRADIENT_WIPE_DEFAULTS.exitDuration,
}) => {
  // Memoize the container style to avoid creating new objects each frame
  const containerStyle = useMemo(
    (): React.CSSProperties => ({
      backgroundColor,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    [backgroundColor]
  );

  return (
    <AbsoluteFill style={containerStyle}>
      <LogoReveal
        scale={logoScale}
        revealDuration={revealDuration}
        holdDuration={holdDuration}
        exitDuration={exitDuration}
      />
    </AbsoluteFill>
  );
};

// Default export required for lazy loading in Root.tsx
export default GradientWipeLogoAnimation;
