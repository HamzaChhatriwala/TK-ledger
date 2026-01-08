import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { CustomerForm } from '../../../components/forms/CustomerForm';
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { rpc } from '../../../lib/supabase/rpc';
import type { Customer } from '../../../types';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const userRole = useUserRole();
  const { data: customer, isLoading } = useCustomer(id);
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();
  const [showEditModal, setShowEditModal] = useState(false);
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (customer) {
      rpc.calculateCustomerBalance(customer.id)
        .then(setBalance)
        .catch(() => setBalance(0));
    }
  }, [customer]);

  const canEdit = userRole === 'admin' || userRole === 'cashier';
  const canDelete = userRole === 'admin';

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!customer || !canDelete) return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteMutation.mutateAsync(customer.id);
      router.back();
    } catch (error: any) {
      alert(error.message || 'Error deleting customer');
    }
  };

  const handleSubmit = async (
    customerData: Omit<
      Customer,
      'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'
    >
  ) => {
    if (!customer) return;
    try {
      await updateMutation.mutateAsync({
        id: customer.id,
        updates: customerData,
      });
      setShowEditModal(false);
    } catch (error: any) {
      alert(error.message || 'Error updating customer');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading customer..." />;
  }

  if (!customer) {
    return (
      <MainLayout title="Customer Not Found" showBack>
        <View style={styles.container}>
          <Text>Customer not found</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={customer.name} showBack>
      <ScrollView style={styles.container}>
        <Card>
          <View style={styles.section}>
            <Text style={styles.label}>Customer ID</Text>
            <Text style={styles.value}>{customer.customer_id}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{customer.name}</Text>
          </View>

          {customer.phone && (
            <View style={styles.section}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{customer.phone}</Text>
            </View>
          )}

          {customer.email && (
            <View style={styles.section}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{customer.email}</Text>
            </View>
          )}

          {customer.address && (
            <View style={styles.section}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{customer.address}</Text>
            </View>
          )}

          {customer.gst_vat && (
            <View style={styles.section}>
              <Text style={styles.label}>GST/VAT</Text>
              <Text style={styles.value}>{customer.gst_vat}</Text>
            </View>
          )}

          {customer.credit_limit && (
            <View style={styles.section}>
              <Text style={styles.label}>Credit Limit</Text>
              <Text style={styles.value}>₹{customer.credit_limit.toLocaleString()}</Text>
            </View>
          )}

          {balance !== null && (
            <View style={styles.section}>
              <Text style={styles.label}>Outstanding Balance</Text>
              <Text style={[styles.value, balance > 0 && styles.negativeBalance]}>
                ₹{balance.toLocaleString()}
              </Text>
            </View>
          )}
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
          <Button
            title="View Ledger"
            onPress={() => router.push(`/(tabs)/ledger/${customer.id}` as any)}
            variant="outline"
            style={styles.button}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Customer"
      >
        <CustomerForm
          customer={customer}
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
  negativeBalance: {
    color: '#FF3B30',
    fontWeight: '600',
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

