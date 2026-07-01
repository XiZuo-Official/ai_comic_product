import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireCreditsUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function errorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid credits request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Credits request failed";
  const status = message === "Insufficient credits" ? 402 : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
