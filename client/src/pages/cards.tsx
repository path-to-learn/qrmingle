import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_BASE, capacitorHeaders } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@shared/schema";
import { FREE_PROFILE_LIMIT, PREMIUM_PURCHASES_ENABLED } from "@shared/premium";
import ProfileCard, { getCardAccent } from "@/components/profile/ProfileCard";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { celebrateCreation } from "@/lib/confetti";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { scheduleHorizontalReset } from "@/lib/viewport";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PENDING_CREATED_PROFILE_ID_KEY = "cardsPendingCreatedProfileId";

export default function CardsPage() {
  const { user, isEffectivelyPremium } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = sessionStorage.getItem("cardsCurrentIndex");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [pendingCreatedProfileId, setPendingCreatedProfileId] = useState<number | null>(() => {
    const saved = sessionStorage.getItem(PENDING_CREATED_PROFILE_ID_KEY);
    const parsed = saved ? parseInt(saved, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  });
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const { data: profiles = [], isLoading, error: profilesError } = useQuery<any[]>({
    queryKey: ['/api/profiles'],
    enabled: !!user,
  });

  const createProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch(API_BASE + "/api/profiles", {
        method: "POST",
        headers: capacitorHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...data, userId: user?.id }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.type === "PROFILE_LIMIT_REACHED") throw new Error(result.message, { cause: "PROFILE_LIMIT_REACHED" });
        throw new Error(result.message || "Failed to create profile");
      }
      return result;
    },
    onSuccess: (createdProfile: any) => {
      celebrateCreation();
      queryClient.setQueryData<any[]>(['/api/profiles'], (current = []) => {
        if (!createdProfile?.id || current.some((profile: any) => profile.id === createdProfile.id)) {
          return current;
        }
        return [...current, createdProfile];
      });
      if (createdProfile?.id) {
        setPendingCreatedProfileId(createdProfile.id);
        setCurrentIndex((profiles.length || 0));
        sessionStorage.setItem("cardsCurrentIndex", String(profiles.length || 0));
      }
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      setShowEditor(false);
      scheduleHorizontalReset();
      toast({ title: "Profile created!" });
    },
    onError: (e: any) => {
      if (e.cause === "PROFILE_LIMIT_REACHED") { setShowEditor(false); setShowUpgradeDialog(true); return; }
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) => {
      const res = await apiRequest("PUT", `/api/profiles/${id}`, data);
      return res.json() as Promise<any>;
    },
    onSuccess: (updated: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      if (updated?.slug) {
        queryClient.invalidateQueries({ queryKey: [`/api/p/${updated.slug}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/p/${updated.slug}?preview=1`] });
      }
      setShowEditor(false);
      setEditingProfileId(null);
      scheduleHorizontalReset();
      toast({ title: "Profile updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      setProfileToDelete(null);
      setCurrentIndex(prev => Math.max(0, prev - 1));
      toast({ title: "Profile deleted" });
    },
  });

  // Persist currentIndex so returning from preview restores the right card
  useEffect(() => {
    sessionStorage.setItem("cardsCurrentIndex", String(currentIndex));
  }, [currentIndex]);

  // Clamp saved index once profiles are loaded (handles deleted cards)
  useEffect(() => {
    if (profiles.length > 0) {
      setCurrentIndex(i => Math.min(i, profiles.length - 1));
    }
  }, [profiles.length]);

  useEffect(() => {
    if (!pendingCreatedProfileId) return;
    const createdIndex = profiles.findIndex((profile: any) => profile.id === pendingCreatedProfileId);
    if (createdIndex === -1) return;
    setCurrentIndex(createdIndex);
    sessionStorage.setItem("cardsCurrentIndex", String(createdIndex));
    sessionStorage.removeItem(PENDING_CREATED_PROFILE_ID_KEY);
    setPendingCreatedProfileId(null);
  }, [pendingCreatedProfileId, profiles]);

  // Sync accent color to CSS variable so BottomTabBar + other UI match the active card
  useEffect(() => {
    const current = profiles[currentIndex];
    const accent = current ? getCardAccent(current.name, current.cardColor) : "#6366f1";
    document.documentElement.style.setProperty("--app-accent", accent);
  }, [profiles, currentIndex]);

  // iOS WKWebView can keep a horizontal visual viewport offset after fixed
  // overlays interact with the keyboard. Lock the page while the editor is open.
  useEffect(() => {
    if (!showEditor) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevHtmlWidth = html.style.width;
    const prevBodyOverflowX = body.style.overflowX;
    const prevBodyWidth = body.style.width;
    const prevBodyTouchAction = body.style.touchAction;

    html.style.overflowX = "hidden";
    html.style.width = "100%";
    body.style.overflowX = "hidden";
    body.style.width = "100%";
    body.style.touchAction = "pan-y";

    return () => {
      scheduleHorizontalReset();
      html.style.overflowX = prevHtmlOverflowX;
      html.style.width = prevHtmlWidth;
      body.style.overflowX = prevBodyOverflowX;
      body.style.width = prevBodyWidth;
      body.style.touchAction = prevBodyTouchAction;
    };
  }, [showEditor]);

  const goNext = () => { if (currentIndex < profiles.length - 1) setCurrentIndex(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 80) goNext();
    else if (diff < -80) goPrev();
  };

  const editingProfile = editingProfileId ? profiles.find((p: any) => p.id === editingProfileId) : undefined;

  if (!user) return null;

  const accent = profiles[currentIndex]
    ? getCardAccent(profiles[currentIndex].name, profiles[currentIndex].cardColor)
    : "#6366f1";

  const isPremium = isEffectivelyPremium();
  const canCreateCard = isPremium || profiles.length < FREE_PROFILE_LIMIT;
  const profileUsageText = isPremium
    ? `${profiles.length} card profile${profiles.length === 1 ? "" : "s"}`
    : `${profiles.length} of ${FREE_PROFILE_LIMIT} free card profiles`;

  const openNewCard = () => { setEditingProfileId(null); setShowEditor(true); };
  const handleNewCard = () => {
    if (!canCreateCard) {
      setShowUpgradeDialog(true);
      return;
    }
    openNewCard();
  };

  return (
    <>
      {/* ── DESKTOP layout ─────────────────────────────────────────── */}
      <div className="desktop-cards-layout" style={{ display: "none", padding: "8px 0 24px" }}>
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: 0 }}>{t('cards.title')}</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              {isLoading ? t('cards.loading') : profileUsageText}
            </p>
          </div>
          {!isLoading && (
            <button
              onClick={handleNewCard}
              style={{
                background: canCreateCard ? accent : "#0f172a", color: "white", border: "none",
                borderRadius: "12px", padding: "10px 20px",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <PlusIcon size={16} /> {canCreateCard ? t('cards.newCard') : "Upgrade"}
            </button>
          )}
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>Loading…</div>
        ) : profiles.length === 0 ? (
          <div
            onClick={handleNewCard}
            style={{
              width: "380px", background: "linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "20px", minHeight: "280px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "16px", cursor: "pointer",
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlusIcon size={36} color="white" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>{t('cards.createFirst')}</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>{t('cards.clickToStart')}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px" }}>
            {profiles.map((profile: any) => (
              <div key={profile.id} style={{ width: "380px", flexShrink: 0, display: "flex" }}>
                <ProfileCard
                  {...profile}
                  onEdit={(id: number) => { setEditingProfileId(id); setShowEditor(true); }}
                  onDelete={(id: number) => setProfileToDelete(id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE layout ──────────────────────────────────────────── */}
      <div
        data-horizontal-lock
        className="mobile-cards-layout"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100%",
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
          touchAction: "pan-y",
        }}
      >
        {/* Dot indicators */}
        {profiles.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "8px 0 4px" }}>
            {profiles.map((_: any, i: number) => (
              <div key={i} onClick={() => setCurrentIndex(i)} style={{
                height: "4px", borderRadius: "99px", cursor: "pointer",
                width: i === currentIndex ? "24px" : "8px",
                background: i === currentIndex ? accent : "#cbd5e1",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        )}

        {/* Profile card */}
        {isLoading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading...</div>
        ) : profilesError ? (
          <div style={{ padding: "24px", background: "#fef2f2", borderRadius: "12px", color: "#dc2626", fontSize: "13px" }}>
            Failed to load profiles: {(profilesError as Error).message}
          </div>
        ) : profiles.length === 0 ? (
          <div
            onClick={handleNewCard}
            style={{
              background: "linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "20px", minHeight: "280px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "16px", cursor: "pointer",
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
            }}
          >
            <div style={{ width: "72px", height: "72px", borderRadius: "20px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PlusIcon size={36} color="white" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>{t('cards.createFirst')}</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>{t('cards.tapToStart')}</div>
            </div>
          </div>
        ) : (
          <ProfileCard
            key={profiles[currentIndex]?.id}
            {...profiles[currentIndex]}
            onEdit={(id: number) => { setEditingProfileId(id); setShowEditor(true); }}
            onDelete={(id: number) => setProfileToDelete(id)}
          />
        )}

        {/* Navigation — marginTop:auto pushes it to the bottom of the flex column */}
        {profiles.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "8px 4px 16px", marginTop: "auto", width: "100%", minWidth: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flexShrink: 0 }}>
              <button onClick={goPrev} disabled={currentIndex === 0} style={{
                background: currentIndex === 0 ? "#e2e8f0" : accent,
                border: "none", borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === 0 ? "default" : "pointer", color: "white",
              }}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                {currentIndex + 1} {t('cards.of')} {profiles.length}
              </span>
              <button onClick={goNext} disabled={currentIndex >= profiles.length - 1} style={{
                background: currentIndex >= profiles.length - 1 ? "#e2e8f0" : accent,
                border: "none", borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex >= profiles.length - 1 ? "default" : "pointer", color: "white",
              }}>
                <ChevronRight size={20} />
              </button>
            </div>
            <button onClick={handleNewCard} style={{
              background: canCreateCard ? accent : "#0f172a", border: "none", borderRadius: "99px",
              padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px",
              minWidth: 0, maxWidth: "50%", overflow: "hidden",
              cursor: "pointer", color: "white", fontWeight: 600, fontSize: "13px",
            }}>
              <PlusIcon size={16} style={{ flexShrink: 0 }} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{canCreateCard ? t('cards.newCard') : "Upgrade"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Editor — outer fixed div IS the scroll container (CLAUDE.md pattern) */}
      {showEditor && (
        <div data-horizontal-lock style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          overflowY: "auto", overflowX: "hidden",
          overscrollBehaviorX: "none",
          touchAction: "pan-y",
          WebkitOverflowScrolling: "touch",
          background: "white",
          paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}>
          <ProfileEditor
            profileData={editingProfile}
            onSubmit={(data) => {
              if (editingProfileId) updateProfile.mutate({ id: editingProfileId, data });
              else createProfile.mutate(data);
            }}
            onCancel={() => {
              setShowEditor(false);
              setEditingProfileId(null);
              scheduleHorizontalReset();
            }}
            isEditing={!!editingProfileId}
            isPremium={isPremium}
          />
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this profile?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => profileToDelete && deleteProfile.mutate(profileToDelete)} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Profile Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              {PREMIUM_PURCHASES_ENABLED
                ? `Free accounts include ${FREE_PROFILE_LIMIT} card profiles. Upgrade to QrMingle Pro for unlimited cards, unlimited AI profile-builder use, and analytics.`
                : `Free accounts include up to ${FREE_PROFILE_LIMIT} card profiles.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{PREMIUM_PURCHASES_ENABLED ? "Not Now" : "Okay"}</AlertDialogCancel>
            {PREMIUM_PURCHASES_ENABLED && (
              <AlertDialogAction onClick={() => navigate("/premium")}>
                Upgrade
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
