---
name: new-logo
description: Creates a logo animation with common patterns (fade, scale, bounce, slide)
---

Create a new logo animation with reusable patterns.

1. Ask the user for:
   - Client name
   - Project name (e.g., "logo-reveal", "logo-intro")
   - Animation style (fade, scale, bounce, slide, rotate, wipe, or combination)
   - Duration in seconds (default: 3 seconds)
   - Logo file path (relative to public/)

2. Create the animation using patterns from:
   - .claude/skills/remotion/logo-animations.md

3. Generate files:
   ```
   src/animations/{client}/{project}/
     Composition.tsx     # Main logo animation
     types.ts           # Props definition
   ```

4. Implement the chosen animation pattern:
   - Use spring() for natural motion
   - Use interpolate() for linear animations
   - Follow timing recommendations from skills
   - Center logo properly
   - Handle different logo sizes/ratios
   - Logo animation must have the same starting and end frame to allow playing it as a loop until user ask explicitely for a different effect

5. Add composition to Root.tsx with:
   - Descriptive ID: `{client}-{project}`
   - At least 60fps for smooth animation
   - Proper dimensions
   - defaultProps with logo URL

6. Ensure the logo animation:
   - Loads using staticFile()
   - Uses <Img> component (not <img>)
   - Has appropriate timing (2-4 seconds total)
   - Memoizes expensive calculations
   - Follows TypeScript conventions

After creation, inform the user:
- Animation location
- How to preview: `pnpm dev`
- How to customize: adjust props in Root.tsx
- Render command: `pnpm render {composition-id}`
