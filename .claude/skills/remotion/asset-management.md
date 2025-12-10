# Asset Management Best Practices

## Core Principles

1. **Organization**: Clear folder structure by client/project
2. **Naming Conventions**: Consistent, descriptive names
3. **Optimization**: Compress assets for performance
4. **Version Control**: Track asset changes appropriately
5. **Security**: Validate sources, protect sensitive assets

---

## Folder Structure

### Recommended Organization

```
public/
  assets/
    logos/
      clients/
        acme-corp/
          logo-primary.png
          logo-white.png
          logo-black.png
          logo-icon.png
        techstart/
          logo-primary.svg
          logo-secondary.svg
      internal/
        company-logo.png
        brand-mark.svg

    fonts/
      Inter-Regular.woff2
      Inter-Bold.woff2
      Poppins-SemiBold.woff2

    images/
      backgrounds/
        gradient-blue.jpg
        pattern-dots.png
      textures/
        noise.png
        paper.jpg

    videos/
      stock/
        background-loop.mp4
      client-footage/
        acme-product.mp4

    audio/
      music/
        upbeat-corporate.mp3
      sfx/
        whoosh.wav
        pop.wav
```

---

## Naming Conventions

### File Naming Rules

**Format**: `{category}-{descriptor}-{variant}.{ext}`

**Examples**:
- `logo-acme-primary.png`
- `bg-gradient-blue.jpg`
- `font-inter-bold.woff2`
- `sfx-whoosh-01.wav`

**Rules**:
- Use lowercase
- Use hyphens (not underscores or spaces)
- Be descriptive but concise
- Include variant when multiple versions
- Version files: `-v1`, `-v2`, `-v3`

### ❌ Bad Names

```
Logo.png
LOGO_FINAL_FINAL.png
acme Corp Logo.png
logo1.png
IMG_1234.jpg
```

### ✅ Good Names

```
logo-acme-primary.png
logo-acme-white.png
bg-gradient-blue.jpg
font-inter-bold.woff2
sfx-whoosh-01.wav
```

---

## Asset Loading with staticFile()

### Basic Usage

```typescript
import { staticFile, Img } from 'remotion';

export const Logo: React.FC = () => {
  const logoUrl = staticFile('assets/logos/clients/acme-corp/logo-primary.png');

  return <Img src={logoUrl} alt="Acme Corp Logo" />;
};
```

### Dynamic Asset Loading

```typescript
type ClientLogoProps = {
  clientName: string;
  variant?: 'primary' | 'white' | 'black';
};

export const ClientLogo: React.FC<ClientLogoProps> = ({
  clientName,
  variant = 'primary',
}) => {
  const logoUrl = staticFile(
    `assets/logos/clients/${clientName}/logo-${variant}.png`
  );

  return <Img src={logoUrl} alt={`${clientName} logo`} />;
};

// Usage
<ClientLogo clientName="acme-corp" variant="white" />
```

---

## Asset Optimization

### Image Optimization

**JPEG**:
- Use for photos, complex images
- Quality: 80-90% (balance size/quality)
- No transparency support

**PNG**:
- Use for logos, graphics with transparency
- Optimize with tools like TinyPNG
- Larger file size than JPEG

**SVG**:
- Use for logos, icons (scalable!)
- Optimize with SVGO
- Smallest file size for vector graphics

**WebP**:
- Modern format, better compression
- Use when browser support allows
- Fallback to JPEG/PNG

### Recommended Image Sizes

```typescript
// Logo sizes
const logoSizes = {
  icon: 64,      // Small icon
  small: 128,    // Thumbnail
  medium: 256,   // Standard
  large: 512,    // High-res
  xl: 1024,      // Full screen
};

// Background sizes (match composition resolution)
const backgroundSizes = {
  hd: { width: 1920, height: 1080 },      // 1080p
  fullHd: { width: 1920, height: 1080 },  // 1080p
  qhd: { width: 2560, height: 1440 },     // 1440p
  uhd: { width: 3840, height: 2160 },     // 4K
};
```

### Video Optimization

```bash
# Compress video with ffmpeg
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# For background loops (smaller size)
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset medium -an output.mp4
```

---

## Font Management

### Web Font Loading

```typescript
import { staticFile } from 'remotion';

// In your composition
export const MyComposition: React.FC = () => {
  const fontUrl = staticFile('assets/fonts/Inter-Bold.woff2');

  return (
    <div
      style={{
        fontFamily: 'Inter',
        fontWeight: 'bold',
      }}
    >
      Text content
    </div>
  );
};

// Add @font-face in global CSS
/*
@font-face {
  font-family: 'Inter';
  src: url('/assets/fonts/Inter-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: block;
}
*/
```

### Font Loading Best Practices

- Use WOFF2 format (best compression)
- Only load needed weights
- Use `font-display: block` for Remotion
- Subset fonts if possible (latin only, etc.)

---

## Asset Configuration File

### Centralized Asset Registry

```typescript
// config/assets.ts
export const ASSETS = {
  logos: {
    clients: {
      acme: {
        primary: 'assets/logos/clients/acme-corp/logo-primary.png',
        white: 'assets/logos/clients/acme-corp/logo-white.png',
        black: 'assets/logos/clients/acme-corp/logo-black.png',
      },
      techstart: {
        primary: 'assets/logos/clients/techstart/logo-primary.svg',
      },
    },
    internal: {
      company: 'assets/logos/internal/company-logo.png',
    },
  },
  backgrounds: {
    gradients: {
      blue: 'assets/images/backgrounds/gradient-blue.jpg',
      purple: 'assets/images/backgrounds/gradient-purple.jpg',
    },
  },
  fonts: {
    inter: {
      regular: 'assets/fonts/Inter-Regular.woff2',
      bold: 'assets/fonts/Inter-Bold.woff2',
    },
  },
} as const;

// Helper function
export const getAsset = (path: string) => staticFile(path);

// Usage
import { ASSETS, getAsset } from '@/config/assets';

const logoUrl = getAsset(ASSETS.logos.clients.acme.primary);
```

---

## Asset Validation

### Type-Safe Asset Loading

```typescript
import { staticFile } from 'remotion';
import { z } from 'zod';

const assetPathSchema = z.string().refine(
  (path) => {
    // Validate path is within assets directory
    return path.startsWith('assets/');
  },
  { message: 'Asset path must start with assets/' }
);

export const loadAsset = (path: string): string => {
  const validated = assetPathSchema.parse(path);
  return staticFile(validated);
};

// Usage with runtime validation
try {
  const logoUrl = loadAsset('assets/logos/logo.png');
} catch (error) {
  console.error('Invalid asset path', error);
}
```

---

## .gitignore for Assets

### What to Commit

```gitignore
# ✅ Commit these
public/assets/logos/
public/assets/fonts/

# ❌ Don't commit these
public/assets/client-footage/      # Large video files
public/assets/temp/                # Temporary files
public/assets/renders/             # Rendered outputs
*.psd                              # Source files
*.ai                               # Source files
*.sketch                           # Source files
```

### Use Git LFS for Large Files

```bash
# Install Git LFS
git lfs install

# Track large assets
git lfs track "*.mp4"
git lfs track "*.mov"
git lfs track "*.wav"
git lfs track "*.mp3"

# Commit .gitattributes
git add .gitattributes
git commit -m "Track large media files with Git LFS"
```

---

## Asset Delivery

### CDN for Production Assets

```typescript
// config/cdn.ts
const CDN_URL = process.env.REMOTION_CDN_URL || '';

export const getAssetUrl = (path: string): string => {
  if (CDN_URL) {
    return `${CDN_URL}/${path}`;
  }
  return staticFile(path);
};

// Usage
const logoUrl = getAssetUrl('assets/logos/logo.png');
```

---

## Asset Preloading

### Preload Critical Assets

```typescript
import { delayRender, continueRender } from 'remotion';
import { useEffect, useState } from 'react';

export const usePreloadImages = (imageUrls: string[]) => {
  const [handle] = useState(() => delayRender());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const promises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    });

    Promise.all(promises)
      .then(() => {
        setLoaded(true);
        continueRender(handle);
      })
      .catch((error) => {
        console.error('Failed to preload images', error);
        continueRender(handle);
      });
  }, [imageUrls, handle]);

  return loaded;
};

// Usage
export const MyComposition: React.FC = () => {
  const logoUrls = [
    staticFile('assets/logos/logo1.png'),
    staticFile('assets/logos/logo2.png'),
  ];

  const loaded = usePreloadImages(logoUrls);

  if (!loaded) {
    return null;
  }

  return <div>{/* render */}</div>;
};
```

---

## Asset Documentation

### Asset Inventory

```markdown
# Asset Inventory

## Logos

### Acme Corp
- **Primary**: `assets/logos/clients/acme-corp/logo-primary.png` (512x512px, PNG)
- **White**: `assets/logos/clients/acme-corp/logo-white.png` (512x512px, PNG)
- **Black**: `assets/logos/clients/acme-corp/logo-black.png` (512x512px, PNG)
- **Usage**: All Acme Corp animations
- **Last Updated**: 2024-01-15

### TechStart
- **Primary**: `assets/logos/clients/techstart/logo-primary.svg` (Scalable, SVG)
- **Usage**: TechStart animations
- **Last Updated**: 2024-02-01

## Fonts

### Inter
- **Regular**: `assets/fonts/Inter-Regular.woff2`
- **Bold**: `assets/fonts/Inter-Bold.woff2`
- **License**: Open Font License
- **Usage**: All text animations
```

---

## Checklist

Before adding assets:

- [ ] File follows naming convention (lowercase, hyphens)
- [ ] Placed in correct folder (logos, fonts, images, etc.)
- [ ] Optimized for web (compressed, appropriate format)
- [ ] Appropriate size (not too large, not too small)
- [ ] Added to asset registry (if using)
- [ ] Documented in asset inventory
- [ ] Checked into version control (or Git LFS for large files)
- [ ] Tested loading in composition
- [ ] No sensitive information in file name or metadata
- [ ] License allows usage in project
