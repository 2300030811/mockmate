# File Analysis Summary

## ✅ REQUIRED Files (Keep These)

### `app/fonts/Inter-SemiBold.ttf` (309KB)

- **Purpose**: Used by `opengraph-image.tsx` for social media previews
- **Impact if removed**: Twitter/Facebook/LinkedIn cards won't display properly
- **Recommendation**: **KEEP**

### `app/favicon.ico` (15KB)

- **Purpose**: Browser tab icon
- **Impact if removed**: Browser will show default icon
- **Recommendation**: **KEEP**

## ❌ UNNECESSARY Files (Safe to Remove)

### `public/ffmpeg/` folder (23.44MB)

- **Purpose**: Was used for client-side audio transcoding
- **Current status**: NOT USED (switched to Gemini API)
- **Impact if removed**: None - we're using server-side Gemini now
- **Recommendation**: **REMOVE** (saves 23.44MB)

### Unused npm packages (can be removed):

```bash
npm uninstall @ffmpeg/ffmpeg @ffmpeg/core
```

This will save additional space in node_modules.

## 📊 Size Breakdown

Current project: ~512MB

- node_modules: ~487MB
- public/ffmpeg: 23.44MB (can remove)
- Source code: ~1.5MB
- Other assets: ~0.5MB

**After cleanup**: ~488MB (24MB saved)

## 🧹 Recommended Cleanup Commands

```powershell
# Remove unused ffmpeg files
Remove-Item -Recurse -Force public/ffmpeg

# Remove unused npm packages
npm uninstall @ffmpeg/ffmpeg @ffmpeg/core

# Rebuild to ensure everything works
npm run build
```

## ⚠️ DO NOT REMOVE

- `app/fonts/` - Required for Open Graph images
- `app/favicon.ico` - Required for browser icon
- `public/apple-touch-icon.png` - Used by iOS devices
- Any files in `components/` or `utils/`
