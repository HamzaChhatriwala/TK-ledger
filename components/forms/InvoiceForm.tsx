import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Invoice, InvoiceItem, Customer } from '../../types';
import { useTheme } from '../../lib/theme/ThemeContext';

interface InvoiceFormProps {
  invoice?: Invoice;
  items?: InvoiceItem[];
  customers: Customer[];
  onSubmit: (invoice: {
    invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>;
    items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  items: initialItems,
  customers,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [customerId, setCustomerId] = useState(invoice?.customer_id || '');
  const [date, setDate] = useState(invoice?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<Invoice['status']>(invoice?.status || 'draft');
  const [withBill, setWithBill] = useState(invoice?.with_bill !== undefined ? invoice.with_bill : true);
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]>(
    initialItems
      ? initialItems.map((item) => ({
          product_name: item.product_name,
          sku: item.sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_percent: item.tax_percent,
        }))
      : []
  );
  const [simpleAmount, setSimpleAmount] = useState(
    invoice && !invoice.with_bill ? invoice.total.toString() : ''
  );
  const [simpleTax, setSimpleTax] = useState(
    invoice && !invoice.with_bill ? invoice.tax.toString() : '0'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(
        initialItems.map((item) => ({
          product_name: item.product_name,
          sku: item.sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_percent: item.tax_percent,
        }))
      );
    }
  }, [initialItems]);

  const addItem = () => {
    setItems([
      ...items,
      {
        product_name: '',
        sku: '',
        quantity: 1,
        unit_price: 0,
        tax_percent: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotals = () => {
    if (withBill) {
      // Calculate from items
      const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
      const tax = items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price * item.tax_percent) / 100,
        0
      );
      const discount = 0; // Can be added later
      const total = subtotal + tax - discount;
      return { subtotal, tax, discount, total };
    } else {
      // Use simple amount
      const amount = parseFloat(simpleAmount) || 0;
      const taxAmount = parseFloat(simpleTax) || 0;
      const subtotal = amount - taxAmount;
      const discount = 0;
      const total = amount;
      return { subtotal, tax: taxAmount, discount, total };
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!customerId) {
      newErrors.customerId = 'Customer is required';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (withBill) {
      // Validate items for "With Bill"
      if (items.length === 0) {
        newErrors.items = 'At least one item is required';
      }
      items.forEach((item, index) => {
        if (!item.product_name.trim()) {
          newErrors[`item-${index}-product`] = 'Product name is required';
        }
        if (item.quantity <= 0) {
          newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
        }
        if (item.unit_price < 0) {
          newErrors[`item-${index}-price`] = 'Price must be 0 or greater';
        }
      });
    } else {
      // Validate simple amount for "Without Bill"
      if (!simpleAmount || parseFloat(simpleAmount) <= 0) {
        newErrors.simpleAmount = 'Amount must be greater than 0';
      }
      if (simpleTax && parseFloat(simpleTax) < 0) {
        newErrors.simpleTax = 'Tax cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const { subtotal, tax, discount, total } = calculateTotals();

    // For "Without Bill", create a single item with the amount
    let finalItems: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
    
    if (withBill) {
      // Use the items from the form
      finalItems = items;
    } else {
      // Create a single item for "Without Bill"
      finalItems = [
        {
          product_name: 'Invoice Amount',
          sku: '',
          quantity: 1,
          unit_price: total,
          tax_percent: tax > 0 ? (tax / subtotal) * 100 : 0,
        },
      ];
    }

    await onSubmit({
      invoice: {
        customer_id: customerId,
        invoice_no: invoice?.invoice_no || '', // Will be generated on server
        date,
        status,
        subtotal,
        tax,
        discount,
        total,
        notes: notes.trim() || undefined,
        with_bill: withBill,
      },
      items: finalItems,
    });
  };

  const { subtotal, tax, discount, total } = calculateTotals();
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Customer *"
        value={customerId}
        onChangeText={setCustomerId}
        placeholder="Select customer"
        error={errors.customerId}
        editable={false}
      />

      <View style={styles.selectContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Customer *</Text>
        <ScrollView horizontal style={styles.customerScroll}>
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={[
                styles.customerOption,
                {
                  backgroundColor: customerId === customer.id ? theme.primary : theme.borderLight,
                  borderColor: customerId === customer.id ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setCustomerId(customer.id)}
            >
              <Text
                style={[
                  styles.customerText,
                  { color: customerId === customer.id ? '#FFF' : theme.text },
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
        label="Date *"
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        error={errors.date}
      />

      <View style={styles.selectContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Status</Text>
        <View style={styles.statusContainer}>
          {(['draft', 'unpaid', 'partial', 'paid'] as Invoice['status'][]).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusOption,
                {
                  backgroundColor: status === s ? theme.primary : theme.borderLight,
                  borderColor: status === s ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setStatus(s)}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: status === s ? '#FFF' : theme.text },
                  status === s && styles.statusTextSelected,
                ]}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.selectContainer}>
        <Text style={[styles.label, { color: theme.text }]}>Bill Option *</Text>
        <View style={styles.billContainer}>
          <TouchableOpacity
            style={[
              styles.billOption,
              {
                backgroundColor: withBill ? theme.primary : theme.borderLight,
                borderColor: withBill ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setWithBill(true);
              // Clear simple amount when switching to "With Bill"
              if (!withBill) {
                setSimpleAmount('');
                setSimpleTax('0');
              }
            }}
          >
            <Text style={[styles.billText, { color: withBill ? '#FFF' : theme.text }]}>
              With Bill
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.billOption,
              {
                backgroundColor: !withBill ? theme.primary : theme.borderLight,
                borderColor: !withBill ? theme.primary : theme.border,
              },
            ]}
            onPress={() => {
              setWithBill(false);
              // Clear items when switching to "Without Bill"
              if (withBill) {
                setItems([]);
              }
            }}
          >
            <Text style={[styles.billText, { color: !withBill ? '#FFF' : theme.text }]}>
              Without Bill
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {withBill ? (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Items *</Text>
          {errors.items && <Text style={[styles.errorText, { color: theme.error }]}>{errors.items}</Text>}
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Invoice Amount *</Text>
          <Input
            label="Total Amount *"
            value={simpleAmount}
            onChangeText={setSimpleAmount}
            placeholder="Enter invoice amount"
            keyboardType="decimal-pad"
            error={errors.simpleAmount}
          />
          <Input
            label="Tax Amount (Optional)"
            value={simpleTax}
            onChangeText={setSimpleTax}
            placeholder="Enter tax amount"
            keyboardType="decimal-pad"
            error={errors.simpleTax}
          />
        </>
      )}

      {withBill && (
        <>
          {items.map((item, index) => (
            <View key={index} style={[styles.itemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.itemHeader}>
                <Text style={[styles.itemNumber, { color: theme.text }]}>Item {index + 1}</Text>
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <Text style={[styles.removeButton, { color: theme.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Product Name *"
                value={item.product_name}
                onChangeText={(value) => updateItem(index, 'product_name', value)}
                placeholder="Product name"
                error={errors[`item-${index}-product`]}
              />

              <Input
                label="SKU"
                value={item.sku || ''}
                onChangeText={(value) => updateItem(index, 'sku', value)}
                placeholder="SKU code"
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Quantity *"
                    value={item.quantity.toString()}
                    onChangeText={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                    error={errors[`item-${index}-quantity`]}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Unit Price *"
                    value={item.unit_price.toString()}
                    onChangeText={(value) => updateItem(index, 'unit_price', parseFloat(value) || 0)}
                    keyboardType="decimal-pad"
                    error={errors[`item-${index}-price`]}
                  />
                </View>
              </View>

              <Input
                label="Tax %"
                value={item.tax_percent.toString()}
                onChangeText={(value) => updateItem(index, 'tax_percent', parseFloat(value) || 0)}
                keyboardType="decimal-pad"
              />
            </View>
          ))}

          <Button title="+ Add Item" onPress={addItem} variant="outline" style={styles.addButton} />
        </>
      )}

      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes"
        multiline
        numberOfLines={3}
      />

      <View style={[styles.totals, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Subtotal:</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>₹{subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Tax:</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>₹{tax.toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Discount:</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>₹{discount.toLocaleString()}</Text>
        </View>
        <View style={[styles.totalRow, styles.totalRowFinal, { borderTopColor: theme.border }]}>
          <Text style={[styles.totalLabelFinal, { color: theme.text }]}>Total:</Text>
          <Text style={[styles.totalValueFinal, { color: theme.primary }]}>₹{total.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="outline"
          style={styles.button}
        />
        <Button
          title={invoice ? 'Update' : 'Create'}
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
  },
  customerScroll: {
    maxHeight: 100,
  },
  customerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  customerSelected: {
    borderColor: '#FF0000',
  },
  customerText: {
    fontSize: 14,
  },
  customerTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
  },
  statusTextSelected: {
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  itemCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addButton: {
    marginBottom: 16,
  },
  totals: {
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: '700',
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
    fontSize: 12,
    marginTop: 4,
  },
  billContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  billOption: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  billText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

