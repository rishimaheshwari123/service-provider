# Performance Optimization Guide

## Current Issues (PageSpeed Score: 58)

### 1. Largest Contentful Paint: 4.4s
- **Target:** < 2.5s
- **Fix:** Image optimization, lazy loading, code splitting

### 2. Unused JavaScript: 657 KiB
- **Fix:** Code splitting, tree shaking, dynamic imports

### 3. Unused CSS: 35 KiB
- **Fix:** PurgeCSS, remove unused Tailwind classes

### 4. Image Delivery: 90.473 KiB savings
- **Fix:** WebP format, compression, lazy loading

### 5. Cache Lifetime: 982 KiB
- **Fix:** Add cache headers in server config

---

## Fixes Applied

### ✅ 1. Vite Build Optimization
- Added code splitting for vendors
- Enabled Terser minification
- Removed console logs in production
- Split chunks: react-vendor, ui-vendor, icons, i18n

### ✅ 2. Lazy Loading Component
- Created `LazyImage` component
- Intersection Observer for lazy loading
- Placeholder images
- Smooth fade-in transitions

### ✅ 3. Image Optimization
- Added `loading="lazy"` to images
- Added `decoding="async"` for better performance

---

## Additional Optimizations Needed

### 1. Server-Side Optimizations

#### Add to server/index.js:
```javascript
// Compression middleware
const compression = require('compression');
app.use(compression());

// Cache headers
app.use((req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.url.match(/\.(js|css)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});
```

#### Install compression:
```bash
cd server
npm install compression
```

### 2. Image Optimization

#### Convert images to WebP:
```bash
npm install sharp
```

#### Update S3 uploader to create WebP:
- Modify `server/config/s3Uploader.js`
- Convert images to WebP format
- Reduce quality to 80%

### 3. Frontend Optimizations

#### Use React.lazy for route-based code splitting:
```typescript
// In App.tsx or routes
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
  </Routes>
</Suspense>
```

### 4. CSS Optimization

#### Add PurgeCSS to Tailwind config:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of config
}
```

### 5. Font Optimization

#### Preload critical fonts:
```html
<!-- In index.html -->
<link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossorigin>
```

### 6. Critical CSS

#### Inline critical CSS in index.html:
```html
<style>
  /* Critical above-the-fold CSS */
  body { margin: 0; font-family: system-ui; }
  .hero { min-height: 100vh; }
</style>
```

---

## Quick Wins (Do These First)

### 1. Build and Deploy
```bash
npm run build
```

### 2. Enable Compression (Server)
```bash
cd server
npm install compression
```

Add to `server/index.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Add Cache Headers
Update your hosting provider (Vercel/Netlify) config:

**vercel.json:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 4. Optimize Images in S3
- Use WebP format
- Compress to 80% quality
- Add proper cache headers in S3 bucket

---

## Expected Results After Fixes

- **Performance:** 58 → 85+
- **LCP:** 4.4s → 2.0s
- **JavaScript:** -657 KiB (code splitting)
- **Images:** -90 KiB (WebP + compression)
- **Cache:** -982 KiB (proper headers)

---

## Testing

### 1. Local Build Test
```bash
npm run build
npm run preview
```

### 2. PageSpeed Test
https://pagespeed.web.dev/

### 3. Lighthouse (Chrome DevTools)
- Open DevTools
- Go to Lighthouse tab
- Run audit

---

## Monitoring

### Track Performance:
1. Google Analytics - Page Load Time
2. Vercel Analytics (if using Vercel)
3. Regular PageSpeed audits

---

## Priority Order

1. ✅ **Done:** Vite optimization, lazy loading
2. **High:** Server compression, cache headers
3. **High:** Image WebP conversion
4. **Medium:** Route-based code splitting
5. **Medium:** CSS purging
6. **Low:** Font optimization, critical CSS

---

**Next Steps:**
1. Install compression in server
2. Add cache headers
3. Convert images to WebP
4. Deploy and test
