import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { rpc } from '../supabase/rpc';
import type { Invoice, Payment, PaymentAllocation } from '../../types';

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'invoice' | 'payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
  invoice?: Invoice;
  payment?: Payment;
}

export function useCustomerLedger(customerId: string) {
  return useQuery({
    queryKey: ['ledger', customerId],
    queryFn: async (): Promise<LedgerEntry[]> => {
      if (!customerId) return [];

      // Get all invoices for customer
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: true });

      if (invoicesError) throw invoicesError;

      // Get all payments for customer
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: true });

      if (paymentsError) throw paymentsError;

      // Get all payment allocations
      const invoiceIds = invoices?.map((inv) => inv.id) || [];
      const paymentIds = payments?.map((p) => p.id) || [];

      let allocations: PaymentAllocation[] = [];
      if (paymentIds.length > 0) {
        const { data: allocs, error: allocsError } = await supabase
          .from('payment_allocations')
          .select('*')
          .in('payment_id', paymentIds);

        if (allocsError) throw allocsError;
        allocations = allocs || [];
      }

      // Calculate allocated amounts per invoice
      const invoiceAllocated: Record<string, number> = {};
      allocations.forEach((alloc) => {
        invoiceAllocated[alloc.invoice_id] =
          (invoiceAllocated[alloc.invoice_id] || 0) + alloc.amount;
      });

      // Combine all entries first
      const entries: LedgerEntry[] = [];

      // Add invoice entries
      invoices?.forEach((invoice) => {
        entries.push({
          id: `invoice-${invoice.id}`,
          date: invoice.date,
          type: 'invoice',
          description: `Invoice ${invoice.invoice_no}`,
          debit: invoice.total,
          credit: 0,
          balance: 0, // Will be calculated after sorting
          reference: invoice.invoice_no,
          invoice,
        });
      });

      // Add payment entries
      // All payments are included, regardless of whether they have references or allocations
      payments?.forEach((payment) => {
        const refText = payment.reference ? ` (${payment.reference})` : '';
        entries.push({
          id: `payment-${payment.id}`,
          date: payment.date,
          type: 'payment',
          description: `Payment - ${payment.method}${refText}`,
          debit: 0,
          credit: payment.amount,
          balance: 0, // Will be calculated after sorting
          reference: payment.reference || undefined,
          payment,
        });
      });

      // Sort by date and time (invoices before payments on same date)
      entries.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        // If same date, invoices come before payments
        return a.type === 'invoice' ? -1 : 1;
      });

      // Calculate running balance chronologically
      let runningBalance = 0;
      return entries.map((entry) => {
        if (entry.type === 'invoice') {
          runningBalance += entry.debit; // Add invoice amount
        } else {
          runningBalance -= entry.credit; // Subtract payment amount
        }
        return { ...entry, balance: runningBalance };
      });
    },
    enabled: !!customerId,
  });
}

export function useAllLedgers() {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: async (): Promise<Array<{ customerId: string; customerName: string; balance: number }>> => {
      // Get all customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, customer_id')
        .is('deleted_at', null);

      if (customersError) throw customersError;

      // Calculate balance for each customer
      const balances = await Promise.all(
        (customers || []).map(async (customer) => {
          try {
            const balance = await rpc.calculateCustomerBalance(customer.id);
            return {
              customerId: customer.id,
              customerName: customer.name,
              customerCode: customer.customer_id,
              balance,
            };
          } catch {
            return {
              customerId: customer.id,
              customerName: customer.name,
              customerCode: customer.customer_id,
              balance: 0,
            };
          }
        })
      );

      return balances.filter((b) => b.balance !== 0).sort((a, b) => b.balance - a.balance);
    },
  });
}

