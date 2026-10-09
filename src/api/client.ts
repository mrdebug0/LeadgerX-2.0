import {
  User,
  Store,
  Customer,
  Transaction,
  Product,
  AppNotification,
  AuditLog,
  BillExtractionResult,
  VoiceParseResult,
} from '../types';

const TOKEN_KEY = 'leadgerx_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; store: Store }> {
    const data = await request<{ token: string; user: User; store: Store }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(data.token);
    return data;
  },

  async register(params: {
    storeName: string;
    businessType: string;
    ownerName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ token: string; user: User; store: Store }> {
    const data = await request<{ token: string; user: User; store: Store }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setStoredToken(data.token);
    return data;
  },

  async demoLogin(): Promise<{ token: string; user: User; store: Store }> {
    const data = await request<{ token: string; user: User; store: Store }>('/api/auth/demo', {
      method: 'POST',
    });
    setStoredToken(data.token);
    return data;
  },

  async getCurrentUser(): Promise<{ user: User; store: Store }> {
    return request<{ user: User; store: Store }>('/api/auth/me');
  },

  logout(): void {
    removeStoredToken();
  },

  // Store
  async getStore(): Promise<Store> {
    return request<Store>('/api/store');
  },

  async updateStore(storeData: Partial<Store>): Promise<Store> {
    return request<Store>('/api/store', {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  },

  // Customers
  async getCustomers(params?: { search?: string; filter?: 'all' | 'udhaar' | 'recent' | 'nodues' }): Promise<Customer[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.filter) searchParams.set('filter', params.filter);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Customer[]>(`/api/customers${query}`);
  },

  async getCustomer(id: string): Promise<{ customer: Customer; timeline: Transaction[] }> {
    return request<{ customer: Customer; timeline: Transaction[] }>(`/api/customers/${id}`);
  },

  async createCustomer(customer: { name: string; phone: string; address?: string; notes?: string }): Promise<Customer> {
    return request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return request<Customer>(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Transactions
  async getTransactions(params?: { type?: string; customerId?: string; limit?: number }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.customerId) searchParams.set('customerId', params.customerId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<Transaction[]>(`/api/transactions${query}`);
  },

  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    return request<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  },

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Products
  async getProducts(search?: string): Promise<Product[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<Product[]>(`/api/products${query}`);
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    return request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // Reports
  async getReportsSummary(timeframe: 'today' | '7days' | '30days' | 'all' = 'today'): Promise<{
    totalSales: number;
    totalPurchases: number;
    totalExpenses: number;
    totalPaymentsReceived: number;
    totalOutstandingUdhaar: number;
    customersWithUdhaarCount: number;
    salesCount: number;
    totalCustomersCount: number;
    recentTransactions: Transaction[];
  }> {
    return request(`/api/reports/summary?timeframe=${timeframe}`);
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return request<AppNotification[]>('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/api/audit-logs');
  },

  // AI OCR Bill Scan
  async scanBill(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<{
    success: boolean;
    source: string;
    data: BillExtractionResult;
  }> {
    return request('/api/ai/scan-bill', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, mimeType }),
    });
  },

  // AI Voice Parse
  async parseVoice(transcript: string): Promise<{
    success: boolean;
    source: string;
    data: VoiceParseResult;
  }> {
    return request('/api/ai/voice-parse', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  },
};
