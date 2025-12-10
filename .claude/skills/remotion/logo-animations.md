# Logo Animation Patterns

## Core Principles

1. **Smooth Entrance**: Logos should enter gracefully with natural motion
2. **Timing Matters**: 2-4 seconds is ideal for logo reveals
3. **Spring for Natural Feel**: Use springs for bouncy, professional motion
4. **Multiple Variants**: Provide fade, scale, slide, and reveal options
5. **Reusable Components**: Build a library of logo animation primitives

---

## Common Logo Animation Patterns

### 1. Fade In

**Use Case**: Simple, elegant entrance
**Duration**: 30-60 frames (0.5-1 second at 60fps)

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const LogoFadeIn: React.FC<{ logoUrl: string; delay?: number }> = ({
  logoUrl,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - delay,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div style={{ opacity }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 2. Scale Up (Zoom In)

**Use Case**: Energetic, attention-grabbing
**Duration**: 45-90 frames (0.75-1.5 seconds)

```typescript
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const LogoScaleUp: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 3. Slide In from Side

**Use Case**: Dynamic, directional entrance
**Duration**: 40-60 frames

```typescript
import { useCurrentFrame, interpolate, Easing } from 'remotion';

type Direction = 'left' | 'right' | 'top' | 'bottom';

export const LogoSlideIn: React.FC<{
  logoUrl: string;
  direction?: Direction;
}> = ({ logoUrl, direction = 'left' }) => {
  const frame = useCurrentFrame();

  const getTransform = (): string => {
    const progress = interpolate(
      frame,
      [0, 40],
      [0, 1],
      {
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      }
    );

    switch (direction) {
      case 'left':
        return `translateX(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      case 'right':
        return `translateX(${interpolate(progress, [0, 1], [100, 0])}%)`;
      case 'top':
        return `translateY(${interpolate(progress, [0, 1], [-100, 0])}%)`;
      case 'bottom':
        return `translateY(${interpolate(progress, [0, 1], [100, 0])}%)`;
    }
  };

  return (
    <div style={{ transform: getTransform() }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 4. Bounce In

**Use Case**: Playful, energetic brand
**Duration**: 60-90 frames

```typescript
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const LogoBounceIn: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 8,      // Lower = more bouncy
      stiffness: 150,  // Higher = faster
      mass: 1,
    },
  });

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
      }}
    >
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 5. Rotate + Scale In

**Use Case**: Dynamic, modern feel
**Duration**: 60 frames

```typescript
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const LogoRotateIn: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 10 },
  });

  const rotation = interpolate(
    frame,
    [0, 40],
    [-180, 0],
    {
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 6. Fade + Scale Combined

**Use Case**: Elegant, professional
**Duration**: 50 frames

```typescript
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const LogoFadeScale: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 12 },
  });

  const opacity = interpolate(
    frame,
    [0, 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 7. Wipe Reveal (Mask Animation)

**Use Case**: Sophisticated reveal effect
**Duration**: 60-90 frames

```typescript
import { useCurrentFrame, interpolate, Easing } from 'remotion';

type WipeDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';

export const LogoWipeReveal: React.FC<{
  logoUrl: string;
  direction?: WipeDirection;
}> = ({ logoUrl, direction = 'left-to-right' }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [0, 60],
    [0, 100],
    {
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }
  );

  const getClipPath = (): string => {
    switch (direction) {
      case 'left-to-right':
        return `inset(0 ${100 - progress}% 0 0)`;
      case 'right-to-left':
        return `inset(0 0 0 ${100 - progress}%)`;
      case 'top-to-bottom':
        return `inset(0 0 ${100 - progress}% 0)`;
      case 'bottom-to-top':
        return `inset(${100 - progress}% 0 0 0)`;
    }
  };

  return (
    <div style={{ clipPath: getClipPath() }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

### 8. Glitch Entrance (Modern/Tech)

**Use Case**: Tech brands, modern aesthetic
**Duration**: 40 frames

```typescript
import { useCurrentFrame, interpolate, random } from 'remotion';

export const LogoGlitch: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  const frame = useCurrentFrame();

  // Glitch effect only for first 20 frames
  const glitchActive = frame < 20;

  const offsetX = glitchActive
    ? random(`x-${frame}`) * 10 - 5  // Random offset
    : 0;

  const offsetY = glitchActive
    ? random(`y-${frame}`) * 10 - 5
    : 0;

  const opacity = interpolate(
    frame,
    [0, 10, 20, 30],
    [0, 1, 1, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        opacity,
        transform: `translate(${offsetX}px, ${offsetY}px)`,
      }}
    >
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};
```

---

## Composite Patterns

### Logo + Tagline Sequence

```typescript
import { Sequence } from 'remotion';

export const LogoWithTagline: React.FC<{
  logoUrl: string;
  tagline: string;
}> = ({ logoUrl, tagline }) => {
  return (
    <>
      <Sequence from={0} durationInFrames={150}>
        <LogoFadeScale logoUrl={logoUrl} />
      </Sequence>

      <Sequence from={40} durationInFrames={110}>
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          opacity: interpolate(useCurrentFrame(), [0, 20], [0, 1]),
        }}>
          {tagline}
        </div>
      </Sequence>
    </>
  );
};
```

---

## Logo Animation Library Structure

### Reusable Hook

```typescript
// hooks/useLogoAnimation.ts
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';

type AnimationType = 'fade' | 'scale' | 'bounce' | 'slide' | 'rotate';

export const useLogoAnimation = (
  type: AnimationType,
  delay: number = 0
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  switch (type) {
    case 'fade':
      return {
        opacity: interpolate(adjustedFrame, [0, 30], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      };

    case 'scale':
      return {
        transform: `scale(${spring({
          frame: adjustedFrame,
          fps,
          from: 0,
          to: 1,
          config: { damping: 12 },
        })})`,
      };

    case 'bounce':
      return {
        transform: `scale(${spring({
          frame: adjustedFrame,
          fps,
          from: 0,
          to: 1,
          config: { damping: 8, stiffness: 150 },
        })})`,
      };

    case 'slide':
      return {
        transform: `translateX(${interpolate(
          adjustedFrame,
          [0, 40],
          [-100, 0],
          { extrapolateRight: 'clamp' }
        )}%)`,
      };

    case 'rotate':
      const scale = spring({
        frame: adjustedFrame,
        fps,
        from: 0,
        to: 1,
      });
      const rotation = interpolate(adjustedFrame, [0, 40], [-180, 0], {
        extrapolateRight: 'clamp',
      });
      return {
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      };

    default:
      return {};
  }
};
```

---

## Best Practices

### Timing Recommendations

- **Fade**: 0.5-1 second (30-60 frames at 60fps)
- **Scale/Bounce**: 0.75-1.5 seconds (45-90 frames)
- **Slide**: 0.66-1 second (40-60 frames)
- **Wipe**: 1-1.5 seconds (60-90 frames)
- **Glitch**: 0.33-0.66 seconds (20-40 frames)

### Spring Configuration Guide

```typescript
// Subtle, professional
config: { damping: 15, stiffness: 100 }

// Moderate bounce (recommended)
config: { damping: 10, stiffness: 100 }

// Very bouncy, playful
config: { damping: 7, stiffness: 150 }

// Fast, snappy
config: { damping: 12, stiffness: 200 }
```

### Centering Logo

```typescript
<div style={{
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  width: '100vw',
}}>
  <LogoAnimation logoUrl={logoUrl} />
</div>
```

---

## Checklist

Before implementing logo animation:

- [ ] Animation type chosen (fade, scale, slide, etc.)
- [ ] Duration appropriate (2-4 seconds total)
- [ ] Spring damping configured correctly
- [ ] Logo centered properly
- [ ] Timing feels natural (not too fast or slow)
- [ ] Works with various logo sizes/ratios
- [ ] Memoized if using complex calculations
- [ ] Reusable component or hook created
