/**
 * LogoReveal Component - Paint Roller / Squeegee Animation with Organic Speed Effects
 *
 * Implements a paint roller effect where:
 * - A visible gradient strip (matching logo dimensions) moves from left to right
 * - The logo starts completely invisible/transparent
 * - As the strip passes over the logo, it "fills" the logo shape
 * - The strip exits, leaving behind the fully colored logo
 *
 * Organic Speed Effects:
 * - Smooth ease-in-out speed curve: slow start, fast middle, slow end
 * - Velocity calculated from easing derivative (NOT frame-to-frame deltas)
 * - Velocity-based deformation: skew and stretch based on smooth velocity
 * - Motion blur simulation: trailing edge fades when moving fast
 *
 * Visual layers (bottom to top):
 * 1. Logo fill layer (clipped to reveal progressively)
 * 2. Gradient strip (visible rectangle with same dimensions as logo)
 *
 * Quality Standards Applied:
 * - Uses useCurrentFrame() for all animations (NO CSS animations)
 * - Uses type (not interface) for props
 * - Memoizes expensive calculations
 * - Uses staticFile() for asset paths
 * - All interpolate calls are clamped
 * - Velocity derived mathematically for smooth motion
 */

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  Img,
} from 'remotion';
import type { LogoRevealProps } from '../types';
import { ORGANIC_SPEED_DEFAULTS } from '../types';
import { BouncingDot } from './BouncingDot';

// Logo SVG viewBox dimensions
const LOGO_VIEWBOX_WIDTH = 1423.17;
const LOGO_VIEWBOX_HEIGHT = 370;

// Base logo width in pixels (will be scaled)
const BASE_LOGO_WIDTH = 800;

/**
 * SVG paths extracted from logotype-cream-tight.svg
 * These define the shape of "JUNR" (without the dot) that will be filled with the gradient
 * The dot is animated separately by the BouncingDot component
 */
const LOGO_PATHS = [
  // R (without dot)
  'M1238.68,278.02l-15.03-44.4c69.28-16.9,99.39-52.28,99.39-114.15C1323.04,40.23,1272.8,0,1181.92,0h-133.14v181.82c32.03,0,58.12-26.03,58.12-58.17V58.75h71.32c53.94,0,79.77,17.95,79.77,60.73,0,44.97-27.96,62.34-82.38,62.34h-68.76c-32.08,0-58.07,26.03-58.07,58.17v130.01h58.12v-130.01h50.81l18.52,61.82c12.16,40.49,49.46,68.19,91.72,68.19h54.62v-58.17h-36.78c-21.34,0-40.33-13.56-47.11-33.81Z',
  // J
  'M271,223.5c0,102-37,146.5-134.5,146.5-82,0-115.5-70-136.5-135.5h68c11,32,25,82,77,82,37.5,0,56-25.5,56-98V78.5c0-16.5-8-24.5-24-24.5h-112V0h137C248.5,0,271,23,271,69v154.5Z',
  // N
  'M980.63,69.53C980.43,31.1,949.48,0,911.32,0v69.92h0v156.09L801.09,0h-120.95v370h69.41V24.02c0-.87.7-1.57,1.57-1.57.6,0,1.15.34,1.41.89l107.99,223.9c1.74,3.6,5.38,5.89,9.38,5.89h41.43v116.87h69.41V69.53h-.1Z',
  // U
  'M540.63,69.52v167.16c0,55.93-32.95,74.4-65.41,74.4s-65.91-18.97-65.91-77.89V69.92h0C409.22,31.38,377.96.16,339.4.16v253c0,66.41,53.43,116.84,136.32,116.84s134.82-50.43,134.82-116.84V0C572.06,0,540.84,31.09,540.63,69.52Z',
];

// Period dot path - animated separately
// 'M1423.17,352.84c0,11.56-5.6,17.16-16.81,17.16h-25.21c-11.56,0-17.16-5.6-17.16-17.16v-21.36c0-11.56,5.6-17.16,17.16-17.16h25.21c11.2,0,16.81,5.6,16.81,17.16v21.36Z'

/**
 * Calculate smooth velocity from ease-in-out progress curve
 * Uses the derivative of the easing function for accurate, smooth velocity
 *
 * For cubic ease-in-out:
 * - Progress follows a smooth S-curve
 * - Velocity (derivative) is lowest at start/end, highest in middle
 * - This creates natural acceleration/deceleration
 */
const calculateVelocityFromProgress = (progress: number): number => {
  // For cubic ease-in-out, approximate velocity using sin curve
  // Velocity peaks at progress=0.5, is near-zero at progress=0 and progress=1
  // sin(progress * PI) gives us a smooth bell curve from 0 to 1
  const normalizedVelocity = Math.sin(progress * Math.PI);

  return normalizedVelocity;
};

/**
 * LogoReveal component with paint roller animation effect and organic speed
 */
export const LogoReveal: React.FC<LogoRevealProps> = ({
  scale,
  revealDuration,
  holdDuration,
  exitDuration,
  enableOrganicSpeed = ORGANIC_SPEED_DEFAULTS.enableOrganicSpeed,
  maxSkewAngle = ORGANIC_SPEED_DEFAULTS.maxSkewAngle,
  maxStretch = ORGANIC_SPEED_DEFAULTS.maxStretch,
  enableMotionBlur = ORGANIC_SPEED_DEFAULTS.enableMotionBlur,
}) => {
  const frame = useCurrentFrame();
  const { width: compositionWidth, height: compositionHeight } = useVideoConfig();

  // Calculate phase boundaries
  const exitStart = revealDuration + holdDuration;

  // Memoize the gradient source
  const gradientSrc = useMemo(
    () => staticFile('assets/internal/backgrounds/gradient-light-2-inverted.png'),
    []
  );

  // Create stable easing functions
  const easingOutCubic = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Easing.out(Easing.cubic);
  }, []);
  const easingInQuad = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Easing.in(Easing.quad);
  }, []);

  // Calculate logo dimensions and position
  const logoDimensions = useMemo(() => {
    const logoWidth = BASE_LOGO_WIDTH * scale;
    const logoHeight = (LOGO_VIEWBOX_HEIGHT / LOGO_VIEWBOX_WIDTH) * BASE_LOGO_WIDTH * scale;
    const logoLeft = (compositionWidth - logoWidth) / 2;
    const logoTop = (compositionHeight - logoHeight) / 2;
    return { logoWidth, logoHeight, logoLeft, logoTop };
  }, [scale, compositionWidth, compositionHeight]);

  // Calculate animation values based on current frame
  const animationValues = useMemo(() => {
    const { logoWidth } = logoDimensions;

    // Strip dimensions now match the logo dimensions
    const actualStripWidth = logoWidth;

    // Strip travel: from off-screen left to off-screen right
    const stripStartX = -actualStripWidth;
    const stripEndX = compositionWidth;
    const stripTravelDistance = stripEndX - stripStartX;

    // Calculate progress with smooth ease-in-out
    // This creates a natural acceleration and deceleration curve
    const revealProgress = interpolate(
      frame,
      [0, revealDuration],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: enableOrganicSpeed ? Easing.inOut(Easing.cubic) : easingOutCubic,
      }
    );

    // Calculate velocity from the smooth progress curve (NOT from frame-to-frame deltas)
    // This gives us a clean, smooth velocity value based on the derivative of the easing
    const normalizedVelocity = enableOrganicSpeed && frame < revealDuration
      ? calculateVelocityFromProgress(revealProgress)
      : 0;

    // Strip X position (left edge of strip)
    const stripX = stripStartX + stripTravelDistance * revealProgress;

    // Calculate how much of the logo should be revealed
    const { logoLeft } = logoDimensions;

    let revealPercent = 0;
    if (stripX > logoLeft) {
      revealPercent = ((stripX - logoLeft) / logoWidth) * 100;
    }
    revealPercent = Math.min(100, Math.max(0, revealPercent));

    if (frame >= revealDuration) {
      revealPercent = 100;
    }

    // Calculate deformation values based on velocity (only during reveal)
    let skewAngle = 0;
    let scaleX = 1;
    let scaleY = 1;
    let trailingOpacity = 1;

    if (enableOrganicSpeed && frame < revealDuration) {
      // Skew: lean forward when moving fast
      skewAngle = interpolate(
        normalizedVelocity,
        [0, 1],
        [0, maxSkewAngle],
        { extrapolateRight: 'clamp' }
      );

      // Horizontal stretch when fast (squash and stretch principle)
      scaleX = interpolate(
        normalizedVelocity,
        [0, 1],
        [1, maxStretch],
        { extrapolateRight: 'clamp' }
      );

      // Vertical compression to maintain visual "volume"
      const maxCompression = 1 - (maxStretch - 1) * 0.6; // Compress proportionally
      scaleY = interpolate(
        normalizedVelocity,
        [0, 1],
        [1, maxCompression],
        { extrapolateRight: 'clamp' }
      );

      // Motion blur: trailing edge opacity
      if (enableMotionBlur) {
        trailingOpacity = interpolate(
          normalizedVelocity,
          [0, 1],
          [1, 0.6],
          { extrapolateRight: 'clamp' }
        );
      }
    }

    // Phase 3: Exit animation
    const exitOpacity = interpolate(
      frame,
      [exitStart, exitStart + exitDuration],
      [1, 0],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: easingInQuad,
      }
    );

    const exitScale = interpolate(
      frame,
      [exitStart, exitStart + exitDuration],
      [1, 0.97],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: easingInQuad,
      }
    );

    // Determine final values based on phase
    let finalOpacity: number;
    let finalScale: number;

    if (frame < exitStart) {
      finalOpacity = 1;
      finalScale = scale;
    } else {
      finalOpacity = exitOpacity;
      finalScale = exitScale * scale;
    }

    // Strip should only be visible during reveal phase
    const stripOpacity = frame < revealDuration ? 1 : 0;

    return {
      stripX,
      stripOpacity,
      revealPercent,
      opacity: finalOpacity,
      scale: finalScale,
      actualStripWidth,
      // Deformation values
      skewAngle,
      scaleX,
      scaleY,
      trailingOpacity,
      normalizedVelocity,
    };
  }, [
    frame,
    revealDuration,
    exitDuration,
    exitStart,
    scale,
    compositionWidth,
    logoDimensions,
    easingOutCubic,
    easingInQuad,
    enableOrganicSpeed,
    maxSkewAngle,
    maxStretch,
    enableMotionBlur,
  ]);

  // Memoize container style
  const containerStyle = useMemo(
    (): React.CSSProperties => ({
      position: 'relative',
      width: '100%',
      height: '100%',
      opacity: animationValues.opacity,
    }),
    [animationValues.opacity]
  );

  // Memoize logo wrapper style (for centering and scale)
  const logoWrapperStyle = useMemo(
    (): React.CSSProperties => ({
      position: 'absolute',
      left: logoDimensions.logoLeft,
      top: logoDimensions.logoTop,
      width: logoDimensions.logoWidth,
      height: logoDimensions.logoHeight,
      transform: `scale(${animationValues.scale / scale})`,
      transformOrigin: 'center',
    }),
    [logoDimensions, animationValues.scale, scale]
  );

  // Memoize logo SVG style
  const logoSvgStyle = useMemo(
    (): React.CSSProperties => ({
      width: '100%',
      height: '100%',
      overflow: 'visible',
    }),
    []
  );

  // Memoize the clip-path for progressive reveal (left to right)
  const logoClipPath = useMemo(() => {
    const clipFromRight = 100 - animationValues.revealPercent;
    return `inset(0 ${clipFromRight}% 0 0)`;
  }, [animationValues.revealPercent]);

  // Memoize logo fill container style
  const logoFillStyle = useMemo(
    (): React.CSSProperties => ({
      clipPath: logoClipPath,
      width: '100%',
      height: '100%',
    }),
    [logoClipPath]
  );

  // Memoize strip style with organic deformation
  const stripStyle = useMemo((): React.CSSProperties => {
    const { skewAngle, scaleX, scaleY, stripX } = animationValues;

    // Build transform string with deformation
    // Order matters: translate first, then scale, then skew
    const translateX = stripX - logoDimensions.logoLeft;
    const transform = enableOrganicSpeed
      ? `translateX(${translateX}px) scaleX(${scaleX}) scaleY(${scaleY}) skewX(${skewAngle}deg)`
      : `translateX(${translateX}px)`;

    return {
      position: 'absolute',
      left: logoDimensions.logoLeft,
      top: logoDimensions.logoTop,
      width: animationValues.actualStripWidth,
      height: logoDimensions.logoHeight,
      transform,
      transformOrigin: 'center center',
      opacity: animationValues.stripOpacity,
      zIndex: 10,
      borderRadius: 6,
      overflow: 'hidden',
    };
  }, [
    logoDimensions.logoLeft,
    logoDimensions.logoTop,
    logoDimensions.logoHeight,
    animationValues.actualStripWidth,
    animationValues.stripX,
    animationValues.stripOpacity,
    animationValues.skewAngle,
    animationValues.scaleX,
    animationValues.scaleY,
    enableOrganicSpeed,
  ]);

  // Memoize motion blur mask style (gradient for trailing edge)
  const motionBlurMaskStyle = useMemo((): React.CSSProperties => {
    if (!enableOrganicSpeed || !enableMotionBlur) {
      return {
        width: '100%',
        height: '100%',
      };
    }

    const { trailingOpacity } = animationValues;

    // Create a gradient mask that fades the trailing (left) edge
    // The gradient goes from semi-transparent on left to fully opaque on right
    const maskImage = `linear-gradient(
      to right,
      rgba(255,255,255,${trailingOpacity}) 0%,
      rgba(255,255,255,1) 30%,
      rgba(255,255,255,1) 100%
    )`;

    return {
      width: '100%',
      height: '100%',
      WebkitMaskImage: maskImage,
      maskImage: maskImage,
    };
  }, [enableOrganicSpeed, enableMotionBlur, animationValues.trailingOpacity]);

  // Memoize the clipPath ID
  const clipPathId = useMemo(() => 'junr-logo-clip', []);

  return (
    <div style={containerStyle}>
      {/* Layer 1: Logo fill with progressive clip reveal */}
      <div style={logoWrapperStyle}>
        <div style={logoFillStyle}>
          <svg
            viewBox={`0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`}
            style={logoSvgStyle}
            aria-label="JUNR. logo"
          >
            <defs>
              {/* Define the logo shape as a clip path */}
              <clipPath id={clipPathId}>
                {LOGO_PATHS.map((path, index) => (
                  <path key={index} d={path} />
                ))}
              </clipPath>
            </defs>

            {/* Logo shape filled with gradient */}
            <g clipPath={`url(#${clipPathId})`}>
              <image
                href={gradientSrc}
                x="0"
                y="0"
                width={LOGO_VIEWBOX_WIDTH}
                height={LOGO_VIEWBOX_HEIGHT}
                preserveAspectRatio="xMidYMid slice"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Layer 2: Visible gradient strip (the "paint roller") with organic deformation */}
      <div style={stripStyle}>
        <div style={motionBlurMaskStyle}>
          <Img
            src={gradientSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>

      {/* Layer 3: Bouncing dot - falls and bounces into place */}
      <BouncingDot
        startFrame={Math.round(revealDuration * 0.72)}
        scale={scale}
        logoWidth={logoDimensions.logoWidth}
        logoHeight={logoDimensions.logoHeight}
        logoLeft={logoDimensions.logoLeft}
        logoTop={logoDimensions.logoTop}
        exitStart={exitStart}
        exitDuration={exitDuration}
      />
    </div>
  );
};

export default LogoReveal;
