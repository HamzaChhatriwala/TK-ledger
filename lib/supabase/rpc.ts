import { supabase } from './client';

export const rpc = {
  async calculateCustomerBalance(customerId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_customer_balance', {
      p_customer_id: customerId,
    });
    if (error) throw error;
    return data || 0;
  },

  async applyPayment(
    paymentId: string,
    allocations: Array<{ invoice_id: string; amount: number }>
  ): Promise<void> {
    const { error } = await supabase.rpc('apply_payment', {
      p_payment_id: paymentId,
      p_allocations: allocations,
    });
    if (error) throw error;
  },

  async generateInvoiceNo(): Promise<string> {
    // Try to use RPC function if available
    const { data, error } = await supabase.rpc('generate_invoice_no');
    if (!error && data) return data;
    
    // Fallback: generate invoice number based on date and count
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    const invoiceCount = (count || 0) + 1;
    return `INV-${dateStr}-${invoiceCount.toString().padStart(4, '0')}`;
  },

  async updateInvoiceStatus(invoiceId: string): Promise<void> {
    const { error } = await supabase.rpc('update_invoice_status', {
      p_invoice_id: invoiceId,
    });
    if (error) throw error;
  },
};

