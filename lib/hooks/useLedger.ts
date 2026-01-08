import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { rpc } from '../supabase/rpc';
import type { Invoice, Payment, PaymentAllocation } from '../../types';

export interface LedgerEntry {
  id: string;
  type: 'invoice' | 'payment';
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  reference?: string;
}

export interface CustomerLedger {
  customerId: string;
  entries: LedgerEntry[];
  openingBalance: number;
  closingBalance: number;
  totalOutstanding: number;
}

export function useCustomerLedger(customerId: string, dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['customer-ledger', customerId, dateFrom, dateTo],
    queryFn: async (): Promise<CustomerLedger> => {
      let invoiceQuery = supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customerId)
        .in('status', ['unpaid', 'partial', 'paid']);

      if (dateFrom) {
        invoiceQuery = invoiceQuery.gte('date', dateFrom);
      }
      if (dateTo) {
        invoiceQuery = invoiceQuery.lte('date', dateTo);
      }

      const { data: invoices, error: invoiceError } = await invoiceQuery.order('date', {
        ascending: true,
      });
      if (invoiceError) throw invoiceError;

      let paymentQuery = supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId);

      if (dateFrom) {
        paymentQuery = paymentQuery.gte('date', dateFrom);
      }
      if (dateTo) {
        paymentQuery = paymentQuery.lte('date', dateTo);
      }

      const { data: payments, error: paymentError } = await paymentQuery.order('date', {
        ascending: true,
      });
      if (paymentError) throw paymentError;

      const invoiceIds = invoices?.map((inv) => inv.id) || [];
      const { data: allocations, error: allocationError } = await supabase
        .from('payment_allocations')
        .select('*')
        .in('invoice_id', invoiceIds);

      if (allocationError) throw allocationError;

      const entries: LedgerEntry[] = [];
      let runningBalance = 0;

      const allTransactions: Array<{
        type: 'invoice' | 'payment';
        date: string;
        data: Invoice | Payment;
      }> = [
        ...(invoices || []).map((inv) => ({ type: 'invoice' as const, date: inv.date, data: inv })),
        ...(payments || []).map((pay) => ({ type: 'payment' as const, date: pay.date, data: pay })),
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (const transaction of allTransactions) {
        if (transaction.type === 'invoice') {
          const invoice = transaction.data as Invoice;
          const allocatedAmount =
            allocations
              ?.filter((a) => a.invoice_id === invoice.id)
              .reduce((sum, a) => sum + a.amount, 0) || 0;
          const outstanding = invoice.total - allocatedAmount;

          if (outstanding > 0 || invoice.status === 'paid') {
            runningBalance += invoice.total;
            entries.push({
              id: invoice.id,
              type: 'invoice',
              date: invoice.date,
              description: `Invoice ${invoice.invoice_no}`,
              debit: invoice.total,
              credit: 0,
              balance: runningBalance,
              reference: invoice.invoice_no,
            });
          }
        } else {
          const payment = transaction.data as Payment;
          runningBalance -= payment.amount;
          entries.push({
            id: payment.id,
            type: 'payment',
            date: payment.date,
            description: `Payment - ${payment.method.replace('_', ' ')}`,
            debit: 0,
            credit: payment.amount,
            balance: runningBalance,
            reference: payment.reference,
          });
        }
      }

      const totalOutstanding = await rpc.calculateCustomerBalance(customerId);

      return {
        customerId,
        entries,
        openingBalance: 0,
        closingBalance: runningBalance,
        totalOutstanding,
      };
    },
    enabled: !!customerId,
  });
}

export function useOutstandingReceivables() {
  return useQuery({
    queryKey: ['outstanding-receivables'],
    queryFn: async (): Promise<Array<{ customerId: string; customerName: string; amount: number }>> => {
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, name, customer_id')
        .is('deleted_at', null);

      if (customerError) throw customerError;

      const receivables = await Promise.all(
        (customers || []).map(async (customer) => {
          const balance = await rpc.calculateCustomerBalance(customer.id);
          return {
            customerId: customer.id,
            customerName: customer.name,
            amount: balance,
          };
        })
      );

      return receivables.filter((r) => r.amount > 0);
    },
  });
}

