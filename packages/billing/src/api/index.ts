export type BillingPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  monthlyPriceCents: number;
  currency: string;
  creditGrantAmount: number;
  billingPeriod: "monthly";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionStatus = "none" | "incomplete" | "trialing" | "active" | "past_due" | "canceled";

export type SubscriptionProvider = "mvp_placeholder";

export type BillingSubscription = {
  id: string;
  ownerId: string;
  planId: string;
  status: Exclude<SubscriptionStatus, "none">;
  provider: SubscriptionProvider;
  providerSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  lastPaymentFailureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionEventType =
  | "subscription.activated"
  | "subscription.renewed"
  | "subscription.payment_failed"
  | "subscription.canceled";

export type SubscriptionEvent = {
  id: string;
  provider: SubscriptionProvider;
  providerEventId: string;
  eventType: SubscriptionEventType;
  ownerId: string;
  planId: string | null;
  subscriptionId: string | null;
  creditLedgerEntryId: string | null;
  processedAt: Date | null;
  createdAt: Date;
};

export type SubscriptionOverview = {
  plan: BillingPlan | null;
  plans: BillingPlan[];
  status: SubscriptionStatus;
  subscription: BillingSubscription | null;
};

export type StartCheckoutInput = {
  planCode: string;
};

export type CheckoutSession = {
  checkoutUrl: string;
  planCode: string;
  provider: SubscriptionProvider;
  status: "created";
};

export type ProcessSubscriptionWebhookInput = {
  currentPeriodEnd?: string | null;
  currentPeriodStart?: string | null;
  eventType: SubscriptionEventType;
  failureReason?: string | null;
  ownerId: string;
  planCode: string;
  provider?: SubscriptionProvider;
  providerEventId: string;
  providerSubscriptionId?: string | null;
};

export type ProcessSubscriptionWebhookResult = {
  creditGrantApplied: boolean;
  event: SubscriptionEvent;
  subscription: BillingSubscription | null;
};
