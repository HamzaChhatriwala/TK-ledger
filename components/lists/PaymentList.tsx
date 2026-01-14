import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import type { Payment, Customer } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../lib/theme/ThemeContext';

interface PaymentListProps {
  payments: Payment[];
  customers: Customer[];
  onPaymentPress: (payment: Payment) => void;
  loading?: boolean;
}

export const PaymentList: React.FC<PaymentListProps> = ({
  payments,
  customers,
  onPaymentPress,
  loading,
}) => {
  const { theme } = useTheme();
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getMethodColor = (method: Payment['method']) => {
    switch (method) {
      case 'cash':
        return '#34C759';
      case 'card':
        return '#007AFF';
      case 'upi':
        return '#5856D6';
      case 'bank_transfer':
        return '#FF9500';
      case 'cheque':
        return '#FF3B30';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading payments..." />;
  }

  if (payments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No payments found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={payments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
          onPress={() => onPaymentPress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <View style={styles.header}>
              <View style={styles.amountContainer}>
                <Text style={[styles.customerName, { color: theme.text }]}>{getCustomerName(item.customer_id)}</Text>
                <Text style={[styles.amount, { color: theme.success }]}>₹{item.amount.toLocaleString()}</Text>
              </View>
              <View
                style={[
                  styles.methodBadge,
                  { backgroundColor: getMethodColor(item.method) + '20' },
                ]}
              >
                <Text style={[styles.methodText, { color: getMethodColor(item.method) }]}>
                  {item.method.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={[styles.date, { color: theme.textSecondary }]}>{new Date(item.date).toLocaleDateString()}</Text>
            {item.reference ? (
              <Text style={[styles.reference, { color: theme.textLight }]}>Ref: {item.reference}</Text>
            ) : (
              <Text style={[styles.reference, { color: theme.textLight, fontStyle: 'italic' }]}>No reference</Text>
            )}
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  amountContainer: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  methodBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    marginBottom: 4,
  },
  reference: {
    fontSize: 12,
    fontStyle: 'italic',
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

