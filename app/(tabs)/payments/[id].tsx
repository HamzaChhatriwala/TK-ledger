import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { PaymentForm } from '../../../components/forms/PaymentForm';
import { usePayment, usePaymentAllocations, useUpdatePayment, useDeletePayment } from '../../../lib/hooks/usePayments';
import { useInvoices } from '../../../lib/hooks/useInvoices';
import { useCustomers } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import type { Payment } from '../../../types';

export default function PaymentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userRole = useUserRole();
  const { data: payment, isLoading } = usePayment(id);
  const { data: allocations = [] } = usePaymentAllocations(id);
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const updateMutation = useUpdatePayment();
  const deleteMutation = useDeletePayment();
  const [showEditModal, setShowEditModal] = useState(false);

  const canEdit = userRole === 'admin' || userRole === 'cashier';
  const canDelete = userRole === 'admin';

  const customer = customers.find((c) => c.id === payment?.customer_id);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!payment || !canDelete) return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await deleteMutation.mutateAsync(payment.id);
      router.back();
    } catch (error: any) {
      alert(error.message || 'Error deleting payment');
    }
  };

  const handleSubmit = async (data: {
    payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    allocations: Array<{ invoice_id: string; amount: number }>;
  }) => {
    if (!payment) return;
    try {
      await updateMutation.mutateAsync({
        id: payment.id,
        updates: data.payment,
        allocations: data.allocations,
      });
      setShowEditModal(false);
    } catch (error: any) {
      alert(error.message || 'Error updating payment');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading payment..." />;
  }

  if (!payment) {
    return (
      <MainLayout title="Payment Not Found" showBack>
        <View style={styles.container}>
          <Text>Payment not found</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Payment Details" showBack>
      <ScrollView style={styles.container}>
        <Card>
          <View style={styles.section}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.value}>{customer?.name || 'Unknown'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <Text style={[styles.value, styles.amount]}>₹{payment.amount.toLocaleString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{new Date(payment.date).toLocaleDateString()}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={[styles.value, styles.method]}>
              {payment.method.charAt(0).toUpperCase() + payment.method.slice(1).replace('_', ' ')}
            </Text>
          </View>

          {payment.reference && (
            <View style={styles.section}>
              <Text style={styles.label}>Reference</Text>
              <Text style={styles.value}>{payment.reference}</Text>
            </View>
          )}

          {payment.notes && (
            <View style={styles.section}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{payment.notes}</Text>
            </View>
          )}
        </Card>

        {allocations.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Allocated to Invoices</Text>
            {allocations.map((allocation) => {
              const invoice = invoices.find((inv) => inv.id === allocation.invoice_id);
              return (
                <View key={allocation.id} style={styles.allocationRow}>
                  <View style={styles.allocationInfo}>
                    <Text style={styles.invoiceNo}>
                      {invoice?.invoice_no || 'Unknown Invoice'}
                    </Text>
                    {invoice && (
                      <Text style={styles.invoiceTotal}>
                        Total: ₹{invoice.total.toLocaleString()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.allocationAmount}>
                    ₹{allocation.amount.toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </Card>
        )}

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
        title="Edit Payment"
      >
        <PaymentForm
          payment={payment}
          customers={customers}
          invoices={invoices}
          onSubmit={handleSubmit}
          onCancel={() => setShowEditModal(false)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </MainLayout>
  );
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
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  method: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  allocationInfo: {
    flex: 1,
  },
  invoiceNo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  invoiceTotal: {
    fontSize: 12,
    color: '#666',
  },
  allocationAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
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




