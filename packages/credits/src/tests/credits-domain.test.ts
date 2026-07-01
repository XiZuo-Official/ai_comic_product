import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCanReserve,
  assertPositiveCreditAmount,
  assertReservationTransition,
  normalizeNullableText,
  parseCreditGrantInput,
  parseReserveCreditsInput
} from "../domain/credits";

test("parseReserveCreditsInput accepts positive integer amounts", () => {
  const parsed = parseReserveCreditsInput({
    amount: 12,
    idempotencyKey: "reserve-1",
    reason: "test"
  });

  assert.equal(parsed.amount, 12);
  assert.equal(parsed.idempotencyKey, "reserve-1");
});

test("parseReserveCreditsInput rejects invalid amounts", () => {
  assert.throws(() => parseReserveCreditsInput({ amount: 0 }), /greater than zero/);
  assert.throws(() => parseReserveCreditsInput({ amount: 1.5 }), /Expected integer/);
});

test("parseCreditGrantInput requires positive amounts and idempotency", () => {
  const input = parseCreditGrantInput({ amount: 10, idempotencyKey: " grant-1 " });

  assert.equal(input.amount, 10);
  assert.equal(input.idempotencyKey, "grant-1");
  assert.throws(() => parseCreditGrantInput({ amount: 0, idempotencyKey: "grant-2" }), /Credit amount must be greater than zero/);
  assert.throws(() => parseCreditGrantInput({ amount: 10, idempotencyKey: "" }), /String must contain at least 1 character/);
});

test("assertCanReserve prevents negative balances", () => {
  assert.doesNotThrow(() => assertCanReserve(10, 10));
  assert.throws(() => assertCanReserve(9, 10), /Insufficient credits/);
});

test("assertPositiveCreditAmount rejects non-positive amounts", () => {
  assert.throws(() => assertPositiveCreditAmount(0), /positive integer/);
  assert.throws(() => assertPositiveCreditAmount(-1), /positive integer/);
});

test("assertReservationTransition allows valid lifecycle transitions", () => {
  assert.doesNotThrow(() => assertReservationTransition("active", "committed"));
  assert.doesNotThrow(() => assertReservationTransition("active", "released"));
  assert.doesNotThrow(() => assertReservationTransition("committed", "refunded"));
});

test("assertReservationTransition rejects invalid lifecycle transitions", () => {
  assert.throws(() => assertReservationTransition("released", "committed"), /Cannot transition/);
  assert.throws(() => assertReservationTransition("refunded", "released"), /Cannot transition/);
});

test("normalizeNullableText trims empty values to null", () => {
  assert.equal(normalizeNullableText("  hello  "), "hello");
  assert.equal(normalizeNullableText("   "), null);
  assert.equal(normalizeNullableText(null), null);
});
