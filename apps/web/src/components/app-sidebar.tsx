import { Button } from "@ai-comic/ui/components/button";
import { FolderKanban, Home, Image, Receipt, UserCircle } from "lucide-react";
import Link from "next/link";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/single-image-mode", icon: Image, label: "Single Image Mode" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/profile", icon: UserCircle, label: "User Profile" },
  { href: "/subscription", icon: Receipt, label: "Subscription" }
];

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 lg:block">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Button asChild className="justify-start" key={item.href} variant="ghost">
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    </aside>
  );
}
