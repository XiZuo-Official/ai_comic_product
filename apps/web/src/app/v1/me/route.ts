import { getOrCreateUserProfile, updateUserProfile, type UserProfile } from "@ai-comic/auth";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

type ClerkIdentity = {
  emailAddress: string | null;
  imageUrl: string | null;
  name: string | null;
};

function serializeProfile(profile: UserProfile) {
  return {
    id: profile.id,
    authUserId: profile.authUserId,
    displayName: profile.displayName,
    bio: profile.bio,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString()
  };
}

function jsonProfile(profile: UserProfile, identity: ClerkIdentity) {
  return NextResponse.json({
    user: {
      authUserId: profile.authUserId,
      ...identity
    },
    profile: serializeProfile(profile)
  });
}

async function getAuthenticatedContext() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  const emailAddress = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const name = clerkUser?.fullName ?? clerkUser?.username ?? emailAddress?.split("@")[0] ?? null;

  return {
    userId,
    identity: {
      emailAddress,
      imageUrl: clerkUser?.imageUrl ?? null,
      name
    }
  };
}

export async function GET() {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const profile = await getOrCreateUserProfile(context.userId, { displayName: context.identity.name });

  return jsonProfile(profile, context.identity);
}

export async function PATCH(request: Request) {
  const context = await getAuthenticatedContext();

  if (!context) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const profile = await updateUserProfile(context.userId, {
      displayName: String(body.displayName ?? ""),
      bio: body.bio === undefined || body.bio === null ? null : String(body.bio)
    });

    return jsonProfile(profile, context.identity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid profile input" }, { status: 400 });
    }

    return NextResponse.json({ error: "Profile could not be updated" }, { status: 400 });
  }
}
