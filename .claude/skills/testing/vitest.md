# Testing Patterns with Vitest

## Core Principles

1. **Test Utilities, Not Animations**: Visual animations are hard to test - focus on logic
2. **Unit Tests for Functions**: Test calculation, interpolation helpers, data transforms
3. **Fast Tests**: Vitest is fast - leverage it
4. **Clear Test Names**: Describe what you're testing

---

## What to Test

### ✅ Test These

- **Utility functions** (calculations, transforms, parsers)
- **Animation helpers** (easing functions, timing calculations)
- **Data processing** (filtering, sorting, mapping)
- **Type guards** (validation functions)
- **Constants** (ensure correct values)

### ❌ Don't Test These

- **Visual animations** (frame-by-frame rendering - too complex)
- **React components** (integration tests too slow for animations)
- **Remotion internals** (interpolate, spring - already tested by Remotion)

---

## Basic Test Structure

### Simple Function Test

```typescript
// src/utils/animation.ts
export const calculateProgress = (
  frame: number,
  startFrame: number,
  duration: number
): number => {
  if (duration === 0) return 1;
  return Math.min((frame - startFrame) / duration, 1);
};

// src/utils/animation.test.ts
import { describe, it, expect } from 'vitest';
import { calculateProgress } from './animation';

describe('calculateProgress', () => {
  it('returns 0 at start frame', () => {
    expect(calculateProgress(0, 0, 100)).toBe(0);
  });

  it('returns 0.5 at midpoint', () => {
    expect(calculateProgress(50, 0, 100)).toBe(0.5);
  });

  it('returns 1 at end frame', () => {
    expect(calculateProgress(100, 0, 100)).toBe(1);
  });

  it('clamps at 1 after end', () => {
    expect(calculateProgress(150, 0, 100)).toBe(1);
  });

  it('handles delayed start', () => {
    expect(calculateProgress(75, 50, 100)).toBe(0.25);
  });

  it('handles zero duration', () => {
    expect(calculateProgress(50, 0, 0)).toBe(1);
  });
});
```

---

## Testing Animation Helpers

### Easing Functions

```typescript
// src/utils/easing.ts
export const easeInOutCubic = (t: number): number => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// src/utils/easing.test.ts
import { describe, it, expect } from 'vitest';
import { easeInOutCubic } from './easing';

describe('easeInOutCubic', () => {
  it('returns 0 at t=0', () => {
    expect(easeInOutCubic(0)).toBe(0);
  });

  it('returns 1 at t=1', () => {
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('returns 0.5 at t=0.5', () => {
    expect(easeInOutCubic(0.5)).toBe(0.5);
  });

  it('eases in for first half', () => {
    const t1 = easeInOutCubic(0.25);
    const t2 = 0.25;
    expect(t1).toBeLessThan(t2); // Slower than linear
  });

  it('eases out for second half', () => {
    const t1 = easeInOutCubic(0.75);
    const t2 = 0.75;
    expect(t1).toBeGreaterThan(t2); // Faster than linear
  });
});
```

---

## Testing Data Transforms

### Array Processing

```typescript
// src/utils/data.ts
export const filterVisibleItems = <T extends { startFrame: number; endFrame: number }>(
  items: T[],
  currentFrame: number
): T[] => {
  return items.filter(
    item => currentFrame >= item.startFrame && currentFrame <= item.endFrame
  );
};

// src/utils/data.test.ts
import { describe, it, expect } from 'vitest';
import { filterVisibleItems } from './data';

describe('filterVisibleItems', () => {
  const items = [
    { id: 1, startFrame: 0, endFrame: 30 },
    { id: 2, startFrame: 20, endFrame: 60 },
    { id: 3, startFrame: 50, endFrame: 100 },
  ];

  it('returns items visible at frame 0', () => {
    const visible = filterVisibleItems(items, 0);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe(1);
  });

  it('returns items visible at frame 25', () => {
    const visible = filterVisibleItems(items, 25);
    expect(visible).toHaveLength(2);
    expect(visible.map(i => i.id)).toEqual([1, 2]);
  });

  it('returns items visible at frame 55', () => {
    const visible = filterVisibleItems(items, 55);
    expect(visible).toHaveLength(2);
    expect(visible.map(i => i.id)).toEqual([2, 3]);
  });

  it('returns empty array when no items visible', () => {
    const visible = filterVisibleItems(items, 150);
    expect(visible).toHaveLength(0);
  });
});
```

---

## Testing Type Guards

### Validation Functions

```typescript
// src/utils/validation.ts
export type AnimationConfig = {
  duration: number;
  delay: number;
  easing: string;
};

export const isValidAnimationConfig = (
  config: unknown
): config is AnimationConfig => {
  if (typeof config !== 'object' || config === null) return false;

  const c = config as Record<string, unknown>;

  return (
    typeof c.duration === 'number' &&
    typeof c.delay === 'number' &&
    typeof c.easing === 'string' &&
    c.duration >= 0 &&
    c.delay >= 0
  );
};

// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { isValidAnimationConfig } from './validation';

describe('isValidAnimationConfig', () => {
  it('accepts valid config', () => {
    const config = {
      duration: 100,
      delay: 20,
      easing: 'ease-in-out',
    };
    expect(isValidAnimationConfig(config)).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidAnimationConfig(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidAnimationConfig(undefined)).toBe(false);
  });

  it('rejects missing duration', () => {
    const config = {
      delay: 20,
      easing: 'ease-in-out',
    };
    expect(isValidAnimationConfig(config)).toBe(false);
  });

  it('rejects negative duration', () => {
    const config = {
      duration: -10,
      delay: 20,
      easing: 'ease-in-out',
    };
    expect(isValidAnimationConfig(config)).toBe(false);
  });

  it('rejects wrong types', () => {
    const config = {
      duration: '100',
      delay: 20,
      easing: 'ease-in-out',
    };
    expect(isValidAnimationConfig(config)).toBe(false);
  });
});
```

---

## Testing Color Utilities

### Color Parsing

```typescript
// src/utils/colors.ts
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// src/utils/colors.test.ts
import { describe, it, expect } from 'vitest';
import { hexToRgb } from './colors';

describe('hexToRgb', () => {
  it('converts valid hex with #', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts valid hex without #', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('handles lowercase', () => {
    expect(hexToRgb('#abc123')).toEqual({ r: 171, g: 193, b: 35 });
  });

  it('handles uppercase', () => {
    expect(hexToRgb('#ABC123')).toEqual({ r: 171, g: 193, b: 35 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('invalid')).toBeNull();
    expect(hexToRgb('#gggggg')).toBeNull();
    expect(hexToRgb('#ff')).toBeNull();
  });
});
```

---

## Test Organization

### File Structure

```
src/
  utils/
    animation.ts
    animation.test.ts      # Tests next to source
    colors.ts
    colors.test.ts
  components/
    Logo/
      helpers.ts
      helpers.test.ts      # Component-specific utilities
```

### Naming Convention

- Test files: `*.test.ts` (not `.spec.ts`)
- Test names: Describe behavior clearly
- Use `describe` for grouping related tests

---

## Vitest Configuration

### Basic Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.ts',
        'src/**/types.ts',
      ],
    },
  },
});
```

---

## Running Tests

### Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage

# Single file
pnpm test src/utils/animation.test.ts
```

---

## Coverage Goals

### Realistic Targets

- **Utilities**: 80-100% coverage (pure functions, easy to test)
- **Components**: 0-20% coverage (visual, hard to test)
- **Overall**: 40-60% coverage (balanced)

**Don't force 100% coverage** - test what matters, skip what's impractical.

---

## Anti-Patterns

### ❌ Testing Implementation Details

```typescript
// ❌ Bad - tests implementation, not behavior
it('calls interpolate twice', () => {
  const spy = vi.spyOn(remotion, 'interpolate');
  myFunction();
  expect(spy).toHaveBeenCalledTimes(2);
});

// ✅ Good - tests output
it('returns correct opacity', () => {
  const opacity = myFunction();
  expect(opacity).toBe(0.5);
});
```

### ❌ Brittle Snapshot Tests

```typescript
// ❌ Bad - breaks on any change
it('renders correctly', () => {
  const result = render(<Component />);
  expect(result).toMatchSnapshot();
});

// ✅ Good - test specific behaviors
it('shows logo when visible', () => {
  const result = render(<Component frame={30} />);
  expect(result.getByAlt('Logo')).toBeInTheDocument();
});
```

---

## Checklist

Before committing tests:

- [ ] All utility functions have tests
- [ ] Edge cases covered (null, undefined, empty arrays, zero, negative)
- [ ] Happy path tested
- [ ] Test names clearly describe behavior
- [ ] No tests for visual animation rendering
- [ ] Coverage is reasonable (not forcing 100%)
- [ ] Tests run fast (< 1s for unit tests)
- [ ] No flaky tests (deterministic results)
