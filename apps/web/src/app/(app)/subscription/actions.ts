"use server";

import { startSubscriptionCheckout } from "@ai-comic/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function startCheckoutAction(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const planCode = String(formData.get("planCode") ?? "");
  const checkout = await startSubscriptionCheckout(userId, { planCode });

  redirect(checkout.checkoutUrl);
}
