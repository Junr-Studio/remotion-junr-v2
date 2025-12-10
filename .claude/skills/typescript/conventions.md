# TypeScript Conventions for Remotion

## Core Principles

1. **Type Safety First**: Every prop, function, and component must have explicit types
2. **Use `type` over `interface`**: Required for Remotion's `defaultProps` type safety
3. **JSON Serialization**: All composition props must be JSON-serializable
4. **No Any**: Avoid `any` type - use `unknown` when type is truly unknown

---

## Prop Typing Patterns

### ✅ CORRECT: Use `type` for Component Props

```typescript
type TitleProps = {
  text: string;
  color: string;
  duration: number;
};

export const Title: React.FC<TitleProps> = ({ text, color, duration }) => {
  // implementation
};
```

### ❌ INCORRECT: Using `interface`

```typescript
// Avoid - breaks defaultProps type safety
interface TitleProps {
  text: string;
}
```

---

## Composition Props

### ✅ JSON-Serializable Props

```typescript
type MyCompProps = {
  text: string;
  count: number;
  enabled: boolean;
  items: string[];
  config: {
    speed: number;
    color: string;
  };
};
```

### ❌ Non-Serializable Props

```typescript
// NEVER use these in composition props:
type BadProps = {
  callback: () => void;        // Functions not allowed
  element: HTMLElement;         // DOM elements not allowed
  instance: MyClass;            // Class instances not allowed
};
```

**Note**: Functions are allowed in `<Player>` component props, but NOT in `<Composition>` props.

---

## Remotion-Specific Types

### Video Config

```typescript
import { useVideoConfig } from 'remotion';

const Component: React.FC = () => {
  const { width, height, fps, durationInFrames } = useVideoConfig();
  // All values are typed automatically
};
```

### Current Frame

```typescript
import { useCurrentFrame } from 'remotion';

const frame = useCurrentFrame(); // number
```

### Interpolation

```typescript
import { interpolate } from 'remotion';

const opacity = interpolate(
  frame,
  [0, 30],      // input range: number[]
  [0, 1],       // output range: number[]
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }
);
```

---

## File Organization

### Naming Conventions

- **Components**: PascalCase (`LogoReveal.tsx`, `TextFade.tsx`)
- **Utilities**: camelCase (`calculateBezier.ts`, `parseColor.ts`)
- **Types**: PascalCase with `Type` suffix (`AnimationPropsType`, `LogoConfigType`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_FPS`, `MAX_DURATION`)

### File Structure

```
src/
  animations/
    {client}/
      {project}/
        Composition.tsx       # Main composition
        types.ts             # Project-specific types
        components/          # Sub-components
          Logo.tsx
          Background.tsx
  components/                # Reusable components
    Logo/
      LogoReveal.tsx
      types.ts
  utils/                     # Utility functions
    animation.ts
    colors.ts
  types/                     # Global types
    common.ts
```

---

## Import Organization

```typescript
// 1. External dependencies
import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';

// 2. Internal utilities
import { calculateEasing } from '@/utils/animation';

// 3. Types
import type { LogoProps } from './types';

// 4. Styles (if any)
import './styles.css';
```

---

## Type Exports

### ✅ Export Types Explicitly

```typescript
// types.ts
export type LogoAnimationProps = {
  logoUrl: string;
  duration: number;
};

export type TextEffectConfig = {
  text: string;
  fontSize: number;
  color: string;
};
```

### Use Type Imports

```typescript
// Only import types, not runtime values
import type { LogoAnimationProps } from './types';
```

---

## Utility Function Typing

### ✅ Explicit Return Types

```typescript
export const calculateProgress = (
  frame: number,
  startFrame: number,
  duration: number
): number => {
  return (frame - startFrame) / duration;
};
```

### Generic Utilities

```typescript
export const clamp = <T extends number>(
  value: T,
  min: number,
  max: number
): number => {
  return Math.min(Math.max(value, min), max);
};
```

---

## Anti-Patterns

### ❌ Implicit Any

```typescript
// Bad
const getValue = (config) => config.value;

// Good
const getValue = (config: ConfigType): number => config.value;
```

### ❌ Type Assertions Without Validation

```typescript
// Bad
const data = fetchData() as MyType;

// Good
const data = fetchData();
if (isMyType(data)) {
  // use data safely
}
```

### ❌ Optional Chaining Overuse

```typescript
// Bad - hides potential bugs
const value = obj?.prop?.nested?.value ?? defaultValue;

// Good - explicit handling
const value = obj.prop.nested.value;
```

---

## Checklist

Before committing TypeScript code:

- [ ] All props use `type` (not `interface`)
- [ ] No `any` types used
- [ ] All functions have explicit return types
- [ ] Composition props are JSON-serializable
- [ ] Imports are organized (external → internal → types)
- [ ] File naming follows conventions (PascalCase for components)
- [ ] Types are exported explicitly when reused
- [ ] No implicit type assertions
