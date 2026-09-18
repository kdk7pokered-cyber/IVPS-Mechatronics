import {
  User, MachineCardData, MachineDetailData, CategorySummary,
  PaymentInitiateResponse, PaymentRecord, EnquiryItem, FilterParams,
  FeeSettingsResponse, UnlockTransactionsResponse, RegisterResponse, UnlockedBrokerContact,
  GoogleAuthResponse, OAuthAuthorizeResponse, OAuthCallbackRequest, OAuthCompleteRegistrationRequest, OAuthAuthResponse
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ivps_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'Network request failed';
    try {
      const err = await res.json();
      errorMsg = err.detail || err.message || JSON.stringify(err);
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ access_token: string; token_type: string; user: User }>(res);
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    role: 'buyer' | 'broker';
    company?: string;
    business_description?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<RegisterResponse>(res);
  },

  async verifyOtp(email: string, otp: string) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return handleResponse<{ access_token: string; token_type: string; user: User }>(res);
  },

  async resendOtp(email: string) {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ success: boolean; email: string; message: string; dev_otp?: string }>(res);
  },

  async loginWithGoogle(data: {
    id_token?: string;
    code?: string;
    role?: 'buyer' | 'broker';
    phone?: string;
    company?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<GoogleAuthResponse>(res);
  },

  async completeGoogleRegistration(data: {
    google_sub: string;
    email: string;
    name: string;
    role: 'buyer' | 'broker';
    phone?: string;
    company?: string;
    business_description?: string;
    profile_image?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/google/complete-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ access_token: string; token_type: string; user: User }>(res);
  },

  async getOAuthAuthorizeUrl(provider: 'google' | 'yahoo', role?: 'buyer' | 'broker') {
    const params = new URLSearchParams({ provider });
    if (role) {
      params.append('role', role);
    }
    const res = await fetch(`${API_BASE}/auth/oauth/authorize?${params.toString()}`);
    return handleResponse<OAuthAuthorizeResponse>(res);
  },

  async handleOAuthCallback(data: OAuthCallbackRequest) {
    const res = await fetch(`${API_BASE}/auth/oauth/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<OAuthAuthResponse>(res);
  },

  async completeOAuthRegistration(data: OAuthCompleteRegistrationRequest) {
    const res = await fetch(`${API_BASE}/auth/oauth/complete-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<OAuthAuthResponse>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<User>(res);
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<User>(res);
  },

  // Machines
  async getCategoriesSummary() {
    const res = await fetch(`${API_BASE}/machines/categories/summary`);
    return handleResponse<CategorySummary[]>(res);
  },

  async listMachines(params: FilterParams = {}) {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.listing_type) query.set('listing_type', params.listing_type);
    if (params.category) query.set('category', params.category);
    if (params.manufacturer) query.set('manufacturer', params.manufacturer);
    if (params.condition) query.set('condition', params.condition);
    if (params.min_price !== undefined && params.min_price !== null) query.set('min_price', params.min_price.toString());
    if (params.max_price !== undefined && params.max_price !== null) query.set('max_price', params.max_price.toString());
    if (params.min_year !== undefined && params.min_year !== null) query.set('min_year', params.min_year.toString());
    if (params.max_year !== undefined && params.max_year !== null) query.set('max_year', params.max_year.toString());
    if (params.max_hours !== undefined && params.max_hours !== null) query.set('max_hours', params.max_hours.toString());
    if (params.location) query.set('location', params.location);
    if (params.is_featured !== undefined) query.set('is_featured', params.is_featured.toString());
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.page) query.set('page', params.page.toString());
    if (params.page_size) query.set('page_size', params.page_size.toString());

    const res = await fetch(`${API_BASE}/machines?${query.toString()}`);
    return handleResponse<{
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      items: MachineCardData[];
    }>(res);
  },

  async getMachineDetail(id: number) {
    const res = await fetch(`${API_BASE}/machines/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<MachineDetailData>(res);
  },

  async createMachine(data: any) {
    const res = await fetch(`${API_BASE}/machines`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<MachineDetailData>(res);
  },

  async updateMachine(id: number, data: any) {
    const res = await fetch(`${API_BASE}/machines/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<MachineDetailData>(res);
  },

  async deleteMachine(id: number) {
    const res = await fetch(`${API_BASE}/machines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Contact Unlock & Payments
  async initiateUnlock(machineId: number, paymentMethod: string = 'upi') {
    const res = await fetch(`${API_BASE}/unlock/initiate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ machine_id: machineId, payment_method: paymentMethod })
    });
    return handleResponse<PaymentInitiateResponse>(res);
  },

  async verifyUnlock(paymentId: number, simulateStatus: string = 'success') {
    const res = await fetch(`${API_BASE}/unlock/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_id: paymentId, simulate_status: simulateStatus })
    });
    return handleResponse<{
      success: boolean;
      status: string;
      message: string;
      contact?: UnlockedBrokerContact;
    }>(res);
  },

  async checkUnlockStatus(machineId: number) {
    const res = await fetch(`${API_BASE}/unlock/status/${machineId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ is_unlocked: boolean; is_owner: boolean; unlocked_at?: string }>(res);
  },

  async getMyPayments() {
    const res = await fetch(`${API_BASE}/payments/my-payments`, {
      headers: getAuthHeaders()
    });
    return handleResponse<PaymentRecord[]>(res);
  },

  // Enquiries
  async sendEnquiry(data: any) {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<EnquiryItem>(res);
  },

  async getReceivedEnquiries() {
    const res = await fetch(`${API_BASE}/enquiries/received`, {
      headers: getAuthHeaders()
    });
    return handleResponse<EnquiryItem[]>(res);
  },

  async getSentEnquiries() {
    const res = await fetch(`${API_BASE}/enquiries/sent`, {
      headers: getAuthHeaders()
    });
    return handleResponse<EnquiryItem[]>(res);
  },

  async updateEnquiryStatus(id: number, status: string) {
    const res = await fetch(`${API_BASE}/enquiries/${id}/status?status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; status: string }>(res);
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${API_BASE}/wishlist`, {
      headers: getAuthHeaders()
    });
    return handleResponse<MachineCardData[]>(res);
  },

  async getWishlistIds() {
    const res = await fetch(`${API_BASE}/wishlist/ids`, {
      headers: getAuthHeaders()
    });
    return handleResponse<number[]>(res);
  },

  async toggleWishlist(machineId: number) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ machine_id: machineId })
    });
    return handleResponse<{ saved: boolean; machine_id: number }>(res);
  },

  // Dashboard & Admin
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async getPendingMachines(page: number = 1) {
    const res = await fetch(`${API_BASE}/admin/pending-machines?page=${page}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ total: number; items: any[] }>(res);
  },

  async moderateMachine(machineId: number, status: string, rejectionReason?: string) {
    const res = await fetch(`${API_BASE}/admin/machines/${machineId}/moderate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, rejection_reason: rejectionReason })
    });
    return handleResponse<any>(res);
  },

  async toggleMachineFeature(machineId: number, isFeatured: boolean) {
    const res = await fetch(`${API_BASE}/admin/machines/${machineId}/feature`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_featured: isFeatured })
    });
    return handleResponse<any>(res);
  },

  async getAdminUsers(role?: string) {
    const url = role ? `${API_BASE}/admin/users?role=${role}` : `${API_BASE}/admin/users`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse<User[]>(res);
  },

  async verifyUser(userId: number) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<{ success: boolean; user_id: number; is_verified: boolean }>(res);
  },

  // Admin Contact Unlock Fee Controls
  async getFeeSettings() {
    const res = await fetch(`${API_BASE}/admin/settings/fee`, {
      headers: getAuthHeaders()
    });
    return handleResponse<FeeSettingsResponse>(res);
  },

  async updatePlatformFee(defaultFee: number) {
    const res = await fetch(`${API_BASE}/admin/settings/fee`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ default_fee: defaultFee })
    });
    return handleResponse<{ success: boolean; default_contact_unlock_fee: number; currency: string; message: string }>(res);
  },

  async updateMachineFee(machineId: number, contactUnlockFee: number | null) {
    const res = await fetch(`${API_BASE}/admin/machines/${machineId}/fee`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ contact_unlock_fee: contactUnlockFee })
    });
    return handleResponse<{ success: boolean; machine_id: number; machine_title: string; contact_unlock_fee: number | null; message: string }>(res);
  },

  async getUnlockTransactions(page: number = 1, pageSize: number = 25) {
    const res = await fetch(`${API_BASE}/admin/unlock-transactions?page=${page}&page_size=${pageSize}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<UnlockTransactionsResponse>(res);
  }
};
