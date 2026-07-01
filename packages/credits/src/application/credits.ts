import type { CreditAccount, CreditLedgerEntry, CreditOperationInput, CreditRefund, CreditReservation, ReserveCreditsInput } from "../api";
import { assertCanReserve, assertPositiveCreditAmount, assertReservationTransition, normalizeNullableText, parseReserveCreditsInput } from "../domain/credits";
import {
  createReservation,
  findReservationById,
  findReservationByIdempotencyKey,
  findRefundByIdempotencyKey,
  getOrCreateCreditAccount,
  listCreditLedgerEntries,
  commitActiveReservation,
  refundReservationFromStatuses,
  releaseActiveReservation
} from "../infrastructure/credit-repository";

export async function getCreditBalance(ownerId: string): Promise<CreditAccount> {
  return getOrCreateCreditAccount(ownerId);
}

export async function listCreditLedger(ownerId: string): Promise<CreditLedgerEntry[]> {
  const account = await getOrCreateCreditAccount(ownerId);

  return listCreditLedgerEntries(account.id);
}

export async function reserveCredits(ownerId: string, input: ReserveCreditsInput): Promise<CreditReservation> {
  const parsed = parseReserveCreditsInput(input);
  const account = await getOrCreateCreditAccount(ownerId);
  const idempotencyKey = normalizeNullableText(parsed.idempotencyKey);

  if (idempotencyKey) {
    const existing = await findReservationByIdempotencyKey(account.id, idempotencyKey);

    if (existing) {
      return existing;
    }
  }

  assertCanReserve(account.balance, parsed.amount);

  try {
    return await createReservation(account.id, parsed.amount, normalizeNullableText(parsed.reason), idempotencyKey);
  } catch (error) {
    if (idempotencyKey) {
      const existing = await findReservationByIdempotencyKey(account.id, idempotencyKey);

      if (existing) {
        return existing;
      }
    }

    throw error;
  }
}

export async function commitCreditReservation(ownerId: string, reservationId: string, input: CreditOperationInput = {}): Promise<CreditReservation> {
  const account = await getOrCreateCreditAccount(ownerId);
  const reservation = await findReservationById(account.id, reservationId);

  if (!reservation) {
    throw new Error("Credit reservation not found");
  }

  if (reservation.status === "committed") {
    return reservation;
  }

  assertReservationTransition(reservation.status, "committed");

  const committed = await commitActiveReservation({
    accountId: account.id,
    description: normalizeNullableText(input.reason) ?? "Credit reservation committed",
    idempotencyKey: normalizeNullableText(input.idempotencyKey) ?? `commit:${reservationId}`,
    reservationId
  });

  if (!committed) {
    const current = await findReservationById(account.id, reservationId);

    if (!current) {
      throw new Error("Credit reservation not found");
    }

    if (current.status === "committed") {
      return current;
    }

    assertReservationTransition(current.status, "committed");
    throw new Error("Credit reservation could not be committed");
  }

  return committed;
}

export async function releaseCreditReservation(ownerId: string, reservationId: string, input: CreditOperationInput = {}): Promise<CreditReservation> {
  const account = await getOrCreateCreditAccount(ownerId);
  const reservation = await findReservationById(account.id, reservationId);

  if (!reservation) {
    throw new Error("Credit reservation not found");
  }

  if (reservation.status === "released") {
    return reservation;
  }

  assertReservationTransition(reservation.status, "released");

  const released = await releaseActiveReservation({
    accountId: account.id,
    description: normalizeNullableText(input.reason) ?? "Credit reservation released",
    idempotencyKey: normalizeNullableText(input.idempotencyKey) ?? `release:${reservationId}`,
    reservationId
  });

  if (!released) {
    const current = await findReservationById(account.id, reservationId);

    if (!current) {
      throw new Error("Credit reservation not found");
    }

    if (current.status === "released") {
      return current;
    }

    assertReservationTransition(current.status, "released");
    throw new Error("Credit reservation could not be released");
  }

  return released;
}

export async function refundCredits(ownerId: string, reservationId: string, input: CreditOperationInput = {}): Promise<CreditRefund> {
  const account = await getOrCreateCreditAccount(ownerId);
  const reservation = await findReservationById(account.id, reservationId);

  if (!reservation) {
    throw new Error("Credit reservation not found");
  }

  assertReservationTransition(reservation.status, "refunded");
  assertPositiveCreditAmount(reservation.amount);

  const idempotencyKey = normalizeNullableText(input.idempotencyKey) ?? `refund:${reservationId}`;

  const existingRefund = await findRefundByIdempotencyKey(account.id, idempotencyKey);

  if (existingRefund) {
    return existingRefund;
  }

  const refund = await refundReservationFromStatuses({
    accountId: account.id,
    description: normalizeNullableText(input.reason) ?? "Credits refunded",
    idempotencyKey,
    reservationId,
    statuses: ["active", "committed"]
  });

  if (!refund) {
    const current = await findReservationById(account.id, reservationId);

    if (!current) {
      throw new Error("Credit reservation not found");
    }

    if (current.status === "refunded") {
      const currentRefund = await findRefundByIdempotencyKey(account.id, idempotencyKey);

      if (currentRefund) {
        return currentRefund;
      }
    }

    assertReservationTransition(current.status, "refunded");
    throw new Error("Credit reservation could not be refunded");
  }

  return refund;
}
