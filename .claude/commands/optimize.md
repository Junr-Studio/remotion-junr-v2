---
name: optimize
description: Runs performance checks and suggests optimizations for Remotion project
---

Analyze the Remotion project for performance issues and suggest optimizations.

1. Check for common performance issues:

   **a) Missing Memoization:**
   - Search for `useMemo` and `useCallback` usage
   - Flag expensive calculations not memoized
   - Look for object/array creation in render

   **b) GPU-Heavy Effects:**
   - Search for `filter: 'blur'`
   - Search for `boxShadow`
   - Flag for cloud rendering concerns

   **c) Image Optimization:**
   - Check if using `<Img>` vs `<img>`
   - Check image file sizes in public/
   - Suggest compression if >500KB

   **d) Component Loading:**
   - Check if large compositions use `lazyComponent`
   - Check for proper code-splitting

   **e) Data Fetching:**
   - Look for fetch/API calls in components
   - Check for delayRender/continueRender usage

2. Run checks:
   ```bash
   # Check bundle size
   du -sh node_modules/@remotion

   # Count compositions
   grep -r "component=" src/Root.tsx | wc -l

   # Find large assets
   find public -type f -size +1M

   # Check for common anti-patterns
   grep -r "animation:" src/
   grep -r "transition:" src/
   ```

3. Generate report:

   ```markdown
   ## Performance Optimization Report

   ### Issues Found

   #### 🔴 Critical
   - [ ] CSS animations detected (use useCurrentFrame instead)
   - [ ] Large images not optimized (>1MB)

   #### 🟡 Recommended
   - [ ] Missing memoization in 3 components
   - [ ] GPU effects detected (may slow cloud rendering)

   #### 💡 Suggestions
   - [ ] Enable lazy loading for 2 large compositions
   - [ ] Compress background images

   ### Recommendations

   1. **Memoization**: Add useMemo to:
      - `src/animations/client/project/Component.tsx:45`

   2. **Image Optimization**:
      - Compress `public/assets/backgrounds/image.jpg` (2.4MB → ~500KB)

   3. **Lazy Loading**:
      - Use `lazyComponent` in Root.tsx for large compositions

   ### Next Steps
   1. Fix critical issues first
   2. Address recommended optimizations
   3. Re-run optimize command
   4. Benchmark render time: `npx remotion benchmark`
   ```

4. After report:
   - Offer to fix issues automatically
   - Suggest using implementer agent for code changes
   - Recommend benchmark command for measuring improvements

5. Follow guidelines from:
   - .claude/skills/remotion/performance.md
   - .claude/skills/react/patterns.md
