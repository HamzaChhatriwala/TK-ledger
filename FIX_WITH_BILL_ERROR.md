# Fix "with_bill column not found" Error

## Quick Fix

The `with_bill` column is missing from your `invoices` table. Follow these steps to add it:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"

### Step 2: Run the Migration

Copy and paste this SQL into the SQL Editor:

```sql
-- Add with_bill column to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS with_bill BOOLEAN DEFAULT true;

-- Update existing invoices to have with_bill = true by default
UPDATE public.invoices
SET with_bill = true
WHERE with_bill IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.invoices.with_bill IS 'Indicates whether invoice should be generated with bill (true) or without bill (false)';
```

### Step 3: Execute

1. Click "Run" or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)
2. You should see "Success. No rows returned"

### Step 4: Verify

The error should now be fixed. Try creating an invoice again.

## What This Does

- Adds a `with_bill` column to the `invoices` table
- Sets default value to `true` (with bill)
- Updates all existing invoices to have `with_bill = true`
- The column is optional (nullable), but defaults to `true`

## Alternative: Use the SQL File

You can also copy the contents from `ADD_WITH_BILL_COLUMN.sql` file in your project root.




