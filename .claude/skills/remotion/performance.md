# Remotion Performance Optimization

## Core Principles

1. **Memoization First**: Cache expensive computations with `useMemo()`
2. **Avoid GPU Effects in Cloud**: No blur, box-shadow when rendering on Lambda
3. **Optimize Concurrency**: Use `--concurrency` flag appropriately
4. **Lazy Load Components**: Use `lazyComponent` for code-splitting
5. **Minimize Data Fetching**: Cache locally when possible

---

## Memoization Patterns

### Memoize Expensive Calculations

```typescript
import { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

export const Component: React.FC<{ data: number[] }> = ({ data }) => {
  const frame = useCurrentFrame();

  // ✅ Memoize expensive processing
  const processedData = useMemo(() => {
    return data
      .map(item => expensiveTransform(item))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]); // Only recalculate when data changes

  // ✅ Memoize complex interpolations
  const positions = useMemo(() => {
    return processedData.map((item, index) => {
      return interpolate(frame, [0, 60], [0, index * 50]);
    });
  }, [frame, processedData]);

  return <div>{/* render */}</div>;
};
```

### Memoize Interpolations with Many Data Points

```typescript
// ❌ Bad - recalculates every frame
const opacity = data.map(item =>
  interpolate(frame, [item.start, item.end], [0, 1])
);

// ✅ Good - memoized
const opacity = useMemo(
  () => data.map(item =>
    interpolate(frame, [item.start, item.end], [0, 1])
  ),
  [frame, data]
);
```

---

## Component Performance

### Lazy Loading with lazyComponent

```typescript
// Root.tsx
import { Composition } from 'remotion';
import { lazy } from 'react';

// ✅ Use lazyComponent for large compositions
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="logo-animation"
        component={lazy(() => import('./animations/LogoAnimation'))}
        durationInFrames={150}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

**Benefits:**
- Faster Remotion Studio startup
- Smaller initial bundle
- Only loads code when needed

**Requirements:**
- Must use default export
- Component wrapped in React.lazy()

---

## GPU Considerations

### ❌ Avoid GPU Effects in Cloud Rendering

```typescript
// ❌ Bad - slow on Lambda (no GPU)
const style = {
  filter: 'blur(10px)',        // GPU effect
  boxShadow: '0 0 20px rgba(0,0,0,0.5)', // GPU effect
};

// ✅ Good - use pre-rendered images
import blurredLogo from './assets/logo-blurred.png';

<img src={blurredLogo} alt="Logo" />
```

**GPU-Heavy Effects to Avoid:**
- `filter: blur()`
- `box-shadow`
- Complex gradients
- WebGL rendering (when possible)
- Heavy 2D canvas operations

**When GPU Effects Are OK:**
- Local rendering (you have a GPU)
- Simple effects (small blur radius)
- When quality matters more than speed

---

## Rendering Performance

### Concurrency Optimization

```bash
# Find optimal concurrency for your machine
npx remotion benchmark

# Use the recommended value
npx remotion render src/index.tsx MyComp out.mp4 --concurrency=8
```

**Guidelines:**
- Too low: Underutilizes CPU
- Too high: Context switching overhead
- Benchmark on target machine (local vs cloud)

### Resolution Scaling

```bash
# Render at 50% resolution for faster previews
npx remotion render src/index.tsx MyComp out.mp4 --scale=0.5

# Full quality for final
npx remotion render src/index.tsx MyComp out.mp4 --scale=1
```

### Codec Selection

```typescript
// Fast rendering (lossy)
// JPEG: Fastest, no transparency
// Good for: Previews, no transparency needed

// Slower rendering (better quality/compression)
// PNG: Slower, supports transparency
// VP8/VP9: Much slower, strong compression
```

---

## Data Fetching Optimization

### ❌ Fetching on Every Frame

```typescript
// ❌ Bad - fetches on every render
export const Bad: React.FC = () => {
  const frame = useCurrentFrame();
  const data = fetchData(); // Fetches every frame!
  return <div />;
};
```

### ✅ Fetch Once with delayRender

```typescript
import { delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';

export const Good: React.FC = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    fetchData()
      .then(result => {
        setData(result);
        continueRender(handle);
      });
  }, [handle]);

  if (!data) {
    return null;
  }

  return <div>{/* render with data */}</div>;
};
```

### Static Assets

```typescript
import { staticFile } from 'remotion';

// ✅ Use staticFile() for assets
const logoUrl = staticFile('logo.png');

<img src={logoUrl} alt="Logo" />
```

---

## Image Optimization

### Preload Images

```typescript
import { Img, staticFile } from 'remotion';

// ✅ Use Remotion's <Img> tag (auto-preloads)
<Img src={staticFile('logo.png')} alt="Logo" />

// ❌ Regular <img> doesn't preload
<img src={staticFile('logo.png')} alt="Logo" />
```

### Image Format Selection

- **JPEG**: Fastest rendering, no transparency
- **PNG**: Slower, supports transparency
- **WebP**: Good balance (not universally supported in older Remotion)

**Recommendation**: Use JPEG unless you need transparency, then use PNG.

---

## Video Performance

### Use Modern Video Tag

```typescript
import { Video } from 'remotion';

// ✅ Use <Video> (fastest)
<Video src={staticFile('background.mp4')} />

// ❌ Don't use older tags
// <OffthreadVideo> - deprecated
// <IFrame> with video - slow
```

---

## Measuring Performance

### Enable Verbose Logging

```bash
npx remotion render src/index.tsx MyComp out.mp4 --log=verbose
```

**Output shows:**
- Slowest frames
- Rendering time per frame
- Bottlenecks

### Profiling Code

```typescript
export const Component: React.FC = () => {
  const frame = useCurrentFrame();

  console.time('expensive-calc');
  const result = expensiveCalculation();
  console.timeEnd('expensive-calc');

  return <div />;
};
```

**Check Remotion Studio console** for timing information.

---

## Bundle Size Optimization

### Code Splitting

```typescript
// ✅ Split by composition
const LogoAnimation = lazy(() => import('./LogoAnimation'));
const TextEffect = lazy(() => import('./TextEffect'));

// Each loads independently
```

### Tree Shaking

```typescript
// ✅ Import only what you need
import { interpolate } from 'remotion';

// ❌ Imports everything
import * as Remotion from 'remotion';
```

---

## Common Performance Pitfalls

### ❌ Creating New Objects Every Frame

```typescript
// ❌ Bad - new object every frame
const style = {
  opacity: interpolate(frame, [0, 30], [0, 1]),
  transform: `scale(${interpolate(frame, [0, 30], [0, 1])})`,
};

// ✅ Good - memoized
const style = useMemo(() => ({
  opacity: interpolate(frame, [0, 30], [0, 1]),
  transform: `scale(${interpolate(frame, [0, 30], [0, 1])})`,
}), [frame]);
```

### ❌ Heavy Calculations in Render

```typescript
// ❌ Bad - sorts on every frame
export const Bad: React.FC<{ items: Item[] }> = ({ items }) => {
  const sorted = items.sort((a, b) => b.value - a.value);
  return <div>{/* render */}</div>;
};

// ✅ Good - memoized
export const Good: React.FC<{ items: Item[] }> = ({ items }) => {
  const sorted = useMemo(
    () => items.sort((a, b) => b.value - a.value),
    [items]
  );
  return <div>{/* render */}</div>;
};
```

### ❌ Not Using Keys in Lists

```typescript
// ❌ Bad - React re-renders everything
{items.map(item => <Item item={item} />)}

// ✅ Good - React can optimize
{items.map(item => <Item key={item.id} item={item} />)}
```

---

## Performance Checklist

Before committing:

- [ ] Expensive calculations memoized with `useMemo()`
- [ ] Callbacks memoized with `useCallback()`
- [ ] Components use `lazyComponent` for code-splitting
- [ ] No GPU-heavy effects (blur, box-shadow) for cloud rendering
- [ ] Images use `<Img>` tag (not `<img>`)
- [ ] Data fetched once with `delayRender`/`continueRender`
- [ ] Static assets use `staticFile()`
- [ ] Videos use modern `<Video>` tag
- [ ] List items have unique `key` props
- [ ] No object/array creation in render without memoization

---

## Optimization Priority

1. **Profile first**: Measure before optimizing
2. **Memoize calculations**: Biggest impact for most animations
3. **Lazy load**: Faster startup
4. **Optimize concurrency**: Use benchmark tool
5. **Avoid GPU effects**: For cloud rendering
6. **Compress assets**: Smaller images = faster loading
