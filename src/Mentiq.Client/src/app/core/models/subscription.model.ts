/** Effective access snapshot — always computed on the backend, never trusted from the client. */
export interface SubscriptionStatus {
  status: 'Trial' | 'Active' | 'Expired' | 'Cancelled';
  hasAccess: boolean;
  isTrial: boolean;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  plan: string | null;
  daysRemaining: number;
  accessEndsUtc: string | null;
}

export interface SubscriptionDto {
  userId: string;
  plan: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  provider: string | null;
  activatedByAdminId: string | null;
  notes: string | null;
  trialStartDate: string;
  trialEndDate: string;
}

export interface Plan {
  code: string;
  name: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  period: string;
  durationDays: number;
  description: string | null;
  audiences: string[];
}

export interface PlansResponse {
  plans: Plan[];
  paymentInstructions: string;
  contactEmail: string;
  contactPhone: string;
  manualPayment: boolean;
}

// ---- Admin ----

export interface AdminSubscriptionRow {
  userId: string;
  email: string;
  displayName: string;
  status: string;
  hasAccess: boolean;
  trialEndDate: string;
  plan: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
}

export interface AdminSubscriptionListResponse {
  items: AdminSubscriptionRow[];
  total: number;
}

export interface SubscriptionHistoryItem {
  action: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  provider: string;
  activatedBy: string | null;
  notes: string | null;
  createdAtUtc: string;
}

export interface AdminSubscriptionDetail {
  current: SubscriptionDto;
  status: SubscriptionStatus;
  email: string;
  displayName: string;
  history: SubscriptionHistoryItem[];
}

export interface ActivateSubscriptionRequest {
  plan: string;
  startDate: string;
  endDate: string;
  provider?: string;
  notes?: string | null;
}

export interface ExtendSubscriptionRequest {
  endDate?: string | null;
  addDays?: number | null;
  notes?: string | null;
}

export interface CancelSubscriptionRequest {
  notes?: string | null;
}
