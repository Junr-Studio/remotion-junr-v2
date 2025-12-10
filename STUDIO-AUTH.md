# Remotion Studio Authentication

## Overview

Secure access to Remotion Studio using Supabase authentication. Users access the studio from the WeWeb ERP (axio.junr.studio) which passes session tokens via URL parameters.

## Architecture

```
┌─────────────────────┐         ┌─────────────────────────────────────┐
│  axio.junr.studio   │         │  studio.junr.studio                 │
│  (WeWeb ERP)        │────────▶│  ┌─────────────────────────────────┐│
│                     │         │  │ Express Auth Proxy + Remotion   ││
└─────────────────────┘         │  │ Studio (single process)         ││
   ?token=xxx                   │  │ Port: 3000                      ││
   &refresh_token=yyy           │  └─────────────────────────────────┘│
   &expires_at=zzz              └─────────────────────────────────────┘
```

**Stack**: Express middleware wrapping Remotion Studio (no reverse proxy).

## Authentication Flow

1. User clicks "Open Studio" in WeWeb ERP
2. ERP redirects to: `https://studio.junr.studio?token=xxx&refresh_token=yyy&expires_at=zzz`
3. Express middleware validates `expires_at`, stores tokens in HTTP-only cookies, redirects to clean URL
4. Subsequent requests: middleware checks cookie expiry, refreshes if needed (<5min left)
5. Session expires after 24 hours of inactivity → redirect to ERP

## Implementation

### Dependencies

```bash
pnpm add express cookie-parser http-proxy-middleware
pnpm add -D @types/express @types/cookie-parser concurrently tsx
```

### Environment Variables

```env
# .env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbG...
ERP_URL=https://axio.junr.studio

# Development only - set to "true" to skip all authentication
BYPASS_AUTH=false
```

### File Structure

```
src/
  server/
    auth-proxy.ts
```

### Implementation: src/server/auth-proxy.ts

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import { createClient } from '@supabase/supabase-js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cookieParser());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
);

const ERP_URL = process.env.ERP_URL || 'https://axio.junr.studio';
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';
const REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 min before expiry
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

app.use(async (req, res, next) => {
  // === DEV BYPASS ===
  if (BYPASS_AUTH) {
    return next();
  }

  // === NEW SESSION FROM URL ===
  if (req.query.token && req.query.refresh_token && req.query.expires_at) {
    const expiresAt = parseInt(req.query.expires_at as string) * 1000;

    if (expiresAt < Date.now()) {
      return res.redirect(ERP_URL);
    }

    const maxAge = Math.min(expiresAt - Date.now(), SESSION_MAX_AGE);
    res.cookie('studio_token', req.query.token, { ...secureCookieOptions, maxAge });
    res.cookie('studio_refresh', req.query.refresh_token, { ...secureCookieOptions, maxAge: SESSION_MAX_AGE });
    res.cookie('studio_expires', req.query.expires_at, { ...secureCookieOptions, maxAge });

    return res.redirect(req.path || '/');
  }

  // === EXISTING SESSION ===
  const token = req.cookies['studio_token'];
  const refreshToken = req.cookies['studio_refresh'];
  const expiresAt = parseInt(req.cookies['studio_expires'] || '0') * 1000;

  if (!token || !refreshToken) {
    return res.redirect(ERP_URL);
  }

  // Token still valid
  if (expiresAt > Date.now() + REFRESH_BUFFER) {
    return next();
  }

  // === REFRESH NEEDED ===
  const { data, error } = await supabase.auth.setSession({
    access_token: token,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    res.clearCookie('studio_token');
    res.clearCookie('studio_refresh');
    res.clearCookie('studio_expires');
    return res.redirect(ERP_URL);
  }

  const newExpiresAt = data.session.expires_at!;
  const maxAge = Math.min(newExpiresAt * 1000 - Date.now(), SESSION_MAX_AGE);

  res.cookie('studio_token', data.session.access_token, { ...secureCookieOptions, maxAge });
  res.cookie('studio_refresh', data.session.refresh_token!, { ...secureCookieOptions, maxAge: SESSION_MAX_AGE });
  res.cookie('studio_expires', newExpiresAt.toString(), { ...secureCookieOptions, maxAge });

  return next();
});

// Proxy to Remotion Studio
app.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:3001', // Remotion runs on 3001
    ws: true,
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth proxy on port ${PORT}, proxying to Remotion on 3001`);
  console.log(`BYPASS_AUTH: ${BYPASS_AUTH}`);
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "remotion studio --port 3001",
    "dev:auth": "concurrently \"pnpm dev\" \"tsx src/server/auth-proxy.ts\"",
    "start": "concurrently \"remotion studio --port 3001\" \"tsx src/server/auth-proxy.ts\""
  }
}
```

## Development

```bash
# Set in .env.local
BYPASS_AUTH=true

# Run with auth proxy (bypassed)
pnpm dev:auth
# Access at http://localhost:3000
```

## Production

```bash
# .env (on deployment platform)
BYPASS_AUTH=false
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbG...
ERP_URL=https://axio.junr.studio
NODE_ENV=production

# Start command
pnpm start
```

Platform exposes port 3000 (auth proxy). Remotion runs internally on 3001.

## WeWeb Configuration

Button action to open studio:

```
https://studio.junr.studio?token={{supabase.auth.session.access_token}}&refresh_token={{supabase.auth.session.refresh_token}}&expires_at={{supabase.auth.session.expires_at}}
```

## Rules for Implementation

1. **Single entry point**: Express on port 3000, Remotion on 3001 (internal)
2. **No reverse proxy**: Express handles everything
3. **Session duration**: 24 hours max, then redirect to ERP
4. **Dev bypass**: `BYPASS_AUTH=true` skips all auth
5. **Cookies**: HTTP-only, secure in production, SameSite=strict
6. **Token refresh**: Automatic when <5 min remaining
7. **No per-request validation**: Trust cookie until expiry/refresh
