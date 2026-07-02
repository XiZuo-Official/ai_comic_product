import { listProjectComicPages } from "@ai-comic/comic-studio";
import { listProjectExports, type ExportJobWithArtifact } from "@ai-comic/export";
import { getProject } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { Download, FileArchive, History, LoaderCircle, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../../../components/empty-state";
import { createExportAction } from "./actions";

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function statusClassName(status: ExportJobWithArtifact["status"]): string {
  if (status === "completed") {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
  }

  if (status === "failed") {
    return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
  }

  return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
}

export default async function ExportPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  const [pages, exports] = await Promise.all([listProjectComicPages(userId, projectId), listProjectExports(userId, projectId)]);
  const canExport = pages.length > 0;
  const latestExport = exports[0];

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Export</CardTitle>
              <CardDescription>Create a downloadable HTML artifact from saved Comic Studio content for {project.name}.</CardDescription>
            </div>
            {latestExport ? <Badge className={statusClassName(latestExport.status)}>Latest: {latestExport.status}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent>
          <form action={createExportAction} className="grid gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700 md:grid-cols-[1fr_auto]">
            <input name="projectId" type="hidden" value={project.id} />
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">MVP Format</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">HTML export, generated from {pages.length} saved page{pages.length === 1 ? "" : "s"}.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input className="h-4 w-4 rounded border-slate-300" defaultChecked name="includeMetadata" type="checkbox" />
                Include export metadata
              </label>
            </div>
            <Button className="self-end" disabled={!canExport} type="submit">
              <FileArchive className="h-4 w-4" />
              Start Export
            </Button>
          </form>
        </CardContent>
      </Card>

      {!canExport ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href={`/projects/${project.id}/comic-studio`}>Open Comic Studio</Link>
            </Button>
          }
          description="Create at least one Comic Studio page before starting an export."
          title="No comic pages to export"
        />
      ) : null}

      {latestExport && latestExport.status !== "completed" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {latestExport.status === "failed" ? <TriangleAlert className="h-4 w-4" /> : <LoaderCircle className="h-4 w-4 animate-spin" />}
              Current Export
            </CardTitle>
            <CardDescription>Status updates are persisted with the export job.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={statusClassName(latestExport.status)}>{latestExport.status}</Badge>
              <span className="text-slate-500 dark:text-slate-400">Started {formatDate(latestExport.createdAt)}</span>
            </div>
            {latestExport.errorMessage ? <p className="text-red-600 dark:text-red-300">{latestExport.errorMessage}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Export History
          </CardTitle>
          <CardDescription>Completed and failed export jobs stay linked to this project.</CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <EmptyState description="Start an export to create the first downloadable artifact." title="No exports yet" />
          ) : (
            <div className="grid gap-3">
              {exports.map((exportJob) => (
                <div key={exportJob.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusClassName(exportJob.status)}>{exportJob.status}</Badge>
                      <Badge className="bg-slate-100 dark:bg-slate-900">{exportJob.format}</Badge>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950 dark:text-slate-50">
                        {exportJob.artifact?.fileName ?? `Export ${exportJob.id.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Created {formatDate(exportJob.createdAt)}
                        {exportJob.artifact ? `, ${formatFileSize(exportJob.artifact.fileSize)}` : ""}
                      </p>
                    </div>
                    {exportJob.errorMessage ? <p className="text-sm text-red-600 dark:text-red-300">{exportJob.errorMessage}</p> : null}
                    {exportJob.sourceSnapshot ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Source snapshot: {exportJob.sourceSnapshot.pageCount} page{exportJob.sourceSnapshot.pageCount === 1 ? "" : "s"}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center md:justify-end">
                    {exportJob.status === "completed" && exportJob.artifact ? (
                      <Button asChild>
                        <Link href={`/v1/exports/${exportJob.id}/download`}>
                          <Download className="h-4 w-4" />
                          Download
                        </Link>
                      </Button>
                    ) : (
                      <Label className="text-sm text-slate-500 dark:text-slate-400">No artifact available</Label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
