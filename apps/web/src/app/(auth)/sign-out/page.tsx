import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";

export default function SignOutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>End this session and return to the sign in page.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton redirectUrl="/sign-in">
            <Button className="w-full">Sign Out</Button>
          </SignOutButton>
        </CardContent>
      </Card>
    </main>
  );
}
