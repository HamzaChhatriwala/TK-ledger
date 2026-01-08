import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { rpc } from '../supabase/rpc';
import type { Payment, PaymentAllocation, PaymentMethod } from '../../types';

export interface PaymentFilters {
  customerId?: string;
  method?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export function usePayments(filters?: PaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async (): Promise<Payment[]> => {
      let query = supabase.from('payments').select('*').order('date', { ascending: false });

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.method) {
        query = query.eq('method', filters.method);
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payment', id],
    queryFn: async (): Promise<Payment | null> => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Payment;
    },
    enabled: !!id,
  });
}

export function usePaymentAllocations(paymentId: string) {
  return useQuery({
    queryKey: ['payment-allocations', paymentId],
    queryFn: async (): Promise<PaymentAllocation[]> => {
      const { data, error } = await supabase
        .from('payment_allocations')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PaymentAllocation[];
    },
    enabled: !!paymentId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payment,
      allocations,
    }: {
      payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
      allocations: Array<{ invoice_id: string; amount: number }>;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          ...payment,
          created_by: user.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      if (allocations.length > 0) {
        await rpc.applyPayment(paymentData.id, allocations);
      }

      return paymentData as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

