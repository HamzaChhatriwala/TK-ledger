# How to Start Your App

## Quick Start

Open your terminal and run:

```bash
cd "/Users/justmac/Documents/TK LEDGER/tk-ledger"
npm run web
```

## What Happens Next

1. **Expo will start** - You'll see output in your terminal
2. **Browser opens automatically** - Usually at `http://localhost:8081`
3. **If browser doesn't open** - Look for a URL in the terminal output and open it manually

## Expected Output

You should see something like:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Web is waiting on http://localhost:8081
```

## Troubleshooting

**If you see errors:**

1. **"Port already in use"**
   ```bash
   # Kill the process
   lsof -ti:8081 | xargs kill -9
   # Then try again
   npm run web
   ```

2. **"Module not found"**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   npm run web
   ```

3. **"Command not found: expo"**
   ```bash
   # Install Expo CLI globally (optional)
   npm install -g expo-cli
   # Or just use npx
   npx expo start --web
   ```

## Current App State

Your app is currently showing the basic Expo template. Many core files need to be restored for full functionality.

## Next Steps

Once the app is running:
1. You'll see a basic screen with "Open up App.tsx to start working on your app!"
2. To restore full functionality, the missing components and screens need to be recreated
3. Set up Supabase for database functionality (see GETTING_STARTED.md)

