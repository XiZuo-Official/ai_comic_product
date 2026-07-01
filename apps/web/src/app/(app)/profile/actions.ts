"use server";

import { updateUserProfile } from "@ai-comic/auth";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requireUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}

export async function updateUserProfileAction(formData: FormData) {
  const userId = await requireUserId();

  try {
    await updateUserProfile(userId, {
      displayName: String(formData.get("displayName") ?? ""),
      bio: String(formData.get("bio") ?? "")
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message : "Profile could not be updated";
    redirect(`/profile?error=${encodeURIComponent(message ?? "Profile could not be updated")}`);
  }

  revalidatePath("/profile");
  redirect("/profile?status=updated");
}
