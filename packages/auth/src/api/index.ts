export type AuthenticatedUserRef = {
  authUserId: string;
  emailAddress?: string | null;
  imageUrl?: string | null;
  name?: string | null;
};

export type UserProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserProfileDefaults = {
  displayName?: string | null;
};

export type UpdateUserProfileInput = {
  displayName: string;
  bio?: string | null;
};
