import { generateSingleImage } from "@ai-comic/ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isRouteResponse, requireAiUserId } from "../../ai/jobs/_lib";

function singleImageErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid single image request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Single image generation failed";
  const status = message === "Insufficient credits" ? 402 : message === "Project not found" ? 404 : 400;

  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const userId = await requireAiUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const body = await request.json();
    const result = await generateSingleImage(userId, {
      aspectRatio: body.aspectRatio,
      idempotencyKey: body.idempotencyKey,
      projectId: body.projectId,
      prompt: body.prompt,
      style: body.style
    });

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return singleImageErrorResponse(error);
  }
}
