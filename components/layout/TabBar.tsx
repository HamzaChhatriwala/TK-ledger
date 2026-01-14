import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../lib/theme/ThemeContext';

interface Tab {
  name: string;
  label: string;
  route: string;
}

const tabs: Tab[] = [
  { name: 'customers', label: 'Customers', route: '/(tabs)/customers' },
  { name: 'invoices', label: 'Invoices', route: '/(tabs)/invoices' },
  { name: 'payments', label: 'Payments', route: '/(tabs)/payments' },
  { name: 'ledger', label: 'Ledger', route: '/(tabs)/ledger' },
];

export const TabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const isActive = (route: string) => {
    return pathname?.startsWith(route);
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const active = isActive(tab.route);
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, active && { borderBottomColor: theme.tabActive }]}
            onPress={() => router.push(tab.route as any)}
          >
            <Text
              style={[
                styles.tabText,
                { color: active ? theme.tabActive : theme.tabInactive },
                active && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
});

