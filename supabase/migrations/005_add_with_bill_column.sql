-- Add with_bill column to invoices table
-- This column indicates whether the invoice should be generated with a bill (true) or without a bill (false)

ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS with_bill BOOLEAN DEFAULT true;

-- Update existing invoices to have with_bill = true by default
UPDATE public.invoices
SET with_bill = true
WHERE with_bill IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.invoices.with_bill IS 'Indicates whether invoice should be generated with bill (true) or without bill (false)';




