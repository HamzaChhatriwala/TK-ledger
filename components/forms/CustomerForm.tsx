import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Customer } from '../../types';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [customerId, setCustomerId] = useState(customer?.customer_id || '');
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [gstVat, setGstVat] = useState(customer?.gst_vat || '');
  const [creditLimit, setCreditLimit] = useState(customer?.credit_limit?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    }
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (creditLimit && isNaN(Number(creditLimit))) {
      newErrors.creditLimit = 'Credit limit must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      customer_id: customerId.trim(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      gst_vat: gstVat.trim() || undefined,
      credit_limit: creditLimit ? Number(creditLimit) : undefined,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Customer ID *"
        value={customerId}
        onChangeText={setCustomerId}
        placeholder="e.g., CUST001"
        error={errors.customerId}
        editable={!customer}
      />

      <Input
        label="Name *"
        value={name}
        onChangeText={setName}
        placeholder="Customer name"
        error={errors.name}
      />

      <Input
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone number"
        keyboardType="phone-pad"
      />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Address"
        value={address}
        onChangeText={setAddress}
        placeholder="Full address"
        multiline
        numberOfLines={3}
      />

      <Input
        label="GST/VAT"
        value={gstVat}
        onChangeText={setGstVat}
        placeholder="GST/VAT number"
      />

      <Input
        label="Credit Limit"
        value={creditLimit}
        onChangeText={setCreditLimit}
        placeholder="Credit limit amount"
        keyboardType="decimal-pad"
        error={errors.creditLimit}
      />

      <View style={styles.buttons}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title={customer ? 'Update' : 'Create'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    flex: 1,
  },
});




