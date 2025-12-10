---
name: render-preview
description: Quick render command for fast preview (lower quality, optimized settings)
---

Render a composition quickly for preview purposes.

1. Ask the user:
   - Composition ID to render
   - Output format (mp4, gif, or png-sequence)

2. Run render with optimized settings for speed:
   ```bash
   npx remotion render src/index.tsx {composition-id} out/preview-{composition-id}.mp4 \
     --scale=0.5 \
     --codec=h264 \
     --crf=28 \
     --concurrency=4
   ```

3. Settings explanation:
   - `--scale=0.5`: 50% resolution (much faster)
   - `--codec=h264`: Fast codec
   - `--crf=28`: Lower quality (faster encoding)
   - `--concurrency=4`: Moderate CPU usage

4. For GIF output:
   ```bash
   npx remotion render src/index.tsx {composition-id} out/preview-{composition-id}.gif \
     --scale=0.3 \
     --every-nth-frame=2
   ```

5. After rendering:
   - Show output location
   - Display file size
   - Remind: this is preview quality
   - For final render, use: `pnpm render {composition-id}`

6. If render fails:
   - Check composition ID exists
   - Check for errors in console
   - Suggest using debugger agent if needed

Note: Preview renders prioritize speed over quality. For client delivery, always use full-quality render.
