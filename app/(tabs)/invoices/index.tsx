import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Button } from '../../../components/ui/Button';
import { InvoiceList } from '../../../components/lists/InvoiceList';
import { Modal } from '../../../components/ui/Modal';
import { InvoiceForm } from '../../../components/forms/InvoiceForm';
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice } from '../../../lib/hooks/useInvoices';
import { useCustomers } from '../../../lib/hooks/useCustomers';
import { useUserRole } from '../../../lib/hooks/useUser';
import type { Invoice } from '../../../types';

export default function InvoicesScreen() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const router = useRouter();
  const userRole = useUserRole();
  const { data: customers = [] } = useCustomers();
  const { data: invoices = [], isLoading } = useInvoices({
    search,
    status: statusFilter || undefined,
  });
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();

  const canEdit = userRole === 'admin' || userRole === 'cashier';

  const handleInvoicePress = (invoice: Invoice) => {
    router.push(`/(tabs)/invoices/${invoice.id}` as any);
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleSubmit = async (data: {
    invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    items: any[];
  }) => {
    try {
      if (editingInvoice) {
        await updateMutation.mutateAsync({
          id: editingInvoice.id,
          updates: data.invoice,
          items: data.items,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowModal(false);
      setEditingInvoice(null);
    } catch (error: any) {
      alert(error.message || 'Error saving invoice');
      console.error('Error saving invoice:', error);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    if (userRole !== 'admin') return;
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await deleteMutation.mutateAsync(invoice.id);
    } catch (error: any) {
      alert(error.message || 'Error deleting invoice');
    }
  };

  return (
    <MainLayout
      title="Invoices"
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
            placeholder="Search invoices..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, statusFilter === '' && styles.filterButtonActive]}
              onPress={() => setStatusFilter('')}
            >
              <Text style={[styles.filterText, statusFilter === '' && styles.filterTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {['draft', 'unpaid', 'partial', 'paid'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[styles.filterText, statusFilter === status && styles.filterTextActive]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <InvoiceList
          invoices={invoices}
          onInvoicePress={handleInvoicePress}
          loading={isLoading}
        />
      </View>

      <Modal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInvoice(null);
        }}
        title={editingInvoice ? 'Edit Invoice' : 'New Invoice'}
      >
        <InvoiceForm
          invoice={editingInvoice || undefined}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setEditingInvoice(null);
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
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    color: '#000',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
});
