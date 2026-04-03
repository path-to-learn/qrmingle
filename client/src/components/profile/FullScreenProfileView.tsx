import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { PlusIcon, Pencil, Trash2, Share, UserPlus, QrCode } from "lucide-react";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { saveToContacts } from "@/lib/vcard";
import { useToast } from "@/hooks/use-toast";

interface FullScreenProfileViewProps {
  profiles: any[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onNewProfile: () => void;
}

const bgGradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
  "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
];

function ProfileStoryCard({ profile, onEdit, onDelete, onSwipeLeft, onSwipeRight }: any) {
  const [showQR, setShowQR] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-6, 6]);
  const { toast } = useToast();

  const bgGradient = bgGradients[(profile.name?.charCodeAt(0) || 0) % bgGradients.length];
  const profileUrl = `${window.location.origin}/p/${profile.slug}`;

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) onSwipeRight();
      else onSwipeLeft();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: profile.displayName, url: profileUrl });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(profileUrl);
      toast({ title: "Link copied!" });
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
      style={{ x, rotate, width: "100%", maxWidth: "100%", overflow: "hidden" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        background: bgGradient,
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 180px)",
        width: "100%",
        boxSizing: "border-box",
      }}>
        {/* Top actions */}
        <div style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <button onClick={() => onEdit(profile.id)} style={{
            background: "rgba(255,255,255,0.25)", border: "none",
            borderRadius: "50%", width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Pencil size={18} color="white" />
          </button>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 600 }}>
            {profile.name}
          </span>
          <button onClick={() => onDelete(profile.id)} style={{
            background: "rgba(255,255,255,0.25)", border: "none",
            borderRadius: "50%", width: "40px", height: "40px",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Trash2 size={18} color="white" />
          </button>
        </div>

        {/* Profile content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "space-evenly",
          padding: "16px", gap: "8px",
        }}>
          {/* Photo */}
          {profile.photoUrl ? (
            <div style={{
              width: "110px", height: "110px", borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.8)",
              overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}>
              <img src={profile.photoUrl} alt={profile.displayName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ) : (
            <div style={{
              width: "110px", height: "110px", borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              border: "4px solid rgba(255,255,255,0.8)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: "44px", color: "white", fontWeight: 700 }}>
                {profile.displayName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Name & title */}
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "white", fontSize: "26px", fontWeight: 700, margin: 0 }}>
              {profile.displayName}
            </h2>
            {profile.title && (
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", margin: "4px 0 0" }}>
                {profile.title}
              </p>
            )}
          </div>

          {/* Social links */}
          {profile.socialLinks?.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {profile.socialLinks.map((link: any, i: number) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.2)", borderRadius: "20px",
                  padding: "5px 12px", color: "white", fontSize: "13px", fontWeight: 500,
                }}>
                  {link.platform}
                </div>
              ))}
            </div>
          )}

          {/* QR toggle button */}
          <button onClick={() => setShowQR(!showQR)} style={{
            background: "rgba(255,255,255,0.95)", border: "none",
            borderRadius: "14px", padding: "10px 20px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            fontWeight: 600, fontSize: "14px", color: "#374151",
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
                style={{
                  background: "white", borderRadius: "16px",
                  padding: "14px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                <QrCodeDisplay
                  value={profileUrl}
                  size={160}
                  color={profile.qrColor || "#3B82F6"}
                  style={profile.qrStyle || "basic"}
                />
                <p style={{ textAlign: "center", fontSize: "11px", color: "#9ca3af", margin: "6px 0 0" }}>
                  {profile.scanCount || 0} scans
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div style={{ padding: "16px", display: "flex", gap: "10px" }}>
          <button onClick={handleSaveContact} style={{
            flex: 1, padding: "13px",
            background: "rgba(255,255,255,0.95)", border: "none",
            borderRadius: "12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontWeight: 600, fontSize: "14px", color: "#374151",
          }}>
            <UserPlus size={17} /> Save Contact
          </button>
          <button onClick={handleShare} style={{
            flex: 1, padding: "13px",
            background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.5)",
            borderRadius: "12px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            fontWeight: 600, fontSize: "14px", color: "white",
          }}>
            <Share size={17} /> Share
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function FullScreenProfileView({ profiles, onEdit, onDelete, onNewProfile }: FullScreenProfileViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => { if (currentIndex < profiles.length - 1) setCurrentIndex(currentIndex + 1); };
  const goPrev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };

  if (!profiles || profiles.length === 0) {
    return (
      <div onClick={onNewProfile} style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "20px", minHeight: "70vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "20px", padding: "32px", cursor: "pointer",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "20px",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PlusIcon size={36} color="white" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
            Create Your First Card
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: 0 }}>
            Tap to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>

      {/* Dot indicators */}
      <div style={{
        display: "flex", justifyContent: "center", gap: "6px", marginBottom: "12px",
      }}>
        {profiles.map((_: any, i: number) => (
          <div key={i} onClick={() => setCurrentIndex(i)} style={{
            height: "4px",
            width: i === currentIndex ? "24px" : "8px",
            borderRadius: "99px",
            background: i === currentIndex ? "#0ea5e9" : "#cbd5e1",
            transition: "all 0.3s",
            cursor: "pointer",
          }} />
        ))}
      </div>

      {/* Card */}
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

      {/* Counter + Add button */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "12px 12px 16px",
      }}>
        <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>
          {currentIndex + 1} of {profiles.length}
        </span>
        <button onClick={onNewProfile} style={{
          background: "#0ea5e9", border: "none",
          borderRadius: "99px", padding: "8px 16px",
          display: "flex", alignItems: "center", gap: "6px",
          cursor: "pointer", color: "white", fontWeight: 600, fontSize: "13px",
        }}>
          <PlusIcon size={16} /> New Card
        </button>
      </div>
    </div>
  );
}
