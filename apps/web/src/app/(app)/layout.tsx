import type { ReactNode } from "react";

import { AppSidebar } from "../../components/app-sidebar";
import { TopNav } from "../../components/top-nav";

export default function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNav />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AppSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
