import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_BILLING_PLAN,
  MVP_BILLING_PROVIDER,
  parseCheckoutInput,
  parseOptionalDate,
  parseSubscriptionWebhookInput,
  shouldGrantCreditsForEventType,
  statusForSubscriptionEvent
} from "../domain/subscription";

test("parseCheckoutInput normalizes plan codes", () => {
  const input = parseCheckoutInput({ planCode: "  mvp_creator  " });

  assert.equal(input.planCode, "mvp_creator");
});

test("parseSubscriptionWebhookInput defaults to the MVP placeholder provider", () => {
  const input = parseSubscriptionWebhookInput({
    eventType: "subscription.activated",
    ownerId: "user_123",
    planCode: DEFAULT_BILLING_PLAN.code,
    providerEventId: "evt_123"
  });

  assert.equal(input.provider, MVP_BILLING_PROVIDER);
});

test("parseSubscriptionWebhookInput rejects invalid webhook events", () => {
  assert.throws(
    () =>
      parseSubscriptionWebhookInput({
        eventType: "invalid.event" as never,
        ownerId: "user_123",
        planCode: DEFAULT_BILLING_PLAN.code,
        providerEventId: "evt_123"
      }),
    /Invalid enum value/
  );
});

test("shouldGrantCreditsForEventType grants only activation and renewal events", () => {
  assert.equal(shouldGrantCreditsForEventType("subscription.activated"), true);
  assert.equal(shouldGrantCreditsForEventType("subscription.renewed"), true);
  assert.equal(shouldGrantCreditsForEventType("subscription.payment_failed"), false);
  assert.equal(shouldGrantCreditsForEventType("subscription.canceled"), false);
});

test("statusForSubscriptionEvent maps payment and cancellation states clearly", () => {
  assert.equal(statusForSubscriptionEvent("subscription.activated"), "active");
  assert.equal(statusForSubscriptionEvent("subscription.renewed"), "active");
  assert.equal(statusForSubscriptionEvent("subscription.payment_failed"), "past_due");
  assert.equal(statusForSubscriptionEvent("subscription.canceled"), "canceled");
});

test("parseOptionalDate converts absent values to null", () => {
  assert.equal(parseOptionalDate(null), null);
  assert.equal(parseOptionalDate(undefined), null);
  assert.ok(parseOptionalDate("2026-07-01T00:00:00.000Z") instanceof Date);
});
