# React Patterns for Remotion

## Core Principles

1. **Components are Pure Functions**: No side effects in render
2. **Memoization for Performance**: Cache expensive computations
3. **Composition Over Inheritance**: Build complex UIs from simple components
4. **Hooks for Logic Reuse**: Extract common patterns into custom hooks

---

## Component Structure

### ✅ Functional Component Pattern

```typescript
import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { LogoProps } from './types';

export const Logo: React.FC<LogoProps> = ({ logoUrl, scale = 1 }) => {
  const frame = useCurrentFrame();

  // All hooks at the top
  const opacity = useOpacityAnimation(frame);
  const transform = useScaleAnimation(frame, scale);

  // Derived values
  const style: React.CSSProperties = {
    opacity,
    transform,
  };

  return (
    <div style={style}>
      <img src={logoUrl} alt="Logo" />
    </div>
  );
};
```

---

## Performance Optimization

### Memoization with useMemo

```typescript
import { useMemo } from 'react';

export const ComplexAnimation: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();

  // ✅ Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  // ✅ Memoize interpolation with many points
  const progress = useMemo(() => {
    return interpolate(frame, [0, 100], [0, 1]);
  }, [frame]);

  return <div>{/* render */}</div>;
};
```

### Callback Memoization

```typescript
import { useCallback } from 'react';

export const Parent: React.FC = () => {
  // ✅ Memoize callbacks passed to children
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <Child onClick={handleClick} />;
};
```

---

## Custom Hooks

### Extract Animation Logic

```typescript
// hooks/useOpacityFade.ts
import { useCurrentFrame } from 'remotion';
import { interpolate } from 'remotion';

export const useOpacityFade = (
  startFrame: number,
  duration: number
): number => {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [startFrame, startFrame + duration],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );
};

// Usage
export const Component: React.FC = () => {
  const opacity = useOpacityFade(0, 30);

  return <div style={{ opacity }}>{/* content */}</div>;
};
```

### Reusable Spring Hook

```typescript
// hooks/useSpringAnimation.ts
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const useSpringAnimation = (config?: {
  from?: number;
  to?: number;
  mass?: number;
  damping?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return spring({
    frame,
    fps,
    from: config?.from ?? 0,
    to: config?.to ?? 1,
    config: {
      mass: config?.mass ?? 1,
      damping: config?.damping ?? 10,
    },
  });
};
```

---

## Component Composition

### Building Reusable Pieces

```typescript
// components/AnimatedText.tsx
export const AnimatedText: React.FC<{
  children: string;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame - delay,
    [0, 20],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return <div style={{ opacity }}>{children}</div>;
};

// Usage - composing multiple instances
export const Title: React.FC = () => {
  return (
    <>
      <AnimatedText delay={0}>Hello</AnimatedText>
      <AnimatedText delay={15}>World</AnimatedText>
    </>
  );
};
```

---

## Sequence Patterns

### Orchestrating Complex Timing

```typescript
import { Sequence, useVideoConfig } from 'remotion';

export const ComplexAnimation: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Logo appears first */}
      <Sequence from={0} durationInFrames={60}>
        <Logo />
      </Sequence>

      {/* Text appears after logo */}
      <Sequence from={30} durationInFrames={90}>
        <AnimatedText>Welcome</AnimatedText>
      </Sequence>

      {/* Background fades in underneath */}
      <Sequence from={0} layout="none">
        <Background />
      </Sequence>
    </>
  );
};
```

### Nested Sequences

```typescript
export const Scene: React.FC = () => {
  return (
    <Sequence from={30}>
      {/* This whole group starts at frame 30 */}
      <Sequence from={0}>
        <Element1 /> {/* Visible at frame 30 */}
      </Sequence>
      <Sequence from={20}>
        <Element2 /> {/* Visible at frame 50 (30 + 20) */}
      </Sequence>
    </Sequence>
  );
};
```

---

## Conditional Rendering

### Frame-Based Visibility

```typescript
export const Component: React.FC = () => {
  const frame = useCurrentFrame();

  // Show different content at different times
  if (frame < 60) {
    return <IntroScene />;
  }

  if (frame < 120) {
    return <MainScene />;
  }

  return <OutroScene />;
};
```

---

## Props Drilling Prevention

### Context for Shared Config

```typescript
import { createContext, useContext } from 'react';

type ThemeContextType = {
  primaryColor: string;
  accentColor: string;
  fontSize: number;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  theme: ThemeContextType;
}> = ({ children, theme }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Usage
export const Logo: React.FC = () => {
  const { primaryColor } = useTheme();
  return <div style={{ color: primaryColor }}>{/* content */}</div>;
};
```

---

## Anti-Patterns

### ❌ Side Effects in Render

```typescript
// Bad
export const Bad: React.FC = () => {
  const frame = useCurrentFrame();
  console.log(frame); // Side effect - will log on every render
  return <div />;
};

// Good - side effects only when needed
export const Good: React.FC = () => {
  const frame = useCurrentFrame();
  // Pure render
  return <div />;
};
```

### ❌ Creating Components Inside Components

```typescript
// Bad
export const Parent: React.FC = () => {
  // Creates new component on every render
  const Child = () => <div>Child</div>;
  return <Child />;
};

// Good
const Child: React.FC = () => <div>Child</div>;

export const Parent: React.FC = () => {
  return <Child />;
};
```

### ❌ Not Memoizing Expensive Calculations

```typescript
// Bad - recalculates on every frame
export const Bad: React.FC<{ data: number[] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const sorted = data.sort((a, b) => b - a); // Expensive!
  return <div>{/* render */}</div>;
};

// Good - memoized
export const Good: React.FC<{ data: number[] }> = ({ data }) => {
  const frame = useCurrentFrame();
  const sorted = useMemo(() => data.sort((a, b) => b - a), [data]);
  return <div>{/* render */}</div>;
};
```

---

## Checklist

Before committing React code:

- [ ] All components are functional components
- [ ] Expensive calculations are memoized with `useMemo`
- [ ] Callbacks passed to children use `useCallback`
- [ ] No side effects in render (no console.log, no mutations)
- [ ] Components are small and focused (single responsibility)
- [ ] Reusable logic extracted into custom hooks
- [ ] `<Sequence>` used for complex timing orchestration
- [ ] No components created inside other components
- [ ] Context used to avoid props drilling (when appropriate)
