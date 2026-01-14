import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/client';
import { rpc } from '../supabase/rpc';
import type { Invoice, InvoiceItem } from '../../types';

export function useInvoices(filters?: {
  customerId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async (): Promise<Invoice[]> => {
      let query = supabase
        .from('invoices')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`invoice_no.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async (): Promise<Invoice | null> => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!id,
  });
}

export function useInvoiceItems(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: async (): Promise<InvoiceItem[]> => {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InvoiceItem[];
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoice,
      items,
    }: {
      invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
      items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate invoice number
      const invoiceNo = await rpc.generateInvoiceNo();

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          invoice_no: invoiceNo,
          created_by: user.id,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (items.length > 0) {
        const { error: itemsError } = await supabase.from('invoice_items').insert(
          items.map((item) => ({
            ...item,
            invoice_id: invoiceData.id,
          }))
        );

        if (itemsError) throw itemsError;
      }

      // Update invoice status
      await rpc.updateInvoiceStatus(invoiceData.id);

      return invoiceData as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      items,
    }: {
      id: string;
      updates: Partial<Invoice>;
      items?: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update invoice
      const { data, error } = await supabase
        .from('invoices')
        .update({
          ...updates,
          updated_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update items if provided
      if (items !== undefined) {
        // Delete existing items
        await supabase.from('invoice_items').delete().eq('invoice_id', id);

        // Insert new items
        if (items.length > 0) {
          const { error: itemsError } = await supabase.from('invoice_items').insert(
            items.map((item) => ({
              ...item,
              invoice_id: id,
            }))
          );

          if (itemsError) throw itemsError;
        }

        // Recalculate totals
        const { data: allItems } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', id);

        if (allItems) {
          const subtotal = allItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
          const tax = allItems.reduce(
            (sum, item) => sum + (item.quantity * item.unit_price * item.tax_percent) / 100,
            0
          );
          const total = subtotal + tax;

          await supabase
            .from('invoices')
            .update({
              subtotal,
              tax,
              total,
            })
            .eq('id', id);
        }
      }

      // Update invoice status
      await rpc.updateInvoiceStatus(id);

      return data as Invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['invoice-items', data.id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}




