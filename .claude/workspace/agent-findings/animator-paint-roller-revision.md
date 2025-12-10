# Animation Design: Paint Roller Logo Reveal (Revision)

## Agent: Animator
## Task: Revise logo animation based on user feedback

---

## User Feedback Summary

The current implementation is **incorrect**. The user wants:
1. Logo starts INVISIBLE/TRANSPARENT
2. A VISIBLE gradient strip rectangle moves left-to-right across screen
3. As strip passes over logo area, it "fills" the logo shape
4. Strip exits right, fully colored logo remains

Visual metaphor: **Paint roller or squeegee** - you see the tool AND the paint it leaves behind.

---

## Revised Animation Architecture

### Two-Layer Visual System

**Layer 1: The Gradient Strip (The "Brush")**
- Visible rectangular element
- Uses gradient image: `gradient-light-2-inverted.png`
- Moves from left (off-screen) to right (off-screen)
- Height: Full composition height or logo area height
- Width: ~200-300px (the "brush width")

**Layer 2: The Logo Fill (The "Paint Left Behind")**
- Logo shape filled with gradient
- Uses clip-path/mask based on strip position
- Reveals progressively from left to right
- Only visible where strip has already passed

### Layer Ordering (bottom to top)
1. Background (black)
2. Logo fill layer (progressively revealed)
3. Gradient strip (moves across, on top)

---

## Animation Timeline

**Total Duration**: 180 frames (3 seconds at 60fps)

### Phase 1: Reveal (Frames 0-90)
- **Strip**: Moves from off-screen left to off-screen right
- **Logo**: Progressively fills from left to right, tracking strip position
- **Easing**: ease-out cubic for natural deceleration

### Phase 2: Hold (Frames 90-150)
- **Strip**: Off-screen to the right (exited)
- **Logo**: Fully visible, static
- **Purpose**: Brand exposure, let viewer absorb the logo

### Phase 3: Exit (Frames 150-180)
- **Strip**: Already gone
- **Logo**: Fades out with subtle scale reduction
- **Easing**: ease-in quad for accelerating exit

---

## Technical Specification

### Strip Element

```
Position calculation:
- Start: -stripWidth (completely off-screen left)
- End: compositionWidth (completely off-screen right)
- Travel distance: compositionWidth + stripWidth

Dimensions:
- Width: 200px (adjustable via prop)
- Height: 100% of composition

Positioning:
- Absolute positioned
- Full height
- translateX based on frame progress
```

### Logo Fill Clip

```
Clip-path approach:
- Use CSS clip-path: inset() or polygon()
- Reveal from left edge to right
- Clip right edge = stripPosition - logoLeftEdge
- Formula: clipRight = 100% - revealProgress%

Example at 50% reveal:
clip-path: inset(0 50% 0 0)  // Hide right 50%
```

### Synchronization

The logo clip MUST track the strip position exactly:
- When strip left edge is at logo left edge: logo reveal starts
- When strip passes a point: that part of logo stays revealed
- When strip exits: logo is fully revealed

```
stripLeftEdge = stripStartX + (stripTravelDistance * progress)
logoRevealRight = stripLeftEdge - logoLeftX

If using percentage-based clip:
revealPercent = (stripLeftEdge - logoLeftX) / logoWidth * 100
```

---

## Props to Add/Modify

### New Props for LogoReveal

```typescript
type LogoRevealProps = {
  scale: number;
  revealDuration: number;
  holdDuration: number;
  exitDuration: number;
  stripWidth: number;        // NEW: Width of visible gradient strip
  showStrip: boolean;        // NEW: Toggle strip visibility (for debugging)
};
```

### Default Values

```typescript
stripWidth: 200,    // 200px wide strip
showStrip: true,    // Strip visible by default
```

---

## Implementation Notes

### SVG vs CSS Clip-Path

For the logo reveal, recommend using **CSS clip-path** on a div containing the filled logo:
- More performant than SVG clipPath
- Easier to animate with translateX
- Works well with Remotion's style-based animation

### Strip Gradient Image

The strip should use the same gradient image as the logo fill for visual consistency. The strip essentially "deposits" the gradient into the logo shape.

### Z-Index Ordering

```
z-index: 1 - Background
z-index: 2 - Logo fill (clipped)
z-index: 3 - Gradient strip (moving)
```

### Edge Cases

1. **Strip enters before reaching logo**: Strip visible, logo still invisible
2. **Strip over logo**: Both visible, logo partially filled
3. **Strip exits**: Only filled logo remains

---

## Visual Timeline

```
Frame 0:    [Strip]------------------>|logo hidden|<-----------------
Frame 30:   ------[Strip]------------>|logo 25% visible|<------------
Frame 60:   ------------[Strip]------>|logo 70% visible|<------------
Frame 90:   ------------------[Strip]>|logo 100% visible|<-----------
Frame 150:  -------------------------|logo 100% visible (holding)|---
Frame 180:  -------------------------|logo fading out|---------------
```

---

## Quality Checklist

- [ ] All animation uses useCurrentFrame() - NO CSS animations
- [ ] Strip position calculated with interpolate() + clamp
- [ ] Logo clip calculated based on strip position
- [ ] Memoize expensive calculations (positions, styles)
- [ ] Use staticFile() for gradient image
- [ ] Props use `type` not `interface`
- [ ] All interpolate calls clamped

---

## Handoff to Implementer

The implementer should:
1. Add a visible gradient strip element that moves across screen
2. Modify the logo fill to use a clip-path based on strip position
3. Ensure logo starts completely invisible
4. Synchronize the clip reveal with strip position
5. Keep existing timing phases (90/60/30 frames)
6. Add stripWidth prop for configurability
