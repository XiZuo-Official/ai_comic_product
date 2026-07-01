import { getCreditBalance, listCreditLedger } from "@ai-comic/credits";
import { Badge } from "@ai-comic/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { auth } from "@clerk/nextjs/server";

import { EmptyState } from "../../../components/empty-state";

function formatDelta(amount: number): string {
  return amount > 0 ? `+${amount}` : String(amount);
}

export default async function CreditsPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [account, entries] = await Promise.all([getCreditBalance(userId), listCreditLedger(userId)]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Credits</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Review your balance and append-only credit history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
          <CardDescription>Credits will be reserved before paid AI actions in later milestones.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold tracking-tight">{account.balance}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Available credits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credit Ledger</CardTitle>
          <CardDescription>Ledger entries are append-only for auditability.</CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <EmptyState description="Credit activity will appear after reservations, releases, commits, or refunds." title="No credit activity yet" />
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {entries.map((entry) => (
                <div className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center" key={entry.id}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{entry.entryType}</Badge>
                      <p className="font-medium">{entry.description ?? "Credit operation"}</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {entry.createdAt.toLocaleString()} · Balance after: {entry.balanceAfter}
                    </p>
                  </div>
                  <p className={entry.amountDelta >= 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                    {formatDelta(entry.amountDelta)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
