import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { PlusIcon, Pencil, Trash2, Share, Download, UserPlus, Eye, QrCode, ChevronUp, ChevronDown } from "lucide-react";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { saveToContacts } from "@/lib/vcard";
import { useToast } from "@/hooks/use-toast";

interface FullScreenProfileViewProps {
  profiles: any[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onNewProfile: () => void;
}

function ProfileStoryCard({ profile, onEdit, onDelete, onSwipeLeft, onSwipeRight }: any) {
  const [showQR, setShowQR] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-6, 6]);
  const { toast } = useToast();

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) onSwipeRight();
      else onSwipeLeft();
    }
  };

  const bgGradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
    "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  ];

  const bgGradient = bgGradients[(profile.name?.charCodeAt(0) || 0) % bgGradients.length];
  const profileUrl = `${window.location.origin}/p/${profile.slug}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.displayName,
          text: `Check out ${profile.displayName}'s profile on QrMingle`,
          url: profileUrl,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
    }
  };

  const handleSaveContact = async () => {
    try {
      await saveToContacts(profile);
      toast({ title: "Contact saved!", description: `${profile.displayName} added to your contacts` });
    } catch (e) {
      toast({ title: "Error", description: "Could not save contact", variant: "destructive" });
    }
  };

  return (
    <motion.div
      style={{
        x, rotate,
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10,
        background: bgGradient,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
    >
      {/* Top actions */}
      <div style={{
        paddingTop: "calc(env(safe-area-inset-top) + 60px)",
        padding: "calc(env(safe-area-inset-top) + 60px) 16px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <button
          onClick={() => onEdit(profile.id)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none", borderRadius: "50%",
            width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Pencil size={18} color="white" />
        </button>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 600 }}>
          {profile.name}
        </div>
        <button
          onClick={() => onDelete(profile.id)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none", borderRadius: "50%",
            width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Trash2 size={18} color="white" />
        </button>
      </div>

      {/* Profile content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        gap: "16px",
      }}>
        {/* Photo */}
        {profile.photoUrl && (
          <div style={{
            width: "120px", height: "120px",
            borderRadius: "50%",
            border: "4px solid rgba(255,255,255,0.8)",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}>
            <img src={profile.photoUrl} alt={profile.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        {!profile.photoUrl && (
          <div style={{
            width: "120px", height: "120px", borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "4px solid rgba(255,255,255,0.8)",
          }}>
            <span style={{ fontSize: "48px", color: "white", fontWeight: 700 }}>
              {profile.displayName?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Name & title */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            {profile.displayName}
          </h2>
          {profile.title && (
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "16px", margin: "4px 0 0", fontWeight: 400 }}>
              {profile.title}
            </p>
          )}
        </div>

        {/* Social links */}
        {profile.socialLinks?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "300px" }}>
            {profile.socialLinks.map((link: any, i: number) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.2)",
                borderRadius: "20px",
                padding: "6px 14px",
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                {link.platform}
              </div>
            ))}
          </div>
        )}

        {/* QR Code toggle */}
        <button
          onClick={() => setShowQR(!showQR)}
          style={{
            background: "rgba(255,255,255,0.95)",
            border: "none",
            borderRadius: "16px",
            padding: "12px 24px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
            fontSize: "15px",
            color: "#374151",
          }}
        >
          <QrCode size={20} />
          {showQR ? "Hide QR" : "Show QR Code"}
        </button>

        {/* QR Code */}
        <AnimatePresence>
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <QrCodeDisplay
                value={profileUrl}
                size={180}
                color={profile.qrColor || "#3B82F6"}
                style={profile.qrStyle || "basic"}
              />
              <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", margin: "8px 0 0" }}>
                {profile.scanCount || 0} scans
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div style={{
        padding: "16px",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 80px)",
        display: "flex",
        gap: "10px",
      }}>
        <button onClick={handleSaveContact} style={{
          flex: 1, padding: "14px", background: "rgba(255,255,255,0.95)",
          border: "none", borderRadius: "14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontWeight: 600, fontSize: "14px", color: "#374151",
        }}>
          <UserPlus size={18} />
          Save Contact
        </button>
        <button onClick={handleShare} style={{
          flex: 1, padding: "14px", background: "rgba(255,255,255,0.2)",
          border: "2px solid rgba(255,255,255,0.5)", borderRadius: "14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          fontWeight: 600, fontSize: "14px", color: "white",
        }}>
          <Share size={18} />
          Share
        </button>
      </div>
    </motion.div>
  );
}

export default function FullScreenProfileView({ profiles, onEdit, onDelete, onNewProfile }: FullScreenProfileViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < profiles.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  if (profiles.length === 0) {
    return (
      <div
        onClick={onNewProfile}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "24px", padding: "32px", zIndex: 10,
        }}
      >
        <div style={{
          width: "80px", height: "80px", borderRadius: "24px",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PlusIcon size={40} color="white" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "24px", fontWeight: 700, margin: "0 0 8px" }}>Create Your First Card</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", margin: 0 }}>Tap anywhere to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dot indicators - shown above the full screen card */}
      <div style={{
        position: "fixed",
        top: "calc(env(safe-area-inset-top) + 16px)",
        left: 0, right: 0,
        display: "flex",
        justifyContent: "center",
        gap: "6px",
        zIndex: 20,
        pointerEvents: "none",
      }}>
        {profiles.map((_: any, i: number) => (
          <div key={i} style={{
            height: "3px",
            width: i === currentIndex ? "24px" : "8px",
            borderRadius: "99px",
            background: i === currentIndex ? "white" : "rgba(255,255,255,0.4)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <ProfileStoryCard
          key={currentIndex}
          profile={profiles[currentIndex]}
          onEdit={onEdit}
          onDelete={onDelete}
          onSwipeLeft={goNext}
          onSwipeRight={goPrev}
        />
      </AnimatePresence>

      {/* Add new button */}
      <button
        onClick={onNewProfile}
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom) + 80px)",
          right: "16px",
          width: "52px", height: "52px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.9)",
          border: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          zIndex: 30,
        }}
      >
        <PlusIcon size={24} color="#374151" />
      </button>
    </>
  );
}
