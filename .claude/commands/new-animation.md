---
name: new-animation
description: Scaffolds a new Remotion animation with TypeScript template (client/project structure)
---

Create a new Remotion animation with the following structure:

1. Ask the user for:
   - Client name (e.g., "acme-corp", "techstart", or "internal")
   - Project name (e.g., "logo-reveal", "product-intro")
   - Animation type (logo, text-effect, or custom)
   - Duration in seconds
   - Resolution (1920x1080, 1080x1080, 1080x1920, or custom)

2. Create the folder structure:
   ```
   src/animations/{client-name}/{project-name}/
     Composition.tsx
     components/
     types.ts
   ```

3. Generate Composition.tsx with:
   - Proper TypeScript types
   - Default props setup
   - Basic animation structure based on type selected
   - Imports for Remotion hooks

4. Add the composition to src/Root.tsx:
   - Import the new composition
   - Add <Composition> with proper ID, fps, dimensions
   - Place in appropriate <Folder> (by client)

5. Generate types.ts with:
   - Props type definition
   - Use `type` (not `interface`)
   - JSON-serializable props only

Follow all patterns from:
- .claude/skills/typescript/conventions.md
- .claude/skills/remotion/composition.md
- .claude/skills/remotion/core.md

After scaffolding, inform the user:
- Where files were created
- How to preview: `pnpm dev`
- Next steps: implement animation logic
