---
name: new-text-effect
description: Creates a text/background animation with "wow effect" patterns
---

Create a new text animation with background effects.

1. Ask the user for:
   - Client name (or "internal")
   - Project name
   - Text effect type (fade, slide, typewriter, letter-stagger, glitch)
   - Background effect type (none, gradient, parallax, particles, pulsing-circles)
   - Text content (default: placeholder)
   - Duration in seconds (default: 5 seconds)

2. Create animation using patterns from:
   - .claude/skills/remotion/text-effects.md

3. Generate files:
   ```
   src/animations/{client}/{project}/
     Composition.tsx     # Text + background animation
     types.ts           # Props definition
   ```

4. Implement:
   - Text animation based on selected type
   - Background animation (if selected)
   - Proper layering (background → text)
   - Reading time calculation for text visibility
   - Responsive text sizing

5. Key features to include:
   - Calculate reading time based on text length
   - Ensure readability (contrast, size, duration)
   - Memoize calculations for performance
   - Use <Sequence> for layering
   - Center text appropriately

6. Add composition to Root.tsx:
   - ID: `{client}-{project}`
   - 60fps
   - Default dimensions: 1920x1080
   - defaultProps with text content

7. Follow these skills:
   - .claude/skills/react/patterns.md (memoization)
   - .claude/skills/remotion/core.md (frame-based animation)
   - .claude/skills/remotion/performance.md (optimization)

After creation, inform the user:
- Files created
- How to preview: `pnpm dev`
- How to customize text: edit defaultProps in Root.tsx
- Tips: adjust reading time, colors, fonts
