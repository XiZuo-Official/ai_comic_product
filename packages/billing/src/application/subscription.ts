import { grantCredits } from "@ai-comic/credits";

import type {
  BillingPlan,
  CheckoutSession,
  ProcessSubscriptionWebhookInput,
  ProcessSubscriptionWebhookResult,
  StartCheckoutInput,
  SubscriptionOverview
} from "../api";
import {
  MVP_BILLING_PROVIDER,
  normalizeNullableText,
  parseCheckoutInput,
  parseOptionalDate,
  parseSubscriptionWebhookInput,
  shouldGrantCreditsForEventType,
  statusForSubscriptionEvent
} from "../domain/subscription";
import {
  buildPlaceholderCheckoutUrl,
  findPlanByCode,
  findSubscriptionByOwner,
  listActivePlans,
  markSubscriptionEventProcessed,
  recordSubscriptionEvent,
  upsertSubscription
} from "../infrastructure/subscription-repository";

export async function listBillingPlans(): Promise<BillingPlan[]> {
  return listActivePlans();
}

export async function getSubscriptionOverview(ownerId: string): Promise<SubscriptionOverview> {
  const [plans, subscription] = await Promise.all([listActivePlans(), findSubscriptionByOwner(ownerId)]);
  const plan = subscription ? plans.find((item) => item.id === subscription.planId) ?? null : null;

  return {
    plan,
    plans,
    status: subscription?.status ?? "none",
    subscription
  };
}

export async function startSubscriptionCheckout(ownerId: string, input: StartCheckoutInput): Promise<CheckoutSession> {
  const parsed = parseCheckoutInput(input);
  const plan = await findPlanByCode(parsed.planCode);

  if (!plan || !plan.isActive) {
    throw new Error("Subscription plan not found");
  }

  return {
    checkoutUrl: buildPlaceholderCheckoutUrl(plan.code),
    planCode: plan.code,
    provider: MVP_BILLING_PROVIDER,
    status: "created"
  };
}

export async function processSubscriptionWebhook(input: ProcessSubscriptionWebhookInput): Promise<ProcessSubscriptionWebhookResult> {
  const parsed = parseSubscriptionWebhookInput(input);
  const plan = await findPlanByCode(parsed.planCode);

  if (!plan || !plan.isActive) {
    throw new Error("Subscription plan not found");
  }

  const event = await recordSubscriptionEvent({
    eventType: parsed.eventType,
    ownerId: parsed.ownerId,
    payload: JSON.stringify(parsed),
    planId: plan.id,
    provider: parsed.provider ?? MVP_BILLING_PROVIDER,
    providerEventId: parsed.providerEventId
  });

  if (event.processedAt) {
    const subscription = await findSubscriptionByOwner(parsed.ownerId);

    return {
      creditGrantApplied: false,
      event,
      subscription
    };
  }

  const subscription = await upsertSubscription({
    currentPeriodEnd: parseOptionalDate(parsed.currentPeriodEnd),
    currentPeriodStart: parseOptionalDate(parsed.currentPeriodStart),
    failureReason: parsed.eventType === "subscription.payment_failed" ? normalizeNullableText(parsed.failureReason) ?? "Payment failed" : null,
    ownerId: parsed.ownerId,
    planId: plan.id,
    provider: parsed.provider ?? MVP_BILLING_PROVIDER,
    providerSubscriptionId: normalizeNullableText(parsed.providerSubscriptionId),
    status: statusForSubscriptionEvent(parsed.eventType)
  });

  let creditLedgerEntryId: string | null = null;
  let creditGrantApplied = false;

  if (shouldGrantCreditsForEventType(parsed.eventType)) {
    const ledgerEntry = await grantCredits(parsed.ownerId, {
      amount: plan.creditGrantAmount,
      idempotencyKey: `subscription:${parsed.provider ?? MVP_BILLING_PROVIDER}:${parsed.providerEventId}:grant`,
      reason: `Subscription credit grant: ${plan.name}`
    });

    creditLedgerEntryId = ledgerEntry.id;
    creditGrantApplied = true;
  }

  const processedEvent = await markSubscriptionEventProcessed({
    creditLedgerEntryId,
    eventId: event.id,
    subscriptionId: subscription.id
  });

  return {
    creditGrantApplied,
    event: processedEvent,
    subscription
  };
}
