import { listProjectAssets } from "@ai-comic/assets";
import { getProject } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { Archive, FileText, ImageUp, Upload } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../../../components/empty-state";
import { deleteAssetAction, updateAssetAction, uploadAssetAction } from "./actions";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function metadataValue(metadata: Record<string, unknown>): string {
  return Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : "";
}

export default async function AssetLibraryPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  const assets = await listProjectAssets(userId, projectId);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Library</CardTitle>
          <CardDescription>Upload and organize reusable project assets for {project.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadAssetAction} className="grid gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <input name="projectId" type="hidden" value={project.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="asset-file">File</Label>
                <Input
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain"
                  id="asset-file"
                  name="file"
                  required
                  type="file"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-display-name">Display Name</Label>
                <Input id="asset-display-name" maxLength={160} name="displayName" placeholder="Optional friendly name" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="asset-description">Description</Label>
                <Input id="asset-description" maxLength={500} name="description" placeholder="Optional asset notes" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset-tags">Tags</Label>
                <Input id="asset-tags" name="tags" placeholder="hero, reference, background" />
              </div>
            </div>
            <Button className="w-fit" type="submit">
              <Upload className="h-4 w-4" />
              Upload Asset
            </Button>
          </form>
        </CardContent>
      </Card>

      {assets.length === 0 ? (
        <EmptyState
          action={
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <ImageUp className="h-4 w-4" />
              Upload your first project asset to begin.
            </div>
          }
          description="Assets uploaded here stay scoped to this project and can be reused by later MVP modules."
          title="No assets yet"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden">
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-slate-900">
                  {asset.mimeType.startsWith("image/") ? (
                    <Image alt={asset.displayName} className="h-full w-full object-cover" height={360} src={asset.previewUrl} width={480} />
                  ) : (
                    <FileText className="h-12 w-12 text-slate-400" />
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{asset.displayName}</CardTitle>
                      <CardDescription>{formatFileSize(asset.fileSize)}</CardDescription>
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-900">{asset.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <p className="min-h-10 text-sm text-slate-500 dark:text-slate-400">
                    {asset.description ?? "No description yet."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.length > 0 ? (
                      asset.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)
                    ) : (
                      <Badge className="border-dashed text-slate-500 dark:text-slate-400">untagged</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <aside className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardHeader>
                  <CardTitle className="text-base">Edit {asset.displayName}</CardTitle>
                  <CardDescription>Metadata changes stay inside the Assets module.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <form action={updateAssetAction} className="grid gap-3">
                    <input name="projectId" type="hidden" value={project.id} />
                    <input name="assetId" type="hidden" value={asset.id} />
                    <div className="space-y-2">
                      <Label htmlFor={`display-name-${asset.id}`}>Display Name</Label>
                      <Input id={`display-name-${asset.id}`} maxLength={160} name="displayName" required defaultValue={asset.displayName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${asset.id}`}>Description</Label>
                      <Input id={`description-${asset.id}`} maxLength={500} name="description" defaultValue={asset.description ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tags-${asset.id}`}>Tags</Label>
                      <Input id={`tags-${asset.id}`} name="tags" defaultValue={asset.tags.join(", ")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`metadata-${asset.id}`}>Metadata JSON</Label>
                      <textarea
                        className="min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        id={`metadata-${asset.id}`}
                        name="metadata"
                        defaultValue={metadataValue(asset.metadata)}
                      />
                    </div>
                    <Button type="submit">Save Asset</Button>
                  </form>
                  <form action={deleteAssetAction}>
                    <input name="projectId" type="hidden" value={project.id} />
                    <input name="assetId" type="hidden" value={asset.id} />
                    <Button className="w-full" type="submit" variant="destructive">
                      <Archive className="h-4 w-4" />
                      Delete Asset
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}
