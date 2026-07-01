export type CreditLedgerEntryType = "reservation" | "commit" | "release" | "refund" | "adjustment";

export type CreditReservationStatus = "active" | "committed" | "released" | "refunded";

export type CreditAccount = {
  id: string;
  ownerId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreditLedgerEntry = {
  id: string;
  accountId: string;
  reservationId: string | null;
  refundId: string | null;
  entryType: CreditLedgerEntryType;
  amountDelta: number;
  balanceAfter: number;
  description: string | null;
  createdAt: Date;
};

export type CreditReservation = {
  id: string;
  accountId: string;
  amount: number;
  status: CreditReservationStatus;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreditRefund = {
  id: string;
  accountId: string;
  reservationId: string | null;
  amount: number;
  reason: string | null;
  createdAt: Date;
};

export type ReserveCreditsInput = {
  amount: number;
  idempotencyKey?: string | null;
  reason?: string | null;
};

export type CreditOperationInput = {
  idempotencyKey?: string | null;
  reason?: string | null;
};

export type CreditGrantInput = {
  amount: number;
  idempotencyKey: string;
  reason?: string | null;
};
