import {
  characterAssets,
  characters,
  characterVersions,
  db,
  type CharacterAssetRow,
  type CharacterRow,
  type CharacterVersionRow
} from "@ai-comic/db";
import { and, desc, eq, isNull, ne } from "drizzle-orm";

import type {
  Character,
  CharacterAssetReference,
  CharacterMetadata,
  CharacterSnapshot,
  CharacterStatus,
  CharacterVersion,
  CharacterVersionAction
} from "../api";

type CharacterRowWithAssets = CharacterRow & {
  referenceAssetIds: string[];
};

export function toCharacter(row: CharacterRowWithAssets): Character {
  return {
    id: row.id,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt,
    description: row.description,
    metadata: row.metadata as CharacterMetadata,
    name: row.name,
    normalizedName: row.normalizedName,
    ownerId: row.ownerId,
    projectId: row.projectId,
    referenceAssetIds: row.referenceAssetIds,
    status: row.status as CharacterStatus,
    updatedAt: row.updatedAt
  };
}

export function toCharacterVersion(row: CharacterVersionRow): CharacterVersion {
  return {
    id: row.id,
    action: row.action as CharacterVersionAction,
    characterId: row.characterId,
    createdAt: row.createdAt,
    snapshot: row.snapshot as CharacterSnapshot
  };
}

export function toCharacterAssetReference(row: CharacterAssetRow): CharacterAssetReference {
  return {
    id: row.id,
    assetId: row.assetId,
    characterId: row.characterId,
    createdAt: row.createdAt,
    ownerId: row.ownerId,
    projectId: row.projectId
  };
}

async function referenceAssetIdsForCharacter(characterId: string): Promise<string[]> {
  const rows = await db
    .select({ assetId: characterAssets.assetId })
    .from(characterAssets)
    .where(eq(characterAssets.characterId, characterId))
    .orderBy(characterAssets.createdAt);

  return rows.map((row) => row.assetId);
}

async function withReferenceAssets(row: CharacterRow): Promise<CharacterRowWithAssets> {
  return {
    ...row,
    referenceAssetIds: await referenceAssetIdsForCharacter(row.id)
  };
}

export async function listCharacterRows(ownerId: string, projectId: string): Promise<Character[]> {
  const rows = await db
    .select()
    .from(characters)
    .where(and(eq(characters.ownerId, ownerId), eq(characters.projectId, projectId), isNull(characters.deletedAt), ne(characters.status, "deleted")))
    .orderBy(desc(characters.updatedAt));

  const rowsWithAssets = await Promise.all(rows.map(withReferenceAssets));

  return rowsWithAssets.map(toCharacter);
}

export async function findCharacterRow(ownerId: string, characterId: string): Promise<Character | null> {
  const [character] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.ownerId, ownerId), eq(characters.id, characterId), isNull(characters.deletedAt), ne(characters.status, "deleted")))
    .limit(1);

  return character ? toCharacter(await withReferenceAssets(character)) : null;
}

export async function findCharacterByNormalizedNameRow(input: {
  characterIdToExclude?: string;
  normalizedName: string;
  ownerId: string;
  projectId: string;
}): Promise<Character | null> {
  const rows = await db
    .select()
    .from(characters)
    .where(and(eq(characters.ownerId, input.ownerId), eq(characters.projectId, input.projectId), eq(characters.normalizedName, input.normalizedName), isNull(characters.deletedAt), ne(characters.status, "deleted")))
    .limit(1);

  const character = rows.find((row) => row.id !== input.characterIdToExclude);

  return character ? toCharacter(await withReferenceAssets(character)) : null;
}

export async function createCharacterRow(input: {
  description: string | null;
  metadata: CharacterMetadata;
  name: string;
  normalizedName: string;
  ownerId: string;
  projectId: string;
  referenceAssetIds: string[];
}): Promise<Character> {
  const [character] = await db
    .insert(characters)
    .values({
      description: input.description,
      metadata: input.metadata,
      name: input.name,
      normalizedName: input.normalizedName,
      ownerId: input.ownerId,
      projectId: input.projectId,
      status: "active"
    })
    .returning();

  await syncCharacterAssetRows({
    assetIds: input.referenceAssetIds,
    characterId: character.id,
    ownerId: input.ownerId,
    projectId: input.projectId
  });

  const created = toCharacter(await withReferenceAssets(character));
  await recordCharacterVersionRow(created, "created");

  return created;
}

export async function updateCharacterRow(input: {
  characterId: string;
  description?: string | null;
  metadata?: CharacterMetadata;
  name?: string;
  normalizedName?: string;
  ownerId: string;
  referenceAssetIds?: string[];
}): Promise<Character> {
  const [character] = await db
    .update(characters)
    .set({
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.normalizedName !== undefined ? { normalizedName: input.normalizedName } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(characters.ownerId, input.ownerId), eq(characters.id, input.characterId), isNull(characters.deletedAt), ne(characters.status, "deleted")))
    .returning();

  if (!character) {
    throw new Error("Character not found");
  }

  if (input.referenceAssetIds !== undefined) {
    await syncCharacterAssetRows({
      assetIds: input.referenceAssetIds,
      characterId: character.id,
      ownerId: input.ownerId,
      projectId: character.projectId
    });
  }

  const updated = toCharacter(await withReferenceAssets(character));
  await recordCharacterVersionRow(updated, input.referenceAssetIds !== undefined ? "references_updated" : "updated");

  return updated;
}

export async function deleteCharacterRow(ownerId: string, characterId: string): Promise<void> {
  const [character] = await db
    .update(characters)
    .set({ deletedAt: new Date(), status: "deleted", updatedAt: new Date() })
    .where(and(eq(characters.ownerId, ownerId), eq(characters.id, characterId), isNull(characters.deletedAt)))
    .returning();

  if (!character) {
    throw new Error("Character not found");
  }

  await recordCharacterVersionRow(toCharacter(await withReferenceAssets(character)), "deleted");
}

export async function listCharacterVersionRows(ownerId: string, characterId: string): Promise<CharacterVersion[]> {
  const character = await findCharacterRow(ownerId, characterId);

  if (!character) {
    throw new Error("Character not found");
  }

  const rows = await db
    .select()
    .from(characterVersions)
    .where(eq(characterVersions.characterId, characterId))
    .orderBy(desc(characterVersions.createdAt));

  return rows.map(toCharacterVersion);
}

export async function listCharacterAssetRows(ownerId: string, characterId: string): Promise<CharacterAssetReference[]> {
  const character = await findCharacterRow(ownerId, characterId);

  if (!character) {
    throw new Error("Character not found");
  }

  const rows = await db
    .select()
    .from(characterAssets)
    .where(and(eq(characterAssets.ownerId, ownerId), eq(characterAssets.characterId, characterId)))
    .orderBy(characterAssets.createdAt);

  return rows.map(toCharacterAssetReference);
}

async function syncCharacterAssetRows(input: {
  assetIds: string[];
  characterId: string;
  ownerId: string;
  projectId: string;
}): Promise<void> {
  await db.delete(characterAssets).where(eq(characterAssets.characterId, input.characterId));

  if (input.assetIds.length === 0) {
    return;
  }

  await db.insert(characterAssets).values(
    input.assetIds.map((assetId) => ({
      assetId,
      characterId: input.characterId,
      ownerId: input.ownerId,
      projectId: input.projectId
    }))
  );
}

async function recordCharacterVersionRow(character: Character, action: CharacterVersionAction): Promise<void> {
  await db.insert(characterVersions).values({
    action,
    characterId: character.id,
    snapshot: {
      id: character.id,
      deletedAt: character.deletedAt?.toISOString() ?? null,
      description: character.description,
      metadata: character.metadata,
      name: character.name,
      ownerId: character.ownerId,
      projectId: character.projectId,
      referenceAssetIds: character.referenceAssetIds,
      status: character.status
    }
  });
}
