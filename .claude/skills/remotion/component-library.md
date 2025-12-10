# Component Library Patterns

## Core Principles

1. **Reusability First**: Build once, use everywhere
2. **Composable**: Small pieces that combine well
3. **Configurable**: Props for customization
4. **Type-Safe**: Full TypeScript support
5. **Documented**: Clear examples and usage

---

## Component Structure

### Basic Reusable Component

```typescript
// components/Logo/LogoReveal.tsx
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import type { LogoRevealProps } from './types';

export const LogoReveal: React.FC<LogoRevealProps> = ({
  logoUrl,
  animationType = 'scale',
  delay = 0,
  duration = 60,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animation = useLogoAnimation(animationType, delay);

  return (
    <div style={{ ...animation, ...style }}>
      <img src={logoUrl} alt="Logo" style={{ width: '100%' }} />
    </div>
  );
};

// components/Logo/types.ts
export type AnimationType = 'fade' | 'scale' | 'slide' | 'bounce';

export type LogoRevealProps = {
  logoUrl: string;
  animationType?: AnimationType;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
};
```

---

## Component Organization

### Folder Structure

```
src/
  components/
    Logo/
      LogoReveal.tsx       # Main component
      LogoFade.tsx         # Variant
      LogoScale.tsx        # Variant
      types.ts             # Shared types
      hooks.ts             # Shared hooks
      utils.ts             # Helper functions
      index.ts             # Barrel export

    Text/
      AnimatedText.tsx
      TypewriterText.tsx
      types.ts
      hooks.ts
      index.ts

    Background/
      GradientBackground.tsx
      ParticleBackground.tsx
      types.ts
      index.ts

    Layout/
      CenteredContainer.tsx
      AnimatedSequence.tsx
      types.ts
      index.ts
```

### Barrel Exports

```typescript
// components/Logo/index.ts
export { LogoReveal } from './LogoReveal';
export { LogoFade } from './LogoFade';
export { LogoScale } from './LogoScale';
export type { LogoRevealProps, AnimationType } from './types';
export { useLogoAnimation } from './hooks';
```

---

## Prop Patterns

### Flexible Props with Defaults

```typescript
type AnimatedTextProps = {
  children: string;
  animationType?: 'fade' | 'slide' | 'scale';
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
  className?: string;
};

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animationType = 'fade',
  delay = 0,
  duration = 30,
  style,
  className,
}) => {
  // Implementation
};

// Usage with minimal props
<AnimatedText>Hello</AnimatedText>

// Usage with all customization
<AnimatedText
  animationType="slide"
  delay={20}
  duration={45}
  style={{ fontSize: 48, color: '#fff' }}
>
  Hello
</AnimatedText>
```

### Variant Props

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  variant?: ButtonVariant;
  children: React.ReactNode;
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: '1px solid #bdc3c7',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#3498db',
    border: '1px solid #3498db',
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
}) => {
  return <div style={variantStyles[variant]}>{children}</div>;
};
```

---

## Custom Hooks for Reusability

### Animation Hook

```typescript
// hooks/useAnimationProgress.ts
import { useCurrentFrame, interpolate } from 'remotion';

export const useAnimationProgress = (
  startFrame: number,
  endFrame: number
): number => {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [startFrame, endFrame],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
};

// Usage
export const Component: React.FC = () => {
  const progress = useAnimationProgress(0, 60);

  return <div style={{ opacity: progress }}>Content</div>;
};
```

### Timing Hook

```typescript
// hooks/useDelayedAnimation.ts
import { useCurrentFrame } from 'remotion';

export const useDelayedAnimation = (delay: number) => {
  const frame = useCurrentFrame();
  const adjustedFrame = Math.max(0, frame - delay);
  const hasStarted = frame >= delay;

  return { frame: adjustedFrame, hasStarted };
};

// Usage
export const Component: React.FC<{ delay: number }> = ({ delay }) => {
  const { frame, hasStarted } = useDelayedAnimation(delay);

  if (!hasStarted) return null;

  const opacity = interpolate(frame, [0, 20], [0, 1]);
  return <div style={{ opacity }}>Content</div>;
};
```

---

## Composition Patterns

### Render Props Pattern

```typescript
type AnimationRenderProps = {
  progress: number;
  opacity: number;
  scale: number;
};

type AnimationWrapperProps = {
  duration: number;
  children: (props: AnimationRenderProps) => React.ReactNode;
};

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(frame, [0, duration * 0.3], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = spring({
    frame,
    fps: 60,
    from: 0,
    to: 1,
  });

  return <>{children({ progress, opacity, scale })}</>;
};

// Usage
<AnimationWrapper duration={60}>
  {({ progress, opacity, scale }) => (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      Progress: {Math.round(progress * 100)}%
    </div>
  )}
</AnimationWrapper>
```

### Compound Components Pattern

```typescript
// Components that work together
type LogoCardProps = {
  children: React.ReactNode;
};

export const LogoCard: React.FC<LogoCardProps> = ({ children }) => {
  return (
    <div style={{
      padding: 40,
      backgroundColor: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }}>
      {children}
    </div>
  );
};

type LogoCardLogoProps = {
  logoUrl: string;
};

LogoCard.Logo = ({ logoUrl }: LogoCardLogoProps) => {
  return <img src={logoUrl} alt="Logo" style={{ width: 200 }} />;
};

type LogoCardTitleProps = {
  children: string;
};

LogoCard.Title = ({ children }: LogoCardTitleProps) => {
  return <h2 style={{ marginTop: 20, fontSize: 32 }}>{children}</h2>;
};

LogoCard.Tagline = ({ children }: { children: string }) => {
  return <p style={{ marginTop: 10, fontSize: 18, color: '#666' }}>{children}</p>;
};

// Usage
<LogoCard>
  <LogoCard.Logo logoUrl="/logo.png" />
  <LogoCard.Title>Company Name</LogoCard.Title>
  <LogoCard.Tagline>Your trusted partner</LogoCard.Tagline>
</LogoCard>
```

---

## Layout Components

### Centered Container

```typescript
type CenteredProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const Centered: React.FC<CenteredProps> = ({ children, style }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
```

### Split Screen Layout

```typescript
type SplitScreenProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  splitRatio?: number; // 0 to 1, default 0.5
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
  left,
  right,
  splitRatio = 0.5,
}) => {
  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ flex: splitRatio }}>
        {left}
      </div>
      <div style={{ flex: 1 - splitRatio }}>
        {right}
      </div>
    </div>
  );
};
```

---

## Configuration Objects Pattern

### Theme Configuration

```typescript
// theme.ts
export type Theme = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
};

export const defaultTheme: Theme = {
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#fff',
    text: '#2c3e50',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: 16,
      medium: 24,
      large: 48,
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 32,
  },
};

// Usage with React Context
import { createContext, useContext } from 'remotion';

const ThemeContext = createContext<Theme>(defaultTheme);

export const ThemeProvider: React.FC<{
  theme: Theme;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// In components
export const ThemedText: React.FC<{ children: string }> = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize.medium,
        color: theme.colors.text,
      }}
    >
      {children}
    </div>
  );
};
```

---

## Utility Components

### Conditional Renderer

```typescript
type ShowProps = {
  when: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const Show: React.FC<ShowProps> = ({ when, children, fallback = null }) => {
  return when ? <>{children}</> : <>{fallback}</>;
};

// Usage
<Show when={frame > 30}>
  <Logo />
</Show>
```

### Frame Range Renderer

```typescript
type FrameRangeProps = {
  from: number;
  to: number;
  children: React.ReactNode;
};

export const FrameRange: React.FC<FrameRangeProps> = ({
  from,
  to,
  children,
}) => {
  const frame = useCurrentFrame();

  if (frame < from || frame > to) {
    return null;
  }

  return <>{children}</>;
};

// Usage
<FrameRange from={30} to={90}>
  <AnimatedText>Visible between frames 30-90</AnimatedText>
</FrameRange>
```

---

## Documentation Pattern

### Component Documentation

```typescript
/**
 * Animated logo component with multiple animation variants
 *
 * @example
 * ```tsx
 * <LogoReveal
 *   logoUrl={staticFile('logo.png')}
 *   animationType="scale"
 *   delay={30}
 * />
 * ```
 *
 * @param logoUrl - URL to logo image (use staticFile())
 * @param animationType - Type of animation ('fade' | 'scale' | 'slide' | 'bounce')
 * @param delay - Delay before animation starts (in frames)
 * @param duration - Animation duration (in frames)
 * @param style - Additional CSS styles
 */
export const LogoReveal: React.FC<LogoRevealProps> = ({
  // implementation
}) => {
  // ...
};
```

---

## Testing Utilities

### Test Helpers

```typescript
// utils/testHelpers.ts
export const createMockProps = <T>(overrides?: Partial<T>): T => {
  const defaults = {
    delay: 0,
    duration: 60,
    // ... other defaults
  };

  return { ...defaults, ...overrides } as T;
};

// In tests
const props = createMockProps<LogoRevealProps>({
  logoUrl: '/test-logo.png',
  animationType: 'fade',
});
```

---

## Checklist

Before adding a component to the library:

- [ ] Component is reusable (not project-specific)
- [ ] Props are well-typed with TypeScript
- [ ] Default values provided for optional props
- [ ] Component is documented (JSDoc comments)
- [ ] Organized in appropriate folder
- [ ] Exported via barrel export (index.ts)
- [ ] Follows naming conventions (PascalCase)
- [ ] Memoized if using expensive calculations
- [ ] Works with various prop combinations
- [ ] Tested with different resolutions
