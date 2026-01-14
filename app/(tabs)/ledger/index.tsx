import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/ui/Card';
import { useAllLedgers } from '../../../lib/hooks/useLedger';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useTheme } from '../../../lib/theme/ThemeContext';

export default function LedgerScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: ledgers = [], isLoading } = useAllLedgers();

  const handleCustomerPress = (customerId: string) => {
    router.push(`/(tabs)/ledger/${customerId}` as any);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading ledgers..." />;
  }

  return (
    <MainLayout title="Ledger">
      <View style={styles.container}>
        {ledgers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No outstanding balances</Text>
          </View>
        ) : (
          <ScrollView style={styles.list}>
            {ledgers.map((ledger) => (
              <TouchableOpacity
                key={ledger.customerId}
                onPress={() => handleCustomerPress(ledger.customerId)}
                activeOpacity={0.7}
              >
                <Card>
                  <View style={styles.customerRow}>
                    <View style={styles.customerInfo}>
                      <Text style={[styles.customerName, { color: theme.text }]}>{ledger.customerName}</Text>
                      <Text style={[styles.customerCode, { color: theme.textSecondary }]}>{ledger.customerCode}</Text>
                    </View>
                    <View style={styles.balanceContainer}>
                      <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Balance:</Text>
                      <Text
                        style={[
                          styles.balanceAmount,
                          { color: ledger.balance < 0 ? theme.error : theme.success },
                        ]}
                      >
                        ₹{Math.abs(ledger.balance).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerCode: {
    fontSize: 14,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
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
