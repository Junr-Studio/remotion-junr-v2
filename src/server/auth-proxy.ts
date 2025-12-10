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

// Downloads page with auto-download on new renders
app.get('/downloads', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remotion Downloads</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 2rem; }
    h1 { margin-bottom: 1rem; }
    .status { padding: 0.5rem 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem; }
    .status.watching { background: #1a3a1a; border: 1px solid #2d5a2d; }
    .status.downloading { background: #3a3a1a; border: 1px solid #5a5a2d; }
    .files { list-style: none; }
    .file { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
    .file-info { flex: 1; }
    .file-name { font-weight: 600; margin-bottom: 0.25rem; }
    .file-meta { font-size: 0.8rem; color: #888; }
    .download-btn { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; text-decoration: none; }
    .download-btn:hover { background: #2563eb; }
    .new { animation: pulse 2s ease-in-out; }
    @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } 50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.3); } }
    .empty { color: #666; font-style: italic; }
    .toggle { margin-bottom: 1rem; }
    .toggle label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .back-link { color: #3b82f6; text-decoration: none; margin-bottom: 1rem; display: inline-block; }
  </style>
</head>
<body>
  <a href="/" class="back-link">&larr; Back to Studio</a>
  <h1>Rendered Videos</h1>
  <div class="toggle">
    <label><input type="checkbox" id="autoDownload" checked> Auto-download new renders</label>
  </div>
  <div id="status" class="status watching">Watching for new renders...</div>
  <ul id="files" class="files"></ul>

  <script>
    let knownFiles = new Set();
    let autoDownload = true;
    const statusEl = document.getElementById('status');
    const filesEl = document.getElementById('files');
    const autoDownloadEl = document.getElementById('autoDownload');

    autoDownloadEl.addEventListener('change', (e) => {
      autoDownload = e.target.checked;
      statusEl.textContent = autoDownload ? 'Watching for new renders...' : 'Auto-download disabled';
      statusEl.className = 'status watching';
    });

    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    }

    function triggerDownload(url, name) {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    async function checkRenders() {
      try {
        const res = await fetch('/api/renders', { credentials: 'include' });

        // Check if we got redirected (auth issue)
        if (res.redirected) {
          statusEl.textContent = 'Auth error - redirected. Try refreshing page.';
          statusEl.className = 'status downloading';
          console.error('Redirected to:', res.url);
          return;
        }

        if (!res.ok) {
          statusEl.textContent = 'API error: ' + res.status + ' ' + res.statusText;
          statusEl.className = 'status downloading';
          console.error('API error:', res.status, await res.text());
          return;
        }

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          statusEl.textContent = 'Invalid response - not JSON';
          statusEl.className = 'status downloading';
          console.error('Not JSON, got:', contentType, await res.text());
          return;
        }

        const data = await res.json();

        // Check for new files
        const newFiles = data.files.filter(f => !knownFiles.has(f.name));

        // Debug info
        console.log('Renders API response:', data);
        console.log('Known files:', [...knownFiles]);
        console.log('New files:', newFiles);

        // Update UI
        if (data.files.length === 0) {
          filesEl.innerHTML = '<li class="empty">No rendered videos yet. Render something in the Studio!</li>';
        } else {
          filesEl.innerHTML = data.files.map(f => {
            const isNew = newFiles.some(nf => nf.name === f.name);
            return \`<li class="file \${isNew ? 'new' : ''}">
              <div class="file-info">
                <div class="file-name">\${f.name}</div>
                <div class="file-meta">\${formatSize(f.size)} &bull; \${formatDate(f.created)}</div>
              </div>
              <a href="\${f.url}" class="download-btn" download>Download</a>
            </li>\`;
          }).join('');
        }

        // Auto-download new files
        if (autoDownload && newFiles.length > 0) {
          statusEl.textContent = 'Downloading ' + newFiles.map(f => f.name).join(', ') + '...';
          statusEl.className = 'status downloading';

          for (const file of newFiles) {
            triggerDownload(file.url, file.name);
          }

          setTimeout(() => {
            statusEl.textContent = 'Watching for new renders...';
            statusEl.className = 'status watching';
          }, 3000);
        }

        // Update known files
        knownFiles = new Set(data.files.map(f => f.name));
      } catch (err) {
        console.error('Error checking renders:', err);
      }
    }

    // Initial check
    checkRenders();

    // Poll every 2 seconds
    setInterval(checkRenders, 2000);
  </script>
</body>
</html>`);
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
