# Remotion Core Patterns

## Core Principles

1. **Frame-Based Animation**: Always use `useCurrentFrame()` - never CSS animations
2. **Interpolation for Smoothness**: Use `interpolate()` for linear animations
3. **Spring for Natural Motion**: Use `spring()` for bouncy, natural animations
4. **Sequence for Orchestration**: Use `<Sequence>` for complex timing
5. **Serializable Props**: Composition props must be JSON-serializable

---

## The Golden Rule: useCurrentFrame()

### ✅ ALWAYS Use Frame-Based Animation

```typescript
import { useCurrentFrame, interpolate } from 'remotion';

export const FadeIn: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, 30],      // From frame 0 to frame 30
    [0, 1],       // Opacity goes from 0 to 1
    {
      extrapolateRight: 'clamp', // Don't exceed 1
    }
  );

  return <div style={{ opacity }}>Content</div>;
};
```

### ❌ NEVER Use CSS Animations or Transitions

```typescript
// ❌ BAD - Will cause flickering during render
export const Bad: React.FC = () => {
  return (
    <div style={{ animation: 'fadeIn 1s ease-in' }}>
      Content
    </div>
  );
};

// ❌ BAD - CSS transitions don't work in Remotion
const BadStyle = {
  transition: 'opacity 0.3s',
};
```

**Why?** Remotion renders each frame independently. CSS animations won't be captured during rendering - only frame-based values work.

---

## Interpolation Patterns

### Basic Linear Interpolation

```typescript
const frame = useCurrentFrame();

// Simple fade in
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});

// Scale up
const scale = interpolate(frame, [0, 45], [0, 1], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});

// Move from left to right
const translateX = interpolate(frame, [0, 60], [-100, 0]);
```

### Extrapolation Options

```typescript
// Clamp - stop at boundaries (most common)
const clamped = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'clamp',  // Stay at 0 before frame 0
  extrapolateRight: 'clamp', // Stay at 1 after frame 30
});

// Extend - continue the trend
const extended = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'extend', // Goes beyond 1 (1.1, 1.2...)
});

// Identity - return frame value directly
const identity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: 'identity', // Returns actual frame number
});
```

### Multi-Point Interpolation

```typescript
const frame = useCurrentFrame();

// Fade in, stay visible, fade out
const opacity = interpolate(
  frame,
  [0, 30, 90, 120],           // Key frames
  [0, 1, 1, 0],                // Opacity values
  {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }
);
```

---

## Spring Animations

### Basic Spring (0 → 1)

```typescript
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

export const BounceIn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    // Defaults: from 0 to 1
  });

  return (
    <div style={{ transform: `scale(${scale})` }}>
      Bouncy!
    </div>
  );
};
```

### Custom Spring Configuration

```typescript
const scale = spring({
  frame,
  fps,
  from: 0,
  to: 1.2,
  config: {
    damping: 10,      // Higher = less bouncy (default: 10)
    stiffness: 100,   // Higher = faster (default: 100)
    mass: 1,          // Lower = faster (default: 1)
    overshootClamping: false, // Prevent overshoot if true
  },
});
```

### Spring with Delay

```typescript
// Start spring after 30 frames
const delayed = spring({
  frame: frame - 30,  // Subtract delay
  fps,
  config: {
    damping: 12,
  },
});

// Or use delay parameter
const delayed2 = spring({
  frame,
  fps,
  delay: 30,
});
```

### Reverse Spring (1 → 0)

```typescript
const scaleOut = spring({
  frame,
  fps,
  reverse: true,  // Animates from 1 to 0
});
```

---

## Sequence Orchestration

### Basic Sequence Pattern

```typescript
import { Sequence } from 'remotion';

export const Scene: React.FC = () => {
  return (
    <>
      {/* Logo: frames 0-60 */}
      <Sequence from={0} durationInFrames={60}>
        <Logo />
      </Sequence>

      {/* Title: frames 40-100 (overlap with logo) */}
      <Sequence from={40} durationInFrames={60}>
        <Title />
      </Sequence>

      {/* Subtitle: frames 80-140 */}
      <Sequence from={80} durationInFrames={60}>
        <Subtitle />
      </Sequence>
    </>
  );
};
```

**Important**: Inside a `<Sequence from={40}>`, `useCurrentFrame()` returns `0` at frame 40 (time-shifted).

### Layout Control

```typescript
// Default: wraps in AbsoluteFill (absolute positioning, full screen)
<Sequence from={0}>
  <Component />
</Sequence>

// No wrapper: manual layout control
<Sequence from={0} layout="none">
  <Component />
</Sequence>
```

### Nested Sequences

```typescript
<Sequence from={30}>
  {/* Group starts at frame 30 */}
  <Sequence from={0}>
    <A /> {/* Visible at frame 30 */}
  </Sequence>
  <Sequence from={20}>
    <B /> {/* Visible at frame 50 (30 + 20) */}
  </Sequence>
</Sequence>
```

### Negative Offsets (Trim Start)

```typescript
// Start component mid-animation
<Sequence from={-15}>
  {/* Component thinks it's at frame 15 when composition starts */}
  <FadeIn /> {/* Will be partially faded in already */}
</Sequence>
```

---

## Combining Techniques

### Interpolate + Spring

```typescript
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Bounce in with spring
const scale = spring({ frame, fps });

// Fade in with interpolate
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateRight: 'clamp',
});

return (
  <div style={{
    transform: `scale(${scale})`,
    opacity,
  }}>
    Content
  </div>
);
```

### Delayed Animations

```typescript
const frame = useCurrentFrame();

// Helper for delayed animations
const getDelayedFrame = (delay: number) => Math.max(0, frame - delay);

const logoOpacity = interpolate(
  getDelayedFrame(0),
  [0, 30],
  [0, 1],
  { extrapolateRight: 'clamp' }
);

const textOpacity = interpolate(
  getDelayedFrame(30),
  [0, 30],
  [0, 1],
  { extrapolateRight: 'clamp' }
);
```

---

## Video Configuration

### Accessing Video Settings

```typescript
import { useVideoConfig } from 'remotion';

export const Component: React.FC = () => {
  const { width, height, fps, durationInFrames } = useVideoConfig();

  // Use these for responsive calculations
  const centerX = width / 2;
  const centerY = height / 2;

  return <div />;
};
```

---

## Common Animation Patterns

### Fade In

```typescript
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});
```

### Slide In from Left

```typescript
const translateX = interpolate(frame, [0, 30], [-100, 0], {
  extrapolateRight: 'clamp',
});

<div style={{ transform: `translateX(${translateX}%)` }} />
```

### Scale Up

```typescript
const scale = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});

<div style={{ transform: `scale(${scale})` }} />
```

### Bounce In

```typescript
const scale = spring({ frame, fps });

<div style={{ transform: `scale(${scale})` }} />
```

### Rotate

```typescript
const rotation = interpolate(frame, [0, 60], [0, 360]);

<div style={{ transform: `rotate(${rotation}deg)` }} />
```

### Stagger Multiple Elements

```typescript
const items = ['A', 'B', 'C', 'D'];

return (
  <>
    {items.map((item, index) => {
      const delay = index * 10; // 10 frames between each
      const opacity = interpolate(
        frame - delay,
        [0, 20],
        [0, 1],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
      );

      return (
        <div key={item} style={{ opacity }}>
          {item}
        </div>
      );
    })}
  </>
);
```

---

## Anti-Patterns

### ❌ Using CSS Animations

```typescript
// ❌ Will not render correctly
<div style={{ animation: 'spin 2s linear' }} />
```

### ❌ Using State for Animation

```typescript
// ❌ State changes won't be captured frame-by-frame
const [opacity, setOpacity] = useState(0);
useEffect(() => {
  setOpacity(1);
}, []);
```

### ❌ Not Clamping Interpolations

```typescript
// ❌ Can produce invalid values (opacity > 1)
const opacity = interpolate(frame, [0, 30], [0, 1]);

// ✅ Always clamp unless you have a reason not to
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});
```

---

## Checklist

Before committing animation code:

- [ ] All animations use `useCurrentFrame()` (no CSS animations)
- [ ] `interpolate()` calls include extrapolate options
- [ ] Spring animations use `fps` from `useVideoConfig()`
- [ ] Complex timing uses `<Sequence>` for orchestration
- [ ] Delayed animations properly subtract frame offset
- [ ] Responsive calculations use `width`/`height` from `useVideoConfig()`
- [ ] No state-based animations (useState, useEffect for animation)
