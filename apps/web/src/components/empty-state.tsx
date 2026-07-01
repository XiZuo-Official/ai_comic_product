import { Card, CardContent } from "@ai-comic/ui/components/card";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center gap-4 p-8 text-center">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
