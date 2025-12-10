# Animator Agent: Bouncing Dot Animation Design

## Task
Design physics-based bounce animation for the period/dot in "JUNR." logo that falls from above and bounces naturally.

## Animation Concept: "Falling Ball"

The dot should behave like a real ball dropped from height:
- Falls with acceleration (gravity)
- Impacts the ground with energy
- Bounces back up, losing energy each bounce
- Squashes on impact, stretches during fall
- Settles into final resting position

---

## Timing Specification

### Context (at 60fps)
- Total composition: 180 frames (3 seconds)
- Reveal phase: 0-90 frames (gradient strip reveals "JUNR")
- Hold phase: 90-150 frames
- Exit phase: 150-180 frames

### Dot Animation Timeline

| Phase | Frames | Duration | Description |
|-------|--------|----------|-------------|
| Wait | 0-65 | 1.08s | Dot invisible, waiting for reveal |
| Fall | 65-85 | 0.33s | Drop from above with gravity |
| Bounce 1 | 85-100 | 0.25s | First bounce (highest) |
| Bounce 2 | 100-112 | 0.20s | Second bounce (medium) |
| Bounce 3 | 112-120 | 0.13s | Third bounce (small) |
| Settle | 120-125 | 0.08s | Final settle wiggle |

**Key Frame**: Frame 65 = dot starts falling (when strip is ~72% through reveal)
**Landing Frame**: Frame 85 = first ground contact
**Settled Frame**: Frame 125 = completely at rest

---

## Physics Parameters

### Gravity and Drop
```
Initial Y position: -200 (above viewBox, in viewBox units)
Final Y position: 314.32 (top of dot bounding box in viewBox)
Drop distance: ~514 viewBox units
Fall duration: 20 frames

Gravity acceleration formula:
y = startY + (dropDistance * easeInQuad(progress))
```

### Bounce Heights (Decreasing Energy)
```
Energy retention: 45% per bounce

Bounce 1: 45% of drop height = ~231 units up
Bounce 2: 45% of bounce 1 = ~104 units up
Bounce 3: 45% of bounce 2 = ~47 units up
```

### Bounce Timing
```
Each bounce is shorter than the last (faster oscillation):
- Bounce 1: 15 frames (up 8, down 7)
- Bounce 2: 12 frames (up 6, down 6)
- Bounce 3: 8 frames (up 4, down 4)
- Settle: 5 frames (micro adjustment)
```

---

## Squash and Stretch

### Principle
- Objects stretch when moving fast (falling/rising)
- Objects squash on impact
- Volume should appear constant (stretch tall = squash narrow, squash short = stretch wide)

### Deformation Values

| State | ScaleX | ScaleY | When |
|-------|--------|--------|------|
| Resting | 1.0 | 1.0 | Start and end |
| Falling fast | 0.85 | 1.25 | During fall |
| Impact squash | 1.4 | 0.6 | At ground contact |
| Rising | 0.9 | 1.15 | Going up after bounce |
| Peak of bounce | 1.0 | 1.0 | At apex |

### Squash/Stretch Timing
```
Fall phase:
- Stretch gradually increases as velocity increases
- Maximum stretch just before impact

Impact:
- Instant squash (1-2 frames)
- scaleY drops to 0.6, scaleX expands to 1.4

Recovery:
- Quick return (3-4 frames)
- scaleY returns toward 1.0 with slight overshoot

Each subsequent bounce has smaller deformation:
- Bounce 1: Full deformation (scaleY 0.6 on impact)
- Bounce 2: 60% deformation (scaleY 0.75 on impact)
- Bounce 3: 30% deformation (scaleY 0.88 on impact)
```

---

## Implementation Approach

### Option 1: Custom Physics Formula (Recommended)
Use piecewise interpolation for complete control:

```typescript
const getBounceY = (frame: number, startFrame: number): number => {
  const f = frame - startFrame;

  // Define keyframes for each phase
  // Fall: 0-20 frames
  if (f < 20) {
    return interpolate(f, [0, 20], [-200, 314.32], {
      easing: Easing.in(Easing.quad) // Gravity acceleration
    });
  }

  // Bounce 1 up: 20-28 frames
  if (f < 28) {
    return interpolate(f, [20, 28], [314.32, 83], {
      easing: Easing.out(Easing.quad)
    });
  }

  // Bounce 1 down: 28-35 frames
  if (f < 35) {
    return interpolate(f, [28, 35], [83, 314.32], {
      easing: Easing.in(Easing.quad)
    });
  }

  // ... continue for bounces 2 and 3

  return 314.32; // Final resting position
};
```

### Option 2: Damped Spring
Use Remotion's spring with high damping for settling:

```typescript
// Less realistic bounces but simpler code
const y = spring({
  frame: frame - startFrame,
  fps,
  from: -200,
  to: 314.32,
  config: {
    damping: 8,    // Low = more bouncy
    stiffness: 80, // Moderate speed
    mass: 1.2,     // Slightly heavy feel
  }
});
```

**Recommendation**: Use Option 1 (custom formula) for authentic ball physics. Spring animation doesn't create realistic multiple bounces with proper energy decay.

---

## Visual Enhancements

### 1. Motion Blur (Optional)
During fast fall, add slight vertical blur:
- Blur amount: 0-3px based on velocity
- Only during fall phase

### 2. Shadow (Optional)
Ground shadow that:
- Scales with dot height (smaller when high, larger when close)
- Provides depth cue

### 3. Transform Origin
Set transform origin to bottom-center of dot:
- Squash/stretch happens from ground contact point
- Prevents dot from "floating" during squash

---

## Keyframe Summary

```
Frame 0-64:   Dot invisible (opacity: 0)
Frame 65:     Dot appears above, starts falling
Frame 66-84:  Falling with stretch, accelerating
Frame 85:     IMPACT - squash (scaleY: 0.6, scaleX: 1.4)
Frame 86-87:  Recovery from squash
Frame 88-92:  Rising to bounce 1 peak with stretch
Frame 93:     Bounce 1 peak (scaleY: 1.0)
Frame 94-99:  Falling to bounce 1 ground
Frame 100:    IMPACT 2 - squash (scaleY: 0.75)
Frame 101-106: Bounce 2 up and down
Frame 107:    IMPACT 3 - squash (scaleY: 0.88)
Frame 108-115: Bounce 3 up and down
Frame 116-120: Settle wiggle
Frame 121+:   At rest (scaleY: 1.0, scaleX: 1.0, y: 314.32)
```

---

## Integration with Logo Reveal

### Coordination
1. LogoReveal renders "JUNR" (4 paths, excluding dot)
2. BouncingDot renders separately, positioned to align with logo
3. Both use same gradient fill (gradient-light-2-inverted.png)
4. BouncingDot respects same exit animation (fade/scale at frame 150+)

### Positioning
The dot must align perfectly with where it would be in the original SVG:
- Use same viewBox scaling as main logo
- Position calculated relative to logo container
- Final position matches original: x=1363.99 to 1423.17, y=314.32 to 370

---

## Props Recommendation

```typescript
type BouncingDotProps = {
  /** Frame when dot starts falling */
  startFrame: number;
  /** Logo scale factor (matches LogoReveal) */
  scale: number;
  /** Number of bounces (1-4, default: 3) */
  bounceCount?: number;
  /** Energy retention per bounce (0-1, default: 0.45) */
  energyRetention?: number;
  /** Maximum squash factor (default: 0.6) */
  maxSquash?: number;
  /** Maximum stretch factor (default: 1.25) */
  maxStretch?: number;
  /** Exit animation start frame */
  exitStart: number;
  /** Exit animation duration */
  exitDuration: number;
};
```

---

## Summary

The bouncing dot animation creates a playful, physics-based reveal:
1. Falls from above with realistic gravity
2. Impacts with satisfying squash
3. Bounces 3 times with decreasing energy
4. Stretches during motion, squashes on impact
5. Settles into final position perfectly aligned with logo

This adds visual interest and a "punctuation" moment to complete the "JUNR." reveal.
