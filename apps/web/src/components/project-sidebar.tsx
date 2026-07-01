import { Button } from "@ai-comic/ui/components/button";
import { Box, Download, Images, MessageSquareText, Paintbrush, UsersRound } from "lucide-react";
import Link from "next/link";

const projectNavItems = [
  { href: "idea-chat", icon: MessageSquareText, label: "Idea Chat" },
  { href: "characters", icon: UsersRound, label: "Characters" },
  { href: "asset-library", icon: Images, label: "Asset Library" },
  { href: "comic-studio", icon: Paintbrush, label: "Comic Studio" },
  { href: "export", icon: Download, label: "Export" }
];

type ProjectSidebarProps = {
  projectId: string;
};

export function ProjectSidebar({ projectId }: ProjectSidebarProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 lg:w-64">
      <Button asChild className="mb-2 w-full justify-start" variant="ghost">
        <Link href={`/projects/${projectId}`}>
          <Box className="h-4 w-4" />
          Project Overview
        </Link>
      </Button>
      <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {projectNavItems.map((item) => (
          <Button asChild className="justify-start" key={item.href} variant="ghost">
            <Link href={`/projects/${projectId}/${item.href}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
