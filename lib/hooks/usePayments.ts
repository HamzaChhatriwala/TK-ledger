import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { rpc } from '../supabase/rpc';
import type { Payment, PaymentAllocation } from '../../types';

export function usePayments(filters?: { customerId?: string; search?: string }) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async (): Promise<Payment[]> => {
      let query = supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.search) {
        query = query.or(`reference.ilike.%${filters.search}%`);
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
        .eq('payment_id', paymentId);

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

      // Create payment
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          ...payment,
          created_by: user.id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Apply payment allocations if provided
      // Even if no allocations, the payment is still recorded and will affect ledger balance
      if (allocations && allocations.length > 0) {
        await rpc.applyPayment(paymentData.id, allocations);
      }
      // If no allocations, the payment still exists and will be deducted from customer balance
      // in the ledger calculation (which sums all invoices and subtracts all payments)

      return paymentData as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      allocations,
    }: {
      id: string;
      updates: Partial<Payment>;
      allocations?: Array<{ invoice_id: string; amount: number }>;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update payment
      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update allocations if provided
      if (allocations !== undefined) {
        // Delete existing allocations
        await supabase.from('payment_allocations').delete().eq('payment_id', id);

        // Apply new allocations
        if (allocations.length > 0) {
          await rpc.applyPayment(id, allocations);
        }
      }

      return data as Payment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

