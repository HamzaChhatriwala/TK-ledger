-- COPY AND PASTE THIS INTO SUPABASE SQL EDITOR
-- This adds the 'with_bill' column to the invoices table

-- Add with_bill column to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS with_bill BOOLEAN DEFAULT true;

-- Update existing invoices to have with_bill = true by default
UPDATE public.invoices
SET with_bill = true
WHERE with_bill IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.invoices.with_bill IS 'Indicates whether invoice should be generated with bill (true) or without bill (false)';




