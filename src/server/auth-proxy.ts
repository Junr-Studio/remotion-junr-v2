import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cookieParser());

const ERP_URL = process.env.ERP_URL || 'https://axio.junr.studio';
const BYPASS_AUTH = process.env.BYPASS_AUTH === 'true';

// Only create Supabase client if not bypassing auth and credentials exist
let supabase: SupabaseClient | null = null;
if (!BYPASS_AUTH) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required when BYPASS_AUTH is not true');
    process.exit(1);
  }
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
  );
}
const REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 min before expiry
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // 'lax' allows cookies on cross-site top-level navigations (clicking links)
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

    // Validate path to prevent open redirect
    const safePath = req.path && req.path.startsWith('/') && !req.path.startsWith('//')
      ? req.path
      : '/';
    return res.redirect(safePath);
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
  const { data, error } = await supabase!.auth.setSession({
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

const REMOTION_PORT = process.env.REMOTION_PORT || 3001;
const REMOTION_TARGET = `http://localhost:${REMOTION_PORT}`;

// Serve rendered videos from the out/ directory
// This allows downloads to work in production where the filesystem is ephemeral
const outDir = path.join(process.cwd(), 'out');

// API endpoint to list rendered files
app.get('/api/renders', (_req, res) => {
  try {
    if (!fs.existsSync(outDir)) {
      return res.json({ files: [] });
    }
    const files = fs.readdirSync(outDir)
      .filter(f => ['.mp4', '.webm', '.mov', '.gif'].includes(path.extname(f).toLowerCase()))
      .map(f => {
        const stats = fs.statSync(path.join(outDir, f));
        return {
          name: f,
          url: `/out/${f}`,
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    return res.json({ files });
  } catch (err) {
    console.error('Error listing renders:', err);
    return res.status(500).json({ error: 'Failed to list renders' });
  }
});

// Serve static files from out/ directory
app.use('/out', express.static(outDir, {
  setHeaders: (res, filePath) => {
    // Set content-disposition for video files to trigger download
    const ext = path.extname(filePath).toLowerCase();
    if (['.mp4', '.webm', '.mov', '.gif'].includes(ext)) {
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    }
  }
}));

// Proxy to Remotion Studio with retry on connection errors
app.use(
  '/',
  createProxyMiddleware({
    target: REMOTION_TARGET,
    ws: true,
    changeOrigin: true,
    on: {
      error: (err, _req, res) => {
        console.error('Proxy error:', err.message);
        if ('writeHead' in res && typeof res.writeHead === 'function') {
          res.writeHead(503, { 'Content-Type': 'text/plain' });
          res.end('Remotion Studio is starting up, please refresh in a few seconds...');
        }
      },
    },
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Auth proxy on port ${PORT}, proxying to Remotion on ${REMOTION_PORT}`);
  console.log(`BYPASS_AUTH: ${BYPASS_AUTH}`);
});
