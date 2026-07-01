import {
  creditAccounts,
  creditLedgerEntries,
  creditRefunds,
  creditReservations,
  db,
  type CreditAccountRow,
  type CreditLedgerEntryRow,
  type CreditRefundRow,
  type CreditReservationRow
} from "@ai-comic/db";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";

import type { CreditAccount, CreditLedgerEntry, CreditRefund, CreditReservation, CreditReservationStatus } from "../api";

export function toCreditAccount(row: CreditAccountRow): CreditAccount {
  return {
    id: row.id,
    ownerId: row.ownerId,
    balance: row.balance,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export function toCreditLedgerEntry(row: CreditLedgerEntryRow): CreditLedgerEntry {
  return {
    id: row.id,
    accountId: row.accountId,
    reservationId: row.reservationId,
    refundId: row.refundId,
    entryType: row.entryType as CreditLedgerEntry["entryType"],
    amountDelta: row.amountDelta,
    balanceAfter: row.balanceAfter,
    description: row.description,
    createdAt: row.createdAt
  };
}

export function toCreditReservation(row: CreditReservationRow): CreditReservation {
  return {
    id: row.id,
    accountId: row.accountId,
    amount: row.amount,
    status: row.status as CreditReservationStatus,
    reason: row.reason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export function toCreditRefund(row: CreditRefundRow): CreditRefund {
  return {
    id: row.id,
    accountId: row.accountId,
    reservationId: row.reservationId,
    amount: row.amount,
    reason: row.reason,
    createdAt: row.createdAt
  };
}

export async function getOrCreateCreditAccount(ownerId: string): Promise<CreditAccount> {
  const [existing] = await db.select().from(creditAccounts).where(eq(creditAccounts.ownerId, ownerId)).limit(1);

  if (existing) {
    return toCreditAccount(existing);
  }

  const [created] = await db.insert(creditAccounts).values({ ownerId }).onConflictDoNothing().returning();

  if (created) {
    return toCreditAccount(created);
  }

  const [account] = await db.select().from(creditAccounts).where(eq(creditAccounts.ownerId, ownerId)).limit(1);

  if (!account) {
    throw new Error("Credit account could not be created");
  }

  return toCreditAccount(account);
}

export async function listCreditLedgerEntries(accountId: string): Promise<CreditLedgerEntry[]> {
  const rows = await db
    .select()
    .from(creditLedgerEntries)
    .where(eq(creditLedgerEntries.accountId, accountId))
    .orderBy(desc(creditLedgerEntries.createdAt));

  return rows.map(toCreditLedgerEntry);
}

export async function findReservationById(accountId: string, reservationId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .select()
    .from(creditReservations)
    .where(and(eq(creditReservations.accountId, accountId), eq(creditReservations.id, reservationId)))
    .limit(1);

  return reservation ? toCreditReservation(reservation) : null;
}

export async function findReservationByIdempotencyKey(accountId: string, idempotencyKey: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .select()
    .from(creditReservations)
    .where(and(eq(creditReservations.accountId, accountId), eq(creditReservations.idempotencyKey, idempotencyKey)))
    .limit(1);

  return reservation ? toCreditReservation(reservation) : null;
}

export async function createReservation(accountId: string, amount: number, reason: string | null, idempotencyKey: string | null): Promise<CreditReservation> {
  const result = await db.transaction(async (tx) => {
    const [updatedAccount] = await tx
      .update(creditAccounts)
      .set({
        balance: sql`${creditAccounts.balance} - ${amount}`,
        updatedAt: new Date()
      })
      .where(and(eq(creditAccounts.id, accountId), gte(creditAccounts.balance, amount)))
      .returning();

    if (!updatedAccount) {
      throw new Error("Insufficient credits");
    }

    const [reservation] = await tx
      .insert(creditReservations)
      .values({ accountId, amount, reason, idempotencyKey })
      .returning();

    await tx.insert(creditLedgerEntries).values({
      accountId,
      amountDelta: -amount,
      balanceAfter: updatedAccount.balance,
      description: reason,
      entryType: "reservation",
      idempotencyKey: idempotencyKey ? `reservation:${idempotencyKey}` : null,
      reservationId: reservation.id
    });

    return reservation;
  });

  return toCreditReservation(result);
}

export async function transitionReservation(accountId: string, reservationId: string, status: CreditReservationStatus): Promise<CreditReservation> {
  const [reservation] = await db
    .update(creditReservations)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(creditReservations.accountId, accountId), eq(creditReservations.id, reservationId)))
    .returning();

  if (!reservation) {
    throw new Error("Credit reservation not found");
  }

  return toCreditReservation(reservation);
}

export async function commitActiveReservation(input: {
  accountId: string;
  description: string | null;
  idempotencyKey: string | null;
  reservationId: string;
}): Promise<CreditReservation | null> {
  const result = await db.transaction(async (tx) => {
    const [reservation] = await tx
      .update(creditReservations)
      .set({ status: "committed", updatedAt: new Date() })
      .where(
        and(
          eq(creditReservations.accountId, input.accountId),
          eq(creditReservations.id, input.reservationId),
          eq(creditReservations.status, "active")
        )
      )
      .returning();

    if (!reservation) {
      return null;
    }

    const [account] = await tx.select().from(creditAccounts).where(eq(creditAccounts.id, input.accountId)).limit(1);

    if (!account) {
      throw new Error("Credit account not found");
    }

    await tx
      .insert(creditLedgerEntries)
      .values({
        accountId: input.accountId,
        amountDelta: 0,
        balanceAfter: account.balance,
        description: input.description,
        entryType: "commit",
        idempotencyKey: input.idempotencyKey,
        reservationId: input.reservationId
      })
      .onConflictDoNothing();

    return reservation;
  });

  return result ? toCreditReservation(result) : null;
}

export async function releaseActiveReservation(input: {
  accountId: string;
  description: string | null;
  idempotencyKey: string | null;
  reservationId: string;
}): Promise<CreditReservation | null> {
  const result = await db.transaction(async (tx) => {
    const [reservation] = await tx
      .update(creditReservations)
      .set({ status: "released", updatedAt: new Date() })
      .where(
        and(
          eq(creditReservations.accountId, input.accountId),
          eq(creditReservations.id, input.reservationId),
          eq(creditReservations.status, "active")
        )
      )
      .returning();

    if (!reservation) {
      return null;
    }

    const [account] = await tx
      .update(creditAccounts)
      .set({
        balance: sql`${creditAccounts.balance} + ${reservation.amount}`,
        updatedAt: new Date()
      })
      .where(eq(creditAccounts.id, input.accountId))
      .returning();

    if (!account) {
      throw new Error("Credit account not found");
    }

    await tx
      .insert(creditLedgerEntries)
      .values({
        accountId: input.accountId,
        amountDelta: reservation.amount,
        balanceAfter: account.balance,
        description: input.description,
        entryType: "release",
        idempotencyKey: input.idempotencyKey,
        reservationId: input.reservationId
      })
      .onConflictDoNothing();

    return reservation;
  });

  return result ? toCreditReservation(result) : null;
}

export async function findRefundByIdempotencyKey(accountId: string, idempotencyKey: string): Promise<CreditRefund | null> {
  const [refund] = await db
    .select()
    .from(creditRefunds)
    .where(and(eq(creditRefunds.accountId, accountId), eq(creditRefunds.idempotencyKey, idempotencyKey)))
    .limit(1);

  return refund ? toCreditRefund(refund) : null;
}

export async function refundReservationFromStatuses(input: {
  accountId: string;
  description: string | null;
  idempotencyKey: string;
  reservationId: string;
  statuses: CreditReservationStatus[];
}): Promise<CreditRefund | null> {
  const result = await db.transaction(async (tx) => {
    const [existingRefund] = await tx
      .select()
      .from(creditRefunds)
      .where(and(eq(creditRefunds.accountId, input.accountId), eq(creditRefunds.idempotencyKey, input.idempotencyKey)))
      .limit(1);

    if (existingRefund) {
      return existingRefund;
    }

    const [reservation] = await tx
      .update(creditReservations)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(
        and(
          eq(creditReservations.accountId, input.accountId),
          eq(creditReservations.id, input.reservationId),
          inArray(creditReservations.status, input.statuses)
        )
      )
      .returning();

    if (!reservation) {
      return null;
    }

    const [account] = await tx
      .update(creditAccounts)
      .set({
        balance: sql`${creditAccounts.balance} + ${reservation.amount}`,
        updatedAt: new Date()
      })
      .where(eq(creditAccounts.id, input.accountId))
      .returning();

    if (!account) {
      throw new Error("Credit account not found");
    }

    const [refund] = await tx
      .insert(creditRefunds)
      .values({
        accountId: input.accountId,
        amount: reservation.amount,
        idempotencyKey: input.idempotencyKey,
        reason: input.description,
        reservationId: input.reservationId
      })
      .onConflictDoNothing()
      .returning();

    if (!refund) {
      const [conflictingRefund] = await tx
        .select()
        .from(creditRefunds)
        .where(and(eq(creditRefunds.accountId, input.accountId), eq(creditRefunds.idempotencyKey, input.idempotencyKey)))
        .limit(1);

      if (!conflictingRefund) {
        throw new Error("Credit refund could not be created");
      }

      return conflictingRefund;
    }

    await tx
      .insert(creditLedgerEntries)
      .values({
        accountId: input.accountId,
        amountDelta: reservation.amount,
        balanceAfter: account.balance,
        description: input.description,
        entryType: "refund",
        idempotencyKey: `ledger:${input.idempotencyKey}`,
        refundId: refund.id,
        reservationId: input.reservationId
      })
      .onConflictDoNothing();

    return refund;
  });

  return result ? toCreditRefund(result) : null;
}

export async function recordLedgerEntry(input: {
  accountId: string;
  amountDelta: number;
  balanceAfter: number;
  description: string | null;
  entryType: CreditLedgerEntry["entryType"];
  idempotencyKey: string | null;
  refundId?: string | null;
  reservationId?: string | null;
}): Promise<CreditLedgerEntry> {
  const [entry] = await db
    .insert(creditLedgerEntries)
    .values({
      accountId: input.accountId,
      amountDelta: input.amountDelta,
      balanceAfter: input.balanceAfter,
      description: input.description,
      entryType: input.entryType,
      idempotencyKey: input.idempotencyKey,
      refundId: input.refundId ?? null,
      reservationId: input.reservationId ?? null
    })
    .onConflictDoNothing()
    .returning();

  if (entry) {
    return toCreditLedgerEntry(entry);
  }

  if (!input.idempotencyKey) {
    throw new Error("Credit ledger entry could not be recorded");
  }

  const [existing] = await db
    .select()
    .from(creditLedgerEntries)
    .where(and(eq(creditLedgerEntries.accountId, input.accountId), eq(creditLedgerEntries.idempotencyKey, input.idempotencyKey)))
    .limit(1);

  if (!existing) {
    throw new Error("Credit ledger entry could not be recorded");
  }

  return toCreditLedgerEntry(existing);
}

export async function addCreditsToAccount(accountId: string, amount: number): Promise<CreditAccount> {
  const [account] = await db
    .update(creditAccounts)
    .set({
      balance: sql`${creditAccounts.balance} + ${amount}`,
      updatedAt: new Date()
    })
    .where(eq(creditAccounts.id, accountId))
    .returning();

  if (!account) {
    throw new Error("Credit account not found");
  }

  return toCreditAccount(account);
}

export async function createRefund(input: {
  accountId: string;
  amount: number;
  idempotencyKey: string | null;
  reason: string | null;
  reservationId: string | null;
}): Promise<CreditRefund> {
  const [refund] = await db
    .insert(creditRefunds)
    .values(input)
    .onConflictDoNothing()
    .returning();

  if (refund) {
    return toCreditRefund(refund);
  }

  if (!input.idempotencyKey) {
    throw new Error("Credit refund could not be created");
  }

  const [existing] = await db
    .select()
    .from(creditRefunds)
    .where(and(eq(creditRefunds.accountId, input.accountId), eq(creditRefunds.idempotencyKey, input.idempotencyKey)))
    .limit(1);

  if (!existing) {
    throw new Error("Credit refund could not be created");
  }

  return toCreditRefund(existing);
}

export async function grantCreditsToAccount(input: {
  accountId: string;
  amount: number;
  description: string | null;
  idempotencyKey: string;
}): Promise<CreditLedgerEntry> {
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM credit_accounts WHERE id = ${input.accountId} FOR UPDATE`);

    const [existingEntry] = await tx
      .select()
      .from(creditLedgerEntries)
      .where(and(eq(creditLedgerEntries.accountId, input.accountId), eq(creditLedgerEntries.idempotencyKey, input.idempotencyKey)))
      .limit(1);

    if (existingEntry) {
      return existingEntry;
    }

    const [account] = await tx
      .update(creditAccounts)
      .set({
        balance: sql`${creditAccounts.balance} + ${input.amount}`,
        updatedAt: new Date()
      })
      .where(eq(creditAccounts.id, input.accountId))
      .returning();

    if (!account) {
      throw new Error("Credit account not found");
    }

    const [entry] = await tx
      .insert(creditLedgerEntries)
      .values({
        accountId: input.accountId,
        amountDelta: input.amount,
        balanceAfter: account.balance,
        description: input.description,
        entryType: "adjustment",
        idempotencyKey: input.idempotencyKey
      })
      .returning();

    return entry;
  });

  return toCreditLedgerEntry(result);
}
