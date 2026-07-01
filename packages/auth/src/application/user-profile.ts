import type { UpdateUserProfileInput, UserProfile, UserProfileDefaults } from "../api";
import { getDefaultDisplayName, parseUserProfileInput } from "../domain/profile";
import { createUserProfile, findUserProfileByAuthUserId, updateUserProfileRow } from "../infrastructure/user-profile-repository";

export async function getOrCreateUserProfile(authUserId: string, defaults: UserProfileDefaults = {}): Promise<UserProfile> {
  const existing = await findUserProfileByAuthUserId(authUserId);

  if (existing) {
    return existing;
  }

  const created = await createUserProfile(authUserId, getDefaultDisplayName(defaults.displayName));

  if (created) {
    return created;
  }

  const profile = await findUserProfileByAuthUserId(authUserId);

  if (!profile) {
    throw new Error("User profile could not be created");
  }

  return profile;
}

export async function updateUserProfile(authUserId: string, input: UpdateUserProfileInput): Promise<UserProfile> {
  const parsed = parseUserProfileInput(input);
  const existing = await findUserProfileByAuthUserId(authUserId);

  if (!existing) {
    await getOrCreateUserProfile(authUserId, { displayName: parsed.displayName });
  }

  return updateUserProfileRow(authUserId, parsed);
}
