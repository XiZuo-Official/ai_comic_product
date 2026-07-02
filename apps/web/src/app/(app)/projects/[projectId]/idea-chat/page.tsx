import { estimateAiJobCredits } from "@ai-comic/ai";
import { getIdeaThread, listProjectIdeaThreads } from "@ai-comic/ideas";
import { getProject } from "@ai-comic/projects";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { Input } from "@ai-comic/ui/components/input";
import { Label } from "@ai-comic/ui/components/label";
import { auth } from "@clerk/nextjs/server";
import { MessageSquareText, Plus, SendHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState } from "../../../../../components/empty-state";
import { createIdeaThreadAction, sendIdeaMessageAction } from "./actions";
import { SubmitButton } from "./submit-button";

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(date);
}

export default async function IdeaChatPage({
  params,
  searchParams
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string; threadId?: string }>;
}) {
  const [{ projectId }, { error, threadId }, { userId }] = await Promise.all([params, searchParams, auth()]);

  if (!userId) {
    notFound();
  }

  const project = await getProject(userId, projectId);

  if (!project) {
    notFound();
  }

  const threads = await listProjectIdeaThreads(userId, projectId);
  const selectedThreadId = threadId && threads.some((thread) => thread.id === threadId) ? threadId : threads[0]?.id;
  const selectedThread = selectedThreadId ? await getIdeaThread(userId, selectedThreadId) : null;
  const cost = estimateAiJobCredits("text_generation");

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Idea Chat</CardTitle>
            <CardDescription>Brainstorm story direction for {project.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createIdeaThreadAction} className="grid gap-3">
              <input name="projectId" type="hidden" value={project.id} />
              <div className="space-y-2">
                <Label htmlFor="idea-thread-title">New Thread</Label>
                <Input id="idea-thread-title" maxLength={120} name="title" placeholder="Opening arc, villain reveal..." />
              </div>
              <SubmitButton pendingText="Creating...">
                <Plus className="h-4 w-4" />
                Create Thread
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Threads</CardTitle>
            <CardDescription>Project-scoped conversation history.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {threads.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No idea threads yet.</p>
            ) : (
              threads.map((thread) => (
                <Button
                  key={thread.id}
                  asChild
                  className="justify-start"
                  variant={thread.id === selectedThreadId ? "secondary" : "ghost"}
                >
                  <Link href={`/projects/${project.id}/idea-chat?threadId=${thread.id}`}>
                    <MessageSquareText className="h-4 w-4" />
                    <span className="truncate">{thread.title}</span>
                  </Link>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credit Preview</CardTitle>
            <CardDescription>AI text messages use the AI Job Foundation.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-sm">
            <span>Per assistant response</span>
            <Badge className="bg-slate-100 dark:bg-slate-900">{cost} Credits</Badge>
          </CardContent>
        </Card>
      </aside>

      <section className="grid gap-6">
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {!selectedThread ? (
          <EmptyState
            action={
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Sparkles className="h-4 w-4" />
                Create a thread to begin brainstorming.
              </div>
            }
            description="Idea Chat keeps project-scoped history and uses provider-agnostic AI text generation."
            title="No active idea thread"
          />
        ) : (
          <Card className="min-h-[640px]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{selectedThread.thread.title}</CardTitle>
                  <CardDescription>
                    {selectedThread.messages.length} messages - Updated {formatTime(selectedThread.thread.updatedAt)}
                  </CardDescription>
                </div>
                <Badge className="bg-slate-100 dark:bg-slate-900">{cost} Credits / response</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              {selectedThread.messages.length === 0 ? (
                <EmptyState
                  description="Ask for premises, arcs, scene beats, tone options, or prompt direction."
                  title="This thread is ready"
                />
              ) : (
                <div className="grid gap-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.role === "user"
                          ? "ml-auto max-w-[85%] rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white dark:bg-slate-100 dark:text-slate-950"
                          : "mr-auto max-w-[85%] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                      }
                    >
                      <div className="mb-2 flex items-center gap-2 text-xs opacity-70">
                        <span>{message.role === "user" ? "You" : "Idea Assistant"}</span>
                        <span>{formatTime(message.createdAt)}</span>
                        {message.status === "failed" ? <Badge className="border-red-200 text-red-700 dark:border-red-900 dark:text-red-300">failed</Badge> : null}
                      </div>
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                      {message.aiJobId ? <p className="mt-2 text-xs opacity-60">AI job: {message.aiJobId}</p> : null}
                    </div>
                  ))}
                </div>
              )}

              <form action={sendIdeaMessageAction} className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <input name="projectId" type="hidden" value={project.id} />
                <input name="threadId" type="hidden" value={selectedThread.thread.id} />
                <div className="space-y-2">
                  <Label htmlFor="idea-message">Message</Label>
                  <textarea
                    className="min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    id="idea-message"
                    maxLength={4000}
                    name="content"
                    placeholder="Help me develop a first chapter hook with emotional stakes..."
                    required
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Sending reserves {cost} credits before AI execution.</p>
                  <SubmitButton pendingText="Generating...">
                    <SendHorizontal className="h-4 w-4" />
                    Send Message
                  </SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
