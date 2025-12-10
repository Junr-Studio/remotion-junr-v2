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
