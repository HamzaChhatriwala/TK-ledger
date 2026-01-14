import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import type { LedgerEntry } from '../../lib/hooks/useLedger';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useTheme } from '../../lib/theme/ThemeContext';

interface LedgerListProps {
  entries: LedgerEntry[];
  loading?: boolean;
}

export const LedgerList: React.FC<LedgerListProps> = ({ entries, loading }) => {
  const { theme } = useTheme();
  
  if (loading) {
    return <LoadingSpinner message="Loading ledger..." />;
  }

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No ledger entries found</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal>
      <View>
        <View style={[styles.header, { backgroundColor: theme.borderLight, borderBottomColor: theme.border }]}>
          <Text style={[styles.headerCell, styles.dateCell, { color: theme.text }]}>Date</Text>
          <Text style={[styles.headerCell, styles.typeCell, { color: theme.text }]}>Type</Text>
          <Text style={[styles.headerCell, styles.descCell, { color: theme.text }]}>Description</Text>
          <Text style={[styles.headerCell, styles.refCell, { color: theme.text }]}>Reference</Text>
          <Text style={[styles.headerCell, styles.amountCell, { color: theme.text }]}>Debit</Text>
          <Text style={[styles.headerCell, styles.amountCell, { color: theme.text }]}>Credit</Text>
          <Text style={[styles.headerCell, styles.balanceCell, { color: theme.text }]}>Balance</Text>
        </View>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: theme.card, borderBottomColor: theme.border },
                item.type === 'payment' && { backgroundColor: theme.surface },
              ]}
            >
              <Text style={[styles.cell, styles.dateCell, { color: theme.text }]}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.cell, styles.typeCell, { color: theme.text }]}>
                {item.type === 'invoice' ? 'INV' : 'PAY'}
              </Text>
              <Text style={[styles.cell, styles.descCell, { color: theme.text }]} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={[styles.cell, styles.refCell, { color: theme.text }]} numberOfLines={1}>
                {item.reference || '-'}
              </Text>
              <Text style={[styles.cell, styles.amountCell, { color: item.debit === 0 ? theme.textLight : theme.text }]}>
                {item.debit > 0 ? `₹${item.debit.toLocaleString()}` : '-'}
              </Text>
              <Text style={[styles.cell, styles.amountCell, { color: item.credit === 0 ? theme.textLight : theme.text }]}>
                {item.credit > 0 ? `₹${item.credit.toLocaleString()}` : '-'}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.balanceCell,
                  { color: item.balance < 0 ? theme.error : theme.text },
                ]}
              >
                ₹{item.balance.toLocaleString()}
              </Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  cell: {
    fontSize: 14,
  },
  dateCell: {
    width: 100,
  },
  typeCell: {
    width: 60,
    fontWeight: '600',
  },
  descCell: {
    width: 200,
  },
  refCell: {
    width: 120,
  },
  amountCell: {
    width: 100,
    textAlign: 'right',
  },
  balanceCell: {
    width: 120,
    textAlign: 'right',
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

