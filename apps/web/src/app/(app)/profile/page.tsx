import { getOrCreateUserProfile } from "@ai-comic/auth";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { auth, currentUser } from "@clerk/nextjs/server";

import { updateUserProfileAction } from "./actions";

type ProfilePageProps = {
  searchParams?: Promise<{
    error?: string;
    status?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [{ userId }, clerkUser] = await Promise.all([auth(), currentUser()]);
  const params = searchParams ? await searchParams : {};

  if (!userId) {
    return null;
  }

  const primaryEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
  const defaultName = clerkUser?.fullName ?? clerkUser?.username ?? primaryEmail?.split("@")[0] ?? null;
  const profile = await getOrCreateUserProfile(userId, { displayName: defaultName });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Profile</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage app-specific profile information. Authentication details stay in Clerk.
        </p>
      </div>

      {params.status === "updated" ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Profile updated.
        </div>
      ) : null}

      {params.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {params.error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>These fields belong to the app and can evolve without changing Clerk authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateUserProfileAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input id="displayName" maxLength={80} name="displayName" required defaultValue={profile.displayName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  className="min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  defaultValue={profile.bio ?? ""}
                  id="bio"
                  maxLength={280}
                  name="bio"
                  placeholder="Short creator bio"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Maximum 280 characters.</p>
              </div>
              <Button type="submit">Save Profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Identity</CardTitle>
            <CardDescription>Read-only authentication context from Clerk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-medium">{primaryEmail ?? "Not provided"}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Auth user id</p>
              <p className="break-all font-mono text-xs">{userId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
