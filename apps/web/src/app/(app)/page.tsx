import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { FolderKanban, Image } from "lucide-react";
import Link from "next/link";

const entryPoints = [
  {
    description: "Open the single-image creation surface.",
    href: "/single-image-mode",
    icon: Image,
    title: "Single Image Mode"
  },
  {
    description: "Manage project workspaces and comic structure.",
    href: "/projects",
    icon: FolderKanban,
    title: "Projects"
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Home</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose where to start.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {entryPoints.map((entry) => (
          <Card key={entry.href}>
            <CardHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800">
                <entry.icon className="h-5 w-5" />
              </div>
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={entry.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
