import * as React from "react";

import { cn } from "../lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex items-center rounded-md border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200", className)}
      {...props}
    />
  );
}
