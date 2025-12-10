/**
 * BouncingDot Component - Physics-based bouncing animation for the "." in "JUNR."
 *
 * Implements a realistic ball drop with:
 * - Gravity-based fall acceleration
 * - Multiple bounces with energy decay
 * - Squash on impact, stretch during motion
 * - Smooth settling into final position
 *
 * Quality Standards Applied:
 * - Uses useCurrentFrame() for all animations (NO CSS animations)
 * - Uses type (not interface) for props
 * - Memoizes expensive calculations
 * - All interpolate calls are clamped
 */

import React, { useMemo } from 'react';
import {
  useCurrentFrame,
  interpolate,
  Easing,
  staticFile,
} from 'remotion';
import type { BouncingDotProps } from '../types';
import { BOUNCING_DOT_DEFAULTS } from '../types';

// Logo SVG viewBox dimensions (must match LogoReveal)
const LOGO_VIEWBOX_WIDTH = 1423.17;
const LOGO_VIEWBOX_HEIGHT = 370;

// Dot path from the SVG
const DOT_PATH =
  'M1423.17,352.84c0,11.56-5.6,17.16-16.81,17.16h-25.21c-11.56,0-17.16-5.6-17.16-17.16v-21.36c0-11.56,5.6-17.16,17.16-17.16h25.21c11.2,0,16.81,5.6,16.81,17.16v21.36Z';

// Dot bounding box in viewBox coordinates
const DOT_BOUNDS = {
  x: 1363.99, // Left edge
  y: 314.32, // Top edge (final resting Y)
  width: 59.18, // Width
  height: 55.68, // Height
  centerX: 1393.58, // Horizontal center
  bottomY: 370, // Bottom edge (ground level)
};


/**
 * Calculate Y position for bouncing ball physics
 * Uses true parabolic motion for realistic gravity-based bouncing
 */
const calculateBounceY = (
  localFrame: number,
  dropHeight: number,
  finalY: number,
  bounceCount: number,
  energyRetention: number
): number => {
  // Phase durations (in frames)
  const fallDuration = 20;

  // Calculate bounce heights based on energy retention
  const bounceHeights: number[] = [];
  let currentHeight = dropHeight * energyRetention;
  for (let i = 0; i < bounceCount; i++) {
    bounceHeights.push(currentHeight);
    currentHeight *= energyRetention;
  }

  // Calculate bounce durations (proportional to sqrt of height for realistic timing)
  // Physics: t = sqrt(2h/g), so duration scales with sqrt(height)
  const durationMultiplier = 1.4; // Consistent multiplier for both X and Y
  const bounceDurations = bounceHeights.map((h) =>
    Math.round(Math.sqrt(h / dropHeight) * fallDuration * durationMultiplier)
  );

  // Build keyframe timeline
  let currentFrame = 0;

  // Phase 1: Initial fall (use quad easing for gravity feel)
  if (localFrame < fallDuration) {
    const startY = finalY - dropHeight;
    return interpolate(localFrame, [0, fallDuration], [startY, finalY], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad), // Gravity acceleration
    });
  }
  currentFrame = fallDuration;

  // Phase 2+: Bounces - use true parabolic arc (sine wave = natural projectile motion)
  for (let i = 0; i < bounceCount; i++) {
    const bounceHeight = bounceHeights[i] ?? 0;
    const bounceDuration = bounceDurations[i] ?? 0;

    if (bounceDuration === 0) continue;

    if (localFrame < currentFrame + bounceDuration) {
      // Progress through this bounce (0 to 1)
      const bounceProgress = (localFrame - currentFrame) / bounceDuration;

      // True parabolic motion: sin(π * t) creates natural projectile arc
      // This gives smooth acceleration into apex and smooth deceleration out
      // Much more organic than polynomial curves
      const arcValue = Math.sin(bounceProgress * Math.PI);

      // Y position: ground (finalY) minus height based on arc
      return finalY - bounceHeight * arcValue;
    }

    currentFrame += bounceDuration;
  }

  // Settled
  return finalY;
};

/**
 * Calculate X position for diagonal trajectory
 * Dot starts to the LEFT of final position and moves diagonally down-right
 */
const calculateBounceX = (
  localFrame: number,
  dropHeight: number,
  bounceCount: number,
  energyRetention: number,
  startXOffset: number
): number => {
  const fallDuration = 20;
  const durationMultiplier = 1.4; // Same as Y calculation for sync

  // Calculate bounce parameters
  const bounceHeights: number[] = [];
  let currentHeight = dropHeight * energyRetention;
  for (let i = 0; i < bounceCount; i++) {
    bounceHeights.push(currentHeight);
    currentHeight *= energyRetention;
  }

  const bounceDurations = bounceHeights.map((h) =>
    Math.round(Math.sqrt(h / dropHeight) * fallDuration * durationMultiplier)
  );

  // Calculate settle frame (when bouncing stops)
  const settleFrame = fallDuration + bounceDurations.reduce((a, b) => a + b, 0);

  // X position moves from startXOffset to 0 over the entire animation
  // Use smooth ease-out for natural deceleration as ball loses energy
  const xOffset = interpolate(
    localFrame,
    [0, fallDuration, settleFrame],
    [startXOffset, startXOffset * 0.3, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad), // Quad matches gravity physics better
    }
  );

  return xOffset;
};

/**
 * Calculate squash/stretch deformation based on velocity
 * Simplified physics-based approach: stretch when moving fast, squash at impact
 */
const calculateDeformation = (
  localFrame: number,
  dropHeight: number,
  bounceCount: number,
  energyRetention: number,
  maxSquash: number,
  maxStretch: number
): { scaleX: number; scaleY: number } => {
  // Calculate velocity using central difference for smoothness
  const prevY = calculateBounceY(localFrame - 1, dropHeight, 0, bounceCount, energyRetention);
  const nextY = calculateBounceY(localFrame + 1, dropHeight, 0, bounceCount, energyRetention);
  const velocity = (nextY - prevY) / 2; // Positive = moving down

  // Get current position for ground detection
  const currentY = calculateBounceY(localFrame, dropHeight, 0, bounceCount, energyRetention);

  // Normalize velocity (max velocity occurs at ground impact from initial drop)
  const fallDuration = 20;
  const maxVelocity = dropHeight / fallDuration;
  const normalizedSpeed = Math.min(1, Math.abs(velocity) / maxVelocity);

  // Smooth the speed response for subtler deformation
  const speedFactor = Math.pow(normalizedSpeed, 0.8);

  // Ground proximity (0 = at ground, 1 = far from ground)
  // Use smooth transition zone for gradual squash onset
  const groundThreshold = dropHeight * 0.15;
  const distanceFromGround = Math.abs(currentY);
  const groundProximity = Math.min(1, distanceFromGround / groundThreshold);
  // Smoothstep for organic transition
  const smoothGroundProximity = groundProximity * groundProximity * (3 - 2 * groundProximity);

  // Squash when near ground AND moving down (velocity > 0)
  const isMovingDown = velocity > 0;
  const squashFactor = isMovingDown ? (1 - smoothGroundProximity) * speedFactor : 0;

  // Stretch when moving fast and in the air
  const stretchFactor = smoothGroundProximity * speedFactor;

  // Calculate final scales with volume preservation (scaleX * scaleY ≈ 1)
  const scaleY = interpolate(
    squashFactor - stretchFactor * 0.5,
    [-0.5, 0, 1],
    [maxStretch, 1, maxSquash],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Preserve volume: if scaleY shrinks, scaleX expands
  const scaleX = 1 / scaleY;

  return { scaleX, scaleY };
};

/**
 * BouncingDot component with physics-based bounce animation
 */
export const BouncingDot: React.FC<BouncingDotProps> = ({
  startFrame,
  scale,
  logoWidth,
  logoHeight,
  logoLeft,
  logoTop,
  bounceCount = BOUNCING_DOT_DEFAULTS.bounceCount,
  energyRetention = BOUNCING_DOT_DEFAULTS.energyRetention,
  maxSquash = BOUNCING_DOT_DEFAULTS.maxSquash,
  maxStretch = BOUNCING_DOT_DEFAULTS.maxStretch,
  dropHeight = BOUNCING_DOT_DEFAULTS.dropHeight,
  startXOffset = BOUNCING_DOT_DEFAULTS.startXOffset,
  exitStart,
  exitDuration,
}) => {
  const frame = useCurrentFrame();

  // Memoize the gradient source
  const gradientSrc = useMemo(
    () => staticFile('assets/internal/backgrounds/gradient-light-2-inverted.png'),
    []
  );

  // Memoize easing functions
  const easingInQuad = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return Easing.in(Easing.quad);
  }, []);

  // Calculate local frame (relative to start of bounce animation)
  const localFrame = frame - startFrame;

  // Calculate animation values
  const animationValues = useMemo(() => {
    // Before animation starts
    if (localFrame < 0) {
      return {
        opacity: 0,
        x: startXOffset,
        y: DOT_BOUNDS.y - dropHeight,
        scaleX: 1,
        scaleY: 1,
        exitOpacity: 1,
        exitScale: 1,
      };
    }

    // Calculate bounce position (in viewBox coordinates)
    const y = calculateBounceY(
      localFrame,
      dropHeight,
      DOT_BOUNDS.y,
      bounceCount,
      energyRetention
    );

    // Calculate horizontal movement (diagonal trajectory)
    const x = calculateBounceX(
      localFrame,
      dropHeight,
      bounceCount,
      energyRetention,
      startXOffset
    );

    // Calculate deformation
    const { scaleX, scaleY } = calculateDeformation(
      localFrame,
      dropHeight,
      bounceCount,
      energyRetention,
      maxSquash,
      maxStretch
    );

    // Exit animation
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

    return {
      opacity: 1,
      x,
      y,
      scaleX,
      scaleY,
      exitOpacity: frame >= exitStart ? exitOpacity : 1,
      exitScale: frame >= exitStart ? exitScale : 1,
    };
  }, [
    localFrame,
    frame,
    dropHeight,
    bounceCount,
    energyRetention,
    maxSquash,
    maxStretch,
    startXOffset,
    exitStart,
    exitDuration,
    easingInQuad,
  ]);


  // Memoize container style
  const containerStyle = useMemo(
    (): React.CSSProperties => ({
      position: 'absolute',
      left: logoLeft,
      top: logoTop,
      width: logoWidth,
      height: logoHeight,
      overflow: 'visible',
      opacity: animationValues.opacity * animationValues.exitOpacity,
      transform: `scale(${animationValues.exitScale * scale / scale})`,
      transformOrigin: 'center',
      pointerEvents: 'none',
    }),
    [
      logoLeft,
      logoTop,
      logoWidth,
      logoHeight,
      animationValues.opacity,
      animationValues.exitOpacity,
      animationValues.exitScale,
      scale,
    ]
  );

  // Memoize SVG style
  const svgStyle = useMemo(
    (): React.CSSProperties => ({
      width: '100%',
      height: '100%',
      overflow: 'visible',
    }),
    []
  );

  // Memoize dot transform
  const dotTransform = useMemo(() => {
    // X offset from resting position (in viewBox units)
    const xOffset = animationValues.x;

    // Y offset from resting position (in viewBox units)
    const yOffset = animationValues.y - DOT_BOUNDS.y;

    // Transform origin at bottom center of dot for squash/stretch
    const transformOriginX = DOT_BOUNDS.centerX;
    const transformOriginY = DOT_BOUNDS.bottomY;

    return {
      transform: `translate(${transformOriginX}, ${transformOriginY}) scale(${animationValues.scaleX}, ${animationValues.scaleY}) translate(${-transformOriginX + xOffset}, ${-transformOriginY + yOffset})`,
    };
  }, [animationValues.x, animationValues.y, animationValues.scaleX, animationValues.scaleY]);

  // Memoize clip path ID
  const clipPathId = useMemo(() => 'bouncing-dot-clip', []);

  return (
    <div style={containerStyle}>
      <svg
        viewBox={`0 0 ${LOGO_VIEWBOX_WIDTH} ${LOGO_VIEWBOX_HEIGHT}`}
        style={svgStyle}
        aria-hidden="true"
      >
        <defs>
          {/* Define the dot shape as a clip path */}
          <clipPath id={clipPathId}>
            <path d={DOT_PATH} transform={dotTransform.transform} />
          </clipPath>
        </defs>

        {/* Dot shape filled with gradient - positioned to align with original logo */}
        <g clipPath={`url(#${clipPathId})`}>
          <image
            href={gradientSrc}
            x={0}
            y={0}
            width={LOGO_VIEWBOX_WIDTH}
            height={LOGO_VIEWBOX_HEIGHT}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      </svg>
    </div>
  );
};

export default BouncingDot;
