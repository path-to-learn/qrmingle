import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@shared/schema";
import ProfileCard, { getCardAccent } from "@/components/profile/ProfileCard";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { celebrateCreation } from "@/lib/confetti";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CardsPage() {
  const { user, isEffectivelyPremium } = useAuth();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);

  const { data: profiles = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/profiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/profiles?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    },
    enabled: !!user,
  });

  const createProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/profiles", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.type === "PROFILE_LIMIT_REACHED") throw new Error(result.message, { cause: "PROFILE_LIMIT_REACHED" });
        throw new Error(result.message || "Failed to create profile");
      }
      return result;
    },
    onSuccess: () => {
      celebrateCreation();
      refetch();
      setShowEditor(false);
      toast({ title: "Profile created!" });
    },
    onError: (e: any) => {
      if (e.cause === "PROFILE_LIMIT_REACHED") { setShowEditor(false); setShowUpgradeDialog(true); return; }
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) =>
      apiRequest("PUT", `/api/profiles/${id}`, data),
    onSuccess: () => {
      refetch();
      setShowEditor(false);
      setEditingProfileId(null);
      toast({ title: "Profile updated!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      refetch();
      setProfileToDelete(null);
      setCurrentIndex(prev => Math.max(0, prev - 1));
      toast({ title: "Profile deleted" });
    },
  });

  // Sync accent color to CSS variable so BottomTabBar + other UI match the active card
  useEffect(() => {
    const current = profiles[currentIndex];
    const accent = current ? getCardAccent(current.name, current.cardColor) : "#6366f1";
    document.documentElement.style.setProperty("--app-accent", accent);
  }, [profiles, currentIndex]);

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

  const openNewCard = () => { setEditingProfileId(null); setShowEditor(true); };

  return (
    <>
      {/* ── DESKTOP layout ─────────────────────────────────────────── */}
      <div className="desktop-cards-layout" style={{ display: "none", padding: "8px 0 24px" }}>
        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: 0 }}>My Cards</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>
              {isLoading ? "Loading…" : `${profiles.length} of 3 profiles`}
            </p>
          </div>
          {!isLoading && profiles.length < 3 && (
            <button
              onClick={openNewCard}
              style={{
                background: accent, color: "white", border: "none",
                borderRadius: "12px", padding: "10px 20px",
                fontSize: "14px", fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <PlusIcon size={16} /> New Card
            </button>
          )}
        </div>

        {/* Cards grid */}
        {isLoading ? (
          <div style={{ color: "#64748b", padding: "40px 0" }}>Loading…</div>
        ) : profiles.length === 0 ? (
          <div
            onClick={openNewCard}
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
              <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>Create Your First Card</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>Click to get started</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "flex-start" }}>
            {profiles.map((profile: any) => (
              <div key={profile.id} style={{ width: "380px", flexShrink: 0 }}>
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
        className="mobile-cards-layout"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ padding: "0 16px 16px" }}
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
        ) : profiles.length === 0 ? (
          <div
            onClick={openNewCard}
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
              <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>Create Your First Card</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>Tap to get started</div>
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

        {/* Navigation */}
        {profiles.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button onClick={goPrev} disabled={currentIndex === 0} style={{
                background: currentIndex === 0 ? "#e2e8f0" : accent,
                border: "none", borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: currentIndex === 0 ? "default" : "pointer", color: "white",
              }}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
                {currentIndex + 1} of {profiles.length}
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
            <button onClick={openNewCard} style={{
              background: accent, border: "none", borderRadius: "99px",
              padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px",
              cursor: "pointer", color: "white", fontWeight: 600, fontSize: "13px",
            }}>
              <PlusIcon size={16} /> New Card
            </button>
          </div>
        )}
      </div>

      {/* Profile Editor */}
      {showEditor && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: "white", overflowY: "auto", overflowX: "hidden", paddingBottom: "80px" }}>
          <ProfileEditor
            profileData={editingProfile}
            onSubmit={(data) => {
              if (editingProfileId) updateProfile.mutate({ id: editingProfileId, data });
              else createProfile.mutate(data);
            }}
            onCancel={() => { setShowEditor(false); setEditingProfileId(null); }}
            isEditing={!!editingProfileId}
            isPremium={isEffectivelyPremium()}
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
            <AlertDialogDescription>You have reached the limit of 3 profiles.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Got It</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
