import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Capacitor } from "@capacitor/core";
import {
  BarChart2,
  Check,
  Crown,
  QrCode,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IAP, IAPProduct } from "@/lib/iap";
import { PREMIUM_PLANS, PREMIUM_PLAN_ORDER, PremiumPlanKey, FREE_PROFILE_LIMIT, FREE_AI_ASSIST_LIMIT } from "@shared/premium";

const isNativeApp = Capacitor.isNativePlatform();
const PLAN_PRODUCT_IDS = PREMIUM_PLAN_ORDER.map((planKey) => PREMIUM_PLANS[planKey].productId);

const FREE_FEATURES = [
  `${FREE_PROFILE_LIMIT} card profiles`,
  `${FREE_AI_ASSIST_LIMIT} AI profile-builder uses`,
  "Basic QR and card styles",
  "Total scan count",
  "Event theme cards",
  "Shareable public card links",
];

const PRO_FEATURES = [
  { text: "Unlimited card profiles", icon: Users },
  { text: "Unlimited AI profile-builder usage", icon: Sparkles },
  { text: "Analytics unlocked", icon: BarChart2 },
  { text: "Premium QR styles", icon: QrCode },
  { text: "Priority support", icon: Zap },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const { isEffectivelyPremium, refetchUser } = useAuth();
  const { toast } = useToast();
  const isPremium = isEffectivelyPremium();
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlanKey>("yearly");
  const [productsById, setProductsById] = useState<Record<string, IAPProduct>>({});
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!isNativeApp) return;
    IAP.getProducts({ productIds: PLAN_PRODUCT_IDS })
      .then(({ products }) => {
        const nextProducts: Record<string, IAPProduct> = {};
        products.forEach((product) => {
          nextProducts[product.id] = product;
        });
        setProductsById(nextProducts);
      })
      .catch(() => {});
  }, []);

  const selectedPlanDetails = PREMIUM_PLANS[selectedPlan];
  const selectedProduct = productsById[selectedPlanDetails.productId];
  const selectedPrice = selectedProduct?.displayPrice ?? selectedPlanDetails.fallbackPrice;

  const yearlyMonthlyEquivalent = useMemo(() => {
    const yearlyPrice = productsById[PREMIUM_PLANS.yearly.productId]?.displayPrice ?? PREMIUM_PLANS.yearly.fallbackPrice;
    return `${yearlyPrice} yearly`;
  }, [productsById]);

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await IAP.purchase({ productId: selectedPlanDetails.productId });
      await apiRequest("POST", "/api/iap/verify", { jwsRepresentation: result.jwsRepresentation });
      await refetchUser();
      toast({ title: "Welcome to QrMingle Pro!", description: "Your Premium features are now unlocked." });
      navigate("/profiles");
    } catch (err: any) {
      if (err?.message !== "CANCELLED" && err?.message !== "PENDING") {
        toast({ title: "Purchase failed", description: err?.message || "Please try again.", variant: "destructive" });
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const { transactions } = await IAP.restorePurchases();
      if (transactions.length === 0) {
        toast({ title: "Nothing to restore", description: "No previous Premium purchase was found." });
        return;
      }
      const res = await apiRequest("POST", "/api/iap/restore", { transactions });
      const data = await res.json();
      if (data.restored) {
        await refetchUser();
        toast({ title: "Purchase restored!", description: "Premium is active again." });
        navigate("/profiles");
      } else {
        toast({ title: "Nothing to restore", description: "No active Premium purchase was found." });
      }
    } catch {
      toast({ title: "Restore failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  if (isPremium) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px" }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #14b8a6)",
          borderRadius: "20px",
          padding: "32px 24px",
          textAlign: "center",
          color: "white",
          marginBottom: "24px",
        }}>
          <Crown size={40} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>You're on QrMingle Pro</div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Unlimited cards, AI builder, analytics, and premium QR styles are active.</div>
        </div>
        <button
          onClick={() => navigate("/profiles")}
          style={{ width: "100%", padding: "14px", background: "#6366f1", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
        >
          Go to My Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "520px", margin: "0 auto", padding: "20px 16px", paddingBottom: "40px", overflowX: "hidden" }}>
      <section style={{
        background: "linear-gradient(135deg, #4f46e5, #14b8a6)",
        borderRadius: "22px",
        padding: "26px 22px",
        color: "white",
        marginBottom: "18px",
        boxShadow: "0 18px 42px rgba(79,70,229,0.22)",
      }}>
        <Crown size={36} style={{ marginBottom: "12px" }} />
        <div style={{ fontSize: "24px", fontWeight: 850, lineHeight: 1.15, marginBottom: "8px" }}>QrMingle Pro</div>
        <div style={{ fontSize: "14px", opacity: 0.92, lineHeight: 1.5 }}>
          Build more cards, use AI freely, and see what happens after people scan.
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "16px" }}>
          <span style={{ background: "rgba(255,255,255,0.28)", borderRadius: "99px", padding: "7px 11px", fontSize: "12px", fontWeight: 800 }}>
            First 2 months free
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: "99px", padding: "7px 11px", fontSize: "12px", fontWeight: 700 }}>
            Starts at {PREMIUM_PLANS.monthly.fallbackPrice}
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", borderRadius: "99px", padding: "7px 11px", fontSize: "12px", fontWeight: 700 }}>
            {yearlyMonthlyEquivalent}
          </span>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "15px", minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", marginBottom: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Free</div>
          <div style={{ display: "grid", gap: "8px" }}>
            {FREE_FEATURES.map((feature) => (
              <div key={feature} style={{ display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: "7px", alignItems: "start" }}>
                <Check size={14} style={{ color: "#10b981", marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#475569", lineHeight: 1.35 }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#f8fafc", border: "2px solid #6366f1", borderRadius: "16px", padding: "15px", minWidth: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#4f46e5", marginBottom: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Pro</div>
          <div style={{ display: "grid", gap: "8px" }}>
            {PRO_FEATURES.map(({ text, icon: Icon }) => (
              <div key={text} style={{ display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: "7px", alignItems: "start" }}>
                <Icon size={14} style={{ color: "#6366f1", marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#312e81", lineHeight: 1.35, fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gap: "10px", marginBottom: "16px" }}>
        {PREMIUM_PLAN_ORDER.map((planKey) => {
          const plan = PREMIUM_PLANS[planKey];
          const product = productsById[plan.productId];
          const price = product?.displayPrice ?? plan.fallbackPrice;
          const isSelected = selectedPlan === planKey;

          return (
            <button
              key={plan.productId}
              type="button"
              onClick={() => setSelectedPlan(planKey)}
              style={{
                width: "100%",
                textAlign: "left",
                background: isSelected ? "#eef2ff" : "white",
                border: isSelected ? "2px solid #6366f1" : "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "12px",
                alignItems: "center",
                cursor: "pointer",
                boxSizing: "border-box",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "5px" }}>
                  <span style={{ color: "#0f172a", fontSize: "15px", fontWeight: 800 }}>{plan.label}</span>
                  {plan.badge && (
                    <span style={{ background: "#dcfce7", color: "#166534", borderRadius: "99px", padding: "3px 8px", fontSize: "10px", fontWeight: 800 }}>
                      {plan.badge}
                    </span>
                  )}
                </span>
                <span style={{ display: "block", color: "#64748b", fontSize: "12px", lineHeight: 1.4 }}>{plan.note}</span>
              </span>
              <span style={{ textAlign: "right", color: "#0f172a", flexShrink: 0 }}>
                <span style={{ display: "block", fontSize: "18px", fontWeight: 850 }}>{price}</span>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{plan.cadence}</span>
              </span>
            </button>
          );
        })}
      </section>

      {isNativeApp ? (
        <section style={{ display: "grid", gap: "10px" }}>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            style={{
              width: "100%",
              padding: "16px",
              background: purchasing ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #14b8a6)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: 800,
              cursor: purchasing ? "not-allowed" : "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {purchasing ? "Processing..." : `Continue with ${selectedPlanDetails.label} - ${selectedPrice}`}
          </button>
          <button
            onClick={handleRestore}
            disabled={restoring}
            style={{
              width: "100%",
              padding: "12px",
              background: "transparent",
              color: "#4f46e5",
              border: "1.5px solid #c7d2fe",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: restoring ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <RotateCcw size={14} />
            {restoring ? "Restoring..." : "Restore Purchase"}
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#64748b", margin: "2px 0 0", lineHeight: 1.45 }}>
            Monthly and yearly renew automatically until canceled in Apple Account settings. Payment is processed securely by Apple.
          </p>
        </section>
      ) : (
        <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px", textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "5px" }}>Available in the iPhone app</div>
          <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.45, marginBottom: "15px" }}>
            Open QrMingle on your iPhone to upgrade with App Store billing.
          </div>
          <button
            onClick={() => navigate("/profiles")}
            style={{ width: "100%", padding: "13px", background: "#0f172a", color: "white", border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}
          >
            Back to My Cards
          </button>
        </section>
      )}
    </div>
  );
}
