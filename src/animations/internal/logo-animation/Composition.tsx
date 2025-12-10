/**
 * Junr Logo Animation - Main Composition
 *
 * A professional, modern logo reveal animation for Junr brand.
 * Animation sequence (180 frames at 60fps = 3 seconds):
 * - Phase 1: Entrance (0-60 frames) - Spring scale + opacity fade
 * - Phase 2: Hold (60-150 frames) - Brand exposure
 * - Phase 3: Exit (150-180 frames) - Fade out with scale
 *
 * Quality Standards Applied:
 * - Uses useCurrentFrame() for all animations (no CSS animations)
 * - Uses type (not interface) for props
 * - Memoizes expensive calculations
 * - All props are JSON-serializable
 * - Uses <Img> for images via Logo component
 * - Uses staticFile() for assets via Logo component
 */

import React, { useMemo } from 'react';
import { AbsoluteFill } from 'remotion';
import type { JunrLogoAnimationProps } from './types';
import { JUNR_DEFAULTS } from './types';
import { Logo } from './components/Logo';

/**
 * Main Junr Logo Animation Composition
 *
 * @param props - Animation configuration props
 * @returns The complete logo animation composition
 */
const JunrLogoAnimation: React.FC<JunrLogoAnimationProps> = ({
  backgroundColor = JUNR_DEFAULTS.backgroundColor,
  logoScale = JUNR_DEFAULTS.logoScale,
  animationType = JUNR_DEFAULTS.animationType,
  springConfig,
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

  // Memoize spring config to pass down
  const resolvedSpringConfig = useMemo(
    () => springConfig ?? JUNR_DEFAULTS.springConfig,
    [springConfig]
  );

  return (
    <AbsoluteFill style={containerStyle}>
      <Logo
        scale={logoScale}
        animationType={animationType}
        springConfig={resolvedSpringConfig}
      />
    </AbsoluteFill>
  );
};

// Default export required for lazy loading in Root.tsx
export default JunrLogoAnimation;
