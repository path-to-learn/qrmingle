import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { IAP, PREMIUM_PRODUCT_ID, IAPProduct } from "@/lib/iap";
import { Crown, Check, Sparkles, BarChart2, QrCode, Users, Zap, RotateCcw } from "lucide-react";

import { Capacitor } from "@capacitor/core";
const isNativeApp = Capacitor.isNativePlatform();

const FREE_FEATURES = [
  "2 digital profiles",
  "Basic QR code style",
  "Total scan count",
  "FIFA fan cards (always free)",
  "2 AI card assists (promo)",
  "All social link types",
  "Shareable public profile page",
];

const PREMIUM_FEATURES = [
  { text: "Up to 5 profiles", icon: Users },
  { text: "All premium QR styles (bordered, gradient, rounded, shadow)", icon: QrCode },
  { text: "Full analytics — charts, device & country breakdown", icon: BarChart2 },
  { text: "Unlimited AI card builder assists", icon: Sparkles },
  { text: "Priority support", icon: Zap },
];

export default function Premium() {
  const [, navigate] = useLocation();
  const { user, isEffectivelyPremium, refetchUser } = useAuth();
  const { toast } = useToast();
  const isPremium = isEffectivelyPremium();
  const [product, setProduct] = useState<IAPProduct | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!isNativeApp) return;
    IAP.getProducts({ productIds: [PREMIUM_PRODUCT_ID] })
      .then(({ products }) => { if (products[0]) setProduct(products[0]); })
      .catch(() => {});
  }, []);

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const result = await IAP.purchase({ productId: PREMIUM_PRODUCT_ID });
      await apiRequest("POST", "/api/iap/verify", { jwsRepresentation: result.jwsRepresentation });
      await refetchUser();
      toast({ title: "Welcome to Premium!", description: "All features are now unlocked." });
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
        toast({ title: "Nothing to restore", description: "No previous purchases found." });
        return;
      }
      const res = await apiRequest("POST", "/api/iap/restore", { transactions });
      const data = await res.json();
      if (data.restored) {
        await refetchUser();
        toast({ title: "Purchase restored!", description: "Premium is active again." });
        navigate("/profiles");
      } else {
        toast({ title: "Nothing to restore", description: "No Premium purchase found." });
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
        <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "20px", padding: "32px 24px", textAlign: "center", color: "white", marginBottom: "24px" }}>
          <Crown size={40} style={{ margin: "0 auto 12px" }} />
          <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>You're on Premium</div>
          <div style={{ fontSize: "14px", opacity: 0.85 }}>All features are unlocked. Enjoy!</div>
        </div>
        <button
          onClick={() => navigate("/profiles")}
          style={{ width: "100%", padding: "14px", background: "#6366f1", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
        >
          Go to My Cards
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 16px", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "20px", padding: "28px 24px", textAlign: "center", color: "white", marginBottom: "20px" }}>
        <Crown size={36} style={{ margin: "0 auto 10px" }} />
        <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>QrMingle Premium</div>
        <div style={{ fontSize: "14px", opacity: 0.85 }}>More profiles, full analytics, unlimited AI</div>
        <div style={{ marginTop: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "10px", padding: "12px 24px", display: "inline-block" }}>
            <div style={{ fontSize: "28px", fontWeight: 800 }}>{product?.displayPrice ?? "$4.99"}</div>
            <div style={{ fontSize: "12px", opacity: 0.85 }}>one-time purchase · yours forever</div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#64748b", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FREE_FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <Check size={13} style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#475569", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#faf5ff", border: "2px solid #6366f1", borderRadius: "14px", padding: "16px", position: "relative" }}>
          <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#6366f1", color: "white", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", whiteSpace: "nowrap" }}>
            PREMIUM
          </div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#6366f1", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", color: "#7c3aed", fontStyle: "italic", marginBottom: "2px" }}>Everything in Free, plus:</div>
            {PREMIUM_FEATURES.map(({ text, icon: Icon }) => (
              <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                <Icon size={13} style={{ color: "#6366f1", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#3730a3", lineHeight: 1.4, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {isNativeApp ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            style={{ width: "100%", padding: "16px", background: purchasing ? "#a5b4fc" : "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", border: "none", borderRadius: "14px", fontSize: "16px", fontWeight: 700, cursor: purchasing ? "not-allowed" : "pointer", WebkitTapHighlightColor: "transparent" }}
          >
            {purchasing ? "Processing…" : `Get Premium · ${product?.displayPrice ?? "$4.99"}`}
          </button>
          <button
            onClick={handleRestore}
            disabled={restoring}
            style={{ width: "100%", padding: "12px", background: "transparent", color: "#6366f1", border: "1.5px solid #6366f1", borderRadius: "12px", fontSize: "14px", fontWeight: 600, cursor: restoring ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", WebkitTapHighlightColor: "transparent" }}
          >
            <RotateCcw size={14} />
            {restoring ? "Restoring…" : "Restore Purchase"}
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", margin: 0 }}>
            Payment processed securely by Apple
          </p>
        </div>
      ) : (
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>Available on iOS</div>
          <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
            Open QrMingle on your iPhone to upgrade to Premium.
          </div>
          <button
            onClick={() => navigate("/profiles")}
            style={{ width: "100%", padding: "13px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            Back to My Cards
          </button>
        </div>
      )}
    </div>
  );
}
