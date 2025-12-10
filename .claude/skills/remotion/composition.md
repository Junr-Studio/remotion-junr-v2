# Remotion Composition Structure

## Core Principles

1. **Unique IDs**: Every composition needs a unique identifier
2. **JSON-Serializable Props**: defaultProps must be pure JSON
3. **Type Safety**: Use `type` for prop definitions (not `interface`)
4. **Lazy Loading**: Use `lazyComponent` for better performance
5. **Organize with Folders**: Group related compositions

---

## Basic Composition Structure

### Minimal Composition

```typescript
// src/Root.tsx
import { Composition } from 'remotion';
import { LogoAnimation } from './animations/LogoAnimation';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="logo-animation"
        component={LogoAnimation}
        durationInFrames={150}
        fps={60}
        width={1920}
        height={1080}
      />
    </>
  );
};
```

### Composition with Default Props

```typescript
import { Composition } from 'remotion';
import { TextEffect } from './animations/TextEffect';

type TextEffectProps = {
  text: string;
  color: string;
  fontSize: number;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition<TextEffectProps>
        id="text-effect"
        component={TextEffect}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          text: 'Hello World',
          color: '#ffffff',
          fontSize: 64,
        }}
      />
    </>
  );
};
```

---

## Props Requirements

### ✅ JSON-Serializable Props

```typescript
type GoodProps = {
  // Primitives
  text: string;
  count: number;
  enabled: boolean;

  // Arrays
  items: string[];
  numbers: number[];

  // Objects
  config: {
    speed: number;
    color: string;
  };

  // Dates (special case - supported)
  createdAt: Date;

  // staticFile (special case - supported)
  logoUrl: string; // staticFile() result
};
```

### ❌ Non-Serializable Props

```typescript
type BadProps = {
  // ❌ Functions not allowed in Composition
  callback: () => void;
  onChange: (value: string) => void;

  // ❌ Class instances not allowed
  moment: moment.Moment;
  customClass: MyClass;

  // ❌ DOM elements not allowed
  element: HTMLElement;

  // ❌ Symbols not allowed
  sym: Symbol;
};
```

**Note**: Functions ARE allowed in `<Player>` props, but NOT in `<Composition>` props.

---

## Type Safety

### ✅ Use `type` for Props

```typescript
// ✅ Correct - use type
type LogoProps = {
  logoUrl: string;
  scale: number;
};

export const Logo: React.FC<LogoProps> = ({ logoUrl, scale }) => {
  // implementation
};
```

### ❌ Don't Use `interface`

```typescript
// ❌ Breaks defaultProps type safety
interface LogoProps {
  logoUrl: string;
}
```

---

## Lazy Loading

### Basic Lazy Loading

```typescript
import { Composition } from 'remotion';
import { lazy } from 'react';

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
- Code-splitting for better performance
- Only loads when needed

**Requirements:**
- Component must use **default export**

```typescript
// LogoAnimation.tsx
export const LogoAnimation: React.FC = () => {
  return <div>Logo</div>;
};

// Must also have default export for lazy loading
export default LogoAnimation;
```

---

## Folder Organization

### Grouping Related Compositions

```typescript
import { Composition, Folder } from 'remotion';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Client: Acme Corp">
        <Composition
          id="acme-logo"
          component={lazy(() => import('./animations/acme/Logo'))}
          durationInFrames={150}
          fps={60}
          width={1920}
          height={1080}
        />
        <Composition
          id="acme-intro"
          component={lazy(() => import('./animations/acme/Intro'))}
          durationInFrames={240}
          fps={60}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Client: TechStart">
        <Composition
          id="techstart-logo"
          component={lazy(() => import('./animations/techstart/Logo'))}
          durationInFrames={180}
          fps={60}
          width={1920}
          height={1080}
        />
      </Folder>

      <Folder name="Internal">
        <Composition
          id="company-intro"
          component={lazy(() => import('./animations/internal/Intro'))}
          durationInFrames={300}
          fps={60}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
```

**Benefits:**
- Organized sidebar in Remotion Studio
- Easy to find client vs internal animations
- No effect on rendering (purely organizational)

---

## Dynamic Metadata

### Calculate Metadata at Runtime

```typescript
import { Composition } from 'remotion';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="dynamic-animation"
        component={MyComponent}
        durationInFrames={150}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={({ props }) => {
          // Dynamically calculate based on props
          const duration = props.text.length * 5; // 5 frames per character

          return {
            durationInFrames: duration,
            props, // Can modify props here
          };
        }}
      />
    </>
  );
};
```

---

## Schema Validation

### Zod Schema for Visual Editing

```typescript
import { Composition } from 'remotion';
import { z } from 'zod';

const logoSchema = z.object({
  logoUrl: z.string().url(),
  title: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  scale: z.number().min(0.1).max(2),
});

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="logo-with-validation"
        component={LogoAnimation}
        durationInFrames={150}
        fps={60}
        width={1920}
        height={1080}
        schema={logoSchema}
        defaultProps={{
          logoUrl: 'https://example.com/logo.png',
          title: 'My Company',
          color: '#3498db',
          scale: 1,
        }}
      />
    </>
  );
};
```

**Benefits:**
- Visual prop editor in Remotion Studio
- Runtime validation
- Prevents invalid props

---

## Recommended File Structure

```
src/
  Root.tsx                    # Main composition registration

  animations/
    {client-name}/
      {project-name}/
        Composition.tsx       # Main composition
        components/           # Project-specific components
          Logo.tsx
          Background.tsx
        types.ts             # Project types
        assets/              # Project assets (optional)

  components/                # Shared reusable components
    Logo/
      LogoReveal.tsx
      LogoFade.tsx
      types.ts
    Text/
      AnimatedText.tsx
      KineticText.tsx

  utils/                     # Utility functions
    animation.ts
    colors.ts

  types/                     # Global types
    common.ts

  public/                    # Static assets
    fonts/
    images/
    logos/
```

---

## Composition Naming Convention

### IDs

```typescript
// Format: {client}-{project}-{variant}
id: "acme-logo-reveal"
id: "techstart-intro-short"
id: "internal-company-values"

// Or for reusable templates
id: "template-logo-fade"
id: "template-text-kinetic"
```

**Rules:**
- Use lowercase
- Use hyphens (not underscores or camelCase)
- Descriptive and unique
- Include client/project context

---

## Common Patterns

### Multiple Resolutions

```typescript
const compositions = [
  { width: 1920, height: 1080, label: 'Full HD' },
  { width: 1080, height: 1080, label: 'Square' },
  { width: 1080, height: 1920, label: 'Vertical' },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {compositions.map(({ width, height, label }) => (
        <Composition
          key={`logo-${width}x${height}`}
          id={`logo-${width}x${height}`}
          component={LogoAnimation}
          durationInFrames={150}
          fps={60}
          width={width}
          height={height}
          defaultProps={{ layout: label }}
        />
      ))}
    </>
  );
};
```

### Different Frame Rates

```typescript
// Smooth animation (60fps)
<Composition
  id="logo-smooth"
  component={LogoAnimation}
  fps={60}
  // ...
/>

// Standard (30fps)
<Composition
  id="logo-standard"
  component={LogoAnimation}
  fps={30}
  // ...
/>
```

---

## Anti-Patterns

### ❌ Duplicate IDs

```typescript
// ❌ Bad - duplicate IDs
<Composition id="logo" component={Logo1} {...} />
<Composition id="logo" component={Logo2} {...} /> // ERROR
```

### ❌ Non-JSON Props in defaultProps

```typescript
// ❌ Bad - function in defaultProps
<Composition
  defaultProps={{
    text: 'Hello',
    onComplete: () => console.log('done'), // ERROR
  }}
  {...}
/>
```

### ❌ Large Objects in defaultProps

```typescript
// ❌ Bad - huge object degrades performance
<Composition
  defaultProps={{
    data: massiveArrayWith10000Items, // Slow!
  }}
  {...}
/>

// ✅ Good - load data inside component
<Composition
  defaultProps={{
    dataUrl: '/api/data', // Load in component
  }}
  {...}
/>
```

---

## Checklist

Before committing composition code:

- [ ] Every composition has a unique ID
- [ ] All defaultProps are JSON-serializable
- [ ] Props use `type` (not `interface`)
- [ ] Large compositions use `lazyComponent`
- [ ] Components have default export (for lazy loading)
- [ ] Related compositions grouped in `<Folder>`
- [ ] IDs follow naming convention (lowercase, hyphens)
- [ ] No functions in composition defaultProps
- [ ] Schema validation for complex props (optional but recommended)
- [ ] File structure follows convention (animations/{client}/{project}/)
