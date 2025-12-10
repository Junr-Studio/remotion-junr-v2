# Animation Design: Organic Speed Effects for Logo Strip

## Overview
Enhance the paint roller gradient strip with organic, living motion through non-linear speed curves and velocity-based deformation. The goal is to transform a mechanical left-to-right movement into something that feels energetic and alive.

## Mood & Style
- **Mood**: Dynamic, professional with energetic flair
- **Pace**: Variable - starts bold, slows for impact, accelerates to finish
- **Brand Alignment**: Modern, sophisticated, shows attention to craft

---

## Speed Curve Design

### Recommended: "Dramatic Pause" Speed Curve

This creates a visual narrative: **Bold entrance -> Dramatic slowdown in center -> Swift exit**

```
Frame Timeline (90 frames reveal phase):
0-20:   Fast entry (0% -> 35% position)    - Confident, bold entrance
20-50:  Slow middle (35% -> 65% position)  - Dramatic "painting" moment
50-90:  Fast exit (65% -> 100% position)   - Swift completion
```

### Technical Implementation: Custom Bezier Curve

Use a custom bezier curve that creates this S-shaped velocity profile:

```typescript
// Custom easing with dramatic pause in middle
const customEasing = Easing.bezier(0.7, 0, 0.3, 1);
```

Alternative: Piecewise interpolation for more control:

```typescript
const getProgress = (frame: number): number => {
  if (frame < 20) {
    // Fast start: 0-35% in 20 frames
    return interpolate(frame, [0, 20], [0, 0.35], {
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.quad),
    });
  } else if (frame < 50) {
    // Slow middle: 35-65% in 30 frames
    return interpolate(frame, [20, 50], [0.35, 0.65], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.sine),
    });
  } else {
    // Fast end: 65-100% in 40 frames
    return interpolate(frame, [50, 90], [0.65, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });
  }
};
```

---

## Velocity Calculation

To apply deformation based on speed, we need to calculate instantaneous velocity.

### Velocity Calculation Method

```typescript
// Calculate velocity as change in position between frames
const calculateVelocity = (
  currentProgress: number,
  previousProgress: number,
  maxVelocity: number = 1
): number => {
  const delta = currentProgress - previousProgress;
  // Normalize: typical delta is ~0.01-0.03 per frame
  const normalizedVelocity = Math.min(delta / 0.025, maxVelocity);
  return Math.max(0, normalizedVelocity);
};
```

### Expected Velocity Profile

```
Frame 0-20:   High velocity (~0.8-1.0)   - Fast entry
Frame 20-50:  Low velocity (~0.2-0.4)    - Slow middle
Frame 50-90:  High velocity (~0.8-1.0)   - Fast exit
```

---

## Deformation Design

### Primary Effect: Horizontal Skew (Lean Forward/Back)

When moving fast, the strip "leans" in the direction of motion.

```typescript
// Positive skew = leaning forward (right)
// Negative skew = leaning backward (left)
const skewAngle = interpolate(
  velocity,
  [0, 1],
  [0, 15],  // Max 15 degrees skew at full speed
  { extrapolateRight: 'clamp' }
);
```

Visual effect:
- Fast forward motion: Strip leans forward (skewX positive)
- Slow motion: Strip is upright (skewX near 0)
- Decelerating: Slight lean back before settling

### Secondary Effect: Horizontal Stretch (Squash & Stretch)

Classic animation principle - objects stretch in direction of movement.

```typescript
// scaleX increases with velocity (stretch)
// scaleY decreases proportionally (maintain volume)
const scaleX = interpolate(
  velocity,
  [0, 1],
  [1, 1.15],  // Up to 15% stretch at full speed
  { extrapolateRight: 'clamp' }
);

const scaleY = interpolate(
  velocity,
  [0, 1],
  [1, 0.92],  // Compress 8% to maintain visual volume
  { extrapolateRight: 'clamp' }
);
```

### Tertiary Effect: Edge Opacity Gradient (Motion Blur Simulation)

Trailing edge becomes slightly transparent when moving fast.

```typescript
// Use CSS gradient with opacity on trailing edge
const trailingOpacity = interpolate(
  velocity,
  [0, 1],
  [1, 0.6],  // 40% fade on trailing edge at full speed
  { extrapolateRight: 'clamp' }
);
```

Implemented as a gradient mask:
```typescript
const maskImage = `linear-gradient(
  to right,
  rgba(255,255,255,${trailingOpacity}) 0%,
  rgba(255,255,255,1) 30%,
  rgba(255,255,255,1) 100%
)`;
```

---

## Combined Transform Specification

### Transform Order (Important!)

```typescript
transform: `
  translateX(${stripX}px)
  scaleX(${scaleX})
  scaleY(${scaleY})
  skewX(${skewAngle}deg)
`
```

### Transform Origin

```typescript
transformOrigin: 'center center'
```

This ensures scaling and skewing happen from the center of the strip.

---

## Technical Specifications

### New Props (types.ts)

```typescript
export type LogoRevealProps = {
  scale: number;
  revealDuration: number;
  holdDuration: number;
  exitDuration: number;
  // NEW: Organic speed effect parameters
  enableOrganicSpeed?: boolean;     // Enable/disable the effect
  maxSkewAngle?: number;            // Maximum skew in degrees (default: 15)
  maxStretch?: number;              // Maximum horizontal stretch (default: 1.15)
  enableMotionBlur?: boolean;       // Enable trailing edge fade
};
```

### Default Values

```typescript
export const ORGANIC_SPEED_DEFAULTS = {
  enableOrganicSpeed: true,
  maxSkewAngle: 15,
  maxStretch: 1.15,
  enableMotionBlur: true,
} as const;
```

### Memoization Requirements

Must memoize:
1. Progress calculation (changes every frame)
2. Velocity calculation (depends on current and previous progress)
3. Transform values (scaleX, scaleY, skewAngle)
4. Style objects

### Performance Considerations

- All calculations are simple math - no GPU effects
- useMemo for velocity smoothing (optional: average last 3 frames)
- No blur effects (they would slow rendering)
- Gradient mask is CSS-only (performant)

---

## Timeline Summary

### Phase 1: Fast Entry (Frames 0-20)

| Property | Value | Visual |
|----------|-------|--------|
| Position | 0% -> 35% | Rapid movement |
| Velocity | ~0.8-1.0 | High |
| SkewX | ~12-15deg | Leaning forward |
| ScaleX | ~1.12-1.15 | Stretched |
| ScaleY | ~0.92-0.94 | Compressed |
| Trail Opacity | ~0.6-0.7 | Faded trailing edge |

### Phase 2: Slow Middle (Frames 20-50)

| Property | Value | Visual |
|----------|-------|--------|
| Position | 35% -> 65% | Slow, deliberate |
| Velocity | ~0.2-0.4 | Low |
| SkewX | ~3-6deg | Nearly upright |
| ScaleX | ~1.03-1.06 | Slight stretch |
| ScaleY | ~0.97-0.98 | Slight compress |
| Trail Opacity | ~0.85-0.9 | Nearly solid |

### Phase 3: Fast Exit (Frames 50-90)

| Property | Value | Visual |
|----------|-------|--------|
| Position | 65% -> 100% | Rapid completion |
| Velocity | ~0.8-1.0 | High |
| SkewX | ~12-15deg | Leaning forward |
| ScaleX | ~1.12-1.15 | Stretched |
| ScaleY | ~0.92-0.94 | Compressed |
| Trail Opacity | ~0.6-0.7 | Faded trailing edge |

---

## Visual Hierarchy

1. **Primary**: Logo reveal (unchanged - this is the main attraction)
2. **Secondary**: Strip deformation (enhances but doesn't distract)
3. **Tertiary**: Motion blur trail (subtle, adds polish)

---

## Component Structure

```tsx
<div style={containerStyle}>
  {/* Layer 1: Logo fill with progressive clip reveal */}
  <div style={logoWrapperStyle}>
    <div style={logoFillStyle}>
      <svg>...</svg>
    </div>
  </div>

  {/* Layer 2: Gradient strip with organic deformation */}
  <div style={stripStyle}>
    {/* Optional: Motion blur mask */}
    <div style={motionBlurMaskStyle}>
      <Img src={gradientSrc} style={imgStyle} />
    </div>
  </div>
</div>
```

---

## Implementation Notes for Implementer

### Step 1: Calculate Progress with Custom Easing
Replace the simple `Easing.out(Easing.cubic)` with the piecewise function.

### Step 2: Calculate Velocity
Store previous frame's progress to calculate delta (velocity).

### Step 3: Apply Deformation Transforms
Add skewX, scaleX, scaleY based on velocity.

### Step 4: Add Motion Blur Mask (Optional)
Wrap the strip image in a div with gradient mask.

### Step 5: Memoize Everything
Ensure all calculations are properly memoized.

---

## Variants to Consider

### Variant A: Subtle
- maxSkewAngle: 8
- maxStretch: 1.08
- Softer speed curve

### Variant B: Dramatic (Recommended)
- maxSkewAngle: 15
- maxStretch: 1.15
- Sharp speed changes

### Variant C: Extreme
- maxSkewAngle: 25
- maxStretch: 1.25
- Very pronounced effects

---

## Quality Checklist

- [ ] Uses useCurrentFrame() for all animations
- [ ] No CSS animations, transitions, or keyframes
- [ ] All interpolate() calls are clamped
- [ ] All calculations memoized with useMemo()
- [ ] Props use `type` not `interface`
- [ ] Props are JSON-serializable
- [ ] Velocity smoothing prevents jitter
- [ ] Deformation is noticeable but not distracting
- [ ] Strip still syncs perfectly with logo reveal

---

## Next Steps for Implementer

1. Update `types.ts` with new optional props
2. Implement custom speed curve (piecewise interpolation)
3. Add velocity calculation with memoization
4. Implement skew deformation based on velocity
5. Implement stretch deformation (scaleX/scaleY)
6. Add motion blur mask (optional enhancement)
7. Test at 60fps for smooth playback
8. Verify logo reveal still syncs correctly
