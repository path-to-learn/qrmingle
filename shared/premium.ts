export const FREE_PROFILE_LIMIT: number = 2;
export const FREE_AI_ASSIST_LIMIT: number = 3;

export const PREMIUM_PRODUCT_IDS = {
  // com.qrmingle.app.pro.monthly / .yearly were permanently locked by Apple after being
  // created and deleted in App Store Connect before ever being sold — subscription product
  // IDs can't be reused once claimed, even after deletion. These replace them.
  monthly: "com.qrmingle.app.sub.monthly",
  yearly: "com.qrmingle.app.sub.yearly",
} as const;

export type PremiumPlanKey = keyof typeof PREMIUM_PRODUCT_IDS;

export const PREMIUM_PLAN_ORDER: PremiumPlanKey[] = ["yearly", "monthly"];

export const ACTIVE_PREMIUM_PRODUCT_IDS = [
  PREMIUM_PRODUCT_IDS.monthly,
  PREMIUM_PRODUCT_IDS.yearly,
] as const;

export const PREMIUM_PLANS: Record<PremiumPlanKey, {
  productId: string;
  label: string;
  fallbackPrice: string;
  cadence: string;
  badge?: string;
  note: string;
  kind: "subscription";
}> = {
  monthly: {
    productId: PREMIUM_PRODUCT_IDS.monthly,
    label: "Monthly",
    fallbackPrice: "$1.99",
    cadence: "per month",
    badge: "2 months free",
    note: "First 2 months free, then $1.99/month. Cancel anytime in Apple Account settings.",
    kind: "subscription",
  },
  yearly: {
    productId: PREMIUM_PRODUCT_IDS.yearly,
    label: "Yearly",
    fallbackPrice: "$12.00",
    cadence: "per year",
    badge: "Best value",
    note: "First 2 months free, then $12/year — save about 50% vs. monthly.",
    kind: "subscription",
  },
};

export function isPremiumProductId(productId: string): boolean {
  return (ACTIVE_PREMIUM_PRODUCT_IDS as readonly string[]).includes(productId);
}
