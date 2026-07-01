import { startSubscriptionCheckout } from "@ai-comic/billing";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireSubscriptionUserId } from "../_lib";

export async function POST(request: Request) {
  const userId = await requireSubscriptionUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const checkout = await startSubscriptionCheckout(userId, {
      planCode: body.planCode
    });

    return NextResponse.json(checkout);
  } catch (error) {
    return errorResponse(error);
  }
}
