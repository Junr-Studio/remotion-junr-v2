# Security Best Practices for Remotion

## Core Principles

1. **No Secrets in Code**: Never hardcode API keys, credentials, or sensitive data
2. **Validate External Data**: Sanitize any user input or external data sources
3. **Asset Integrity**: Verify asset sources and prevent malicious content
4. **Secure Dependencies**: Keep packages updated, audit for vulnerabilities

---

## Secrets Management

### ❌ Never Hardcode Secrets

```typescript
// ❌ BAD - Secret in code
const API_KEY = 'sk_live_abc123...';

// ❌ BAD - Secret in composition props
<Composition
  defaultProps={{
    apiKey: 'sk_live_abc123...',
  }}
  {...}
/>
```

### ✅ Use Environment Variables

```typescript
// ✅ Good - use environment variables
const API_KEY = process.env.REMOTION_API_KEY;

if (!API_KEY) {
  throw new Error('REMOTION_API_KEY not set');
}
```

### .env File (Never Commit!)

```bash
# .env (add to .gitignore)
REMOTION_API_KEY=sk_live_abc123...
REMOTION_WEBHOOK_SECRET=whsec_xyz789...
```

### .gitignore

```
.env
.env.local
.env.*.local
credentials.json
secrets/
```

---

## Input Validation

### Validate Composition Props

```typescript
import { z } from 'zod';

// Define schema for runtime validation
const logoPropsSchema = z.object({
  logoUrl: z.string().url(), // Must be valid URL
  title: z.string().min(1).max(100), // Length limits
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/), // Valid hex color
  scale: z.number().min(0.1).max(10), // Reasonable range
});

export const LogoAnimation: React.FC<LogoPropsType> = (props) => {
  // Validate at runtime
  const validated = logoPropsSchema.parse(props);

  // Use validated props
  return <div>{/* render */}</div>;
};
```

### Sanitize External Data

```typescript
// ❌ Bad - untrusted data directly in DOM
const userText = fetchFromAPI();
return <div dangerouslySetInnerHTML={{ __html: userText }} />;

// ✅ Good - sanitize or use text content
import DOMPurify from 'dompurify';

const userText = fetchFromAPI();
const sanitized = DOMPurify.sanitize(userText);
return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;

// ✅ Better - avoid innerHTML
const userText = fetchFromAPI();
return <div>{userText}</div>; // React escapes automatically
```

---

## Asset Security

### Validate Asset URLs

```typescript
// ✅ Validate asset URLs before loading
const isValidAssetUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Only allow specific domains
    const allowedDomains = [
      'yourdomain.com',
      'assets.yourdomain.com',
      's3.amazonaws.com',
    ];

    return allowedDomains.some(domain => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
};

export const Logo: React.FC<{ logoUrl: string }> = ({ logoUrl }) => {
  if (!isValidAssetUrl(logoUrl)) {
    console.error('Invalid asset URL:', logoUrl);
    return <div>Invalid logo URL</div>;
  }

  return <Img src={logoUrl} alt="Logo" />;
};
```

### Use staticFile() for Local Assets

```typescript
import { staticFile } from 'remotion';

// ✅ Good - local assets via staticFile
const logoUrl = staticFile('logos/company-logo.png');

<Img src={logoUrl} alt="Logo" />
```

---

## Dependency Security

### Keep Dependencies Updated

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix

# Update dependencies
pnpm update
```

### .npmrc Security

```
# Prevent package-lock changes
package-lock=false

# Only install from official registry
registry=https://registry.npmjs.org/
```

---

## Data Exposure Prevention

### ❌ Don't Log Sensitive Data

```typescript
// ❌ Bad - logs sensitive data
console.log('User data:', {
  email: user.email,
  apiKey: user.apiKey, // Exposed in logs!
});

// ✅ Good - sanitize logs
console.log('User data:', {
  email: user.email,
  apiKey: '[REDACTED]',
});
```

### ❌ Don't Include Secrets in Error Messages

```typescript
// ❌ Bad - secret in error
throw new Error(`API call failed with key: ${API_KEY}`);

// ✅ Good - generic error
throw new Error('API call failed');
```

---

## File System Security

### Validate File Paths

```typescript
import path from 'path';

// ✅ Validate file paths to prevent directory traversal
const validateAssetPath = (filePath: string): boolean => {
  const publicDir = path.resolve('./public');
  const resolved = path.resolve(publicDir, filePath);

  // Ensure path is within public directory
  return resolved.startsWith(publicDir);
};

export const loadAsset = (filePath: string) => {
  if (!validateAssetPath(filePath)) {
    throw new Error('Invalid file path');
  }

  return staticFile(filePath);
};
```

---

## API Security

### Secure API Calls

```typescript
// ✅ Use HTTPS only
const API_URL = 'https://api.example.com'; // Not http://

// ✅ Include authentication headers
const fetchData = async () => {
  const response = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('API request failed');
  }

  return response.json();
};
```

### Rate Limiting

```typescript
// ✅ Implement basic rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

const rateLimitedFetch = async (url: string) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    throw new Error('Rate limit exceeded');
  }

  lastRequestTime = now;
  return fetch(url);
};
```

---

## Client Assets

### Content Security Policy

When serving Remotion Player:

```html
<!-- Add CSP headers to prevent XSS -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline';
               style-src 'self' 'unsafe-inline';
               img-src 'self' https:;
               font-src 'self';" />
```

---

## Common Vulnerabilities to Avoid

### XSS (Cross-Site Scripting)

```typescript
// ❌ Vulnerable to XSS
const userInput = props.title;
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ✅ Safe - React escapes automatically
return <div>{userInput}</div>;
```

### Path Traversal

```typescript
// ❌ Vulnerable to path traversal
const fileName = props.fileName;
const filePath = staticFile(`logos/${fileName}`); // Could be '../../../etc/passwd'

// ✅ Safe - validate and sanitize
const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '');
const filePath = staticFile(`logos/${safeFileName}`);
```

### Prototype Pollution

```typescript
// ❌ Vulnerable to prototype pollution
const merge = (target: any, source: any) => {
  for (const key in source) {
    target[key] = source[key]; // Could set __proto__
  }
};

// ✅ Safe - use Object.assign or spread
const merged = { ...target, ...source };
```

---

## Checklist

Before committing code:

- [ ] No hardcoded secrets (API keys, tokens, passwords)
- [ ] Secrets use environment variables
- [ ] .env file is in .gitignore
- [ ] External data is validated (Zod schema)
- [ ] Asset URLs are validated (domain whitelist)
- [ ] No sensitive data in console.log or errors
- [ ] Dependencies are up to date (pnpm audit)
- [ ] File paths are validated (no directory traversal)
- [ ] API calls use HTTPS only
- [ ] No dangerouslySetInnerHTML with untrusted data
- [ ] User input is sanitized

---

## Security Severity Levels

### 🔴 Critical (Fix Immediately)

- Hardcoded API keys or secrets
- SQL injection vulnerabilities
- Command injection vulnerabilities
- Unauthenticated API endpoints exposing sensitive data

### 🟠 High (Fix Soon)

- XSS vulnerabilities
- Path traversal vulnerabilities
- Sensitive data in logs
- Using HTTP instead of HTTPS

### 🟡 Medium (Should Fix)

- Missing input validation
- Outdated dependencies with known vulnerabilities
- Missing rate limiting
- Weak CSP headers

### 🟢 Low (Consider)

- Minor dependencies out of date
- Missing security headers (non-critical)
- Overly permissive CORS

---

## Remotion-Specific Security Notes

1. **Rendering Context**: When using Remotion Lambda, rendered videos are temporary - ensure they're deleted after use if sensitive
2. **Props Serialization**: Composition props are serialized - never include secrets
3. **Static Files**: Public folder is publicly accessible - don't put secrets there
4. **API Calls**: Data fetched in compositions is baked into video - be careful with sensitive data
