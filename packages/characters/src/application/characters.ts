import { getAsset } from "@ai-comic/assets";
import { getProject } from "@ai-comic/projects";

import type { Character, CharacterAssetReference, CharacterVersion, CreateCharacterInput, UpdateCharacterInput } from "../api";
import {
  normalizeCharacterDescription,
  normalizeCharacterKey,
  normalizeCharacterMetadata,
  normalizeCharacterName,
  normalizeReferenceAssetIds,
  parseCreateCharacterInput,
  parseUpdateCharacterInput
} from "../domain/character";
import {
  createCharacterRow,
  deleteCharacterRow,
  findCharacterByNormalizedNameRow,
  findCharacterRow,
  listCharacterAssetRows,
  listCharacterRows,
  listCharacterVersionRows,
  updateCharacterRow
} from "../infrastructure/character-repository";

async function assertProjectAccess(ownerId: string, projectId: string): Promise<void> {
  const project = await getProject(ownerId, projectId);

  if (!project) {
    throw new Error("Project not found");
  }
}

async function assertReferenceAssets(ownerId: string, projectId: string, assetIds: string[]): Promise<void> {
  for (const assetId of assetIds) {
    const asset = await getAsset(ownerId, assetId);

    if (!asset || asset.projectId !== projectId) {
      throw new Error("Reference asset not found");
    }
  }
}

async function assertUniqueCharacterName(input: {
  characterIdToExclude?: string;
  normalizedName: string;
  ownerId: string;
  projectId: string;
}): Promise<void> {
  const existing = await findCharacterByNormalizedNameRow(input);

  if (existing) {
    throw new Error("Character name already exists in this project");
  }
}

export async function listProjectCharacters(ownerId: string, projectId: string): Promise<Character[]> {
  await assertProjectAccess(ownerId, projectId);

  return listCharacterRows(ownerId, projectId);
}

export async function getCharacter(ownerId: string, characterId: string): Promise<Character | null> {
  return findCharacterRow(ownerId, characterId);
}

export async function createCharacter(ownerId: string, input: CreateCharacterInput): Promise<Character> {
  const parsed = parseCreateCharacterInput(input);
  await assertProjectAccess(ownerId, parsed.projectId);

  const name = normalizeCharacterName(parsed.name);
  const normalizedName = normalizeCharacterKey(name);
  const referenceAssetIds = normalizeReferenceAssetIds(parsed.referenceAssetIds);

  await assertUniqueCharacterName({
    normalizedName,
    ownerId,
    projectId: parsed.projectId
  });
  await assertReferenceAssets(ownerId, parsed.projectId, referenceAssetIds);

  return createCharacterRow({
    description: normalizeCharacterDescription(parsed.description),
    metadata: normalizeCharacterMetadata(parsed.metadata),
    name,
    normalizedName,
    ownerId,
    projectId: parsed.projectId,
    referenceAssetIds
  });
}

export async function updateCharacter(ownerId: string, characterId: string, input: UpdateCharacterInput): Promise<Character> {
  const parsed = parseUpdateCharacterInput(input);
  const existing = await findCharacterRow(ownerId, characterId);

  if (!existing) {
    throw new Error("Character not found");
  }

  const name = parsed.name !== undefined ? normalizeCharacterName(parsed.name) : undefined;
  const normalizedName = name !== undefined ? normalizeCharacterKey(name) : undefined;
  const referenceAssetIds = parsed.referenceAssetIds !== undefined ? normalizeReferenceAssetIds(parsed.referenceAssetIds) : undefined;

  if (normalizedName !== undefined && normalizedName !== existing.normalizedName) {
    await assertUniqueCharacterName({
      characterIdToExclude: characterId,
      normalizedName,
      ownerId,
      projectId: existing.projectId
    });
  }

  if (referenceAssetIds !== undefined) {
    await assertReferenceAssets(ownerId, existing.projectId, referenceAssetIds);
  }

  return updateCharacterRow({
    characterId,
    description: parsed.description !== undefined ? normalizeCharacterDescription(parsed.description) : undefined,
    metadata: parsed.metadata !== undefined ? normalizeCharacterMetadata(parsed.metadata) : undefined,
    name,
    normalizedName,
    ownerId,
    referenceAssetIds
  });
}

export async function deleteCharacter(ownerId: string, characterId: string): Promise<void> {
  await deleteCharacterRow(ownerId, characterId);
}

export async function listCharacterVersions(ownerId: string, characterId: string): Promise<CharacterVersion[]> {
  return listCharacterVersionRows(ownerId, characterId);
}

export async function listCharacterAssetReferences(ownerId: string, characterId: string): Promise<CharacterAssetReference[]> {
  return listCharacterAssetRows(ownerId, characterId);
}
