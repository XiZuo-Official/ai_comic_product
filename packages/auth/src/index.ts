export type { AuthenticatedUserRef, UpdateUserProfileInput, UserProfile, UserProfileDefaults } from "./api";
export { getOrCreateUserProfile, updateUserProfile } from "./application/user-profile";
export { updateUserProfileSchema } from "./domain/profile";
