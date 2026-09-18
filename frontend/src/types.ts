export type UserRole = 'buyer' | 'broker' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  business_description?: string;
  role: UserRole;
  profile_image?: string;
  is_verified: boolean;
  google_sub?: string;
  verified_email?: string;
  is_google_verified?: boolean;
  provider?: string;
  provider_user_id?: string;
  is_provider_verified?: boolean;
  created_at: string;
}

export type MachineCondition = 'Brand New' | 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Needs Maintenance';

export interface MachineCardData {
  id: number;
  title: string;
  category: string;
  listing_type: 'new' | 'second_hand';
  manufacturer: string;
  model: string;
  year: number;
  condition: MachineCondition;
  usage_hours: number;
  price: number;
  negotiable: boolean;
  city: string;
  state: string;
  country: string;
  primary_image?: string;
  is_featured: boolean;
  status: string;
  broker_id: number;
  broker_name: string;
  broker_company?: string;
  broker_verified: boolean;
  contact_unlock_fee: number;
  views_count: number;
  created_at: string;
}

export interface UnlockedBrokerContact {
  broker_id: number;
  broker_name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  is_verified: boolean;
  unlocked_at?: string;
}

// Alias for backwards compatibility
export type UnlockedContactInfo = UnlockedBrokerContact;

export interface MachineDetailData {
  id: number;
  broker_id: number;
  broker_name: string;
  broker_company?: string;
  broker_verified: boolean;
  title: string;
  category: string;
  listing_type: 'new' | 'second_hand';
  manufacturer: string;
  model: string;
  year: number;
  condition: MachineCondition;
  usage_hours: number;
  price: number;
  negotiable: boolean;
  country: string;
  state: string;
  city: string;
  address?: string;
  description: string;
  history?: string;
  service_history?: string;
  reason_for_selling?: string;
  included_accessories?: string;
  availability: string;
  specifications: Record<string, any>;
  images: string[];
  status: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  is_contact_unlocked: boolean;
  contact_unlock_fee: number;
  unlocked_contact?: UnlockedBrokerContact;
}

export interface CategorySummary {
  name: string;
  icon: string;
  image: string;
  count: number;
}

export interface PaymentInitiateResponse {
  payment_id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  machine_id: number;
  machine_title: string;
  provider: string;
}

export interface PaymentRecord {
  id: number;
  amount: number;
  currency: string;
  provider: string;
  payment_method: string;
  transaction_id: string;
  status: string;
  failure_reason?: string;
  created_at: string;
  machine_id?: number;
  machine_title?: string;
}

export interface EnquiryItem {
  id: number;
  buyer_id: number;
  broker_id: number;
  machine_id: number;
  machine_title?: string;
  machine_image?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  requirement?: string;
  quantity: number;
  preferred_contact_method: string;
  status: string;
  created_at: string;
}

export interface FilterParams {
  q?: string;
  listing_type?: 'new' | 'second_hand';
  category?: string;
  manufacturer?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  max_hours?: number;
  location?: string;
  is_featured?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}

export interface FeeSettingsResponse {
  default_contact_unlock_fee: number;
  currency: string;
  currency_symbol: string;
  custom_fee_machines_count: number;
}

export interface UnlockTransactionItem {
  unlock_id: number;
  buyer_id: number;
  buyer_name: string;
  buyer_email: string;
  broker_id: number;
  broker_name: string;
  machine_id: number;
  machine_title: string;
  amount: number;
  currency: string;
  unlocked_at: string;
}

export interface UnlockTransactionsResponse {
  total: number;
  total_revenue: number;
  currency: string;
  currency_symbol: string;
  items: UnlockTransactionItem[];
}

export interface RegisterResponse {
  success: boolean;
  requires_verification: boolean;
  email: string;
  role: string;
  message: string;
  dev_otp?: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  user?: User;
  needs_role_selection?: boolean;
  google_sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  message?: string;
}

export interface OAuthAuthorizeResponse {
  authorization_url: string;
  state: string;
  provider: 'google' | 'yahoo';
}

export interface OAuthCallbackRequest {
  provider: 'google' | 'yahoo';
  code: string;
  state: string;
  role?: 'buyer' | 'broker';
}

export interface OAuthCompleteRegistrationRequest {
  provider: 'google' | 'yahoo';
  provider_user_id: string;
  email: string;
  name: string;
  role: 'buyer' | 'broker';
  phone?: string;
  company?: string;
  business_description?: string;
  profile_image?: string;
}

export interface OAuthAuthResponse {
  success: boolean;
  access_token?: string;
  token_type?: string;
  user?: User;
  needs_role_selection?: boolean;
  provider?: string;
  provider_user_id?: string;
  email?: string;
  name?: string;
  picture?: string;
  message?: string;
}

