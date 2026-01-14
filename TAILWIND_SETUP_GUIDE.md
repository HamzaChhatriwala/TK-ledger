# Tailwind CSS Setup Guide for Expo Router Web

## Important Note

The `gradient-bars-background` component uses **Tailwind CSS classes** (className) and is **web-only**. It will NOT work on iOS/Android native platforms.

## Current Status

✅ **Tailwind CSS v4** installed  
✅ **PostCSS** configured  
✅ **lucide-react** installed  
✅ **Component created** at `/components/ui/gradient-bars-background.tsx`  
✅ **Hero page created** at `/app/(auth)/hero.tsx`  
⚠️ **CSS Import**: Needs configuration for Expo Router web

## Tailwind CSS v4 Setup for Expo Router

Tailwind CSS v4 (which was installed) has a different setup than v3. However, for Expo Router web, you have two options:

### Option 1: Use Tailwind CSS v3 (Recommended for Expo)

Tailwind CSS v4 is very new and may have compatibility issues. Consider downgrading to v3:

```bash
npm uninstall tailwindcss
npm install -D tailwindcss@^3.4.0
```

Then update `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Option 2: Configure CSS Import for Expo Router

For Expo Router web, you need to import the CSS file. However, React Native Web doesn't support CSS imports directly. 

**Solution**: Use a web-specific entry point or configure Tailwind's JIT mode.

## Alternative: Use NativeWind (React Native Tailwind)

If you want Tailwind CSS to work across all platforms (web, iOS, Android), consider using **NativeWind** instead:

```bash
npm install nativewind
npm install -D tailwindcss@^3.4.0
```

NativeWind converts Tailwind classes to React Native styles at build time.

## Quick Test

To test if Tailwind is working:

1. Visit: `http://localhost:8081/(auth)/hero` (when server is running)
2. You should see the gradient bars background
3. If styles don't load, Tailwind CSS needs configuration

## Files Created

1. **Component**: `/components/ui/gradient-bars-background.tsx`
2. **Demo/Hero Page**: `/app/(auth)/hero.tsx`
3. **Tailwind Config**: `/tailwind.config.js`
4. **PostCSS Config**: `/postcss.config.js`
5. **Global CSS**: `/styles/global.css` (for reference)

## Usage

Import the component:

```tsx
import { Component } from '../components/ui/gradient-bars-background';

// Then use it:
<Component
  numBars={7}
  gradientFrom="rgb(255, 60, 0)"
  gradientTo="transparent"
  backgroundColor="rgb(10, 10, 10)"
>
  {/* Your content */}
</Component>
```

## Next Steps

1. **Test the hero page**: Navigate to `/app/(auth)/hero` in your browser
2. **If styles don't work**: Consider using NativeWind or configuring Tailwind v4 properly
3. **For production**: Ensure Tailwind CSS is properly processed in your build pipeline

