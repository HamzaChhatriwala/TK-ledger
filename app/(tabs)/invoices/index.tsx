import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Text } from 'react-native';

export default function InvoicesScreen() {
  return (
    <MainLayout title="Invoices">
      <View style={styles.container}>
        <Text>Invoices screen - Coming soon</Text>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

