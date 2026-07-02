import { getAsset } from "@ai-comic/assets";
import { estimateAiJobCredits } from "@ai-comic/ai";
import { listProjects } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { Download, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../components/empty-state";
import { generateSingleImageAction } from "./actions";

export default async function SingleImageModePage({
  searchParams
}: {
  searchParams: Promise<{ assetId?: string; error?: string; jobId?: string; projectId?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const [{ assetId, error, jobId, projectId }, projects] = await Promise.all([searchParams, listProjects(userId)]);
  const selectedProjectId = projectId && projects.some((project) => project.id === projectId) ? projectId : projects[0]?.id;
  const asset = assetId ? await getAsset(userId, assetId) : null;
  const cost = estimateAiJobCredits("image_generation");

  if (projects.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild>
            <Link href="/projects">Create Project</Link>
          </Button>
        }
        description="Single Image Mode saves generated outputs into a project Asset Library, so create a project first."
        title="Create a project before generating"
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Single Image Mode</CardTitle>
              <CardDescription>Generate one image from a prompt and save it to a project Asset Library.</CardDescription>
            </div>
            <Badge className="bg-slate-100 dark:bg-slate-900">{cost} Credits</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form action={generateSingleImageAction} className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="single-image-project">Target Project</Label>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                defaultValue={selectedProjectId}
                id="single-image-project"
                name="projectId"
                required
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="single-image-prompt">Prompt</Label>
              <textarea
                className="min-h-40 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                id="single-image-prompt"
                maxLength={2000}
                name="prompt"
                placeholder="A dramatic manga panel of a lone traveler entering a neon forest..."
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="single-image-style">Style</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                  defaultValue="manga"
                  id="single-image-style"
                  name="style"
                >
                  <option value="manga">Manga</option>
                  <option value="comic">Comic</option>
                  <option value="storybook">Storybook</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="single-image-aspect-ratio">Aspect Ratio</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
                  defaultValue="1:1"
                  id="single-image-aspect-ratio"
                  name="aspectRatio"
                >
                  <option value="1:1">Square 1:1</option>
                  <option value="2:3">Portrait 2:3</option>
                  <option value="3:2">Landscape 3:2</option>
                </select>
              </div>
            </div>
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}
            <Button className="w-fit" type="submit">
              <Sparkles className="h-4 w-4" />
              Generate Image
            </Button>
          </form>
        </CardContent>
      </Card>

      <aside className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generation Status</CardTitle>
            <CardDescription>Milestone 8 uses the provider-agnostic AI Job Foundation.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <span>Cost preview</span>
              <strong>{cost} Credits</strong>
            </div>
            <div className="flex items-center justify-between rounded-md border border-slate-200 p-3 dark:border-slate-800">
              <span>Job</span>
              <strong>{jobId ? "Succeeded" : "Waiting"}</strong>
            </div>
            <p>
              Real provider integration is intentionally not included yet. This workflow proves prompt, credits, job, asset, preview, and download behavior.
            </p>
          </CardContent>
        </Card>

        {asset ? (
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
              <CardDescription>Saved to Asset Library as {asset.displayName}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
                <Image alt={asset.displayName} className="aspect-square h-auto w-full object-cover" height={512} src={asset.previewUrl} width={512} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a download={asset.displayName} href={asset.previewUrl}>
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/projects/${asset.projectId}/asset-library`}>Open Asset Library</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            action={<ImageIcon className="h-5 w-5 text-slate-400" />}
            description="Your generated image preview and download action will appear here."
            title="No image generated yet"
          />
        )}
      </aside>
    </div>
  );
}
