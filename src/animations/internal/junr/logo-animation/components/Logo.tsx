/**
 * Logo Component for Junr Logo Animation
 *
 * Implements the animation design from animator agent's specification:
 * - Phase 1 (Entrance): Spring scale + opacity fade-in (frames 0-60)
 * - Phase 2 (Hold): Static display (frames 60-150)
 * - Phase 3 (Exit): Fade out with slight scale down (frames 150-180)
 *
 * Quality Standards Applied:
 * - Uses useCurrentFrame() for all animations (no CSS animations)
 * - Uses type (not interface) for props
 * - Memoizes expensive calculations
 * - Uses <Img> component for proper Remotion loading
 * - Uses staticFile() for asset paths
 * - All interpolate calls are clamped
 */

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  Img,
  staticFile,
} from 'remotion';
import type { LogoProps } from '../types';
import { JUNR_DEFAULTS } from '../types';

/**
 * Logo component with frame-based animation
 */
export const Logo: React.FC<LogoProps> = ({
  scale,
  animationType,
  springConfig,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Memoize the spring configuration to avoid creating new objects
  const config = useMemo(
    () => springConfig ?? JUNR_DEFAULTS.springConfig,
    [springConfig]
  );

  // Calculate animation values based on animation type
  const animationValues = useMemo(() => {
    // Phase 1: Entrance (frames 0-60)
    // Spring scale animation
    const entranceScale = spring({
      frame,
      fps,
      from: 0,
      to: 1,
      config: {
        damping: config.damping,
        stiffness: config.stiffness,
      },
    });

    // Opacity fade-in with ease-out (faster than scale)
    const entranceOpacity = interpolate(frame, [0, 30], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });

    // Phase 3: Exit (frames 150-180)
    // Fade out with ease-in
    const exitOpacity = interpolate(frame, [150, 180], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });

    // Scale down slightly during exit
    const exitScale = interpolate(frame, [150, 180], [1, 0.95], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });

    // Combine entrance and exit phases
    // During entrance (0-60): use entranceScale
    // During hold (60-150): scale stays at 1
    // During exit (150-180): use exitScale
    let finalScale: number;
    let finalOpacity: number;

    if (frame < 60) {
      // Entrance phase
      finalScale = entranceScale * scale;
      finalOpacity = entranceOpacity;
    } else if (frame < 150) {
      // Hold phase - fully visible
      finalScale = scale;
      finalOpacity = 1;
    } else {
      // Exit phase
      finalScale = exitScale * scale;
      finalOpacity = exitOpacity;
    }

    return {
      scale: finalScale,
      opacity: finalOpacity,
    };
  }, [frame, fps, config.damping, config.stiffness, scale]);

  // Memoize the style object
  const style = useMemo(
    (): React.CSSProperties => ({
      transform: `scale(${animationValues.scale})`,
      opacity: animationValues.opacity,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }),
    [animationValues.scale, animationValues.opacity]
  );

  // Logo image dimensions - memoized
  const imgStyle = useMemo(
    (): React.CSSProperties => ({
      width: 400,
      height: 'auto',
    }),
    []
  );

  return (
    <div style={style}>
      <Img
        src={staticFile('assets/logos/internal/junr/logo.svg')}
        style={imgStyle}
      />
    </div>
  );
};

export default Logo;
