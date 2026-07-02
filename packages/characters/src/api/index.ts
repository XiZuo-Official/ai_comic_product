export type CharacterStatus = "active" | "archived" | "deleted";

export type CharacterMetadata = Record<string, unknown>;

export type Character = {
  createdAt: Date;
  deletedAt: Date | null;
  description: string | null;
  id: string;
  metadata: CharacterMetadata;
  name: string;
  normalizedName: string;
  ownerId: string;
  projectId: string;
  referenceAssetIds: string[];
  status: CharacterStatus;
  updatedAt: Date;
};

export type CharacterVersionAction = "created" | "updated" | "deleted" | "references_updated";

export type CharacterVersion = {
  action: CharacterVersionAction;
  characterId: string;
  createdAt: Date;
  id: string;
  snapshot: CharacterSnapshot;
};

export type CharacterSnapshot = {
  deletedAt: string | null;
  description: string | null;
  id: string;
  metadata: CharacterMetadata;
  name: string;
  ownerId: string;
  projectId: string;
  referenceAssetIds: string[];
  status: CharacterStatus;
};

export type CharacterAssetReference = {
  assetId: string;
  characterId: string;
  createdAt: Date;
  id: string;
  ownerId: string;
  projectId: string;
};

export type CreateCharacterInput = {
  description?: string | null;
  metadata?: CharacterMetadata;
  name: string;
  projectId: string;
  referenceAssetIds?: string[];
};

export type UpdateCharacterInput = {
  description?: string | null;
  metadata?: CharacterMetadata;
  name?: string;
  referenceAssetIds?: string[];
};
