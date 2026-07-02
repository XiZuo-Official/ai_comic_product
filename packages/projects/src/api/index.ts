export type Project = {
  createdAt: Date;
  description: string | null;
  id: string;
  name: string;
  ownerId: string;
  updatedAt: Date;
};

export type ProjectSettings = {
  createdAt: Date;
  id: string;
  projectId: string;
  updatedAt: Date;
};

export type ProjectVersion = {
  action: ProjectVersionAction;
  createdAt: Date;
  id: string;
  projectId: string;
  snapshot: string;
};

export type ProjectVersionAction = "created" | "archived" | "metadata_updated";

export type CreateProjectInput = {
  description?: string | null;
  name: string;
};

export type UpdateProjectMetadataInput = {
  description?: string | null;
  name?: string;
};

export type ArchiveProjectInput = {
  projectId: string;
};
