import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Button } from "@ai-comic/ui/components/button";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { getProject } from "@ai-comic/projects";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { updateProjectMetadataAction } from "../actions";

export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>{project.description ?? "Add a short project description to keep the workspace easy to recognize."}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Open a section from the project sidebar to continue. Feature pages are staged for their assigned milestones.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Metadata</CardTitle>
          <CardDescription>Milestone 5 supports only name and description updates.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProjectMetadataAction} className="grid gap-4">
            <input name="projectId" type="hidden" value={project.id} />
            <div className="space-y-2">
              <Label htmlFor="project-name">Name</Label>
              <Input id="project-name" maxLength={120} name="name" required defaultValue={project.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Input id="project-description" maxLength={500} name="description" defaultValue={project.description ?? ""} />
            </div>
            <Button className="w-fit" type="submit">
              Save Metadata
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
