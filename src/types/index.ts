export type UserRole = 'owner' | 'admin' | 'staff';

export interface User {
  id: string;
  storeId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  tagline?: string;
  ownerId: string;
  businessType: 'kirana' | 'retail' | 'wholesale' | 'general' | 'other';
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  currency: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  phone: string;
  address?: string;
  totalBusiness: number; // authoritative total sales
  pendingUdhaar: number; // authoritative balance owed
  lastTransactionAt?: string;
  lastTransactionType?: string;
  totalTransactionsCount: number;
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'sale' | 'purchase' | 'payment' | 'expense' | 'income' | 'return' | 'note';

export interface LineItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Transaction {
  id: string;
  storeId: string;
  customerId?: string;
  customerName?: string;
  type: TransactionType;
  items: LineItem[];
  totalAmount: number;
  paidAmount: number;
  udhaarAmount: number; // remaining unpaid credit
  paymentMode?: 'cash' | 'upi' | 'card' | 'credit' | 'bank_transfer';
  billNumber?: string;
  billImageUrl?: string;
  notes?: string;
  date: string;
  createdAt: string;
  createdBy: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  unit: string; // kg, pc, litre, packet, box
  defaultPrice?: number;
  purchasePrice?: number;
  stockQuantity: number;
  minStockLevel?: number;
  barcode?: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  storeId: string;
  title: string;
  message: string;
  type: 'payment' | 'udhaar' | 'bill' | 'system' | 'stock';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLog {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ip?: string;
  createdAt: string;
}

export interface BillExtractionResult {
  supplier?: string;
  billNumber?: string;
  date?: string;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  confidence: number;
  notes?: string;
}

export interface VoiceParseResult {
  customerName?: string;
  type: TransactionType;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  paidAmount: number;
  udhaarAmount: number;
  confidence: number;
  rawTranscript: string;
}
