import { deleteCharacter, getCharacter, updateCharacter } from "@ai-comic/characters";
import { NextResponse } from "next/server";

import { characterErrorResponse, characterResponse, isRouteResponse, requireCharactersUserId } from "../_lib";

const updateCharacterFields = new Set(["description", "metadata", "name", "referenceAssetIds"]);

export async function GET(_request: Request, { params }: { params: Promise<{ characterId: string }> }) {
  const userId = await requireCharactersUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { characterId } = await params;
    const character = await getCharacter(userId, characterId);

    if (!character) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }

    return NextResponse.json({ character: characterResponse(character) });
  } catch (error) {
    return characterErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ characterId: string }> }) {
  const userId = await requireCharactersUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ characterId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !updateCharacterFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown character fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const character = await updateCharacter(userId, characterId, {
      description: body.description,
      metadata: body.metadata,
      name: body.name,
      referenceAssetIds: body.referenceAssetIds
    });

    return NextResponse.json({ character: characterResponse(character) });
  } catch (error) {
    return characterErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ characterId: string }> }) {
  const userId = await requireCharactersUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { characterId } = await params;
    await deleteCharacter(userId, characterId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return characterErrorResponse(error);
  }
}
