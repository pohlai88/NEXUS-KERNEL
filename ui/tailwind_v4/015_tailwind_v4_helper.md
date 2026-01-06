### pages/_app.jsx — Theme provider and toggle helper (Pages router)

Drop this into `pages/_app.jsx`. It sets up a theme context, writes both `localStorage` and a `theme` cookie for SSR hydration, and exposes a `useTheme` hook and `ThemeToggle` component you can reuse across the app. It avoids flash-of-incorrect-theme by relying on the `_document.js` hydration script you already have.

```jsx
// pages/_app.jsx
import '../styles/tokens.css'; // MUST import tokens before Tailwind utilities
import '../styles/globals.css';
import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

/**
 * ThemeContext provides theme state and a toggle helper.
 * It writes both localStorage and a cookie named "theme" so SSR can read it.
 *
 * Usage:
 *   import { useTheme, ThemeToggle } from '../path/to/_app.jsx';
 *   const { theme, setTheme, toggleTheme } = useTheme();
 *   <ThemeToggle />
 */

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme() {
  try {
    // Prefer cookie (SSR-friendly), then localStorage, then system preference
    if (typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match('(^|;)\\s*theme\\s*=\\s*([^;]+)');
      if (cookieMatch) return cookieMatch.pop();
      if (window.localStorage) {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
      }
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
  } catch (e) {
    // fallback
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => (typeof window === 'undefined' ? 'light' : getInitialTheme()));

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
      // Persist both localStorage and cookie for SSR and edge middleware
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('theme', theme);
        } catch (e) {
          // ignore storage errors
        }
      }
      // Cookie: secure, path=/, SameSite=Lax; set expiry 365 days
      Cookies.set('theme', theme, { expires: 365, sameSite: 'lax', secure: typeof window !== 'undefined' && window.location.protocol === 'https:' });
    } catch (err) {
      // fail silently
      // eslint-disable-next-line no-console
      console.error('Theme persist error', err);
    }
  }, [theme]);

  const setTheme = (value) => setThemeState(value);
  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      aria-pressed={theme === 'dark'}
      onClick={toggleTheme}
      className={`px-3 py-2 rounded-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
      title="Toggle theme"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
};

ThemeToggle.defaultProps = {
  className: '',
};

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};
```

**Notes and integration**
- Install helper deps: `npm i js-cookie prop-types`.
- Keep the `_document.js` hydration script you already added; it reads the `theme` cookie before hydration and prevents FOUC.
- Use `ThemeToggle` anywhere in your UI. For server-side rendering that needs theme-aware markup, read the `theme` cookie in `getServerSideProps` or middleware.

---

### scripts/compress-and-upload.js — Compress and optionally upload compressed assets to CDN

This script compresses `.js`, `.css`, `.html`, `.json`, `.svg`, and `.wasm` files under `.next/static` using Brotli and Gzip, then optionally uploads the compressed files to a CDN. It supports two upload modes: **S3** (recommended for AWS-backed CDNs) and **HTTP PUT** to a generic endpoint. Configure via environment variables.

```js
// scripts/compress-and-upload.js
// Usage:
//   NODE_ENV=production node scripts/compress-and-upload.js
// Environment variables:
//   UPLOAD_PROVIDER = 'none' | 's3' | 'http'   (default: 'none')
//   For S3:
//     S3_BUCKET, S3_REGION, S3_PREFIX (optional), AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
//   For HTTP:
//     HTTP_UPLOAD_URL (base URL), HTTP_AUTH_HEADER (optional, e.g., "Bearer TOKEN")
//
// Dev deps: npm i -D @aws-sdk/client-s3
// Run after `next build` in CI: node scripts/compress-and-upload.js

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const pipe = promisify(pipeline);
const root = path.resolve(process.cwd(), '.next', 'static');
const brotliOptions = { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } };

const UPLOAD_PROVIDER = process.env.UPLOAD_PROVIDER || 'none';

let s3Client;
let S3Bucket;
let S3Prefix = '';

if (UPLOAD_PROVIDER === 's3') {
  // Lazy import to avoid requiring AWS SDK when not used
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  s3Client = new S3Client({ region: process.env.S3_REGION });
  S3Bucket = process.env.S3_BUCKET;
  S3Prefix = process.env.S3_PREFIX || '';
  if (!S3Bucket) {
    console.error('S3_BUCKET is required for S3 upload');
    process.exit(1);
  }
  // attach to global for upload function
  global.__S3 = { client: s3Client, PutObjectCommand, bucket: S3Bucket, prefix: S3Prefix };
}

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const compressible = ['.js', '.css', '.html', '.json', '.svg', '.wasm'];
  if (!compressible.includes(ext)) return null;

  const stat = await fs.stat(filePath);
  if (!stat.isFile()) return null;

  // Brotli
  const brotliPath = `${filePath}.br`;
  await pipe(fs.createReadStream(filePath), zlib.createBrotliCompress(brotliOptions), fs.createWriteStream(brotliPath));

  // Gzip
  const gzipPath = `${filePath}.gz`;
  await pipe(fs.createReadStream(filePath), zlib.createGzip({ level: 9 }), fs.createWriteStream(gzipPath));

  return { original: filePath, brotli: brotliPath, gzip: gzipPath };
}

async function walk(dir, results = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

async function uploadToS3(localPath, remoteKey, contentEncoding) {
  const { client, PutObjectCommand, bucket, prefix } = global.__S3;
  const key = prefix ? `${prefix.replace(/\/$/, '')}/${remoteKey}` : remoteKey;
  const body = await fs.readFile(localPath);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentEncoding: contentEncoding,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000, immutable',
  };
  await client.send(new PutObjectCommand(params));
  console.log('Uploaded to S3:', key);
}

async function uploadToHttp(localPath, remotePath, contentEncoding) {
  const base = process.env.HTTP_UPLOAD_URL;
  if (!base) {
    throw new Error('HTTP_UPLOAD_URL is required for HTTP upload');
  }
  const url = `${base.replace(/\/$/, '')}/${remotePath.replace(/^\//, '')}`;
  const body = await fs.readFile(localPath);
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Encoding': contentEncoding,
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
  if (process.env.HTTP_AUTH_HEADER) headers.Authorization = process.env.HTTP_AUTH_HEADER;
  const res = await fetch(url, { method: 'PUT', headers, body });
  if (!res.ok) throw new Error(`Upload failed ${res.status} ${res.statusText}`);
  console.log('Uploaded to HTTP:', url);
}

(async function main() {
  console.log('Compress and upload starting. Provider:', UPLOAD_PROVIDER);
  const files = await walk(root);
  const compressPromises = files.map((f) => compressFile(f));
  const compressed = (await Promise.all(compressPromises)).filter(Boolean);

  console.log(`Compressed ${compressed.length} files.`);

  if (UPLOAD_PROVIDER === 'none') {
    console.log('Skipping upload. Set UPLOAD_PROVIDER to s3 or http to enable upload.');
    process.exit(0);
  }

  for (const item of compressed) {
    // remote key relative to .next/static
    const rel = path.relative(root, item.brotli).replace(/\.br$/, '');
    const remoteKeyBase = rel; // e.g., chunks/abc.js
    try {
      if (UPLOAD_PROVIDER === 's3') {
        await uploadToS3(item.brotli, `${remoteKeyBase}.br`, 'br');
        await uploadToS3(item.gzip, `${remoteKeyBase}.gz`, 'gzip');
      } else if (UPLOAD_PROVIDER === 'http') {
        await uploadToHttp(item.brotli, `${remoteKeyBase}.br`, 'br');
        await uploadToHttp(item.gzip, `${remoteKeyBase}.gz`, 'gzip');
      }
    } catch (err) {
      console.error('Upload error for', item.original, err);
      // continue with others but mark failure
    }
  }

  console.log('Compress and upload complete.');
})();
```

**Install required dev dependencies**
```bash
npm install -D @aws-sdk/client-s3
# If you use node <18 and need fetch polyfill, add node-fetch
```

**Environment variables example (GitHub Actions)**
```yaml
env:
  UPLOAD_PROVIDER: s3
  S3_BUCKET: your-bucket-name
  S3_REGION: us-east-1
  S3_PREFIX: my-app/static
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

**CI integration**
- Run `npm run build` (Next.js build).
- Run `node scripts/compress-and-upload.js`.
- Ensure your CDN is configured to prefer `.br` or `.gz` when the client supports it. For S3 + CloudFront, configure CloudFront to forward `Accept-Encoding` and set proper behaviors to serve precompressed objects.

---

### Quick checklist and safety notes
- Add `pages/_app.jsx` and keep your `_document.js` hydration script to avoid FOUC.  
- Ensure `tokens.css` is imported before Tailwind utilities.  
- For uploads to S3, grant the CI IAM principal `s3:PutObject` on the target prefix.  
- Test locally: run `next build`, then `node scripts/compress-and-upload.js` with `UPLOAD_PROVIDER=none` to verify compression only.  
- Verify CDN serves `.br`/`.gz` correctly in staging before enabling in production.

If you want, I can now:
- Produce a `scripts/upload-to-cdn-only.sh` wrapper for common CI providers, or
- Generate a small Playwright snippet that verifies the CDN serves `.br`/`.gz` for a given asset URL.

Which would you like next.