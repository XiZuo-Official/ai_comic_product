import { db, userProfiles, type UserProfileRow } from "@ai-comic/db";
import { eq } from "drizzle-orm";

import type { UserProfile } from "../api";

export function toUserProfile(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    authUserId: row.authUserId,
    displayName: row.displayName,
    bio: row.bio,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function findUserProfileByAuthUserId(authUserId: string): Promise<UserProfile | null> {
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.authUserId, authUserId)).limit(1);

  return profile ? toUserProfile(profile) : null;
}

export async function createUserProfile(authUserId: string, displayName: string): Promise<UserProfile | null> {
  const [profile] = await db
    .insert(userProfiles)
    .values({ authUserId, displayName })
    .onConflictDoNothing()
    .returning();

  return profile ? toUserProfile(profile) : null;
}

export async function updateUserProfileRow(authUserId: string, input: { bio: string | null; displayName: string }): Promise<UserProfile> {
  const [profile] = await db
    .update(userProfiles)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(userProfiles.authUserId, authUserId))
    .returning();

  if (!profile) {
    throw new Error("User profile not found");
  }

  return toUserProfile(profile);
}
