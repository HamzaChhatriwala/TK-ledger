import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import type { Invoice } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../lib/theme/ThemeContext';

interface InvoiceListProps {
  invoices: Invoice[];
  onInvoicePress: (invoice: Invoice) => void;
  loading?: boolean;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onInvoicePress,
  loading,
}) => {
  const { theme } = useTheme();
  const getStatusColor = (status: Invoice['status']) => {
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
  };

  if (loading) {
    return <LoadingSpinner message="Loading invoices..." />;
  }

  if (invoices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No invoices found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invoices}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
          onPress={() => onInvoicePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <View style={styles.header}>
              <Text style={[styles.invoiceNo, { color: theme.text }]}>{item.invoice_no}</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
            <View style={styles.footer}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total:</Text>
              <Text style={[styles.total, { color: theme.text }]}>₹{item.total.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={[styles.arrow, { color: theme.textLight }]}>→</Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNo: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 20,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});

