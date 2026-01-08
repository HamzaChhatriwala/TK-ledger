# Troubleshooting Guide

## Common Errors and Solutions

### Error: "Missing Supabase environment variables"

**Solution:**
1. Make sure `.env` file exists in the project root
2. Restart the development server:
   ```bash
   # Stop server (Ctrl+C)
   npm run web
   ```

### Error: "Cannot connect to Supabase"

**Solution:**
1. Check your `.env` file has correct values:
   ```bash
   cat .env
   ```
2. Verify your Supabase project is active
3. Check if you've run the database migrations

### Error: "Module not found"

**Solution:**
```bash
rm -rf node_modules
npm install
npm run web
```

### Error: "Port already in use"

**Solution:**
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
# Then restart
npm run web
```

### Error: "Table does not exist"

**Solution:**
You need to run the database migrations in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations in order:
   - 001_initial_schema.sql
   - 002_functions.sql
   - 003_rls_policies.sql
   - 004_audit_triggers.sql

### Browser Console Errors

**Check browser console (F12) for:**
- Network errors (CORS, connection issues)
- JavaScript errors
- Authentication errors

### App Shows Blank Screen

**Solution:**
1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Make sure database migrations are run
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

## Getting Help

If you see a specific error message, please share:
1. The exact error text
2. Where it appears (browser console, terminal, etc.)
3. What you were doing when it happened

