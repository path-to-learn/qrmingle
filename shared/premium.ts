export const FREE_PROFILE_LIMIT = 2;
export const FREE_AI_ASSIST_LIMIT = 1;

export const PREMIUM_PRODUCT_IDS = {
  monthly: "com.qrmingle.app.pro.monthly",
  yearly: "com.qrmingle.app.pro.yearly",
  lifetime: "com.qrmingle.app.pro.lifetime",
  legacyLifetime: "com.qrmingle.app.premium",
} as const;

export type PremiumPlanKey = keyof Pick<typeof PREMIUM_PRODUCT_IDS, "monthly" | "yearly" | "lifetime">;

export const PREMIUM_PLAN_ORDER: PremiumPlanKey[] = ["yearly", "monthly", "lifetime"];

export const ACTIVE_PREMIUM_PRODUCT_IDS = [
  PREMIUM_PRODUCT_IDS.monthly,
  PREMIUM_PRODUCT_IDS.yearly,
  PREMIUM_PRODUCT_IDS.lifetime,
  PREMIUM_PRODUCT_IDS.legacyLifetime,
] as const;

export const PREMIUM_PLANS: Record<PremiumPlanKey, {
  productId: string;
  label: string;
  fallbackPrice: string;
  cadence: string;
  badge?: string;
  note: string;
  kind: "subscription" | "lifetime";
}> = {
  monthly: {
    productId: PREMIUM_PRODUCT_IDS.monthly,
    label: "Monthly",
    fallbackPrice: "$2.99",
    cadence: "per month",
    note: "Flexible access. Cancel anytime in Apple Account settings.",
    kind: "subscription",
  },
  yearly: {
    productId: PREMIUM_PRODUCT_IDS.yearly,
    label: "Yearly",
    fallbackPrice: "$19.99",
    cadence: "per year",
    badge: "Best value",
    note: "Save more than 40% compared with monthly.",
    kind: "subscription",
  },
  lifetime: {
    productId: PREMIUM_PRODUCT_IDS.lifetime,
    label: "Lifetime",
    fallbackPrice: "$39.99",
    cadence: "one-time",
    badge: "Founder deal",
    note: "Pay once and keep Pro access for this Apple account.",
    kind: "lifetime",
  },
};

export function isPremiumProductId(productId: string): boolean {
  return (ACTIVE_PREMIUM_PRODUCT_IDS as readonly string[]).includes(productId);
}
