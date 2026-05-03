import { useState } from "react";
import { useLocation } from "wouter";
import { QRCodeSVG } from "qrcode.react";
import {
  Share, UserPlus, Pencil, Trash2, QrCode,
  Mail, Phone, Globe, Link2, Linkedin, Twitter, Instagram, Facebook,
} from "lucide-react";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { saveToContacts, isMobileDevice } from "@/lib/vcard";
import { useToast } from "@/hooks/use-toast";
import { SocialLink } from "@shared/schema";
import { getTeamById } from "@/data/themes";

type ProfileCardProps = {
  id: number;
  name: string;
  displayName: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  backgroundUrl?: string;
  backgroundOpacity?: number;
  cardColor?: string;
  qrStyle?: string;
  qrColor?: string;
  qrSize?: number;
  qrPosition?: string;
  photoPosition?: string;
  photoSize?: number;
  layoutStyle?: string;
  slug: string;
  scanCount: number;
  socialLinks: SocialLink[];
  themeId?: string | null;
  teamId?: string | null;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export const getCardAccent = (name: string, cardColor?: string) => {
  if (cardColor && cardColor !== "#ffffff" && cardColor !== "#fff") return cardColor;
  switch (name.toLowerCase()) {
    case "professional": return "#2d6a9f";
    case "social":       return "#2d9b5d";
    case "personal":     return "#7b3fa8";
    default:             return "#6366f1";
  }
};

const getDefaultGradient = (name: string) => {
  switch (name.toLowerCase()) {
    case "professional": return "linear-gradient(160deg, #1e3a5f 0%, #2d6a9f 100%)";
    case "social":       return "linear-gradient(160deg, #1a5c38 0%, #2d9b5d 100%)";
    case "personal":     return "linear-gradient(160deg, #4a1a7a 0%, #7b3fa8 100%)";
    default:             return "linear-gradient(160deg, #2c3e50 0%, #4a6fa5 100%)";
  }
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  const props = { size: 14, color: "white" };
  if (p === "email")              return <Mail {...props} />;
  if (p === "phone")              return <Phone {...props} />;
  if (p === "linkedin")           return <Linkedin {...props} />;
  if (p === "twitter" || p === "x") return <Twitter {...props} />;
  if (p === "instagram")          return <Instagram {...props} />;
  if (p === "facebook")           return <Facebook {...props} />;
  if (p === "website")            return <Globe {...props} />;
  return <Link2 {...props} />;
};

const formatLinkLabel = (platform: string, url: string) => {
  const p = platform.toLowerCase();
  if (p === "email" || p === "phone") return url;
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
};

export default function ProfileCard({
  id, name, displayName, title,
  photoUrl, photoSize = 80, backgroundUrl, backgroundOpacity = 100,
  cardColor, qrStyle, qrColor,
  slug, scanCount, socialLinks,
  themeId, teamId,
  onEdit, onDelete,
}: ProfileCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showQr, setShowQr] = useState(false);
  const [qrExpanded, setQrExpanded] = useState(false);
  const profileUrl = `${window.location.origin}/p/${slug}`;
  const accent = getCardAccent(name, cardColor);
  const themeTeam = themeId && teamId ? getTeamById(themeId, teamId) : null;
  // Scale photoSize (editor range 60-300) to card-appropriate size (44-88px)
  const cardAvatarSize = Math.min(Math.max(Math.round(photoSize * 0.55), 44), 88);

  const handleSaveContact = async () => {
    try {
      await saveToContacts({ id, name, displayName, title, photoUrl, slug }, socialLinks);
      toast({
        title: isMobileDevice() ? "Adding Contact" : "Contact Downloaded",
        description: isMobileDevice()
          ? "Your contacts app should open to save this contact."
          : "Contact saved as a vCard file.",
      });
    } catch {
      toast({ title: "Error", description: "Failed to save contact.", variant: "destructive" });
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const handleShare = () => {
    if (qrExpanded) {
      setQrExpanded(false);
      return;
    }
    setQrExpanded(true);
    if (navigator.share) {
      navigator.share({
        title: `${displayName}'s Contact Card`,
        text: `Connect with ${displayName}`,
        url: profileUrl,
      }).catch((err) => {
        // AbortError = user dismissed the sheet — don't treat as failure
        if (err?.name === "AbortError") return;
        copyToClipboard(profileUrl);
        toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
      });
    } else {
      copyToClipboard(profileUrl);
      toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
    }
  };

  return (
    <>
      {/* Outer wrapper stretches to parent height so action buttons align across cards */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>

      {/* ── Portrait card — tap navigates to full preview ── */}
      <div
        onClick={() => setLocation(`/p/${slug}?preview=1`)}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "20px",
          overflow: "hidden",
          background: "white",
          boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
        }}
      >

        {/* ── Photo / hero section ── */}
        <div style={{
          height: "230px",
          position: "relative",
          background: themeTeam
            ? `linear-gradient(160deg, ${themeTeam.primary} 0%, ${themeTeam.primary}cc 100%)`
            : getDefaultGradient(name),
          overflow: "hidden",
        }}>
          {/* Background image */}
          {backgroundUrl && (
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${backgroundUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: backgroundOpacity / 100,
            }} />
          )}

          {/* Flag watermark — placed early in DOM so it renders behind badges */}
          {themeTeam && !backgroundUrl && (
            <div style={{
              position: "absolute",
              right: "12px", top: "50%",
              transform: "translateY(-58%)",
              fontSize: "100px", lineHeight: 1,
              opacity: 0.45,
              userSelect: "none", pointerEvents: "none",
              filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.25))",
            }}>
              {themeTeam.flag}
            </div>
          )}

          {/* Top gradient for badge legibility */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)",
          }} />

          {/* Card name badge — top center; shows FIFA 2026 when themed */}
          <div style={{
            position: "absolute", top: "14px", left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
            color: "white", fontSize: "10px", fontWeight: 700,
            padding: "4px 14px", borderRadius: "6px",
            letterSpacing: "1px", textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>{themeTeam ? "⚽ FIFA 2026" : name}</div>

          {/* Team badge — top left */}
          {themeTeam && (
            <div style={{
              position: "absolute", top: "12px", left: "12px",
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
              color: "white", fontSize: "11px", fontWeight: 700,
              padding: "4px 10px", borderRadius: "20px",
              display: "flex", alignItems: "center", gap: "5px",
              whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: "16px" }}>{themeTeam.flag}</span>
              <span>{themeTeam.name}</span>
            </div>
          )}

          {/* Scan count — top right */}
          {scanCount > 0 && (
            <div style={{
              position: "absolute", top: "12px", right: "14px",
              background: "rgba(0,0,0,0.35)",
              color: "rgba(255,255,255,0.9)", fontSize: "10px", fontWeight: 500,
              padding: "3px 8px", borderRadius: "99px",
            }}>{scanCount} {scanCount === 1 ? "scan" : "scans"}</div>
          )}

          {/*
            Avatar sits inside the photo section, above the wave.
            z-index: 2 ensures it renders on top of the white wave fill.
          */}
          {photoUrl && (
            <div style={{
              position: "absolute", bottom: "8px", left: "16px",
              width: `${cardAvatarSize}px`, height: `${cardAvatarSize}px`, borderRadius: "50%",
              border: "3px solid white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: "cover", backgroundPosition: "center",
              zIndex: 2,
            }} />
          )}

          {/* Wave — white fill bites into photo section; z-index: 1 stays below avatar */}
          <svg
            viewBox="0 0 400 48"
            style={{
              position: "absolute", bottom: 0, width: "100%", height: "48px",
              display: "block", zIndex: 1,
            }}
            preserveAspectRatio="none"
          >
            <path d="M0,24 C80,48 200,4 400,28 L400,48 L0,48 Z" fill="white" />
          </svg>
        </div>

        {/* ── Info section ── */}
        <div style={{ flex: 1, padding: "12px 16px 18px" }}>

          {/* Name / title + inline QR */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px",
            paddingLeft: photoUrl ? `${cardAvatarSize + 10}px` : "0",
          }}>
            {/* Name + title with left accent bar */}
            <div style={{
              flex: 1, minWidth: 0,
              paddingLeft: "10px",
              borderLeft: `3px solid ${accent}`,
            }}>
              <div style={{
                fontSize: "19px", fontWeight: 700, color: "#1e293b", lineHeight: 1.2,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{displayName}</div>
              {title && (
                <div style={{
                  fontSize: "13px", color: "#64748b", marginTop: "3px",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{title}</div>
              )}
            </div>

            {/* Inline QR */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{
                padding: "5px", borderRadius: "10px",
                background: "white",
                border: `1.5px solid ${qrExpanded ? accent : "#e2e8f0"}`,
                boxShadow: qrExpanded ? `0 0 0 3px ${accent}22` : "0 1px 6px rgba(0,0,0,0.08)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}>
                <QRCodeSVG value={profileUrl} size={54} fgColor={accent} bgColor="white" level="L" />
              </div>
              {themeTeam && (
                <div style={{
                  fontSize: "9px", fontWeight: 800, color: accent,
                  letterSpacing: "0.5px", textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>
                  ⚽ FIFA 2026
                </div>
              )}
            </div>
          </div>

          {/* Expanded QR panel — slides open when Share is tapped */}
          <div
            onClick={(e) => { e.stopPropagation(); setQrExpanded(false); }}
            style={{
              overflow: "hidden",
              maxHeight: qrExpanded ? "220px" : "0px",
              opacity: qrExpanded ? 1 : 0,
              marginBottom: qrExpanded ? "14px" : "0px",
              transition: qrExpanded
                ? "max-height 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.22s ease, margin-bottom 0.3s ease"
                : "max-height 0.25s ease-in, opacity 0.18s ease, margin-bottom 0.25s ease",
              cursor: "pointer",
            }}
          >
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              paddingTop: "12px", gap: "8px",
            }}>
              <div style={{
                padding: "10px", borderRadius: "14px",
                background: "white",
                border: `2px solid ${accent}`,
                boxShadow: `0 6px 24px ${accent}44`,
              }}>
                <QRCodeSVG value={profileUrl} size={150} fgColor={accent} bgColor="white" level="L" />
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>
                Tap anywhere to close
              </div>
            </div>
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {socialLinks.slice(0, 4).map((link, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: accent, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <PlatformIcon platform={link.platform} />
                  </div>
                  <span style={{
                    fontSize: "13px", color: "#475569",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {formatLinkLabel(link.platform, link.url)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Primary: Share + Edit */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1, background: accent, color: "white",
              border: "none", borderRadius: "14px", padding: "14px 0",
              fontSize: "15px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
            }}
          >
            <Share size={17} /> Share
          </button>
          <button
            onClick={() => onEdit(id)}
            style={{
              flex: 1, background: "#f1f5f9", color: "#1e293b",
              border: "none", borderRadius: "14px", padding: "14px 0",
              fontSize: "15px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
            }}
          >
            <Pencil size={16} /> Edit
          </button>
        </div>

        {/* Secondary: QR fullscreen · Preview (web) · Save · Delete */}
        <div style={{ display: "flex", gap: "10px" }}>
          {([
            { icon: <QrCode size={19} color="#475569" />, label: "QR Code", onClick: () => setShowQr(true), bg: "#f1f5f9", color: "#64748b" },
            { icon: <Globe size={19} color="#475569" />, label: "Preview", onClick: () => setLocation(`/p/${slug}?preview=1`), bg: "#f1f5f9", color: "#64748b" },
            { icon: <UserPlus size={19} color="#475569" />, label: "Save", onClick: handleSaveContact, bg: "#f1f5f9", color: "#64748b" },
            { icon: <Trash2 size={17} color="#ef4444" />, label: "Delete", onClick: () => onDelete(id), bg: "#fff0f0", color: "#ef4444" },
          ] as const).map(({ icon, label, onClick, bg, color }) => (
            <button
              key={label}
              onClick={onClick}
              title={label}
              style={{
                flex: 1, background: bg, border: "none", borderRadius: "12px", padding: "10px 0",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px",
                cursor: "pointer", WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
              }}
            >
              {icon}
              <span style={{ fontSize: "10px", color, fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      </div>{/* end outer flex wrapper */}

      {/* ── QR full-screen modal ── */}
      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 500,
            background: "rgba(0,0,0,0.88)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "20px",
          }}
        >
          <div style={{ background: "white", borderRadius: "24px", padding: "28px" }}>
            <QrCodeDisplay
              value={profileUrl}
              fgColor={qrColor || accent}
              size={220}
              qrStyle={qrStyle}
              profileName={name}
              scanCount={scanCount}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>{displayName}</div>
            {title && (
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", marginTop: "4px" }}>{title}</div>
            )}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Tap anywhere to close</div>
        </div>
      )}
    </>
  );
}
