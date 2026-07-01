import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { getProject } from "@ai-comic/projects";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

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
    <Card>
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>Project navigation is ready. Feature pages are staged for their assigned milestones.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Open a section from the project sidebar to continue.
        </p>
      </CardContent>
    </Card>
  );
}
