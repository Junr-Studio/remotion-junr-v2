# Remotion Studio Server

This document explains how to run the authenticated Remotion Studio server and integrate it with Supabase authentication.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   WeWeb ERP     │────▶│   Auth Proxy     │────▶│ Remotion Studio │
│ (axio.junr...)  │     │   (Port 8080)    │     │  (Port 3001)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌──────────────────┐
        └──────────────▶│    Supabase      │
                        │  (Auth Provider) │
                        └──────────────────┘
```

## Quick Start

### Development (No Auth)

```bash
# Direct access to Remotion Studio
pnpm dev
# Access at http://localhost:3001
```

### Development (With Auth Bypass)

```bash
# Set BYPASS_AUTH=true in .env
pnpm dev:auth
# Access at http://localhost:3000 (no token needed)
```

### Production

```bash
# Ensure .env is configured
pnpm start
# Auth proxy on PORT (default 3000, Railway uses 8080)
# Remotion Studio on 3001 (internal)
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | Yes* | - | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Yes* | - | Supabase anon/public key |
| `ERP_URL` | No | `https://axio.junr.studio` | Redirect URL when auth fails |
| `BYPASS_AUTH` | No | `false` | Set to `true` to skip auth (dev only) |
| `NODE_ENV` | No | `development` | Set to `production` for secure cookies |
| `PORT` | No | `3000` | Auth proxy port (Railway sets to 8080) |
| `REMOTION_PORT` | No | `3001` | Internal Remotion Studio port |

*Required when `BYPASS_AUTH` is not `true`

## Authentication Flow

### 1. User Clicks "Open Studio" in WeWeb ERP

The ERP constructs a URL with Supabase session tokens:

```
https://your-studio-url.com?token={{access_token}}&refresh_token={{refresh_token}}&expires_at={{expires_at}}
```

### 2. URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `token` | Supabase access token (JWT) | `eyJhbGciOiJIUzI1NiIs...` |
| `refresh_token` | Supabase refresh token | `v1.MGRjY2...` |
| `expires_at` | Token expiry (Unix timestamp in seconds) | `1702234567` |

### 3. Auth Proxy Validates & Stores Session

The proxy:
1. Validates the tokens aren't expired
2. Stores them in HTTP-only cookies
3. Redirects to clean URL (strips tokens from URL)

### 4. Subsequent Requests

- Cookies are sent automatically
- Proxy validates session on each request
- Auto-refreshes tokens 5 minutes before expiry
- Redirects to ERP if session invalid

## WeWeb Integration

### Button Configuration

In your WeWeb ERP, configure the "Open Studio" button:

**Action**: Navigate to URL

**URL Formula**:
```javascript
`https://YOUR-STUDIO-URL?token=${supabaseAuth.access_token}&refresh_token=${supabaseAuth.refresh_token}&expires_at=${Math.floor(supabaseAuth.expires_at / 1000)}`
```

Or if using WeWeb variables:
```
https://YOUR-STUDIO-URL?token={{supabase.access_token}}&refresh_token={{supabase.refresh_token}}&expires_at={{supabase.expires_at_seconds}}
```

**Important**: `expires_at` must be in **seconds** (Unix timestamp), not milliseconds.

## Deployment (Railway)

### 1. Connect Repository

Link your GitHub repository to Railway.

### 2. Set Environment Variables

In Railway dashboard, add:
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
ERP_URL=https://your-erp-url.com
NODE_ENV=production
BYPASS_AUTH=false
```

Railway automatically sets `PORT=8080`.

### 3. Deploy

Railway will run `pnpm start` automatically.

### 4. Custom Domain (Optional)

Add a custom domain in Railway settings (e.g., `studio.yourdomain.com`).

## Security Notes

- **Tokens are never stored in localStorage** - HTTP-only cookies only
- **Cookies use `sameSite: strict`** - Prevents CSRF attacks
- **Secure flag in production** - Cookies only sent over HTTPS
- **Auto-refresh** - Tokens refreshed 5 min before expiry
- **24-hour max session** - Forces re-authentication daily
- **Open redirect protection** - URL path validated before redirect

## Troubleshooting

### 502 Bad Gateway

Remotion Studio may not be ready yet. Wait a few seconds and refresh.

### 503 Service Unavailable

Same as above - the proxy shows this when Remotion is starting up.

### Redirect Loop to ERP

- Check that tokens are being passed correctly in the URL
- Verify `expires_at` is in seconds, not milliseconds
- Check Supabase credentials in environment variables

### Cookies Not Being Set

- Ensure `NODE_ENV=production` for HTTPS deployments
- Check browser isn't blocking third-party cookies
- Verify the domain matches your deployment URL
