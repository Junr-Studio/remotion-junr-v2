# Text & Background Animation Effects

## Core Principles

1. **Readability First**: Text must be legible throughout animation
2. **Subtle Wow Factor**: Effects should enhance, not distract
3. **Timing is Everything**: Text appears → readable time → disappears
4. **Layering**: Combine text + background effects for depth
5. **Performance**: Keep effects lightweight

---

## Text Animation Patterns

### 1. Fade In Text

**Use Case**: Simple, professional
**Duration**: 20-40 frames

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const TextFadeIn: React.FC<{
  children: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - delay,
    [0, 20],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return <div style={{ ...style, opacity }}>{children}</div>;
};
```

---

### 2. Slide In Text

**Use Case**: Dynamic entrance
**Duration**: 30-45 frames

```typescript
import { useCurrentFrame, interpolate, Easing } from 'remotion';

type Direction = 'left' | 'right' | 'top' | 'bottom';

export const TextSlideIn: React.FC<{
  children: string;
  direction?: Direction;
  delay?: number;
}> = ({ children, direction = 'left', delay = 0 }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame - delay,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    }
  );

  const getTransform = (): string => {
    const distance = 100; // pixels
    switch (direction) {
      case 'left':
        return `translateX(${interpolate(progress, [0, 1], [-distance, 0])}px)`;
      case 'right':
        return `translateX(${interpolate(progress, [0, 1], [distance, 0])}px)`;
      case 'top':
        return `translateY(${interpolate(progress, [0, 1], [-distance, 0])}px)`;
      case 'bottom':
        return `translateY(${interpolate(progress, [0, 1], [distance, 0])}px)`;
    }
  };

  const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);

  return (
    <div style={{ transform: getTransform(), opacity }}>
      {children}
    </div>
  );
};
```

---

### 3. Scale Pop Text

**Use Case**: Attention-grabbing
**Duration**: 20-30 frames

```typescript
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const TextScalePop: React.FC<{
  children: string;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    from: 0,
    to: 1,
    config: {
      damping: 10,
      stiffness: 200,
    },
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      {children}
    </div>
  );
};
```

---

### 4. Typewriter Effect

**Use Case**: Storytelling, tutorials
**Duration**: Variable (depends on text length)

```typescript
import { useCurrentFrame, interpolate } from 'remotion';
import { useMemo } from 'react';

export const TextTypewriter: React.FC<{
  children: string;
  delay?: number;
  speed?: number; // frames per character
}> = ({ children, delay = 0, speed = 3 }) => {
  const frame = useCurrentFrame();

  const charsToShow = Math.floor(
    interpolate(
      frame - delay,
      [0, children.length * speed],
      [0, children.length],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    )
  );

  const visibleText = useMemo(
    () => children.slice(0, charsToShow),
    [children, charsToShow]
  );

  return <div>{visibleText}</div>;
};
```

---

### 5. Letter-by-Letter Stagger

**Use Case**: Stylish reveal
**Duration**: 40-60 frames

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const TextLetterStagger: React.FC<{
  children: string;
  delay?: number;
  staggerDelay?: number;
}> = ({ children, delay = 0, staggerDelay = 3 }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: 'inline-block' }}>
      {children.split('').map((char, index) => {
        const charDelay = delay + index * staggerDelay;
        const opacity = interpolate(
          frame - charDelay,
          [0, 10],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        const translateY = interpolate(
          frame - charDelay,
          [0, 15],
          [20, 0],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </div>
  );
};
```

---

### 6. Glitch Text Effect

**Use Case**: Tech/modern aesthetic
**Duration**: 20-30 frames

```typescript
import { useCurrentFrame, random } from 'remotion';

export const TextGlitch: React.FC<{
  children: string;
  duration?: number;
}> = ({ children, duration = 20 }) => {
  const frame = useCurrentFrame();

  const isGlitching = frame < duration;

  const offsetX = isGlitching
    ? random(`x-${frame}`) * 4 - 2
    : 0;

  const offsetY = isGlitching
    ? random(`y-${frame}`) * 4 - 2
    : 0;

  const color = isGlitching && Math.random() > 0.7
    ? `rgb(${random(`r-${frame}`) * 255}, ${random(`g-${frame}`) * 255}, ${random(`b-${frame}`) * 255})`
    : 'inherit';

  return (
    <div
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        color,
      }}
    >
      {children}
    </div>
  );
};
```

---

## Background Animation Patterns

### 1. Gradient Shift

**Use Case**: Subtle background movement
**Duration**: Continuous

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const GradientShift: React.FC = () => {
  const frame = useCurrentFrame();

  const hue = interpolate(frame, [0, 300], [0, 360]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 60}, 70%, 60%))`,
      }}
    />
  );
};
```

---

### 2. Parallax Background

**Use Case**: Depth effect
**Duration**: Continuous

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const ParallaxBackground: React.FC<{
  backgroundUrl: string;
  speed?: number;
}> = ({ backgroundUrl, speed = 0.5 }) => {
  const frame = useCurrentFrame();

  const translateY = interpolate(
    frame,
    [0, 300],
    [0, -100 * speed]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateY(${translateY}px)`,
      }}
    />
  );
};
```

---

### 3. Animated Particles

**Use Case**: Dynamic, modern background
**Duration**: Continuous

```typescript
import { useCurrentFrame, interpolate, random } from 'remotion';
import { useMemo } from 'react';

export const ParticleBackground: React.FC<{
  count?: number;
}> = ({ count = 50 }) => {
  const frame = useCurrentFrame();

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: random(`x-${i}`) * 100,
      y: random(`y-${i}`) * 100,
      size: random(`size-${i}`) * 3 + 1,
      speed: random(`speed-${i}`) * 0.5 + 0.2,
    }));
  }, [count]);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {particles.map((particle) => {
        const y = (particle.y + frame * particle.speed) % 110;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${y}%`,
              width: particle.size,
              height: particle.size,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
            }}
          />
        );
      })}
    </div>
  );
};
```

---

### 4. Pulsing Circles

**Use Case**: Rhythm, energy
**Duration**: Continuous

```typescript
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

export const PulsingCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const circles = [
    { delay: 0, x: width * 0.2, y: height * 0.3 },
    { delay: 20, x: width * 0.7, y: height * 0.5 },
    { delay: 40, x: width * 0.5, y: height * 0.7 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {circles.map((circle, index) => {
        const scale = spring({
          frame: (frame - circle.delay) % 60,
          fps,
          from: 0,
          to: 2,
          config: { damping: 20 },
        });

        const opacity = spring({
          frame: (frame - circle.delay) % 60,
          fps,
          from: 0.7,
          to: 0,
          config: { damping: 20 },
        });

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: circle.x,
              top: circle.y,
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};
```

---

## Composite Text + Background Patterns

### Text with Animated Background

```typescript
import { Sequence, AbsoluteFill } from 'remotion';

export const TextWithBackground: React.FC<{
  text: string;
  backgroundType: 'gradient' | 'parallax' | 'particles';
}> = ({ text, backgroundType }) => {
  return (
    <AbsoluteFill>
      {/* Background layer */}
      <Sequence from={0}>
        {backgroundType === 'gradient' && <GradientShift />}
        {backgroundType === 'parallax' && <ParallaxBackground backgroundUrl="/bg.jpg" />}
        {backgroundType === 'particles' && <ParticleBackground />}
      </Sequence>

      {/* Text layer */}
      <Sequence from={30}>
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextLetterStagger style={{ fontSize: 64, color: 'white' }}>
            {text}
          </TextLetterStagger>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
```

---

## Reusable Hook for Text Effects

```typescript
// hooks/useTextAnimation.ts
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';

type TextAnimationType = 'fade' | 'slide' | 'scale' | 'stagger';

export const useTextAnimation = (
  type: TextAnimationType,
  delay: number = 0
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  switch (type) {
    case 'fade':
      return {
        opacity: interpolate(adjustedFrame, [0, 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      };

    case 'slide':
      return {
        transform: `translateX(${interpolate(
          adjustedFrame,
          [0, 30],
          [-50, 0],
          { extrapolateRight: 'clamp' }
        )}px)`,
        opacity: interpolate(adjustedFrame, [0, 10], [0, 1], {
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
          config: { damping: 10 },
        })})`,
      };

    default:
      return {};
  }
};
```

---

## Text Timing Best Practices

### Reading Time Formula

```typescript
// Calculate how long text should be visible
export const calculateReadingTime = (text: string, fps: number): number => {
  const wordsPerMinute = 180; // Average reading speed
  const words = text.split(' ').length;
  const minutes = words / wordsPerMinute;
  const seconds = minutes * 60;
  const frames = Math.ceil(seconds * fps);

  // Minimum 2 seconds, maximum 10 seconds
  return Math.max(2 * fps, Math.min(frames, 10 * fps));
};

// Usage
const readingTime = calculateReadingTime(props.text, fps);

<Sequence from={30} durationInFrames={readingTime}>
  <AnimatedText>{props.text}</AnimatedText>
</Sequence>
```

---

## Performance Tips

### Memoize Text Effects

```typescript
import { useMemo } from 'react';

export const OptimizedText: React.FC<{ children: string }> = ({ children }) => {
  const letters = useMemo(
    () => children.split('').map((char, i) => ({ char, id: i })),
    [children]
  );

  return (
    <div>
      {letters.map((letter) => (
        <AnimatedLetter key={letter.id} char={letter.char} index={letter.id} />
      ))}
    </div>
  );
};
```

---

## Checklist

Before implementing text effects:

- [ ] Text is readable (sufficient contrast with background)
- [ ] Duration allows reading time (use reading time formula)
- [ ] Animation enhances, doesn't distract
- [ ] Effects are memoized for performance
- [ ] Background doesn't overpower text
- [ ] Timing feels natural (not too fast or slow)
- [ ] Works at different resolutions
- [ ] Text is accessible (large enough, clear font)
