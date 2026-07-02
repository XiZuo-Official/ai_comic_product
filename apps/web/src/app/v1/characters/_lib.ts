import type { Character, CharacterVersion } from "@ai-comic/characters";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function requireCharactersUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return userId;
}

export function characterResponse(character: Character) {
  return {
    id: character.id,
    createdAt: character.createdAt.toISOString(),
    deletedAt: character.deletedAt?.toISOString() ?? null,
    description: character.description,
    metadata: character.metadata,
    name: character.name,
    normalizedName: character.normalizedName,
    ownerId: character.ownerId,
    projectId: character.projectId,
    referenceAssetIds: character.referenceAssetIds,
    status: character.status,
    updatedAt: character.updatedAt.toISOString()
  };
}

export function characterVersionResponse(version: CharacterVersion) {
  return {
    id: version.id,
    action: version.action,
    characterId: version.characterId,
    createdAt: version.createdAt.toISOString(),
    snapshot: version.snapshot
  };
}

export function characterErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid character request" }, { status: 400 });
  }

  const message = error instanceof Error ? error.message : "Character request failed";
  const status =
    message === "Character not found" || message === "Project not found" || message === "Reference asset not found" ? 404 : 400;

  return NextResponse.json({ error: message }, { status });
}

export function isRouteResponse(value: string | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
