import { listCreditLedger } from "@ai-comic/credits";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireCreditsUserId } from "../_lib";

export async function GET() {
  const userId = await requireCreditsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const entries = await listCreditLedger(userId);

    return NextResponse.json({
      entries: entries.map((entry) => ({
        id: entry.id,
        amountDelta: entry.amountDelta,
        balanceAfter: entry.balanceAfter,
        createdAt: entry.createdAt.toISOString(),
        description: entry.description,
        entryType: entry.entryType,
        refundId: entry.refundId,
        reservationId: entry.reservationId
      }))
    });
  } catch (error) {
    return errorResponse(error);
  }
}
