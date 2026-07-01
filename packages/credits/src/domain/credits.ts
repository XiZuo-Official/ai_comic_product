import { z } from "zod";

import type { CreditGrantInput, CreditReservationStatus, ReserveCreditsInput } from "../api";

export const reserveCreditsSchema = z.object({
  amount: z.coerce.number().int().positive("Credit amount must be greater than zero"),
  idempotencyKey: z.string().trim().min(1).max(160).optional().nullable(),
  reason: z.string().trim().max(120).optional().nullable()
});

export const grantCreditsSchema = z.object({
  amount: z.coerce.number().int().positive("Credit amount must be greater than zero"),
  idempotencyKey: z.string().trim().min(1).max(160),
  reason: z.string().trim().max(180).optional().nullable()
});

export function parseReserveCreditsInput(input: ReserveCreditsInput) {
  return reserveCreditsSchema.parse(input);
}

export function parseCreditGrantInput(input: CreditGrantInput) {
  return grantCreditsSchema.parse(input);
}

export function assertPositiveCreditAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit amount must be a positive integer");
  }
}

export function assertCanReserve(balance: number, amount: number): void {
  assertPositiveCreditAmount(amount);

  if (balance - amount < 0) {
    throw new Error("Insufficient credits");
  }
}

export function assertReservationTransition(current: CreditReservationStatus, next: CreditReservationStatus): void {
  if (current === next) {
    return;
  }

  const allowed: Record<CreditReservationStatus, CreditReservationStatus[]> = {
    active: ["committed", "released", "refunded"],
    committed: ["refunded"],
    refunded: [],
    released: []
  };

  if (!allowed[current].includes(next)) {
    throw new Error(`Cannot transition reservation from ${current} to ${next}`);
  }
}

export function normalizeNullableText(value?: string | null): string | null {
  const normalized = value?.trim();

  return normalized && normalized.length > 0 ? normalized : null;
}
