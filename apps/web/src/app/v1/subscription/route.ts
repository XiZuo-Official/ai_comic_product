import { getSubscriptionOverview } from "@ai-comic/billing";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireSubscriptionUserId } from "./_lib";

export async function GET() {
  const userId = await requireSubscriptionUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const overview = await getSubscriptionOverview(userId);

    return NextResponse.json({
      plan: overview.plan
        ? {
            code: overview.plan.code,
            creditGrantAmount: overview.plan.creditGrantAmount,
            currency: overview.plan.currency,
            name: overview.plan.name,
            monthlyPriceCents: overview.plan.monthlyPriceCents
          }
        : null,
      status: overview.status,
      subscription: overview.subscription
        ? {
            cancelAtPeriodEnd: overview.subscription.cancelAtPeriodEnd,
            currentPeriodEnd: overview.subscription.currentPeriodEnd?.toISOString() ?? null,
            currentPeriodStart: overview.subscription.currentPeriodStart?.toISOString() ?? null,
            id: overview.subscription.id,
            lastPaymentFailureReason: overview.subscription.lastPaymentFailureReason,
            provider: overview.subscription.provider,
            status: overview.subscription.status
          }
        : null
    });
  } catch (error) {
    return errorResponse(error);
  }
}
