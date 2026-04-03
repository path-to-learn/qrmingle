import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { PlusIcon, Pencil, Trash2, Share, UserPlus, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { saveToContacts } from "@/lib/vcard";
import { useToast } from "@/hooks/use-toast";
import { ProfileFormData } from "@shared/schema";
import ProfileEditor from "@/components/profile/ProfileEditor";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const bgGradients = [
  "linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(160deg, #0ea5e9 0%, #6366f1 100%)",
  "linear-gradient(160deg, #10b981 0%, #0ea5e9 100%)",
  "linear-gradient(160deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(160deg, #ec4899 0%, #8b5cf6 100%)",
];

function StoryCard({ profile, onEdit, onDelete, onSwipeLeft, onSwipeRight, index }: any) {
  const [showQR, setShowQR] = useState(false);
  // Reset QR when profile changes
  useState(() => { setShowQR(false); });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-5, 5]);
  const { toast } = useToast();
  const bg = bgGradients[index % bgGradients.length];
  const profileUrl = `${window.location.origin}/p/${profile.slug}`;

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) onSwipeRight();
    else if (info.offset.x < -100) onSwipeLeft();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: profile.displayName, url: profileUrl }); }
      catch (e) {}
    } else {
      navigator.clipboard?.writeText(profileUrl);
      toast({ title: "Link copied!" });
    }
  };

  const handleSave = async () => {
    try {
      await saveToContacts(profile);
      toast({ title: "Contact saved!", description: `${profile.displayName} added to contacts` });
    } catch (e) {
      toast({ title: "Error saving contact", variant: "destructive" });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, width: "100%", height: "100%", touchAction: "pan-y", overflow: "hidden", maxWidth: "100%" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.4}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        width: "100%", height: "100%",
        background: bg,
        borderRadius: "24px",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Top bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 16px 0",
        }}>
          <button onClick={() => onEdit(profile.id)} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "50%", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Pencil size={18} color="white" />
          </button>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px", fontWeight: 600 }}>
            {profile.name}
          </span>
          <button onClick={() => onDelete(profile.id)} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "50%", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Trash2 size={18} color="white" />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "12px 20px", gap: "10px",
          backgroundImage: profile.backgroundUrl ? `url(${profile.backgroundUrl})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
        }}>
          {/* Overlay if background image */}
          {profile.backgroundUrl && (
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.4)", borderRadius: "24px",
            }} />
          )}

          {/* Photo */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.displayName} style={{
                width: "130px", height: "130px", borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.8)",
                objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }} />
            ) : (
              <div style={{
                width: "130px", height: "130px", borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
                border: "4px solid rgba(255,255,255,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "52px", color: "white", fontWeight: 700 }}>
                  {profile.displayName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name + bio */}
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div style={{ color: "white", fontSize: "26px", fontWeight: 700 }}>
              {profile.displayName}
            </div>
            {profile.title && (
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", marginTop: "2px" }}>
                {profile.title}
              </div>
            )}
            {profile.bio && (
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", marginTop: "6px", maxWidth: "260px" }}>
                {profile.bio}
              </div>
            )}
          </div>

          {/* Social links - clickable */}
          {profile.socialLinks?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", position: "relative", zIndex: 1 }}>
              {profile.socialLinks.slice(0, 4).map((link: any, i: number) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                  background: "rgba(255,255,255,0.2)", borderRadius: "20px",
                  padding: "6px 14px", color: "white", fontSize: "13px", fontWeight: 500,
                  textDecoration: "none", cursor: "pointer",
                }}>
                  {link.platform}
                </a>
              ))}
            </div>
          )}

          {/* QR Button */}
          <button onClick={() => setShowQR(!showQR)} style={{
            background: "rgba(255,255,255,0.95)", border: "none",
            borderRadius: "14px", padding: "10px 20px",
            display: "flex", alignItems: "center", gap: "8px",
            fontWeight: 600, fontSize: "14px", color: "#374151", cursor: "pointer",
            position: "relative", zIndex: 1,
          }}>
            <QrCode size={18} />
            {showQR ? "Hide QR" : "Show QR Code"}
          </button>

          {/* QR Code */}
          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ background: "white", borderRadius: "16px", padding: "12px", position: "relative", zIndex: 1 }}
              >
                <QrCodeDisplay
                  value={profileUrl} size={140}
                  color={profile.qrColor || "#3B82F6"}
                  style={profile.qrStyle || "basic"}
                />
                <div style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                  {profile.scanCount || 0} scans
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div style={{ padding: "12px 16px 16px", display: "flex", gap: "10px" }}>
          <button onClick={handleSave} style={{
            flex: 1, padding: "14px",
            background: "rgba(255,255,255,0.95)", border: "none",
            borderRadius: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontWeight: 600, fontSize: "15px", color: "#374151",
          }}>
            <UserPlus size={18} /> Save Contact
          </button>
          <button onClick={handleShare} style={{
            flex: 1, padding: "14px",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.5)",
            borderRadius: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontWeight: 600, fontSize: "15px", color: "white",
          }}>
            <Share size={18} /> Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CardsPage() {
  const { user, isEffectivelyPremium } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);

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
      if (!response.ok) throw new Error(result.message || "Failed to create profile");
      return result;
    },
    onSuccess: () => { refetch(); setShowEditor(false); toast({ title: "Profile created!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) =>
      apiRequest("PUT", `/api/profiles/${id}`, data),
    onSuccess: () => { refetch(); setShowEditor(false); setEditingProfileId(null); toast({ title: "Profile updated!" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      refetch(); setProfileToDelete(null);
      if (currentIndex >= profiles.length - 1) setCurrentIndex(Math.max(0, profiles.length - 2));
      toast({ title: "Profile deleted" });
    },
  });

  const goNext = () => { if (currentIndex < profiles.length - 1) setCurrentIndex(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  const editingProfile = editingProfileId ? profiles.find((p: any) => p.id === editingProfileId) : undefined;

  if (!user) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0,
      width: "100vw", height: "100vh",
      background: "#f0f9ff", display: "flex", flexDirection: "column",
      paddingTop: "env(safe-area-inset-top)",
      paddingLeft: "env(safe-area-inset-left)",
      paddingRight: "env(safe-area-inset-right)",
      paddingBottom: "calc(env(safe-area-inset-bottom) + 60px)",
      overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Dot indicators */}
      {profiles.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "8px 0" }}>
          {profiles.map((_: any, i: number) => (
            <div key={i} onClick={() => setCurrentIndex(i)} style={{
              height: "4px", borderRadius: "99px", cursor: "pointer",
              width: i === currentIndex ? "24px" : "8px",
              background: i === currentIndex ? "#6366f1" : "#cbd5e1",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, padding: "4px 12px 0", minHeight: 0 }}>
        {isLoading ? (
          <div style={{
            height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#64748b",
          }}>Loading your cards...</div>
        ) : profiles.length === 0 ? (
          <div
            onClick={() => setShowEditor(true)}
            style={{
              height: "100%", background: "linear-gradient(160deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "24px", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "16px", cursor: "pointer",
            }}
          >
            <div style={{
              width: "72px", height: "72px", borderRadius: "20px",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <PlusIcon size={36} color="white" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>Create Your First Card</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginTop: "8px" }}>Tap to get started</div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <StoryCard
              key={currentIndex}
              profile={profiles[currentIndex]}
              index={currentIndex}
              onEdit={(id: number) => { setEditingProfileId(id); setShowEditor(true); }}
              onDelete={(id: number) => setProfileToDelete(id)}
              onSwipeLeft={goNext}
              onSwipeRight={goPrev}
            />
          </AnimatePresence>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "8px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button onClick={goPrev} disabled={currentIndex === 0} style={{
            background: currentIndex === 0 ? "#e2e8f0" : "#6366f1",
            border: "none", borderRadius: "50%", width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: currentIndex === 0 ? "default" : "pointer", color: "white",
          }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
            {profiles.length > 0 ? `${currentIndex + 1} of ${profiles.length}` : ""}
          </span>
          <button onClick={goNext} disabled={currentIndex === profiles.length - 1} style={{
            background: currentIndex === profiles.length - 1 ? "#e2e8f0" : "#6366f1",
            border: "none", borderRadius: "50%", width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: currentIndex === profiles.length - 1 ? "default" : "pointer", color: "white",
          }}>
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={() => { setEditingProfileId(null); setShowEditor(true); }} style={{
          background: "#6366f1", border: "none", borderRadius: "99px",
          padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px",
          cursor: "pointer", color: "white", fontWeight: 600, fontSize: "13px",
        }}>
          <PlusIcon size={16} /> New Card
        </button>
      </div>

      {/* Profile Editor */}
      {showEditor && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, overflowY: "auto", background: "white", WebkitOverflowScrolling: "touch" }}>
          <div style={{ padding: "16px", paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
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
            <AlertDialogAction
              onClick={() => profileToDelete && deleteProfile.mutate(profileToDelete)}
              className="bg-destructive text-destructive-foreground"
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
