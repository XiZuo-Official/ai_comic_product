import { z } from "zod";

import type { ProcessSubscriptionWebhookInput, StartCheckoutInput, SubscriptionEventType, SubscriptionProvider } from "../api";

export const MVP_BILLING_PROVIDER: SubscriptionProvider = "mvp_placeholder";

export const DEFAULT_BILLING_PLAN = {
  billingPeriod: "monthly" as const,
  code: "mvp_creator",
  creditGrantAmount: 120,
  currency: "USD",
  description: "Placeholder MVP subscription plan until a payment provider is approved.",
  isActive: true,
  monthlyPriceCents: 0,
  name: "MVP Creator"
};

export const checkoutInputSchema = z.object({
  planCode: z.string().trim().min(1).max(80)
});

export const subscriptionWebhookSchema = z.object({
  currentPeriodEnd: z.string().datetime().optional().nullable(),
  currentPeriodStart: z.string().datetime().optional().nullable(),
  eventType: z.enum(["subscription.activated", "subscription.renewed", "subscription.payment_failed", "subscription.canceled"]),
  failureReason: z.string().trim().max(180).optional().nullable(),
  ownerId: z.string().trim().min(1).max(200),
  planCode: z.string().trim().min(1).max(80),
  provider: z.literal(MVP_BILLING_PROVIDER).optional(),
  providerEventId: z.string().trim().min(1).max(180),
  providerSubscriptionId: z.string().trim().max(180).optional().nullable()
});

export function parseCheckoutInput(input: StartCheckoutInput): StartCheckoutInput {
  return checkoutInputSchema.parse(input);
}

export function parseSubscriptionWebhookInput(input: ProcessSubscriptionWebhookInput): ProcessSubscriptionWebhookInput {
  const parsed = subscriptionWebhookSchema.parse(input);

  return {
    ...parsed,
    provider: parsed.provider ?? MVP_BILLING_PROVIDER
  };
}

export function shouldGrantCreditsForEventType(eventType: SubscriptionEventType): boolean {
  return eventType === "subscription.activated" || eventType === "subscription.renewed";
}

export function statusForSubscriptionEvent(eventType: SubscriptionEventType) {
  if (eventType === "subscription.payment_failed") {
    return "past_due" as const;
  }

  if (eventType === "subscription.canceled") {
    return "canceled" as const;
  }

  return "active" as const;
}

export function normalizeNullableText(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}

export function parseOptionalDate(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}
