import { listProjectAssets, type Asset } from "@ai-comic/assets";
import { getComicPage, listComicLayoutVersions, listProjectComicPages, type ComicBubble, type ComicPanel } from "@ai-comic/comic-studio";
import { listProjectCharacters } from "@ai-comic/characters";
import { getProject } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { ImageIcon, LayoutPanelTop, MessageSquarePlus, PanelsTopLeft, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../../../components/empty-state";
import {
  createComicBubbleAction,
  createComicPageAction,
  createComicPanelAction,
  updateComicBubbleAction,
  updateComicPageAction,
  updateComicPanelAction
} from "./actions";

function metadataValue(metadata: Record<string, unknown>): string {
  return Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : "";
}

function assetOptionLabel(asset: Asset): string {
  return `${asset.displayName} (${asset.status})`;
}

export default async function ComicStudioPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ pageId?: string }>;
}) {
  const { projectId } = await params;
  const { pageId } = await searchParams;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  const [pages, assets, characters] = await Promise.all([
    listProjectComicPages(userId, projectId),
    listProjectAssets(userId, projectId),
    listProjectCharacters(userId, projectId)
  ]);
  const selectedPageId = pageId ?? pages[0]?.id;
  const selectedPage = selectedPageId ? await getComicPage(userId, selectedPageId) : null;
  const versions = selectedPage ? await listComicLayoutVersions(userId, selectedPage.id) : [];
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Comic Studio</CardTitle>
          <CardDescription>Create and edit comic pages for {project.name}. Layout editing does not consume credits.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createComicPageAction} className="grid gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700 md:grid-cols-[1fr_auto]">
            <input name="projectId" type="hidden" value={project.id} />
            <div className="space-y-2">
              <Label htmlFor="new-page-title">New Page Title</Label>
              <Input id="new-page-title" maxLength={120} name="title" placeholder={`Page ${pages.length + 1}`} />
            </div>
            <Button className="self-end" type="submit">
              <Plus className="h-4 w-4" />
              Create Page
            </Button>
          </form>
        </CardContent>
      </Card>

      {pages.length === 0 || !selectedPage ? (
        <EmptyState
          action={
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <PanelsTopLeft className="h-4 w-4" />
              Create a page to begin arranging panels and bubbles.
            </div>
          }
          description="Comic Studio saves project pages, panels, bubbles, and placed assets for later export."
          title="No comic pages yet"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_420px]">
          <aside className="grid h-fit gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pages</CardTitle>
                <CardDescription>{pages.length} saved pages</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                {pages.map((page) => (
                  <Button key={page.id} asChild variant={page.id === selectedPage.id ? "default" : "outline"}>
                    <Link href={`/projects/${project.id}/comic-studio?pageId=${page.id}`}>
                      Page {page.pageNumber}: {page.title}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Studio Context</CardTitle>
                <CardDescription>Read-only project ingredients available to the layout.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                <Badge>{assets.length} assets</Badge>
                <Badge>{characters.length} characters</Badge>
                <Badge>{versions.length} versions</Badge>
              </CardContent>
            </Card>
          </aside>

          <main className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      Page {selectedPage.pageNumber}: {selectedPage.title}
                    </CardTitle>
                    <CardDescription>
                      {selectedPage.panels.length} panels, {selectedPage.bubbles.length} bubbles
                    </CardDescription>
                  </div>
                  <Badge className="bg-slate-100 dark:bg-slate-900">{selectedPage.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto aspect-[2/3] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-300 bg-[linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:24px_24px] shadow-inner dark:border-slate-700 dark:bg-slate-950">
                  {selectedPage.panels.map((panel) => (
                    <PanelPreview key={panel.id} asset={panel.assetId ? assetById.get(panel.assetId) : undefined} panel={panel} />
                  ))}
                  {selectedPage.bubbles.map((bubble) => (
                    <BubblePreview key={bubble.id} bubble={bubble} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Page Settings</CardTitle>
                <CardDescription>Page metadata updates create layout snapshots.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateComicPageAction} className="grid gap-4">
                  <input name="projectId" type="hidden" value={project.id} />
                  <input name="pageId" type="hidden" value={selectedPage.id} />
                  <div className="space-y-2">
                    <Label htmlFor="page-title">Title</Label>
                    <Input id="page-title" maxLength={120} name="title" required defaultValue={selectedPage.title} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="page-metadata">Metadata JSON</Label>
                    <textarea
                      className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                      id="page-metadata"
                      name="metadata"
                      defaultValue={metadataValue(selectedPage.metadata)}
                    />
                  </div>
                  <Button type="submit">Save Page</Button>
                </form>
              </CardContent>
            </Card>
          </main>

          <aside className="grid h-fit gap-4">
            <PanelEditor assets={assets} pageId={selectedPage.id} panels={selectedPage.panels} projectId={project.id} />
            <BubbleEditor bubbles={selectedPage.bubbles} pageId={selectedPage.id} panels={selectedPage.panels} projectId={project.id} />
          </aside>
        </div>
      )}
    </div>
  );
}

function PanelPreview({ asset, panel }: { asset?: Asset; panel: ComicPanel }) {
  return (
    <div
      className="absolute overflow-hidden rounded-lg border-2 border-slate-950 bg-white shadow-sm dark:border-slate-200 dark:bg-slate-900"
      style={{
        height: `${panel.height}%`,
        left: `${panel.x}%`,
        top: `${panel.y}%`,
        width: `${panel.width}%`,
        zIndex: panel.orderIndex + 1
      }}
    >
      {asset?.mimeType.startsWith("image/") ? (
        <Image alt={asset.displayName} className="h-full w-full object-cover" height={480} src={asset.previewUrl} width={640} />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

function BubblePreview({ bubble }: { bubble: ComicBubble }) {
  return (
    <div
      className="absolute rounded-[45%] border-2 border-slate-950 bg-white px-3 py-2 text-center text-xs font-semibold leading-tight text-slate-950 shadow-sm dark:border-slate-200"
      style={{
        height: `${bubble.height}%`,
        left: `${bubble.x}%`,
        top: `${bubble.y}%`,
        width: `${bubble.width}%`,
        zIndex: bubble.orderIndex + 20
      }}
    >
      <span className="line-clamp-4">{bubble.text}</span>
    </div>
  );
}

function PanelEditor({ assets, pageId, panels, projectId }: { assets: Asset[]; pageId: string; panels: ComicPanel[]; projectId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutPanelTop className="h-4 w-4" />
          Panels
        </CardTitle>
        <CardDescription>Add panels and place existing project assets.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form action={createComicPanelAction} className="grid gap-3 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <input name="projectId" type="hidden" value={projectId} />
          <input name="pageId" type="hidden" value={pageId} />
          <GeometryFields defaults={{ height: 30, orderIndex: panels.length, width: 80, x: 10, y: 10 }} prefix="new-panel" />
          <AssetSelect assets={assets} inputId="new-panel-asset" selectedAssetId={null} />
          <Button type="submit">Add Panel</Button>
        </form>
        {panels.map((panel) => (
          <form key={panel.id} action={updateComicPanelAction} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="pageId" type="hidden" value={pageId} />
            <input name="panelId" type="hidden" value={panel.id} />
            <GeometryFields defaults={panel} prefix={panel.id} />
            <AssetSelect assets={assets} inputId={`${panel.id}-asset`} selectedAssetId={panel.assetId} />
            <Button type="submit" variant="outline">Save Panel</Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

function BubbleEditor({ bubbles, pageId, panels, projectId }: { bubbles: ComicBubble[]; pageId: string; panels: ComicPanel[]; projectId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquarePlus className="h-4 w-4" />
          Bubbles
        </CardTitle>
        <CardDescription>Add dialogue bubbles and attach them to panels if needed.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form action={createComicBubbleAction} className="grid gap-3 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-700">
          <input name="projectId" type="hidden" value={projectId} />
          <input name="pageId" type="hidden" value={pageId} />
          <BubbleFields bubblesCount={bubbles.length} defaultText="" panels={panels} prefix="new-bubble" selectedPanelId={null} />
          <GeometryFields defaults={{ height: 12, orderIndex: bubbles.length, width: 30, x: 35, y: 12 }} prefix="new-bubble" />
          <Button type="submit">Add Bubble</Button>
        </form>
        {bubbles.map((bubble) => (
          <form key={bubble.id} action={updateComicBubbleAction} className="grid gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <input name="projectId" type="hidden" value={projectId} />
            <input name="pageId" type="hidden" value={pageId} />
            <input name="bubbleId" type="hidden" value={bubble.id} />
            <BubbleFields bubblesCount={bubbles.length} defaultText={bubble.text} panels={panels} prefix={bubble.id} selectedPanelId={bubble.panelId} />
            <GeometryFields defaults={bubble} prefix={bubble.id} />
            <Button type="submit" variant="outline">Save Bubble</Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

function GeometryFields({
  defaults,
  prefix
}: {
  defaults: { height: number; orderIndex: number; width: number; x: number; y: number };
  prefix: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["x", "y", "width", "height", "orderIndex"] as const).map((field) => (
        <div key={field} className="space-y-1">
          <Label htmlFor={`${prefix}-${field}`}>{field}</Label>
          <Input id={`${prefix}-${field}`} max={field === "orderIndex" ? 999 : 100} min={field === "width" || field === "height" ? 1 : 0} name={field} required type="number" defaultValue={defaults[field]} />
        </div>
      ))}
    </div>
  );
}

function AssetSelect({ assets, inputId, selectedAssetId }: { assets: Asset[]; inputId: string; selectedAssetId: string | null }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>Placed Asset</Label>
      <select
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
        id={inputId}
        name="assetId"
        defaultValue={selectedAssetId ?? ""}
      >
        <option value="">No asset</option>
        {assets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {assetOptionLabel(asset)}
          </option>
        ))}
      </select>
    </div>
  );
}

function BubbleFields({
  defaultText,
  panels,
  prefix,
  selectedPanelId
}: {
  bubblesCount: number;
  defaultText: string;
  panels: ComicPanel[];
  prefix: string;
  selectedPanelId: string | null;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-text`}>Text</Label>
        <Input id={`${prefix}-text`} maxLength={500} name="text" required defaultValue={defaultText} placeholder="Dialogue or sound effect" />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-panel`}>Panel</Label>
        <select
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
          id={`${prefix}-panel`}
          name="panelId"
          defaultValue={selectedPanelId ?? ""}
        >
          <option value="">No panel binding</option>
          {panels.map((panel, index) => (
            <option key={panel.id} value={panel.id}>
              Panel {index + 1}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
