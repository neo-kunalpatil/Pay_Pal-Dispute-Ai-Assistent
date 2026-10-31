/**
 * Centralized API service layer connecting DisputePilot AI Frontend to FastAPI Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('disputepilot_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Auth
  async login(email: string, password: string, role = 'merchant') {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || 'Login failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('disputepilot_token', data.access_token);
    }
    return data;
  }

  async register(payload: {
    fullName: string;
    businessName?: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: payload.fullName,
        business_name: payload.businessName || `${payload.fullName}'s Account`,
        email: payload.email,
        password: payload.password,
        role: payload.role || 'merchant',
        country: 'US',
        currency: 'USD'
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || 'Registration failed');
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('disputepilot_token', data.access_token);
    }
    return data;
  }

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  }

  // Dashboard
  async getDashboardOverview() {
    const res = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getAdminDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard/admin`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getAnalystDashboard() {
    const res = await fetch(`${API_BASE_URL}/dashboard/analyst`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Users & Team Management
  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async inviteUser(email: string, role = 'analyst', merchantId?: string) {
    const res = await fetch(`${API_BASE_URL}/users/invite`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, role, merchantId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Merchants Management
  async getMerchants() {
    const res = await fetch(`${API_BASE_URL}/merchants`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async createMerchant(payload: { businessName: string; email: string; country?: string; currency?: string }) {
    const res = await fetch(`${API_BASE_URL}/merchants`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Disputes
  async getDisputes(params?: { status?: string; reason?: string; search?: string }) {
    const url = new URL(`${API_BASE_URL}/disputes`);
    if (params?.status && params.status !== 'ALL') url.searchParams.append('status', params.status);
    if (params?.reason && params.reason !== 'ALL') url.searchParams.append('reason', params.reason);
    if (params?.search) url.searchParams.append('search', params.search);

    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getDisputeById(disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async createBuyerDispute(payload: {
    orderNumber: string;
    reason: string;
    statement: string;
    amount: number;
    productName: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/disputes/buyer-create`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Documents
  async getDocuments(category?: string, search?: string) {
    const url = new URL(`${API_BASE_URL}/documents`);
    if (category && category !== 'ALL') url.searchParams.append('category', category);
    if (search) url.searchParams.append('search', search);

    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async uploadDocument(file: File, category: string, linkedDisputeId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (linkedDisputeId) formData.append('linkedDisputeId', linkedDisputeId);

    const token = localStorage.getItem('disputepilot_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async deleteDocument(docId: string) {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async linkDocument(docId: string, disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/documents/${docId}/link`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ dispute_id: disputeId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // AI Investigation
  async runAIInvestigation(disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/investigate`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getInvestigationReport(disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/investigation`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  }

  // Responses & Rebuttal
  async updateDraft(disputeId: string, draft: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/draft`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ draft, merchant_notes: notes }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async approveResponse(disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async submitEvidence(disputeId: string) {
    const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/submit-evidence`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Transactions
  async getTransactions(search?: string) {
    const url = new URL(`${API_BASE_URL}/transactions`);
    if (search) url.searchParams.append('search', search);

    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // PayPal
  async getPayPalConnection() {
    const res = await fetch(`${API_BASE_URL}/paypal/connection`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async testPayPalConnection() {
    const res = await fetch(`${API_BASE_URL}/paypal/test-connection`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async syncPayPalDisputes() {
    const res = await fetch(`${API_BASE_URL}/paypal/disputes/sync`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async getPayPalClientId() {
    const res = await fetch(`${API_BASE_URL}/paypal/client-id`);
    if (!res.ok) return { clientId: '', environment: 'sandbox' };
    return res.json();
  }

  async createPayPalOrder(productName: string, amount: number, currency = 'USD') {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/create-order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ productName, amount, currency }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async capturePayPalOrder(orderId: string) {
    const res = await fetch(`${API_BASE_URL}/payments/paypal/capture-order`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async updateSettings(payload: Record<string, unknown>) {
    const res = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  // Analytics
  async getAnalyticsOverview() {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async markNotificationsRead() {
    const res = await fetch(`${API_BASE_URL}/notifications/mark-read`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

export const api = new ApiService();
