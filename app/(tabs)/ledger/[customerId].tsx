import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MainLayout } from '../../../components/layout/MainLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LedgerList } from '../../../components/lists/LedgerList';
import { useCustomerLedger } from '../../../lib/hooks/useLedger';
import { useCustomer } from '../../../lib/hooks/useCustomers';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useTheme } from '../../../lib/theme/ThemeContext';
import { formatLedgerForWhatsApp, openWhatsApp } from '../../../lib/utils/whatsapp';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

export default function CustomerLedgerScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { data: customer } = useCustomer(customerId);
  const { data: entries = [], isLoading } = useCustomerLedger(customerId);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const finalBalance = entries.length > 0 ? entries[entries.length - 1]?.balance || 0 : 0;

  const handleWhatsApp = () => {
    if (!customer) return;

    // Check if customer has phone number
    if (customer.phone) {
      const message = formatLedgerForWhatsApp(customer, entries, finalBalance);
      openWhatsApp(customer.phone, message);
    } else {
      // Show modal to enter phone number
      setPhoneNumber('');
      setShowPhoneModal(true);
    }
  };

  const handleSendWhatsApp = () => {
    if (!customer || !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Validate phone number format (basic check)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number (at least 10 digits)');
      return;
    }

    const message = formatLedgerForWhatsApp(customer, entries, finalBalance);
    openWhatsApp(phoneNumber, message);
    setShowPhoneModal(false);
    setPhoneNumber('');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading ledger..." />;
  }

  return (
    <MainLayout title={customer?.name || 'Customer Ledger'} showBack>
      <ScrollView style={styles.container}>
        <Card>
          <View style={styles.summary}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Current Balance</Text>
            <Text
              style={[
                styles.summaryAmount,
                { color: finalBalance < 0 ? theme.error : theme.success },
              ]}
            >
              ₹{Math.abs(finalBalance).toLocaleString()}
            </Text>
            {finalBalance < 0 && (
              <Text style={[styles.summaryNote, { color: theme.textSecondary }]}>(Customer owes you)</Text>
            )}
            {finalBalance > 0 && (
              <Text style={[styles.summaryNote, { color: theme.textSecondary }]}>(You owe customer)</Text>
            )}
            {finalBalance === 0 && (
              <Text style={[styles.summaryNote, { color: theme.textSecondary }]}>(Settled)</Text>
            )}
          </View>
          <View style={[styles.whatsappButtonContainer, { borderTopColor: theme.border }]}>
            <Button
              title="📱 Send via WhatsApp"
              onPress={handleWhatsApp}
              variant="primary"
              style={styles.whatsappButton}
            />
          </View>
        </Card>

        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transaction History</Text>
          <LedgerList entries={entries} loading={isLoading} />
        </Card>
      </ScrollView>

      <Modal
        visible={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          setPhoneNumber('');
        }}
        title="Enter Phone Number"
        footer={
          <View style={styles.modalFooter}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowPhoneModal(false);
                setPhoneNumber('');
              }}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Send"
              onPress={handleSendWhatsApp}
              variant="primary"
              style={styles.modalButton}
            />
          </View>
        }
      >
        <View style={styles.modalContent}>
          <Text style={[styles.modalText, { color: theme.textSecondary }]}>
            {customer?.name} doesn't have a phone number saved. Please enter the phone number to send the ledger via WhatsApp.
          </Text>
          <Input
            label="Phone Number *"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="e.g., +91 9876543210"
            keyboardType="phone-pad"
            autoFocus
          />
          <Text style={[styles.modalHint, { color: theme.textLight }]}>
            Include country code (e.g., +91 for India)
          </Text>
        </View>
      </Modal>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summary: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  whatsappButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  whatsappButton: {
    width: '100%',
  },
  modalContent: {
    padding: 8,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalHint: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

