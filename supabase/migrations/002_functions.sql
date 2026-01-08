-- Function to calculate customer balance (running balance)
CREATE OR REPLACE FUNCTION calculate_customer_balance(p_customer_id UUID)
RETURNS DECIMAL(15, 2) AS $$
DECLARE
  v_balance DECIMAL(15, 2) := 0;
BEGIN
  -- Sum of all invoice totals (unpaid/partial)
  SELECT COALESCE(SUM(total), 0) INTO v_balance
  FROM public.invoices
  WHERE customer_id = p_customer_id
    AND status IN ('unpaid', 'partial');

  -- Subtract allocated payments
  SELECT v_balance - COALESCE(SUM(pa.amount), 0) INTO v_balance
  FROM public.payment_allocations pa
  JOIN public.invoices i ON pa.invoice_id = i.id
  WHERE i.customer_id = p_customer_id
    AND i.status IN ('unpaid', 'partial');

  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice status based on allocations
CREATE OR REPLACE FUNCTION update_invoice_status(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total DECIMAL(15, 2);
  v_allocated DECIMAL(15, 2);
  v_status TEXT;
BEGIN
  -- Get invoice total
  SELECT total INTO v_total
  FROM public.invoices
  WHERE id = p_invoice_id;

  -- Get allocated amount
  SELECT COALESCE(SUM(amount), 0) INTO v_allocated
  FROM public.payment_allocations
  WHERE invoice_id = p_invoice_id;

  -- Determine status
  IF v_allocated = 0 THEN
    v_status := 'unpaid';
  ELSIF v_allocated >= v_total THEN
    v_status := 'paid';
  ELSE
    v_status := 'partial';
  END IF;

  -- Update invoice status
  UPDATE public.invoices
  SET status = v_status,
      updated_at = NOW()
  WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply payment and reconcile invoices
CREATE OR REPLACE FUNCTION apply_payment(
  p_payment_id UUID,
  p_allocations JSONB
)
RETURNS VOID AS $$
DECLARE
  v_allocation JSONB;
  v_invoice_id UUID;
  v_amount DECIMAL(15, 2);
BEGIN
  -- Delete existing allocations for this payment
  DELETE FROM public.payment_allocations
  WHERE payment_id = p_payment_id;

  -- Insert new allocations
  FOR v_allocation IN SELECT * FROM jsonb_array_elements(p_allocations)
  LOOP
    v_invoice_id := (v_allocation->>'invoice_id')::UUID;
    v_amount := (v_allocation->>'amount')::DECIMAL(15, 2);

    INSERT INTO public.payment_allocations (payment_id, invoice_id, amount)
    VALUES (p_payment_id, v_invoice_id, v_amount);

    -- Update invoice status
    PERFORM update_invoice_status(v_invoice_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_no()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_last_num INTEGER;
  v_new_num INTEGER;
  v_invoice_no TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get last invoice number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_no FROM '\d+$') AS INTEGER)), 0) INTO v_last_num
  FROM public.invoices
  WHERE invoice_no LIKE 'INV-' || v_year || '-%';

  v_new_num := v_last_num + 1;
  v_invoice_no := 'INV-' || v_year || '-' || LPAD(v_new_num::TEXT, 6, '0');

  RETURN v_invoice_no;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

