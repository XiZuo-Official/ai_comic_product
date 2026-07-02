export type ComicPageStatus = "active" | "archived" | "deleted";

export type ComicMetadata = Record<string, unknown>;

export type ComicLayoutBox = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export type ComicPage = {
  createdAt: Date;
  deletedAt: Date | null;
  id: string;
  metadata: ComicMetadata;
  ownerId: string;
  pageNumber: number;
  projectId: string;
  status: ComicPageStatus;
  title: string;
  updatedAt: Date;
};

export type ComicPanel = ComicLayoutBox & {
  assetId: string | null;
  createdAt: Date;
  id: string;
  metadata: ComicMetadata;
  orderIndex: number;
  ownerId: string;
  pageId: string;
  projectId: string;
  updatedAt: Date;
};

export type ComicBubble = ComicLayoutBox & {
  createdAt: Date;
  id: string;
  metadata: ComicMetadata;
  orderIndex: number;
  ownerId: string;
  pageId: string;
  panelId: string | null;
  projectId: string;
  text: string;
  updatedAt: Date;
};

export type ComicPageDetail = ComicPage & {
  bubbles: ComicBubble[];
  panels: ComicPanel[];
};

export type ComicLayoutVersionAction = "page_created" | "page_updated" | "panel_updated" | "bubble_updated";

export type ComicLayoutSnapshot = {
  bubbles: ComicBubble[];
  page: ComicPage;
  panels: ComicPanel[];
};

export type ComicLayoutVersion = {
  action: ComicLayoutVersionAction;
  createdAt: Date;
  id: string;
  pageId: string;
  snapshot: ComicLayoutSnapshot;
};

export type CreateComicPageInput = {
  metadata?: ComicMetadata;
  projectId: string;
  title?: string | null;
};

export type UpdateComicPageInput = {
  metadata?: ComicMetadata;
  title?: string | null;
};

export type CreateComicPanelInput = ComicLayoutBox & {
  assetId?: string | null;
  metadata?: ComicMetadata;
  orderIndex?: number;
  pageId: string;
};

export type UpdateComicPanelInput = Partial<ComicLayoutBox> & {
  assetId?: string | null;
  metadata?: ComicMetadata;
  orderIndex?: number;
};

export type CreateComicBubbleInput = ComicLayoutBox & {
  metadata?: ComicMetadata;
  orderIndex?: number;
  pageId: string;
  panelId?: string | null;
  text: string;
};

export type UpdateComicBubbleInput = Partial<ComicLayoutBox> & {
  metadata?: ComicMetadata;
  orderIndex?: number;
  panelId?: string | null;
  text?: string;
};
