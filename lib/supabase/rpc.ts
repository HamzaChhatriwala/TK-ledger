import { supabase } from './client';
import type { Payment, PaymentAllocation } from '../../types';

export const rpc = {
  // Calculate customer balance
  async calculateCustomerBalance(customerId: string): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_customer_balance', {
      p_customer_id: customerId,
    });
    if (error) throw error;
    return data || 0;
  },

  // Apply payment to invoices
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

  // Generate next invoice number
  async generateInvoiceNo(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_invoice_no');
    if (error) throw error;
    return data;
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string): Promise<void> {
    const { error } = await supabase.rpc('update_invoice_status', {
      p_invoice_id: invoiceId,
    });
    if (error) throw error;
  },
};

