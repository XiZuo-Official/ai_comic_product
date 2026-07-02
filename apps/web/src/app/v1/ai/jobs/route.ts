import { createAiJob } from "@ai-comic/ai";
import { NextResponse } from "next/server";

import { aiErrorResponse, aiJobResponse, isRouteResponse, requireAiUserId } from "./_lib";

export async function POST(request: Request) {
  const userId = await requireAiUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const job = await createAiJob(userId, {
      idempotencyKey: body.idempotencyKey,
      input: body.input,
      prompt: body.prompt,
      promptTemplateKey: body.promptTemplateKey,
      promptTemplateVersion: body.promptTemplateVersion,
      type: body.type
    });

    return NextResponse.json({ job: aiJobResponse(job) }, { status: 201 });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
