import { listBillingPlans } from "@ai-comic/billing";
import { NextResponse } from "next/server";

import { errorResponse, isRouteResponse, requireSubscriptionUserId } from "../_lib";

export async function GET() {
  const userId = await requireSubscriptionUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const plans = await listBillingPlans();

    return NextResponse.json({
      plans: plans.map((plan) => ({
        billingPeriod: plan.billingPeriod,
        code: plan.code,
        creditGrantAmount: plan.creditGrantAmount,
        currency: plan.currency,
        description: plan.description,
        name: plan.name,
        monthlyPriceCents: plan.monthlyPriceCents
      }))
    });
  } catch (error) {
    return errorResponse(error);
  }
}
