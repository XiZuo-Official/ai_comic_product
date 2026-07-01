import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { ThemeToggle } from "./theme-toggle";

const displayCreditBalance = 120;

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link className="font-semibold tracking-tight" href="/">
          ai_comic_product
        </Link>
        <div className="flex items-center gap-3">
          <Link className="hidden text-sm text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white sm:inline" href="/subscription">
            Subscription
          </Link>
          <div className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium dark:border-slate-800">
            {displayCreditBalance} Credits
          </div>
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
