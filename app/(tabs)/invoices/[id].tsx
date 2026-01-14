import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { InvoiceForm } from '../../../components/forms/InvoiceForm';
import { useInvoice, useInvoiceItems, useUpdateInvoice, useDeleteInvoice } from '../../../lib/hooks/useInvoices';
import { useCustomers } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { Invoice } from '../../../types';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userRole = useUserRole();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: items = [] } = useInvoiceItems(id);
  const { data: customers = [] } = useCustomers();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();
  const [showEditModal, setShowEditModal] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'cashier';
  const canDelete = userRole === 'admin';

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!invoice || !canDelete) return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteMutation.mutateAsync(invoice.id);
      router.back();
    } catch (error: any) {
      alert(error.message || 'Error deleting invoice');
    }
  };

  const handleSubmit = async (data: {
    invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    items: any[];
  }) => {
    if (!invoice) return;
    try {
      await updateMutation.mutateAsync({
        id: invoice.id,
        updates: data.invoice,
        items: data.items,
      });
      setShowEditModal(false);
    } catch (error: any) {
      alert(error.message || 'Error updating invoice');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <MainLayout title="Invoice Not Found" showBack>
        <View style={styles.container}>
          <Text>Invoice not found</Text>
        </View>
      </MainLayout>
    );
  }

  const customer = customers.find((c) => c.id === invoice.customer_id);

  return (
    <MainLayout title={`Invoice ${invoice.invoice_no}`} showBack>
      <ScrollView style={styles.container}>
        <Card>
          <View style={styles.section}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{invoice.invoice_no}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customer?.name || 'Unknown'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date(invoice.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Status</Text>
            <Text style={[styles.value, styles.status, { color: getStatusColor(invoice.status) }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Bill Option</Text>
            <Text style={styles.value}>
              {invoice.with_bill !== false ? 'With Bill' : 'Without Bill'}
            </Text>
          </View>

          {invoice.notes && (
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{invoice.notes}</Text>
            </View>
          )}
        </Card>

        {items.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Items</Text>
            {items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  {item.sku && <Text style={styles.itemSku}>SKU: {item.sku}</Text>}
                </View>
                <View style={styles.itemAmounts}>
                  <Text style={styles.itemQty}>
                    {item.quantity} × ₹{item.unit_price.toLocaleString()}
                  </Text>
                  <Text style={styles.itemTotal}>
                    ₹{(item.quantity * item.unit_price).toLocaleString()}
                  </Text>
                  {item.tax_percent > 0 && (
                    <Text style={styles.itemTax}>Tax: {item.tax_percent}%</Text>
                  )}
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>₹{invoice.subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>₹{invoice.tax.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>₹{invoice.discount.toLocaleString()}</Text>
            </View>
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalLabelFinal}>Total:</Text>
              <Text style={styles.totalValueFinal}>₹{invoice.total.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          {canEdit && (
            <Button title="Edit" onPress={handleEdit} variant="primary" style={styles.button} />
          )}
          {canDelete && (
            <Button
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              style={styles.button}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Invoice"
      >
        <InvoiceForm
          invoice={invoice}
          items={items}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => setShowEditModal(false)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </MainLayout>
  );
}

function getStatusColor(status: Invoice['status']): string {
  switch (status) {
    case 'paid':
      return '#34C759';
    case 'partial':
      return '#FF9500';
    case 'unpaid':
      return '#FF3B30';
    default:
      return '#666';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  status: {
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
    color: '#666',
  },
  itemAmounts: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  itemTax: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  totals: {
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flex: 1,
  },
});

