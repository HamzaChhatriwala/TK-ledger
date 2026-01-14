# Invoice With/Without Bill Feature

## Overview

The invoice form now supports two modes:
- **With Bill**: Add products/items with details (name, SKU, quantity, price, tax)
- **Without Bill**: Simply enter a total amount and optional tax

## Database Setup Required

⚠️ **IMPORTANT**: You must add the `with_bill` column to your database first!

### Steps to Add the Column:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" → "New query"
4. Copy and paste this SQL:

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

5. Click "Run" (or press `Ctrl+Enter` / `Cmd+Enter`)
6. You should see: "Success. No rows returned"

**OR** use the file: `ADD_WITH_BILL_COLUMN.sql` in your project root.

## How It Works

### With Bill Mode (Default)
- Shows product/item fields
- Add multiple items with:
  - Product Name
  - SKU (optional)
  - Quantity
  - Unit Price
  - Tax %
- Totals are calculated automatically from items
- Use "+ Add Item" to add more products

### Without Bill Mode
- Shows simple amount fields:
  - Total Amount (required)
  - Tax Amount (optional)
- No product/item fields shown
- Totals are calculated from the entered amount
- Creates a single invoice item automatically

## Features

- ✅ Toggle between "With Bill" and "Without Bill" modes
- ✅ Automatic form switching (products vs. simple amount)
- ✅ Validation for both modes
- ✅ Automatic total calculation
- ✅ Theme-aware (works in light/dark mode)
- ✅ Existing invoices default to "With Bill" mode

## Usage

1. **Create New Invoice**
   - Select customer, date, status
   - Choose "With Bill" or "Without Bill"
   - Fill in the appropriate fields
   - Review totals
   - Click "Create"

2. **Edit Existing Invoice**
   - The form loads with the invoice's current `with_bill` setting
   - You can switch modes if needed
   - Changes are saved when you click "Update"

## Notes

- When switching from "With Bill" to "Without Bill", all items are cleared
- When switching from "Without Bill" to "With Bill", the amount fields are cleared
- For "Without Bill" invoices, a single item is automatically created with the total amount
- The `with_bill` field is stored in the database and displayed in invoice details




