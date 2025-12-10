# Code Review Checklist for Remotion

## Core Principles

1. **Review Against Skills**: Check code follows all loaded skill patterns
2. **Objective Feedback**: Every issue must reference a skill or best practice
3. **Quality Over Speed**: Better to catch issues now than in production
4. **Constructive**: Explain why something matters, suggest fixes

---

## Review Process

### Step 1: Load All Relevant Skills

Before reviewing, read:

```bash
cat .claude/skills/typescript/conventions.md
cat .claude/skills/react/patterns.md
cat .claude/skills/remotion/core.md
cat .claude/skills/remotion/performance.md
cat .claude/skills/remotion/composition.md
cat .claude/skills/security/core.md
```

### Step 2: Understand Context

- What does this code do?
- What problem does it solve?
- Is it a new feature, bug fix, or refactor?

### Step 3: Check Against Skills

Systematically verify each skill's patterns.

---

## TypeScript Conventions

### ✅ Check These

- [ ] All props use `type` (not `interface`)
- [ ] All functions have explicit return types
- [ ] No `any` types used
- [ ] Composition props are JSON-serializable
- [ ] Imports organized (external → internal → types)
- [ ] File naming follows conventions (PascalCase for components)
- [ ] Types exported explicitly when reused

### Common Issues

**Issue**: Using `interface` for props
```typescript
// ❌ Bad
interface LogoProps {
  text: string;
}

// ✅ Good
type LogoProps = {
  text: string;
};
```

**Issue**: Missing return types
```typescript
// ❌ Bad
const calculate = (x: number) => x * 2;

// ✅ Good
const calculate = (x: number): number => x * 2;
```

---

## React Patterns

### ✅ Check These

- [ ] Expensive calculations memoized with `useMemo()`
- [ ] Callbacks passed to children use `useCallback()`
- [ ] No side effects in render (no console.log in production)
- [ ] Components are small and focused
- [ ] Reusable logic extracted into custom hooks
- [ ] No components created inside other components
- [ ] List items have unique `key` props

### Common Issues

**Issue**: Not memoizing expensive calculations
```typescript
// ❌ Bad
const sorted = items.sort((a, b) => b - a); // Every frame!

// ✅ Good
const sorted = useMemo(
  () => items.sort((a, b) => b - a),
  [items]
);
```

**Issue**: Missing keys in lists
```typescript
// ❌ Bad
{items.map(item => <Item item={item} />)}

// ✅ Good
{items.map(item => <Item key={item.id} item={item} />)}
```

---

## Remotion Core

### ✅ Check These

- [ ] All animations use `useCurrentFrame()` (no CSS animations)
- [ ] `interpolate()` calls include extrapolate options
- [ ] Spring animations use `fps` from `useVideoConfig()`
- [ ] Complex timing uses `<Sequence>` appropriately
- [ ] No state-based animations (useState for animation)

### Common Issues

**Issue**: Using CSS animations
```typescript
// ❌ Bad - will flicker during render
<div style={{ animation: 'fadeIn 1s' }} />

// ✅ Good - frame-based
const opacity = interpolate(frame, [0, 30], [0, 1]);
<div style={{ opacity }} />
```

**Issue**: Missing extrapolate options
```typescript
// ❌ Bad - can exceed valid range
const opacity = interpolate(frame, [0, 30], [0, 1]);

// ✅ Good - clamped
const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateRight: 'clamp',
});
```

---

## Remotion Performance

### ✅ Check These

- [ ] Expensive calculations memoized
- [ ] Components use `lazyComponent` when appropriate
- [ ] No GPU-heavy effects (blur, box-shadow) for cloud rendering
- [ ] Images use `<Img>` tag (not `<img>`)
- [ ] Static assets use `staticFile()`
- [ ] No object/array creation in render without memoization

### Common Issues

**Issue**: GPU-heavy effects
```typescript
// ❌ Bad for cloud rendering
const style = {
  filter: 'blur(10px)',
  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
};

// ✅ Good - use pre-rendered image
import blurredBg from './assets/background-blur.png';
<img src={blurredBg} />
```

**Issue**: Creating objects every frame
```typescript
// ❌ Bad - new object every render
const style = { opacity: interpolate(frame, [0, 30], [0, 1]) };

// ✅ Good - memoized
const style = useMemo(
  () => ({ opacity: interpolate(frame, [0, 30], [0, 1]) }),
  [frame]
);
```

---

## Remotion Composition

### ✅ Check These

- [ ] Every composition has unique ID
- [ ] All defaultProps are JSON-serializable
- [ ] Props use `type` (not `interface`)
- [ ] Large compositions use `lazyComponent`
- [ ] Components have default export (for lazy loading)
- [ ] IDs follow naming convention (lowercase, hyphens)
- [ ] No functions in composition defaultProps

### Common Issues

**Issue**: Non-serializable props
```typescript
// ❌ Bad
<Composition
  defaultProps={{
    text: 'Hello',
    onComplete: () => console.log('done'), // Function!
  }}
  {...}
/>

// ✅ Good - only serializable data
<Composition
  defaultProps={{
    text: 'Hello',
    showCompletionMessage: true,
  }}
  {...}
/>
```

---

## Security

### ✅ Check These

- [ ] No hardcoded secrets (API keys, tokens)
- [ ] Secrets use environment variables
- [ ] External data is validated
- [ ] Asset URLs are validated
- [ ] No sensitive data in console.log
- [ ] No dangerouslySetInnerHTML with untrusted data

### Common Issues

**Issue**: Hardcoded secrets
```typescript
// ❌ Bad
const API_KEY = 'sk_live_abc123...';

// ✅ Good
const API_KEY = process.env.REMOTION_API_KEY;
if (!API_KEY) throw new Error('API_KEY not set');
```

**Issue**: Unvalidated external data
```typescript
// ❌ Bad
const userText = fetchFromAPI();
return <div dangerouslySetInnerHTML={{ __html: userText }} />;

// ✅ Good
const userText = fetchFromAPI();
return <div>{userText}</div>; // React escapes automatically
```

---

## Testing

### ✅ Check These

- [ ] Utility functions have tests
- [ ] Edge cases covered (null, undefined, empty, zero)
- [ ] Test names clearly describe behavior
- [ ] No brittle snapshot tests
- [ ] Tests are deterministic (no flaky tests)

### Common Issues

**Issue**: Missing edge case tests
```typescript
// Tests only happy path
it('calculates progress', () => {
  expect(calculateProgress(50, 0, 100)).toBe(0.5);
});

// ✅ Should also test:
it('handles zero duration', () => {
  expect(calculateProgress(50, 0, 0)).toBe(1);
});

it('clamps at 1', () => {
  expect(calculateProgress(150, 0, 100)).toBe(1);
});
```

---

## File Organization

### ✅ Check These

- [ ] Files follow naming convention
- [ ] Imports are organized correctly
- [ ] File structure matches project conventions
- [ ] Related files grouped appropriately
- [ ] No orphaned files

### Expected Structure

```
src/
  animations/{client}/{project}/
    Composition.tsx
    components/
    types.ts
  components/
    Reusable components
  utils/
    Utility functions with tests
```

---

## Review Output Format

```markdown
## Code Review: {Scope}

### Verdict: {APPROVE | REQUEST_CHANGES | NEEDS_DISCUSSION}

### Summary
{Overall assessment}

### Skill Compliance

| Skill | Status | Issues |
|-------|--------|--------|
| TypeScript/conventions | ✅/⚠️ | {details} |
| React/patterns | ✅/⚠️ | {details} |
| Remotion/core | ✅/⚠️ | {details} |
| Remotion/performance | ✅/⚠️ | {details} |
| Security/core | ✅/⚠️ | {details} |

### Issues Found

#### 🔴 Must Fix (Blocks Approval)
| Issue | Skill Violated | Location | Suggestion |
|-------|---------------|----------|------------|
| CSS animation used | remotion/core | Logo.tsx:24 | Use interpolate with useCurrentFrame |
| Hardcoded API key | security/core | api.ts:5 | Move to environment variable |

#### 🟡 Should Fix (Recommended)
| Issue | Skill | Location | Suggestion |
|-------|-------|----------|------------|
| Missing memoization | react/patterns | Component.tsx:12 | Wrap in useMemo |
| Missing return type | typescript/conventions | utils.ts:8 | Add : number return type |

#### 💡 Consider (Optional)
| Suggestion | Rationale |
|------------|-----------|
| Extract custom hook | Reusable animation logic |

### Test Coverage
- [ ] Unit tests present
- [ ] Edge cases covered
- [ ] Tests pass

### Security
- [ ] No obvious vulnerabilities
- [x] Recommend security agent review (handling user input)

### Metrics
- Files reviewed: 5
- Issues found: 6 (2 critical, 3 recommended, 1 suggestion)
- Skills checked: 6
```

---

## Verdict Guidelines

### APPROVE ✅
- All critical issues resolved
- No skill violations
- Tests pass
- Security looks good

### REQUEST_CHANGES ⚠️
- Critical issues found (must fix)
- Multiple skill violations
- Missing tests for new utilities
- Security concerns

### NEEDS_DISCUSSION 💬
- Architectural concerns
- Multiple valid approaches
- Unclear requirements
- Major refactoring without context

---

## Review Etiquette

### ✅ Do This

- Reference specific skills when giving feedback
- Explain *why* something matters
- Suggest concrete fixes
- Acknowledge good practices
- Ask questions when unclear

### ❌ Avoid This

- Subjective opinions not grounded in skills
- "I prefer..." without rationale
- Nitpicking style (linter handles that)
- Being vague ("this looks wrong")
- Personal attacks or condescension

---

## Checklist

Before approving code:

- [ ] Loaded all relevant skills
- [ ] Understood what the code does
- [ ] Checked TypeScript conventions
- [ ] Checked React patterns
- [ ] Checked Remotion core patterns
- [ ] Checked performance optimizations
- [ ] Checked composition structure
- [ ] Checked security (no secrets, validated input)
- [ ] Checked tests (if utility functions)
- [ ] Every issue tied to a skill violation
- [ ] Provided constructive feedback with examples
- [ ] Verdict reflects actual code quality
