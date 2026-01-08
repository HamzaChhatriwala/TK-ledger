import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Text } from 'react-native';

export default function PaymentsScreen() {
  return (
    <MainLayout title="Payments">
      <View style={styles.container}>
        <Text>Payments screen - Coming soon</Text>
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

