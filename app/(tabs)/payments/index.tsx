import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { PaymentList } from '../../../components/lists/PaymentList';
import { Modal } from '../../../components/ui/Modal';
import { PaymentForm } from '../../../components/forms/PaymentForm';
import { usePayments, useCreatePayment, useUpdatePayment, useDeletePayment } from '../../../lib/hooks/usePayments';
import { useInvoices } from '../../../lib/hooks/useInvoices';
import { useCustomers } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import type { Payment } from '../../../types';

export default function PaymentsScreen() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const router = useRouter();
  const userRole = useUserRole();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [] } = useInvoices();
  const { data: payments = [], isLoading } = usePayments({ search });
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const deleteMutation = useDeletePayment();

  const canEdit = userRole === 'admin' || userRole === 'cashier';

  const handlePaymentPress = (payment: Payment) => {
    router.push(`/(tabs)/payments/${payment.id}` as any);
  };

  const handleCreate = () => {
    setEditingPayment(null);
    setShowModal(true);
  };

  const handleSubmit = async (data: {
    payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    allocations: Array<{ invoice_id: string; amount: number }>;
  }) => {
    try {
      if (editingPayment) {
        await updateMutation.mutateAsync({
          id: editingPayment.id,
          updates: data.payment,
          allocations: data.allocations,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowModal(false);
      setEditingPayment(null);
    } catch (error: any) {
      alert(error.message || 'Error saving payment');
      console.error('Error saving payment:', error);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (userRole !== 'admin') return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await deleteMutation.mutateAsync(payment.id);
    } catch (error: any) {
      alert(error.message || 'Error deleting payment');
    }
  };

  return (
    <MainLayout
      title="Payments"
      headerRight={
        canEdit ? (
          <Button title="+ New" onPress={handleCreate} variant="primary" style={styles.newButton} />
        ) : undefined
      }
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search payments..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>

        <PaymentList
          payments={payments}
          customers={customers}
          onPaymentPress={handlePaymentPress}
          loading={isLoading}
        />
      </View>

      <Modal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPayment(null);
        }}
        title={editingPayment ? 'Edit Payment' : 'New Payment'}
      >
        <PaymentForm
          payment={editingPayment || undefined}
          customers={customers}
          invoices={invoices}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingPayment(null);
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
});
