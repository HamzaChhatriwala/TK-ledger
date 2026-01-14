# 🚨 QUICK FIX: with_bill Column Error

## The Problem

**Error**: `Could not find the 'with_bill' column of 'invoices' in the schema cache`

**Why**: The database table doesn't have the `with_bill` column yet.

## The Fix (2 Minutes)

### Option 1: Copy-Paste SQL (Easiest)

1. **Open Supabase**: https://supabase.com/dashboard
2. **Select your project**
3. **Click "SQL Editor"** → **"New query"**
4. **Paste this code**:

```sql
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS with_bill BOOLEAN DEFAULT true;

UPDATE public.invoices
SET with_bill = true
WHERE with_bill IS NULL;
```

5. **Click "Run"** (or press `Ctrl+Enter`)
6. **Done!** ✅

### Option 2: Use the SQL File

1. Open `ADD_WITH_BILL_COLUMN.sql` in your project
2. Copy all the SQL code
3. Paste into Supabase SQL Editor
4. Run it

## After Running SQL

1. **Restart your app**:
   ```bash
   # Stop the server (Ctrl+C)
   npm run web
   ```

2. **Try creating an invoice again** - the error should be gone!

## Still Not Working?

1. **Verify the column exists** - Run this in SQL Editor:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'invoices' AND column_name = 'with_bill';
   ```
   Should return: `with_bill`

2. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)

3. **Check you're in the right Supabase project**

## What This Does

- Adds `with_bill` column to `invoices` table
- Sets default value to `true` (with bill)
- Updates all existing invoices to have `with_bill = true`

That's it! The error will disappear once you run the SQL.




