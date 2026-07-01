import {
  db,
  plans,
  subscriptionEvents,
  subscriptions,
  type PlanRow,
  type SubscriptionEventRow,
  type SubscriptionRow
} from "@ai-comic/db";
import { and, desc, eq } from "drizzle-orm";

import type {
  BillingPlan,
  BillingSubscription,
  SubscriptionEvent,
  SubscriptionEventType,
  SubscriptionProvider
} from "../api";
import { DEFAULT_BILLING_PLAN, MVP_BILLING_PROVIDER } from "../domain/subscription";

export function toBillingPlan(row: PlanRow): BillingPlan {
  return {
    id: row.id,
    billingPeriod: row.billingPeriod as BillingPlan["billingPeriod"],
    code: row.code,
    createdAt: row.createdAt,
    creditGrantAmount: row.creditGrantAmount,
    currency: row.currency,
    description: row.description,
    isActive: row.isActive,
    monthlyPriceCents: row.monthlyPriceCents,
    name: row.name,
    updatedAt: row.updatedAt
  };
}

export function toBillingSubscription(row: SubscriptionRow): BillingSubscription {
  return {
    id: row.id,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    createdAt: row.createdAt,
    currentPeriodEnd: row.currentPeriodEnd,
    currentPeriodStart: row.currentPeriodStart,
    lastPaymentFailureReason: row.lastPaymentFailureReason,
    ownerId: row.ownerId,
    planId: row.planId,
    provider: row.provider as SubscriptionProvider,
    providerSubscriptionId: row.providerSubscriptionId,
    status: row.status as BillingSubscription["status"],
    updatedAt: row.updatedAt
  };
}

export function toSubscriptionEvent(row: SubscriptionEventRow): SubscriptionEvent {
  return {
    id: row.id,
    createdAt: row.createdAt,
    creditLedgerEntryId: row.creditLedgerEntryId,
    eventType: row.eventType as SubscriptionEventType,
    ownerId: row.ownerId,
    planId: row.planId,
    processedAt: row.processedAt,
    provider: row.provider as SubscriptionProvider,
    providerEventId: row.providerEventId,
    subscriptionId: row.subscriptionId
  };
}

export async function ensureDefaultPlans(): Promise<void> {
  await db
    .insert(plans)
    .values({
      billingPeriod: DEFAULT_BILLING_PLAN.billingPeriod,
      code: DEFAULT_BILLING_PLAN.code,
      creditGrantAmount: DEFAULT_BILLING_PLAN.creditGrantAmount,
      currency: DEFAULT_BILLING_PLAN.currency,
      description: DEFAULT_BILLING_PLAN.description,
      isActive: DEFAULT_BILLING_PLAN.isActive,
      monthlyPriceCents: DEFAULT_BILLING_PLAN.monthlyPriceCents,
      name: DEFAULT_BILLING_PLAN.name
    })
    .onConflictDoNothing();
}

export async function listActivePlans(): Promise<BillingPlan[]> {
  await ensureDefaultPlans();

  const rows = await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.monthlyPriceCents, plans.name);

  return rows.map(toBillingPlan);
}

export async function findPlanByCode(planCode: string): Promise<BillingPlan | null> {
  await ensureDefaultPlans();

  const [plan] = await db.select().from(plans).where(eq(plans.code, planCode)).limit(1);

  return plan ? toBillingPlan(plan) : null;
}

export async function findSubscriptionByOwner(ownerId: string): Promise<BillingSubscription | null> {
  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.ownerId, ownerId)).limit(1);

  return subscription ? toBillingSubscription(subscription) : null;
}

export async function listSubscriptionEvents(ownerId: string): Promise<SubscriptionEvent[]> {
  const rows = await db
    .select()
    .from(subscriptionEvents)
    .where(eq(subscriptionEvents.ownerId, ownerId))
    .orderBy(desc(subscriptionEvents.createdAt));

  return rows.map(toSubscriptionEvent);
}

export async function findSubscriptionEvent(provider: SubscriptionProvider, providerEventId: string): Promise<SubscriptionEvent | null> {
  const [event] = await db
    .select()
    .from(subscriptionEvents)
    .where(and(eq(subscriptionEvents.provider, provider), eq(subscriptionEvents.providerEventId, providerEventId)))
    .limit(1);

  if (!event) {
    return null;
  }

  return toSubscriptionEvent(event);
}

export async function recordSubscriptionEvent(input: {
  eventType: SubscriptionEventType;
  ownerId: string;
  payload: string;
  planId: string | null;
  provider: SubscriptionProvider;
  providerEventId: string;
}): Promise<SubscriptionEvent> {
  const [created] = await db
    .insert(subscriptionEvents)
    .values({
      eventType: input.eventType,
      ownerId: input.ownerId,
      payload: input.payload,
      planId: input.planId,
      provider: input.provider,
      providerEventId: input.providerEventId
    })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return toSubscriptionEvent(created);
  }

  const existing = await findSubscriptionEvent(input.provider, input.providerEventId);

  if (!existing) {
    throw new Error("Subscription event could not be recorded");
  }

  return existing;
}

export async function upsertSubscription(input: {
  currentPeriodEnd: Date | null;
  currentPeriodStart: Date | null;
  failureReason: string | null;
  ownerId: string;
  planId: string;
  provider: SubscriptionProvider;
  providerSubscriptionId: string | null;
  status: BillingSubscription["status"];
}): Promise<BillingSubscription> {
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      currentPeriodEnd: input.currentPeriodEnd,
      currentPeriodStart: input.currentPeriodStart,
      lastPaymentFailureReason: input.failureReason,
      ownerId: input.ownerId,
      planId: input.planId,
      provider: input.provider,
      providerSubscriptionId: input.providerSubscriptionId,
      status: input.status
    })
    .onConflictDoUpdate({
      target: subscriptions.ownerId,
      set: {
        currentPeriodEnd: input.currentPeriodEnd,
        currentPeriodStart: input.currentPeriodStart,
        lastPaymentFailureReason: input.failureReason,
        planId: input.planId,
        provider: input.provider,
        providerSubscriptionId: input.providerSubscriptionId,
        status: input.status,
        updatedAt: new Date()
      }
    })
    .returning();

  return toBillingSubscription(subscription);
}

export async function markSubscriptionEventProcessed(input: {
  creditLedgerEntryId: string | null;
  eventId: string;
  subscriptionId: string | null;
}): Promise<SubscriptionEvent> {
  const [event] = await db
    .update(subscriptionEvents)
    .set({
      creditLedgerEntryId: input.creditLedgerEntryId,
      processedAt: new Date(),
      subscriptionId: input.subscriptionId
    })
    .where(eq(subscriptionEvents.id, input.eventId))
    .returning();

  if (!event) {
    throw new Error("Subscription event not found");
  }

  return toSubscriptionEvent(event);
}

export function buildPlaceholderCheckoutUrl(planCode: string): string {
  const params = new URLSearchParams({
    checkout: "started",
    plan: planCode,
    provider: MVP_BILLING_PROVIDER
  });

  return `/subscription?${params.toString()}`;
}
