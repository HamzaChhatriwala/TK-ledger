export type UserRole = 'admin' | 'cashier' | 'viewer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gst_vat?: string;
  credit_limit?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export type InvoiceStatus = 'draft' | 'unpaid' | 'partial' | 'paid';

export interface Invoice {
  id: string;
  invoice_no: string;
  customer_id?: string;
  date: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_name: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  created_at: string;
}

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
}

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  user_id: string;
  created_at: string;
}

