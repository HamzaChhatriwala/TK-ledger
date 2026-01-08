# Supabase Database Setup Guide

## How to Run Migrations in Supabase

### Step 1: Open SQL Editor
1. Go to your Supabase Dashboard: https://hitmhxjcgllpclsbxtdd.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Each Migration File

**IMPORTANT:** You must copy the **CONTENTS** of each file, NOT the file path!

#### Migration 1: Initial Schema
1. Open the file: `supabase/migrations/001_initial_schema.sql` in your code editor (VS Code)
2. Select ALL the text in the file (Cmd+A / Ctrl+A)
3. Copy it (Cmd+C / Ctrl+C)
4. Paste it into Supabase SQL Editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. Wait for "Success" message

#### Migration 2: Functions
1. Open: `supabase/migrations/002_functions.sql`
2. Copy ALL contents
3. Paste into SQL Editor
4. Click **Run**

#### Migration 3: RLS Policies
1. Open: `supabase/migrations/003_rls_policies.sql`
2. Copy ALL contents
3. Paste into SQL Editor
4. Click **Run**

#### Migration 4: Audit Triggers
1. Open: `supabase/migrations/004_audit_triggers.sql`
2. Copy ALL contents
3. Paste into SQL Editor
4. Click **Run**

### Step 3: Verify Setup
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - users
   - customers
   - invoices
   - invoice_items
   - payments
   - payment_allocations
   - audit_logs

## Common Mistakes

❌ **WRONG:** Copying the file path like `supabase/migrations/001_initial_schema.sql`
✅ **CORRECT:** Copying the SQL code inside the file

❌ **WRONG:** Running all migrations at once
✅ **CORRECT:** Run them one at a time, in order

## Need Help?

If you get errors:
1. Check the error message in Supabase SQL Editor
2. Make sure you copied the entire file contents
3. Make sure you're running them in order (001, 002, 003, 004)
4. Some errors are OK if tables already exist (you can ignore "already exists" errors)

