# Getting Started Guide - Toy Kingdom Ledger

Welcome! This guide will walk you through setting up and running your React Native Web app step by step.

## Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd "/Users/justmac/Documents/TK LEDGER/tk-ledger"
npm install
```

### Step 2: Start the App

```bash
npm run web
```

This will:
- Start the Expo development server
- Open your browser automatically
- Show your app at `http://localhost:8081`

### Step 3: That's It!

Your React Native Web app is now running! 🎉

## What You'll See

When the app starts, you'll see a basic Expo template. The app structure is set up but needs the core files to be restored.

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

**Module not found errors?**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**Need help?** Check the full setup guide below or see the README.md

