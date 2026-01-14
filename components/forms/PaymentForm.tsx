import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Payment, Invoice, Customer } from '../../types';
import { useTheme } from '../../lib/theme/ThemeContext';

interface PaymentFormProps {
  payment?: Payment;
  customers: Customer[];
  invoices?: Invoice[];
  onSubmit: (payment: {
    payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    allocations: Array<{ invoice_id: string; amount: number }>;
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  customers,
  invoices = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [customerId, setCustomerId] = useState(payment?.customer_id || '');
  const [amount, setAmount] = useState(payment?.amount.toString() || '');
  const [method, setMethod] = useState<Payment['method']>(payment?.method || 'cash');
  const [reference, setReference] = useState(payment?.reference || '');
  const [notes, setNotes] = useState(payment?.notes || '');
  const [date, setDate] = useState(payment?.date || new Date().toISOString().split('T')[0]);
  const [allocations, setAllocations] = useState<Array<{ invoice_id: string; amount: number }>>(
    []
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { theme } = useTheme();

  // Filter invoices for selected customer
  const customerInvoices = invoices.filter((inv) => inv.customer_id === customerId);

  useEffect(() => {
    if (customerId && customerInvoices.length > 0) {
      // Auto-allocate to first unpaid invoice if no allocations exist
      if (allocations.length === 0 && customerInvoices.length > 0) {
        const unpaidInvoice = customerInvoices.find((inv) => inv.status !== 'paid');
        if (unpaidInvoice && amount) {
          const allocAmount = Math.min(parseFloat(amount) || 0, unpaidInvoice.total);
          setAllocations([{ invoice_id: unpaidInvoice.id, amount: allocAmount }]);
        }
      }
    }
  }, [customerId, amount]);

  const addAllocation = () => {
    if (customerInvoices.length > 0) {
      setAllocations([
        ...allocations,
        {
          invoice_id: customerInvoices[0].id,
          amount: 0,
        },
      ]);
    }
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: string, value: any) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  const getInvoiceOutstanding = (invoice: Invoice): number => {
    // This would ideally come from the database, but for now we'll use total
    return invoice.total;
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const paymentAmount = parseFloat(amount) || 0;
  const remaining = paymentAmount - totalAllocated;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Customer is required';
    }
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    if (totalAllocated > paymentAmount) {
      newErrors.allocations = 'Total allocations cannot exceed payment amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      payment: {
        customer_id: customerId,
        amount: paymentAmount,
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        date,
      },
      allocations: allocations.filter((alloc) => alloc.amount > 0),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.selectContainer}>
        <Text style={styles.label}>Customer *</Text>
        <ScrollView horizontal style={styles.customerScroll}>
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={[styles.customerOption, customerId === customer.id && styles.customerSelected]}
              onPress={() => setCustomerId(customer.id)}
            >
              <Text
                style={[
                  styles.customerText,
                  customerId === customer.id && styles.customerTextSelected,
                ]}
              >
                {customer.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.customerId && <Text style={styles.errorText}>{errors.customerId}</Text>}
      </View>

      <Input
        label="Amount *"
        value={amount}
        onChangeText={setAmount}
        placeholder="Payment amount"
        keyboardType="decimal-pad"
        error={errors.amount}
      />

      <Input
        label="Date *"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        error={errors.date}
      />

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.methodContainer}>
          {(['cash', 'card', 'upi', 'bank_transfer', 'cheque'] as Payment['method'][]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.methodOption, method === m && styles.methodSelected]}
              onPress={() => setMethod(m)}
            >
              <Text style={[styles.methodText, method === m && styles.methodTextSelected]}>
                {m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Reference"
        value={reference}
        onChangeText={setReference}
        placeholder="Transaction reference"
      />

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes"
        multiline
        numberOfLines={3}
      />

      {customerId && customerInvoices.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Allocate to Invoices (Optional)</Text>
          <Text style={[styles.helpText, { color: theme.textSecondary }]}>
            Note: Payments without allocations will still be recorded and deducted from customer balance in the ledger.
          </Text>
          {errors.allocations && <Text style={styles.errorText}>{errors.allocations}</Text>}

          {allocations.map((allocation, index) => {
            const invoice = customerInvoices.find((inv) => inv.id === allocation.invoice_id);
            return (
              <View key={index} style={styles.allocationCard}>
                <View style={styles.allocationHeader}>
                  <Text style={styles.allocationNumber}>Allocation {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeAllocation(index)}>
                    <Text style={styles.removeButton}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectContainer}>
                  <Text style={styles.label}>Invoice</Text>
                  <ScrollView horizontal>
                    {customerInvoices.map((inv) => (
                      <TouchableOpacity
                        key={inv.id}
                        style={[
                          styles.invoiceOption,
                          allocation.invoice_id === inv.id && styles.invoiceSelected,
                        ]}
                        onPress={() => updateAllocation(index, 'invoice_id', inv.id)}
                      >
                        <Text
                          style={[
                            styles.invoiceText,
                            allocation.invoice_id === inv.id && styles.invoiceTextSelected,
                          ]}
                        >
                          {inv.invoice_no} (₹{inv.total.toLocaleString()})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Input
                  label="Amount"
                  value={allocation.amount.toString()}
                  onChangeText={(value) =>
                    updateAllocation(index, 'amount', parseFloat(value) || 0)
                  }
                  keyboardType="decimal-pad"
                  placeholder="Allocation amount"
                />

                {invoice && (
                  <Text style={styles.outstandingText}>
                    Outstanding: ₹{getInvoiceOutstanding(invoice).toLocaleString()}
                  </Text>
                )}
              </View>
            );
          })}

          <Button
            title="+ Add Allocation"
            onPress={addAllocation}
            variant="outline"
            style={styles.addButton}
          />
        </>
      )}

      {paymentAmount > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Amount:</Text>
            <Text style={styles.summaryValue}>₹{paymentAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allocated:</Text>
            <Text style={styles.summaryValue}>₹{totalAllocated.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowFinal]}>
            <Text style={styles.summaryLabelFinal}>Remaining:</Text>
            <Text
              style={[
                styles.summaryValueFinal,
                remaining < 0 && styles.summaryValueError,
              ]}
            >
              ₹{remaining.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.buttons}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title={payment ? 'Update' : 'Create'}
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
  selectContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  customerScroll: {
    maxHeight: 100,
  },
  customerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  customerSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  customerText: {
    fontSize: 14,
    color: '#000',
  },
  customerTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  methodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  methodSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  methodText: {
    fontSize: 14,
    color: '#000',
  },
  methodTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  helpText: {
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  allocationCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  allocationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  removeButton: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  invoiceSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  invoiceText: {
    fontSize: 12,
    color: '#000',
  },
  invoiceTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  outstandingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addButton: {
    marginBottom: 16,
  },
  summary: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  summaryLabelFinal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  summaryValueFinal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34C759',
  },
  summaryValueError: {
    color: '#FF3B30',
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
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
});

