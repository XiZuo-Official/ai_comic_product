import { createCharacter, listProjectCharacters } from "@ai-comic/characters";
import { NextResponse } from "next/server";

import { characterErrorResponse, characterResponse, isRouteResponse, requireCharactersUserId } from "../../../characters/_lib";

const createCharacterFields = new Set(["description", "metadata", "name", "referenceAssetIds"]);

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireCharactersUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const { projectId } = await params;
    const characters = await listProjectCharacters(userId, projectId);

    return NextResponse.json({ characters: characters.map(characterResponse) });
  } catch (error) {
    return characterErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const userId = await requireCharactersUserId();

  if (isRouteResponse(userId)) {
    return userId;
  }

  try {
    const [{ projectId }, body] = await Promise.all([params, request.json()]);
    const unknownKeys = Object.keys(body).filter((key) => !createCharacterFields.has(key));

    if (unknownKeys.length > 0) {
      return NextResponse.json({ error: `Unknown character fields: ${unknownKeys.join(", ")}` }, { status: 400 });
    }

    const character = await createCharacter(userId, {
      description: body.description,
      metadata: body.metadata,
      name: body.name,
      projectId,
      referenceAssetIds: body.referenceAssetIds
    });

    return NextResponse.json({ character: characterResponse(character) }, { status: 201 });
  } catch (error) {
    return characterErrorResponse(error);
  }
}
