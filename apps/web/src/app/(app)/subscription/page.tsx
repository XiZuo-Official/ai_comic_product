import { getSubscriptionOverview } from "@ai-comic/billing";
import { Badge } from "@ai-comic/ui/components/badge";
import { Button } from "@ai-comic/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ai-comic/ui/components/card";
import { auth } from "@clerk/nextjs/server";

import { EmptyState } from "../../../components/empty-state";
import { startCheckoutAction } from "./actions";

function formatPrice(monthlyPriceCents: number, currency: string): string {
  if (monthlyPriceCents === 0) {
    return "Provider pending";
  }

  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency"
  }).format(monthlyPriceCents / 100);
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

export default async function SubscriptionPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [overview, params] = await Promise.all([
    getSubscriptionOverview(userId),
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>)
  ]);
  const checkoutStarted = params.checkout === "started";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          View your MVP plan status and start the provider-agnostic checkout flow.
        </p>
      </div>

      {checkoutStarted ? (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle>Checkout Started</CardTitle>
            <CardDescription>
              The MVP placeholder checkout returned successfully. A real payment provider can replace this adapter later.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Subscription state is owned by the Billing module.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge>{statusLabel(overview.status)}</Badge>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {overview.plan ? `${overview.plan.name} grants ${overview.plan.creditGrantAmount} credits per billing event.` : "No active subscription yet."}
            </p>
            {overview.subscription?.lastPaymentFailureReason ? (
              <p className="mt-2 text-sm text-red-600">Payment issue: {overview.subscription.lastPaymentFailureReason}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {overview.plans.length === 0 ? (
        <EmptyState description="No active subscription plans are configured." title="No Plans Available" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {overview.plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <Badge>{plan.billingPeriod}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div>
                  <p className="text-3xl font-semibold tracking-tight">{formatPrice(plan.monthlyPriceCents, plan.currency)}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{plan.creditGrantAmount} credits per subscription event</p>
                </div>
                <form action={startCheckoutAction}>
                  <input name="planCode" type="hidden" value={plan.code} />
                  <Button className="w-full" type="submit">
                    Start Checkout
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
