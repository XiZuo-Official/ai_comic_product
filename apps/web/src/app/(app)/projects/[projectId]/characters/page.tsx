import { listProjectAssets, type Asset } from "@ai-comic/assets";
import { listProjectCharacters, listCharacterVersions } from "@ai-comic/characters";
import { getProject } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { Archive, BookUser, ImageIcon, Sparkles, UserRoundPlus } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../../../components/empty-state";
import { createCharacterAction, deleteCharacterAction, updateCharacterAction } from "./actions";

function metadataValue(metadata: Record<string, unknown>): string {
  return Object.keys(metadata).length > 0 ? JSON.stringify(metadata, null, 2) : "";
}

function isAsset(value: Asset | undefined): value is Asset {
  return value !== undefined;
}

export default async function CharactersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  const [characters, assets] = await Promise.all([listProjectCharacters(userId, projectId), listProjectAssets(userId, projectId)]);
  const versionCounts = new Map(
    await Promise.all(characters.map(async (character) => [character.id, (await listCharacterVersions(userId, character.id)).length] as const))
  );
  const assetById = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Characters</CardTitle>
          <CardDescription>Create project-scoped character records and connect existing Asset Library references for {project.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCharacterAction} className="grid gap-4 rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <input name="projectId" type="hidden" value={project.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="character-name">Name</Label>
                <Input id="character-name" maxLength={120} name="name" placeholder="Mira, the moon courier" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="character-description">Description</Label>
                <Input id="character-description" maxLength={800} name="description" placeholder="Role, personality, visual notes" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="character-metadata">Metadata JSON</Label>
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                id="character-metadata"
                name="metadata"
                placeholder='{"role":"protagonist","traits":["curious","brave"]}'
              />
            </div>
            <ReferenceAssetPicker assets={assets} inputIdPrefix="new-character" selectedAssetIds={[]} />
            <Button className="w-fit" type="submit">
              <UserRoundPlus className="h-4 w-4" />
              Create Character
            </Button>
          </form>
        </CardContent>
      </Card>

      {characters.length === 0 ? (
        <EmptyState
          action={
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles className="h-4 w-4" />
              Create your first character to prepare for Comic Studio.
            </div>
          }
          description="Characters stay scoped to this project and can reuse assets already uploaded to the Asset Library."
          title="No characters yet"
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
          <section className="grid gap-4 md:grid-cols-2">
            {characters.map((character) => {
              const referenceAssets = character.referenceAssetIds.map((assetId) => assetById.get(assetId)).filter(isAsset);

              return (
                <Card key={character.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <CardDescription>{character.description ?? "No description yet."}</CardDescription>
                      </div>
                      <Badge className="bg-slate-100 dark:bg-slate-900">{character.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Badge>{versionCounts.get(character.id) ?? 0} versions</Badge>
                      <Badge>{character.referenceAssetIds.length} references</Badge>
                    </div>
                    {referenceAssets.length === 0 ? (
                      <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        No reference assets linked
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {referenceAssets.map((asset) => (
                          <div key={asset.id} className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-slate-900">
                              {asset.mimeType.startsWith("image/") ? (
                                <Image alt={asset.displayName} className="h-full w-full object-cover" height={180} src={asset.previewUrl} width={240} />
                              ) : (
                                <ImageIcon className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <div className="truncate px-2 py-1 text-xs text-slate-600 dark:text-slate-300">{asset.displayName}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {Object.keys(character.metadata).length > 0 ? (
                      <pre className="max-h-32 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        {JSON.stringify(character.metadata, null, 2)}
                      </pre>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <aside className="grid gap-4">
            {characters.map((character) => (
              <Card key={character.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookUser className="h-4 w-4" />
                    Edit {character.name}
                  </CardTitle>
                  <CardDescription>Character changes are versioned by the Characters module.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <form action={updateCharacterAction} className="grid gap-3">
                    <input name="projectId" type="hidden" value={project.id} />
                    <input name="characterId" type="hidden" value={character.id} />
                    <div className="space-y-2">
                      <Label htmlFor={`name-${character.id}`}>Name</Label>
                      <Input id={`name-${character.id}`} maxLength={120} name="name" required defaultValue={character.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${character.id}`}>Description</Label>
                      <Input id={`description-${character.id}`} maxLength={800} name="description" defaultValue={character.description ?? ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`metadata-${character.id}`}>Metadata JSON</Label>
                      <textarea
                        className="min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        id={`metadata-${character.id}`}
                        name="metadata"
                        defaultValue={metadataValue(character.metadata)}
                      />
                    </div>
                    <ReferenceAssetPicker assets={assets} inputIdPrefix={character.id} selectedAssetIds={character.referenceAssetIds} />
                    <Button type="submit">Save Character</Button>
                  </form>
                  <form action={deleteCharacterAction}>
                    <input name="projectId" type="hidden" value={project.id} />
                    <input name="characterId" type="hidden" value={character.id} />
                    <Button className="w-full" type="submit" variant="destructive">
                      <Archive className="h-4 w-4" />
                      Delete Character
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

function ReferenceAssetPicker({
  assets,
  inputIdPrefix,
  selectedAssetIds
}: {
  assets: Awaited<ReturnType<typeof listProjectAssets>>;
  inputIdPrefix: string;
  selectedAssetIds: string[];
}) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Upload assets in the Asset Library before linking character references.
      </div>
    );
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="text-sm font-medium text-slate-900 dark:text-slate-100">Reference Assets</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {assets.map((asset) => (
          <label
            key={asset.id}
            className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800"
            htmlFor={`${inputIdPrefix}-${asset.id}`}
          >
            <input
              defaultChecked={selectedAssetIds.includes(asset.id)}
              id={`${inputIdPrefix}-${asset.id}`}
              name="referenceAssetIds"
              type="checkbox"
              value={asset.id}
            />
            <span className="min-w-0 flex-1 truncate">{asset.displayName}</span>
            <Badge>{asset.status}</Badge>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
