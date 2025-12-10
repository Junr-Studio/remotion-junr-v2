# Animation Design: Junr Logo Animation

## Overview
A professional, modern logo reveal animation for Junr brand. The animation features a bouncy entrance with subtle elegance, designed to capture attention while maintaining sophistication. The logo emerges from scale 0, bounces with spring physics, holds for brand exposure, and fades out gracefully.

## Mood & Style
- **Mood**: Professional with energetic flair
- **Pace**: Medium (balanced between attention-grabbing and elegant)
- **Brand Alignment**: Modern tech/startup feel with gradient colors (indigo to violet)

## Timeline (Total: 180 frames at 60fps = 3 seconds)

### Phase 1: Entrance (Frames 0-60)

#### Logo
- **Pattern**: Scale + bounce in with spring physics
- **Timing**: 0-60 frames (1 second)
- **Spring config**:
  - damping: 10 (moderate bounce)
  - stiffness: 100 (medium speed)
- **Technical**:
  ```typescript
  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10, stiffness: 100 },
  });
  ```

#### Opacity Fade-In (Combined with scale)
- **Pattern**: Fade in opacity
- **Timing**: 0-30 frames (0.5 seconds, faster than scale)
- **Easing**: ease-out (fast start, smooth end)
- **Technical**:
  ```typescript
  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );
  ```

### Phase 2: Hold (Frames 60-150)
- **Duration**: 90 frames (1.5 seconds)
- **Rationale**:
  - Brand name "JUNR" is short (4 letters) - quick to read
  - Allow time for brand recognition and imprint
  - Standard hold time for logo animations
- **Elements**: Logo fully visible, no animation (scale: 1, opacity: 1)

### Phase 3: Exit (Frames 150-180)

#### All Elements
- **Pattern**: Fade out with slight scale down
- **Timing**: 150-180 frames (0.5 seconds)
- **Easing**: ease-in (slow start, accelerates)
- **Technical**:
  ```typescript
  const exitOpacity = interpolate(
    frame,
    [150, 180],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    }
  );

  const exitScale = interpolate(
    frame,
    [150, 180],
    [1, 0.95],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    }
  );
  ```

## Visual Hierarchy
1. **Primary**: Logo SVG (centered, full attention)
2. **Background**: Solid dark color (#000000) to make gradient logo pop

## Component Structure

```tsx
<AbsoluteFill style={{ backgroundColor }}>
  <Logo
    scale={logoScale}
    animationType={animationType}
    springConfig={springConfig}
  />
</AbsoluteFill>
```

### Logo Component Structure

```tsx
const Logo: React.FC<LogoProps> = ({ scale, animationType, springConfig }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Memoize spring configuration
  const config = useMemo(() => springConfig ?? { damping: 10, stiffness: 100 }, [springConfig]);

  // Calculate animations based on type
  const animationStyle = useMemo(() => {
    const entranceScale = spring({
      frame,
      fps,
      from: 0,
      to: 1,
      config,
    });

    const entranceOpacity = interpolate(
      frame,
      [0, 30],
      [0, 1],
      { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
    );

    // Exit phase (frames 150-180)
    const exitOpacity = interpolate(
      frame,
      [150, 180],
      [1, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) }
    );

    const exitScale = interpolate(
      frame,
      [150, 180],
      [1, 0.95],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad) }
    );

    // Combine entrance and exit
    const finalScale = frame < 150 ? entranceScale * scale : exitScale * scale;
    const finalOpacity = frame < 150 ? entranceOpacity : exitOpacity;

    return {
      transform: `scale(${finalScale})`,
      opacity: finalOpacity,
    };
  }, [frame, fps, config, scale]);

  return (
    <div style={animationStyle}>
      <Img src={staticFile('assets/logos/internal/junr/logo.svg')} />
    </div>
  );
};
```

## Technical Specifications

### Memoization Needs
- **Spring calculation**: Calculated every frame (cannot memoize frame-dependent value)
- **Spring config object**: Memoize with useMemo
- **Style object**: Be careful - style objects change every frame, but calculations can be grouped

### Performance Considerations
- No GPU-intensive effects (no blur, no box-shadow)
- Use `<Img>` component (not `<img>`) for proper Remotion loading
- Use `staticFile()` for asset paths
- Composition is simple - no lazy loading needed for internal components

### Props Schema (JSON-serializable)

```typescript
type JunrLogoAnimationProps = {
  backgroundColor: string;      // e.g., '#000000'
  logoScale: number;            // e.g., 1 (100%)
  animationType: LogoAnimationType; // e.g., 'bounce'
  springConfig?: {
    damping: number;
    stiffness: number;
  };
};
```

### Composition Registration

```typescript
<Composition
  id="junr-logo-animation"
  component={JunrLogoAnimation}
  durationInFrames={180}
  fps={60}
  width={1920}
  height={1080}
  defaultProps={{
    backgroundColor: '#000000',
    logoScale: 1,
    animationType: 'bounce',
  }}
/>
```

## Variants to Consider

### 1. Fast Version (for social media intros)
- Reduce total duration to 120 frames (2 seconds)
- Entrance: 0-40 frames
- Hold: 40-100 frames
- Exit: 100-120 frames
- Increase spring stiffness to 150 for snappier feel

### 2. Extended Hold (for video bumpers)
- Increase total duration to 240 frames (4 seconds)
- Entrance: 0-60 frames
- Hold: 60-210 frames (2.5 seconds brand exposure)
- Exit: 210-240 frames

### 3. No Exit (for continuous loops)
- Keep entrance and hold only
- Duration: 150 frames
- Set loop point at end

## Next Steps for Implementer

1. **Create Logo component** in `src/animations/internal/junr/logo-animation/components/Logo.tsx`
   - Implement spring entrance animation
   - Implement fade-in with ease-out
   - Implement exit phase with fade and scale
   - Use `<Img>` for SVG loading
   - Memoize spring config

2. **Update main Composition** in `src/animations/internal/junr/logo-animation/Composition.tsx`
   - Import and use Logo component
   - Apply backgroundColor
   - Pass props through correctly

3. **Verify quality standards**:
   - No CSS animations (useCurrentFrame only)
   - Type (not interface) for all props
   - Memoization where appropriate
   - All interpolate calls clamped

4. **Test at different resolutions**:
   - 1920x1080 (Full HD)
   - 1080x1080 (Square)
   - 1080x1920 (Vertical)

## Animation Timeline Visual

```
Frame:  0         30        60                    150       180
        |---------|---------|---------------------|---------|

Scale:  0 ~~~~~~~~~~~~~~~~~~~~~~~~> 1.0 (spring with bounce) -> 0.95
Opacity: 0 -----> 1 (ease-out)      1.0                       -> 0

Phase:  [====== Entrance ======][========= Hold =========][= Exit =]
              1 second                  1.5 seconds         0.5 sec
```

## Sign-off

Animation design complete. Ready for implementer agent to build.

**Designed by**: Animator Agent
**Date**: 2025-12-10
**Status**: Ready for implementation
