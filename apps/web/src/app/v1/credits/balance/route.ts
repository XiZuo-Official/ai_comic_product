import { getCreditBalance } from "@ai-comic/credits";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireCreditsUserId } from "../_lib";

export async function GET() {
  const userId = await requireCreditsUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const account = await getCreditBalance(userId);

    return NextResponse.json({
      balance: account.balance,
      creditAccountId: account.id,
      ownerId: account.ownerId
    });
  } catch (error) {
    return errorResponse(error);
  }
}
