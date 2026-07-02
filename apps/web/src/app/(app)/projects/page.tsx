import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { listProjects } from "@ai-comic/projects";
import { auth } from "@clerk/nextjs/server";
import { Archive, ExternalLink } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "../../../components/empty-state";
import { archiveProjectAction, createProjectAction, renameProjectAction } from "./actions";

export default async function ProjectsPage() {
  const { userId } = await auth();
  const projects = userId ? await listProjects(userId) : [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Create and manage comic workspaces.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
          <CardDescription>Start a new workspace for story, assets, and comic pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProjectAction} className="grid gap-3 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input id="project-name" maxLength={120} name="name" placeholder="Moonlit Courier" required />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Input id="project-description" maxLength={500} name="description" placeholder="A short note about this comic project" />
            </div>
            <Button type="submit">Create Project</Button>
          </form>
        </CardContent>
      </Card>

      {projects.length === 0 ? (
        <EmptyState
          description="Create the first project to unlock the project workspace navigation."
          title="No projects yet"
        />
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <form action={renameProjectAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <input name="projectId" type="hidden" value={project.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`project-${project.id}`}>Project name</Label>
                    <Input id={`project-${project.id}`} maxLength={120} name="name" required defaultValue={project.name} />
                    <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {project.description ?? "No description yet."}
                    </p>
                  </div>
                  <Button type="submit" variant="secondary">Rename</Button>
                </form>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <Button asChild variant="outline">
                    <Link href={`/projects/${project.id}`}>
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                  <form action={archiveProjectAction}>
                    <input name="projectId" type="hidden" value={project.id} />
                    <Button type="submit" variant="destructive">
                      <Archive className="h-4 w-4" />
                      Archive
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
