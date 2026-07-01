import type { ReactNode } from "react";

import { ProjectSidebar } from "../../../../components/project-sidebar";

export default async function ProjectLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}>) {
  const { projectId } = await params;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row">
      <ProjectSidebar projectId={projectId} />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
