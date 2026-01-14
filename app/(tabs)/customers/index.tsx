import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { CustomerList } from '../../../components/lists/CustomerList';
import { Modal } from '../../../components/ui/Modal';
import { CustomerForm } from '../../../components/forms/CustomerForm';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import type { Customer } from '../../../types';

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const router = useRouter();
  const userRole = useUserRole();
  const { data: customers = [], isLoading } = useCustomers(search);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const canEdit = userRole === 'admin' || userRole === 'cashier';

  const handleCustomerPress = (customer: Customer) => {
    router.push(`/(tabs)/customers/${customer.id}` as any);
  };

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleSubmit = async (
    customerData: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>
  ) => {
    try {
      if (editingCustomer) {
        await updateMutation.mutateAsync({
          id: editingCustomer.id,
          updates: customerData,
        });
      } else {
        await createMutation.mutateAsync(customerData);
      }
      setShowModal(false);
      setEditingCustomer(null);
    } catch (error: any) {
      alert(error.message || 'Error saving customer');
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (userRole !== 'admin') return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await deleteMutation.mutateAsync(customer.id);
    } catch (error: any) {
      alert(error.message || 'Error deleting customer');
    }
  };

  return (
    <MainLayout
      title="Customers"
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
            placeholder="Search customers..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>

        <CustomerList
          customers={customers}
          onCustomerPress={handleCustomerPress}
          loading={isLoading}
        />
      </View>

      <Modal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
      >
        <CustomerForm
          customer={editingCustomer || undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingCustomer(null);
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




