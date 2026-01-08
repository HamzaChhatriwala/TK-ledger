-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.users
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
CREATE POLICY "Users can view their own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (get_user_role(auth.uid()) = 'admin');

-- Customers policies
CREATE POLICY "All authenticated users can view non-deleted customers"
  ON public.customers FOR SELECT
  USING (
    deleted_at IS NULL AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins and cashiers can insert customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins and cashiers can update customers"
  ON public.customers FOR UPDATE
  USING (
    deleted_at IS NULL AND
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins can soft-delete customers"
  ON public.customers FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) = 'admin'
  );

-- Invoices policies
CREATE POLICY "All authenticated users can view invoices"
  ON public.invoices FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and cashiers can insert invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins and cashiers can update invoices"
  ON public.invoices FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) = 'admin'
  );

-- Invoice items policies
CREATE POLICY "All authenticated users can view invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
    )
  );

CREATE POLICY "Admins and cashiers can insert invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier') AND
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
    )
  );

CREATE POLICY "Admins and cashiers can update invoice items"
  ON public.invoice_items FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins and cashiers can delete invoice items"
  ON public.invoice_items FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

-- Payments policies
CREATE POLICY "All authenticated users can view payments"
  ON public.payments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and cashiers can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins and cashiers can update payments"
  ON public.payments FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

CREATE POLICY "Admins can delete payments"
  ON public.payments FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) = 'admin'
  );

-- Payment allocations policies
CREATE POLICY "All authenticated users can view payment allocations"
  ON public.payment_allocations FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and cashiers can manage payment allocations"
  ON public.payment_allocations FOR ALL
  USING (
    auth.role() = 'authenticated' AND
    get_user_role(auth.uid()) IN ('admin', 'cashier')
  );

-- Audit logs policies (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

