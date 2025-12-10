# Animation Design: Gradient Wipe Logo Reveal

## Overview

**Animation Type**: Gradient Wipe Reveal (Mask-based)
**Duration**: 180 frames (3 seconds at 60fps)
**Effect**: A warm gradient "paints" the logo from left to right, progressively revealing the logotype

## Asset Analysis

### Logo Shape (Mask)
- **File**: `public/assets/internal/logos/logotype-cream-tight.svg`
- **Dimensions**: 1423.17 x 370 viewBox
- **Content**: "JUNR." logotype with 5 path elements
- **Original Fill**: #f9f5f3 (cream)

### Fill Gradient
- **File**: `public/assets/internal/backgrounds/gradient-light-2-inverted.png`
- **Colors**: Pink/purple at top transitioning to warm orange at bottom
- **Use**: Will fill the logo shape as it animates across

## Animation Phases

### Phase 1: Entrance/Reveal (Frames 0-90)
**Duration**: 90 frames (1.5 seconds)
**Effect**: Gradient wipes from left to right inside the logo shape

```
Frame 0:   [           ] Gradient fully hidden (off left)
Frame 45:  [JUNR       ] Gradient 50% revealed
Frame 90:  [JUNR.      ] Gradient fully revealed
```

**Easing**: Ease-out cubic for smooth deceleration
- Starts faster, slows down as it completes
- Creates a polished, professional feel

**Technical Approach**:
- Logo SVG paths define a `clipPath`
- Gradient image positioned inside the clip area
- Gradient's `translateX` animated from `-100%` to `0%`
- Container must be slightly oversized to hide the gradient edges

### Phase 2: Hold (Frames 90-150)
**Duration**: 60 frames (1 second)
**Effect**: Logo remains fully visible with gradient fill

This allows the brand to register with viewers before any exit animation.

### Phase 3: Exit (Frames 150-180)
**Duration**: 30 frames (0.5 seconds)
**Effect**: Subtle fade out with slight scale reduction

```
Frame 150: opacity: 1, scale: 1
Frame 180: opacity: 0, scale: 0.97
```

**Easing**: Ease-in quad for gentle acceleration into fade

## Technical Specification

### Component Structure

```
GradientWipeLogo (main component)
  |
  +-- Container (AbsoluteFill, centered)
        |
        +-- LogoMask (wrapper with clipPath)
              |
              +-- GradientFill (animated position)
                    |
                    +-- <Img> (gradient PNG)
```

### Animation Values

#### Reveal Animation (Frames 0-90)
```typescript
const revealProgress = interpolate(
  frame,
  [0, 90],
  [0, 100],
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  }
);

// translateX goes from -100% (hidden left) to 0% (fully shown)
const translateX = interpolate(revealProgress, [0, 100], [-100, 0]);
```

#### Exit Animation (Frames 150-180)
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
  [1, 0.97],
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  }
);
```

### SVG Clip Path Implementation

The logo SVG paths need to be embedded as a `<clipPath>` definition:

```tsx
<svg width="0" height="0" style={{ position: 'absolute' }}>
  <defs>
    <clipPath id="junr-logo-clip" clipPathUnits="objectBoundingBox">
      {/* Normalized paths from logo SVG */}
    </clipPath>
  </defs>
</svg>

<div style={{ clipPath: 'url(#junr-logo-clip)' }}>
  <Img src={gradientSrc} style={{ transform: `translateX(${translateX}%)` }} />
</div>
```

**Important**: For `objectBoundingBox`, paths must be normalized to 0-1 range.

**Alternative**: Use the SVG paths directly with viewBox-based clipping and scale the container.

### Recommended Approach: Direct SVG with Clip Path

Instead of normalizing paths, use the SVG viewBox directly:

```tsx
<div style={{ width: logoWidth, height: logoHeight, overflow: 'hidden' }}>
  <svg viewBox="0 0 1423.17 370" style={{ width: '100%', height: '100%' }}>
    <defs>
      <clipPath id="logo-clip">
        {/* Original SVG paths */}
      </clipPath>
    </defs>
    <g clipPath="url(#logo-clip)">
      <image
        href={gradientSrc}
        width="1423.17"
        height="370"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translateX(${translateX}%)` }}
      />
    </g>
  </svg>
</div>
```

**Best Approach**: Use a React SVG component with inline paths and animate the gradient image position.

## Dimensions and Sizing

### Logo Container
- **Width**: 800px (scaled from 1423.17)
- **Height**: ~208px (maintains aspect ratio: 370/1423.17 * 800)
- **Position**: Centered in composition (1920x1080)

### Gradient Image Sizing
- The gradient image should be sized to cover the full logo area
- Use `preserveAspectRatio="xMidYMid slice"` to fill without distortion

## Visual Timeline

```
Time (seconds): 0     0.5     1.0     1.5     2.0     2.5     3.0
Frame:          0     30      60      90      120     150     180
                |-----|-------|-------|-------|-------|-------|
                |<-------- REVEAL -------->|< HOLD >|< EXIT >|

Visual:
0.0s: [                    ]  (logo invisible)
0.5s: [JU                  ]  (gradient wiping in)
1.0s: [JUNR                ]  (nearly revealed)
1.5s: [JUNR.               ]  (fully revealed, hold begins)
2.5s: [JUNR.               ]  (hold ends, exit begins)
3.0s: [     fading...      ]  (animation complete)
```

## Props Interface

```typescript
type GradientWipeLogoProps = {
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
```

## Quality Considerations

1. **Frame-based animation**: ALL animation via `useCurrentFrame()` + `interpolate()`
2. **No CSS animations**: No `animation`, `transition`, or `@keyframes`
3. **Memoization**: Memoize SVG paths, styles, and calculations
4. **Asset loading**: Use `staticFile()` for gradient PNG
5. **Clamping**: All `interpolate()` calls must clamp extrapolation

## Deliverables

1. **GradientWipeLogo component**: Main composition component
2. **LogoReveal component**: The masked logo with gradient fill animation
3. **Updated types.ts**: New prop types for gradient wipe animation
4. **Updated Root.tsx**: Register new composition (can replace old one)

## Summary

This animation creates a sophisticated "painting" effect where the warm gradient progressively reveals the JUNR. logotype from left to right. The effect is modern, professional, and visually striking - perfect for brand videos and presentations.

**Key Technical Points**:
- SVG clip-path defines the logo shape
- Gradient image animates horizontally inside the clip
- 1.5s reveal + 1s hold + 0.5s exit = 3s total
- Ease-out for reveal, ease-in for exit
- All animation frame-based (no CSS)
