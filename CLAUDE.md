# Remotion Animation System

## Project Overview

**Purpose**: Create programmatic animations using Remotion with AI assistance, enabling rapid creation of professional logo animations,text effects, and any other kind of animation.

**Primary Use Cases**:
1. Logo animations (highest priority) - entrance effects, reveals, branding
2. Text/background animations - "wow effects" for content generation
3. Project-specific custom animations as needed

**Users**: Primarily solo developer with occasional team contributions

**Organization**: Mixed client and internal work, organized by `animations/{client}/{project}/`

---

## Technical Architecture

**Stack**:
- **Remotion**: v4.x (programmatic video framework)
- **Language**: TypeScript (type-safe animation code)
- **Runtime**: Node.js v22 LTS, pnpm package manager
- **Framework**: React (Remotion's foundation)
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Rendering**: Remotion Studio (dev) + Remotion Lambda (production)
- **Quality**: ESLint + Prettier

**Project Structure**:
```
src/
  animations/
    {client-name}/
      {project-name}/
        Composition.tsx
        components/
        types.ts
  components/       # Reusable animation primitives
  utils/           # Utility functions
  types/           # Global types
public/
  assets/
    logos/
      clients/{client}/
      internal/
    fonts/
    images/
```

---

## Quality Standards

### What Quality Means Here

**Professional Output**:
- Smooth 60fps animations
- Proper easing and timing
- Polished, brand-appropriate visuals

**Clean TypeScript**:
- Type-safe props using `type` (not `interface`)
- JSON-serializable composition props
- Explicit return types

**Fast Iteration**:
- Easy to modify and preview
- Reusable component patterns
- Clear organization

### Non-Negotiables

- ✅ **Always use `useCurrentFrame()`** - NEVER CSS animations (will flicker)
- ✅ **Always memoize** expensive calculations with `useMemo()`
- ✅ **Always use `type`** (not `interface`) for props
- ✅ **Always use `staticFile()`** for assets
- ✅ **Always use `<Img>`** (not `<img>`) for images
- ✅ **Always clamp `interpolate()`** with extrapolate options
- ❌ **Never use CSS** `animation`, `transition`, or `@keyframes`
- ❌ **Never use functions** in composition defaultProps

### Known Risks to Prevent

- Flickering from CSS animations instead of frame-based
- Performance issues from missing memoization
- Type safety issues from using `interface` over `type`
- Poor reusability from not extracting components

---

## AI Development Team

This project uses an **AI development team** with enforced quality patterns.

### The Team

| Agent | Role | When to Use |
|-------|------|-------------|
| `po` | Orchestrator | Complex tasks, features, multi-step workflows |
| `animator` | Animation designer | Plan animation sequences, timing, visual flow |
| `implementer` | Developer | Write animation code, implement features |
| `debugger` | Investigator | Bug investigation, root cause analysis |
| `reviewer` | Quality gate | Code review, standards compliance |
| `security` | Auditor | Security review, asset validation |

### Skills (Knowledge Base)

**Foundational**:
| Skill | Purpose |
|-------|---------|
| typescript/conventions | TypeScript standards for Remotion |
| react/patterns | React patterns (memoization, hooks) |
| remotion/core | Core animation patterns (useCurrentFrame, interpolate, spring) |
| remotion/performance | Optimization techniques |
| remotion/composition | Composition structure and props |
| testing/vitest | Testing patterns for utilities |
| security/core | Security practices |
| review/checklist | Review standards |

**Project-Specific**:
| Skill | Purpose |
|-------|---------|
| remotion/logo-animations | Logo animation patterns (fade, scale, bounce, etc.) |
| remotion/text-effects | Text/background effects (typewriter, stagger, parallax) |
| remotion/component-library | Reusable component patterns |
| remotion/asset-management | Asset organization and optimization |

### Quality Enforcement

Every agent has:
- **Penalty constraints**: -$2000 for critical violations (CSS animations, non-serializable props)
- **Evidence minimums**: No conclusions without proof (debugger requires 10+ data points)
- **Skill requirements**: Must load and apply relevant skills before working
- **Cleanup protocols**: Remove debug code, track changes in TodoWrite

---

## Usage Guide

### For Complex Work (Recommended)

```
Use po agent to {task}
```

**PO coordinates the team**, ensuring quality through proper workflow:
- Breaks down complex tasks
- Delegates to appropriate agents
- Tracks progress
- Verifies quality gates
- Aggregates results

**Examples**:
```
Use po agent to create a logo animation for Acme Corp
Use po agent to fix the flickering animation bug
Use po agent to build a text effects component library
```

### For Direct Work

Use individual agents when you know exactly what you need:

```
Use animator agent to plan a logo reveal animation
Use implementer agent to create a fade-in text component
Use debugger agent to investigate why the animation is too fast
Use reviewer agent to review changes in src/animations/
Use security agent to audit asset loading code
```

### Quick Commands

```bash
/new-animation    # Scaffold new animation
/new-logo         # Create logo animation with patterns
/new-text-effect  # Create text/background effect
/render-preview   # Quick low-quality render for preview
/optimize         # Performance analysis and suggestions
```

---

## Workflow Standards

### Before Committing

1. Run reviewer agent on changed files
2. Ensure all skill checklists pass
3. Verify animations use `useCurrentFrame()` (no CSS)
4. Confirm memoization is present
5. Check tests pass (for utility functions)

### For New Animations

**Full Workflow (PO-orchestrated)**:
1. PO receives request
2. Animator plans the animation (timing, patterns, sequencing)
3. Implementer builds based on animator's plan
4. Reviewer verifies quality
5. Security audits if needed (external assets, APIs)

**Quick Workflow (Direct)**:
1. Use implementer directly for simple animations
2. Use reviewer before committing

### For Bugs

**Always**:
1. Debugger investigates (gathers 10+ evidence points, finds root cause)
2. Implementer fixes based on debugger's findings
3. Reviewer verifies fix

**Never**:
- Skip debugger and guess at fixes
- Implement without evidence

### For Rendering

**Preview** (fast, lower quality):
```bash
/render-preview
```

**Production** (full quality):
```bash
pnpm render {composition-id}
```

**Development**:
```bash
pnpm dev  # Opens Remotion Studio
```

---

## Critical Rules

### Remotion-Specific

- ✅ **DO**: Use `useCurrentFrame()` + `interpolate()` / `spring()` for ALL animations
- ✅ **DO**: Memoize with `useMemo()` / `useCallback()`
- ✅ **DO**: Use `<Img>` for images, `staticFile()` for assets
- ✅ **DO**: Clamp `interpolate()` with `extrapolateRight: 'clamp'`
- ❌ **DON'T**: Use CSS `animation`, `transition`, or `@keyframes` (will flicker!)
- ❌ **DON'T**: Create objects/arrays in render without memoization
- ❌ **DON'T**: Use `<img>` tag (use `<Img>`)
- ❌ **DON'T**: Forget to clamp interpolations

### TypeScript-Specific

- ✅ **DO**: Use `type` for all prop definitions
- ✅ **DO**: Make props JSON-serializable
- ✅ **DO**: Add explicit return types
- ❌ **DON'T**: Use `interface` for props
- ❌ **DON'T**: Put functions in composition defaultProps
- ❌ **DON'T**: Use `any` type

### Quality-Specific

- **NEVER commit** without reviewer check
- **NEVER fix bugs** without debugger investigation
- **NEVER skip tests** for utility functions
- **NEVER ignore security** for asset/data code
- **ALWAYS follow** skill patterns
- **ALWAYS track** progress with TodoWrite (for agents)

---

## Getting Started

### Create Your First Animation

**Option 1: Logo Animation**
```
/new-logo
```
Follow prompts for client, project name, and animation style.

**Option 2: Text Effect**
```
/new-text-effect
```
Choose text effect type and optional background.

**Option 3: Custom Animation**
```
Use po agent to create a {description} animation
```
PO will orchestrate the full workflow.

### Preview Your Animation

```bash
pnpm dev
```
Opens Remotion Studio where you can preview and adjust.

### Render Your Animation

**Preview render** (fast):
```
/render-preview
```

**Final render** (full quality):
```bash
pnpm render {composition-id}
```

---

## Quick Reference

### Animation Patterns

**Logo**: fade, scale, bounce, slide, rotate, wipe, glitch
**Text**: fade, slide, typewriter, stagger, pop, glitch
**Background**: gradient, parallax, particles, pulsing circles

### Timing at 60fps

- Quick: 15-20 frames (0.25-0.33s)
- Standard: 30-45 frames (0.5-0.75s)
- Logo reveal: 45-90 frames (0.75-1.5s)
- Total animation: 90-300 frames (1.5-5s)

### Easing Types

- **Linear**: Constant speed - `interpolate()`
- **Ease Out**: Fast start, slow end - `Easing.out(Easing.cubic)`
- **Ease In**: Slow start, fast end - `Easing.in(Easing.cubic)`
- **Spring**: Natural bounce - `spring({ damping, stiffness })`

### Spring Configs

- Subtle: `damping: 15, stiffness: 100`
- Moderate: `damping: 10, stiffness: 100` (recommended)
- Bouncy: `damping: 7, stiffness: 150`
- Snappy: `damping: 12, stiffness: 200`

---

## Common Issues & Solutions

**Animation flickering**:
- ❌ Likely cause: CSS animations
- ✅ Solution: Use `useCurrentFrame()` + `interpolate()`

**Animation too slow/fast**:
- ❌ Likely cause: Wrong interpolation range
- ✅ Solution: Check frame ranges, use debugger agent

**Props not working**:
- ❌ Likely cause: Non-serializable props or using `interface`
- ✅ Solution: Use `type`, ensure JSON-serializable

**Slow rendering**:
- ❌ Likely cause: Missing memoization or GPU effects
- ✅ Solution: Run `/optimize`, add `useMemo()`

**Type errors**:
- ❌ Likely cause: Using `interface` instead of `type`
- ✅ Solution: Change to `type` definition

---

## Need Help?

```
Use po agent to {describe what you need}
```

The PO will coordinate the team to help you achieve your goal with quality.

**Examples**:
- `Use po agent to explain how to create a bouncing logo animation`
- `Use po agent to help me optimize this slow animation`
- `Use po agent to review my code before committing`

---

**Good luck creating amazing animations!** 🎬
