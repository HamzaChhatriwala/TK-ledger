import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import type { Customer } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { rpc } from '../../lib/supabase/rpc';

interface CustomerListProps {
  customers: Customer[];
  onCustomerPress: (customer: Customer) => void;
  loading?: boolean;
}

interface CustomerWithBalance extends Customer {
  outstandingBalance?: number;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  onCustomerPress,
  loading,
}) => {
  const [customersWithBalance, setCustomersWithBalance] = React.useState<CustomerWithBalance[]>([]);

  React.useEffect(() => {
    const loadBalances = async () => {
      const withBalances = await Promise.all(
        customers.map(async (customer) => {
          try {
            const balance = await rpc.calculateCustomerBalance(customer.id);
            return { ...customer, outstandingBalance: balance };
          } catch {
            return { ...customer, outstandingBalance: 0 };
          }
        })
      );
      setCustomersWithBalance(withBalances);
    };

    if (customers.length > 0) {
      loadBalances();
    }
  }, [customers]);

  if (loading) {
    return <LoadingSpinner message="Loading customers..." />;
  }

  if (customersWithBalance.length === 0 && customers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No customers found</Text>
      </View>
    );
  }

  const displayCustomers = customersWithBalance.length > 0 ? customersWithBalance : customers;

  return (
    <FlatList
      data={displayCustomers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const customer = item as CustomerWithBalance;
        return (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onCustomerPress(customer)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.customerId}>{customer.customer_id}</Text>
              {customer.phone && <Text style={styles.phone}>{customer.phone}</Text>}
              {customer.email && <Text style={styles.email}>{customer.email}</Text>}
              {customer.outstandingBalance !== undefined && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Outstanding:</Text>
                  <Text
                    style={[
                      styles.balanceAmount,
                      customer.outstandingBalance > 0 && styles.balanceNegative,
                    ]}
                  >
                    ₹{customer.outstandingBalance.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        );
      }}
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
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  customerId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  balanceNegative: {
    color: '#FF3B30',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
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
    color: '#666',
  },
});

