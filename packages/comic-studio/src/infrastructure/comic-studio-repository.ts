import {
  comicBubbles,
  comicLayoutVersions,
  comicPages,
  comicPanels,
  db,
  type ComicBubbleRow,
  type ComicLayoutVersionRow,
  type ComicPageRow,
  type ComicPanelRow
} from "@ai-comic/db";
import { and, asc, desc, eq, isNull, ne } from "drizzle-orm";

import type {
  ComicBubble,
  ComicLayoutSnapshot,
  ComicLayoutVersion,
  ComicLayoutVersionAction,
  ComicMetadata,
  ComicPage,
  ComicPageDetail,
  ComicPageStatus,
  ComicPanel
} from "../api";
import { shouldCreateComicLayoutVersion } from "../domain/comic-studio";

export function toComicPage(row: ComicPageRow): ComicPage {
  return {
    id: row.id,
    createdAt: row.createdAt,
    deletedAt: row.deletedAt,
    metadata: row.metadata as ComicMetadata,
    ownerId: row.ownerId,
    pageNumber: row.pageNumber,
    projectId: row.projectId,
    status: row.status as ComicPageStatus,
    title: row.title,
    updatedAt: row.updatedAt
  };
}

export function toComicPanel(row: ComicPanelRow): ComicPanel {
  return {
    id: row.id,
    assetId: row.assetId,
    createdAt: row.createdAt,
    height: row.height,
    metadata: row.metadata as ComicMetadata,
    orderIndex: row.orderIndex,
    ownerId: row.ownerId,
    pageId: row.pageId,
    projectId: row.projectId,
    updatedAt: row.updatedAt,
    width: row.width,
    x: row.x,
    y: row.y
  };
}

export function toComicBubble(row: ComicBubbleRow): ComicBubble {
  return {
    id: row.id,
    createdAt: row.createdAt,
    height: row.height,
    metadata: row.metadata as ComicMetadata,
    orderIndex: row.orderIndex,
    ownerId: row.ownerId,
    pageId: row.pageId,
    panelId: row.panelId,
    projectId: row.projectId,
    text: row.text,
    updatedAt: row.updatedAt,
    width: row.width,
    x: row.x,
    y: row.y
  };
}

export function toComicLayoutVersion(row: ComicLayoutVersionRow): ComicLayoutVersion {
  return {
    id: row.id,
    action: row.action as ComicLayoutVersionAction,
    createdAt: row.createdAt,
    pageId: row.pageId,
    snapshot: row.snapshot as ComicLayoutSnapshot
  };
}

export async function listComicPageRows(ownerId: string, projectId: string): Promise<ComicPage[]> {
  const rows = await db
    .select()
    .from(comicPages)
    .where(and(eq(comicPages.ownerId, ownerId), eq(comicPages.projectId, projectId), isNull(comicPages.deletedAt), ne(comicPages.status, "deleted")))
    .orderBy(asc(comicPages.pageNumber), asc(comicPages.createdAt));

  return rows.map(toComicPage);
}

export async function findComicPageDetailRow(ownerId: string, pageId: string): Promise<ComicPageDetail | null> {
  const page = await findComicPageRow(ownerId, pageId);

  return page ? comicPageDetail(page) : null;
}

export async function findComicPageRow(ownerId: string, pageId: string): Promise<ComicPage | null> {
  const [page] = await db
    .select()
    .from(comicPages)
    .where(and(eq(comicPages.ownerId, ownerId), eq(comicPages.id, pageId), isNull(comicPages.deletedAt), ne(comicPages.status, "deleted")))
    .limit(1);

  return page ? toComicPage(page) : null;
}

export async function findComicPanelRow(ownerId: string, panelId: string): Promise<ComicPanel | null> {
  const [panel] = await db.select().from(comicPanels).where(and(eq(comicPanels.ownerId, ownerId), eq(comicPanels.id, panelId))).limit(1);

  return panel ? toComicPanel(panel) : null;
}

export async function findComicBubbleRow(ownerId: string, bubbleId: string): Promise<ComicBubble | null> {
  const [bubble] = await db.select().from(comicBubbles).where(and(eq(comicBubbles.ownerId, ownerId), eq(comicBubbles.id, bubbleId))).limit(1);

  return bubble ? toComicBubble(bubble) : null;
}

export async function createComicPageRow(input: {
  metadata: ComicMetadata;
  ownerId: string;
  projectId: string;
  title: string;
}): Promise<ComicPageDetail> {
  const pageNumber = await nextPageNumber(input.ownerId, input.projectId);
  const [page] = await db
    .insert(comicPages)
    .values({
      metadata: input.metadata,
      ownerId: input.ownerId,
      pageNumber,
      projectId: input.projectId,
      status: "active",
      title: input.title
    })
    .returning();

  const detail = await comicPageDetail(toComicPage(page));
  await recordComicLayoutVersionRow(detail, "page_created");

  return detail;
}

export async function updateComicPageRow(input: {
  metadata?: ComicMetadata;
  ownerId: string;
  pageId: string;
  title?: string;
}): Promise<ComicPageDetail> {
  const [page] = await db
    .update(comicPages)
    .set({
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(comicPages.ownerId, input.ownerId), eq(comicPages.id, input.pageId), isNull(comicPages.deletedAt), ne(comicPages.status, "deleted")))
    .returning();

  if (!page) {
    throw new Error("Comic page not found");
  }

  const detail = await comicPageDetail(toComicPage(page));
  await recordComicLayoutVersionRow(detail, "page_updated");

  return detail;
}

export async function createComicPanelRow(input: {
  assetId: string | null;
  height: number;
  metadata: ComicMetadata;
  orderIndex: number;
  ownerId: string;
  pageId: string;
  projectId: string;
  width: number;
  x: number;
  y: number;
}): Promise<ComicPageDetail> {
  await db.insert(comicPanels).values(input);
  const detail = await requiredComicPageDetail(input.ownerId, input.pageId);
  await recordComicLayoutVersionRow(detail, "panel_updated");

  return detail;
}

export async function updateComicPanelRow(input: {
  assetId?: string | null;
  height?: number;
  metadata?: ComicMetadata;
  orderIndex?: number;
  ownerId: string;
  panelId: string;
  width?: number;
  x?: number;
  y?: number;
}): Promise<ComicPageDetail> {
  const [panel] = await db
    .update(comicPanels)
    .set({
      ...(input.assetId !== undefined ? { assetId: input.assetId } : {}),
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.width !== undefined ? { width: input.width } : {}),
      ...(input.x !== undefined ? { x: input.x } : {}),
      ...(input.y !== undefined ? { y: input.y } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(comicPanels.ownerId, input.ownerId), eq(comicPanels.id, input.panelId)))
    .returning();

  if (!panel) {
    throw new Error("Comic panel not found");
  }

  const detail = await requiredComicPageDetail(input.ownerId, panel.pageId);
  await recordComicLayoutVersionRow(detail, "panel_updated");

  return detail;
}

export async function createComicBubbleRow(input: {
  height: number;
  metadata: ComicMetadata;
  orderIndex: number;
  ownerId: string;
  pageId: string;
  panelId: string | null;
  projectId: string;
  text: string;
  width: number;
  x: number;
  y: number;
}): Promise<ComicPageDetail> {
  await db.insert(comicBubbles).values(input);
  const detail = await requiredComicPageDetail(input.ownerId, input.pageId);
  await recordComicLayoutVersionRow(detail, "bubble_updated");

  return detail;
}

export async function updateComicBubbleRow(input: {
  bubbleId: string;
  height?: number;
  metadata?: ComicMetadata;
  orderIndex?: number;
  ownerId: string;
  panelId?: string | null;
  text?: string;
  width?: number;
  x?: number;
  y?: number;
}): Promise<ComicPageDetail> {
  const [bubble] = await db
    .update(comicBubbles)
    .set({
      ...(input.height !== undefined ? { height: input.height } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      ...(input.orderIndex !== undefined ? { orderIndex: input.orderIndex } : {}),
      ...(input.panelId !== undefined ? { panelId: input.panelId } : {}),
      ...(input.text !== undefined ? { text: input.text } : {}),
      ...(input.width !== undefined ? { width: input.width } : {}),
      ...(input.x !== undefined ? { x: input.x } : {}),
      ...(input.y !== undefined ? { y: input.y } : {}),
      updatedAt: new Date()
    })
    .where(and(eq(comicBubbles.ownerId, input.ownerId), eq(comicBubbles.id, input.bubbleId)))
    .returning();

  if (!bubble) {
    throw new Error("Comic bubble not found");
  }

  const detail = await requiredComicPageDetail(input.ownerId, bubble.pageId);
  await recordComicLayoutVersionRow(detail, "bubble_updated");

  return detail;
}

export async function listComicLayoutVersionRows(ownerId: string, pageId: string): Promise<ComicLayoutVersion[]> {
  const page = await findComicPageRow(ownerId, pageId);

  if (!page) {
    throw new Error("Comic page not found");
  }

  const rows = await db
    .select()
    .from(comicLayoutVersions)
    .where(eq(comicLayoutVersions.pageId, pageId))
    .orderBy(desc(comicLayoutVersions.createdAt));

  return rows.map(toComicLayoutVersion);
}

async function nextPageNumber(ownerId: string, projectId: string): Promise<number> {
  const pages = await listComicPageRows(ownerId, projectId);
  const maxPageNumber = Math.max(0, ...pages.map((page) => page.pageNumber));

  return maxPageNumber + 1;
}

async function requiredComicPageDetail(ownerId: string, pageId: string): Promise<ComicPageDetail> {
  const detail = await findComicPageDetailRow(ownerId, pageId);

  if (!detail) {
    throw new Error("Comic page not found");
  }

  return detail;
}

async function comicPageDetail(page: ComicPage): Promise<ComicPageDetail> {
  const [panels, bubbles] = await Promise.all([panelRowsForPage(page.id), bubbleRowsForPage(page.id)]);

  return {
    ...page,
    bubbles,
    panels
  };
}

async function panelRowsForPage(pageId: string): Promise<ComicPanel[]> {
  const rows = await db.select().from(comicPanels).where(eq(comicPanels.pageId, pageId)).orderBy(asc(comicPanels.orderIndex), asc(comicPanels.createdAt));

  return rows.map(toComicPanel);
}

async function bubbleRowsForPage(pageId: string): Promise<ComicBubble[]> {
  const rows = await db.select().from(comicBubbles).where(eq(comicBubbles.pageId, pageId)).orderBy(asc(comicBubbles.orderIndex), asc(comicBubbles.createdAt));

  return rows.map(toComicBubble);
}

async function recordComicLayoutVersionRow(detail: ComicPageDetail, action: ComicLayoutVersionAction): Promise<void> {
  if (!shouldCreateComicLayoutVersion(action)) {
    return;
  }

  await db.insert(comicLayoutVersions).values({
    action,
    pageId: detail.id,
    snapshot: {
      bubbles: detail.bubbles,
      page: {
        createdAt: detail.createdAt.toISOString(),
        deletedAt: detail.deletedAt?.toISOString() ?? null,
        id: detail.id,
        metadata: detail.metadata,
        ownerId: detail.ownerId,
        pageNumber: detail.pageNumber,
        projectId: detail.projectId,
        status: detail.status,
        title: detail.title,
        updatedAt: detail.updatedAt.toISOString()
      },
      panels: detail.panels
    }
  });
}
