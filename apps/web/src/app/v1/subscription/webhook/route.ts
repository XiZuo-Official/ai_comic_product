import { processSubscriptionWebhook } from "@ai-comic/billing";
import { NextResponse } from "next/server";

import { errorResponse } from "../_lib";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await processSubscriptionWebhook(body);

    return NextResponse.json({
      creditGrantApplied: result.creditGrantApplied,
      event: {
        id: result.event.id,
        processedAt: result.event.processedAt?.toISOString() ?? null,
        providerEventId: result.event.providerEventId
      },
      subscription: result.subscription
        ? {
            id: result.subscription.id,
            status: result.subscription.status
          }
        : null
    });
  } catch (error) {
    return errorResponse(error);
  }
}
