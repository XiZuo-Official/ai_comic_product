import { commitCreditReservation } from "@ai-comic/credits";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireCreditsUserId } from "../../../_lib";

export async function POST(request: Request, { params }: { params: Promise<{ reservationId: string }> }) {
  const userId = await requireCreditsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ reservationId }, body] = await Promise.all([params, request.json().catch(() => ({}))]);
    const reservation = await commitCreditReservation(userId, reservationId, {
      idempotencyKey: body.idempotencyKey,
      reason: body.reason
    });

    return NextResponse.json({
      reservation: {
        id: reservation.id,
        amount: reservation.amount,
        createdAt: reservation.createdAt.toISOString(),
        reason: reservation.reason,
        status: reservation.status,
        updatedAt: reservation.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}
