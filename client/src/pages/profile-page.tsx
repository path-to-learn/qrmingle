import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QrWidgetGenerator } from "@/components/profile/QrWidgetGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Share, UserPlus,
  Mail, Phone, Globe, Link2, Linkedin, Twitter, Instagram, Facebook,
  ArrowLeft,
} from "lucide-react";
import { saveToContacts, isMobileDevice } from "@/lib/vcard";
import { celebrateSaveContact } from "@/lib/confetti";
import { getCardAccent } from "@/components/profile/ProfileCard";
import { getTeamById, getThemeById } from "@/data/themes";

type SocialLinkType = {
  id: number;
  platform: string;
  url: string;
  profileId: number;
};

type ProfileData = {
  id: number;
  name: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  photoSize: number | null;
  backgroundUrl: string | null;
  backgroundOpacity: number | null;
  cardColor: string | null;
  qrStyle: string | null;
  qrColor: string | null;
  slug: string;
  scanCount: number;
  socialLinks: SocialLinkType[];
  hasArEnabled: boolean | null;
  arModelUrl: string | null;
  arScale: number | null;
  arAnimationEnabled: boolean | null;
  themeId: string | null;
  teamId: string | null;
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
  const props = { size: 16, color: "white" };
  if (p === "email")              return <Mail {...props} />;
  if (p === "phone")              return <Phone {...props} />;
  if (p === "linkedin")           return <Linkedin {...props} />;
  if (p === "twitter" || p === "x") return <Twitter {...props} />;
  if (p === "instagram")          return <Instagram {...props} />;
  if (p === "facebook")           return <Facebook {...props} />;
  if (p === "website")            return <Globe {...props} />;
  return <Link2 {...props} />;
};

const getLinkHref = (platform: string, url: string) => {
  const p = platform.toLowerCase();
  if (p === "email") return `mailto:${url}`;
  if (p === "phone") return `tel:${url}`;
  return url.startsWith("http") ? url : `https://${url}`;
};

const formatLinkLabel = (platform: string, url: string) => {
  const p = platform.toLowerCase();
  if (p === "email" || p === "phone") return url;
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
};

export default function ProfilePage() {
  const [_, params] = useRoute("/p/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const isPreview = typeof window !== "undefined" && window.location.search.includes("preview=1");

  const lastTapRef = useRef(0);
  const [showQrWidget, setShowQrWidget] = useState(false);

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: [`/api/p/${slug}`],
    enabled: !!slug,
  });

  const handleSaveContact = async () => {
    if (!profile) return;
    try {
      await saveToContacts(profile, profile.socialLinks);
      toast({
        title: isMobileDevice() ? "Adding Contact" : "Contact Downloaded",
        description: isMobileDevice()
          ? "Your contacts app should open to save this contact."
          : "Contact information has been saved to your device.",
      });
      celebrateSaveContact();
    } catch {
      toast({ title: "Error", description: "There was a problem saving this contact.", variant: "destructive" });
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

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName}'s Contact`,
        text: profile?.bio || `Connect with ${profile?.displayName}`,
        url,
      }).catch((err) => {
        if (err?.name === "AbortError") return;
        fallbackCopy(url);
        toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => fallbackCopy(url));
      toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
    } else {
      fallbackCopy(url);
      toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Skeleton style={{ height: "280px", borderRadius: "20px 20px 0 0" }} />
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Skeleton style={{ height: "24px", width: "60%" }} />
          <Skeleton style={{ height: "16px", width: "40%" }} />
          <Skeleton style={{ height: "16px", width: "80%" }} />
          <Skeleton style={{ height: "48px" }} />
          <Skeleton style={{ height: "48px" }} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", marginBottom: "8px" }}>
          Profile Not Found
        </h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          This profile doesn't exist or has been removed.
        </p>
        <Link href="/">
          <button style={{
            background: "#6366f1", color: "white", border: "none",
            borderRadius: "10px", padding: "10px 20px",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: "6px",
          }}>
            <ArrowLeft size={16} /> Go Home
          </button>
        </Link>
      </div>
    );
  }

  const accent = getCardAccent(profile.name, profile.cardColor ?? undefined);
  const avatarSize = Math.min(Math.max(profile.photoSize || 88, 60), 240);
  const themeTeam = profile.themeId && profile.teamId ? getTeamById(profile.themeId, profile.teamId) : null;
  const theme = profile.themeId ? getThemeById(profile.themeId) : null;
  const avatarOverlap = Math.round(avatarSize * 0.45);

  const handleDoubleTap = (e: React.TouchEvent) => {
    if (!isPreview) return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;
    const now = Date.now();
    if (now - lastTapRef.current < 300) window.history.back();
    lastTapRef.current = now;
  };

  return (
    <div onTouchEnd={handleDoubleTap} style={{ maxWidth: "480px", margin: "0 auto", paddingBottom: "48px" }}>

      {/* ── Floating back button (preview mode only) ── */}
      {isPreview && (
        <button
          onClick={() => window.history.back()}
          style={{
            position: "fixed", top: "16px", left: "16px", zIndex: 1000,
            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
            color: "white", border: "none", borderRadius: "99px",
            padding: "8px 16px", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", gap: "6px",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          ← Back to Cards
        </button>
      )}

      {/* ── Hero section — matches card visual language ── */}
      <div style={{
        height: "280px",
        position: "relative",
        background: themeTeam
          ? `linear-gradient(160deg, ${themeTeam.primary} 0%, ${themeTeam.primary}cc 100%)`
          : getDefaultGradient(profile.name),
        borderRadius: "20px 20px 0 0",
        overflow: "hidden",
      }}>
        {profile.backgroundUrl && (
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${profile.backgroundUrl})`,
            backgroundSize: "cover", backgroundPosition: "center top",
            opacity: profile.backgroundOpacity != null ? profile.backgroundOpacity / 100 : 1,
          }} />
        )}

        {/* Flag watermark — placed early in DOM so it renders behind badges */}
        {themeTeam && !profile.backgroundUrl && (
          <div style={{
            position: "absolute",
            right: "16px", top: "50%",
            transform: "translateY(-58%)",
            fontSize: "120px", lineHeight: 1,
            opacity: 0.4,
            userSelect: "none", pointerEvents: "none",
            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.2))",
          }}>
            {themeTeam.flag}
          </div>
        )}

        {/* Top overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)",
        }} />

        {/* Card type badge — shows FIFA 2026 when themed */}
        <div style={{
          position: "absolute", top: isPreview ? "56px" : "16px", left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
          color: "white", fontSize: "11px", fontWeight: 700,
          padding: "4px 16px", borderRadius: "6px",
          letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>{themeTeam ? "⚽ FIFA 2026" : profile.name}</div>

        {/* Team badge — top left */}
        {themeTeam && theme && (
          <div style={{
            position: "absolute", top: isPreview ? "56px" : "16px", left: "12px",
            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
            color: "white", fontSize: "12px", fontWeight: 700,
            padding: "5px 12px", borderRadius: "20px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "18px" }}>{themeTeam.flag}</span>
            <span>{themeTeam.name}</span>
          </div>
        )}

        {/* Wave — same as card */}
        <svg
          viewBox="0 0 400 48"
          style={{ position: "absolute", bottom: 0, width: "100%", height: "48px", display: "block" }}
          preserveAspectRatio="none"
        >
          <path d="M0,24 C80,48 200,4 400,28 L400,48 L0,48 Z" fill="white" />
        </svg>
      </div>

      {/* ── Avatar — centered, overlapping wave, size driven by photoSize setting ── */}
      <div style={{
        display: "flex", justifyContent: "center",
        marginTop: `-${avatarOverlap}px`, position: "relative", zIndex: 2,
        marginBottom: "12px",
      }}>
        <div style={{
          width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: "50%",
          border: "4px solid white",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          background: profile.photoUrl ? undefined : accent,
          backgroundImage: profile.photoUrl ? `url(${profile.photoUrl})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {!profile.photoUrl && (
            <span style={{ color: "white", fontSize: `${Math.round(avatarSize * 0.36)}px`, fontWeight: 700 }}>
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* ── White content section ── */}
      <div style={{ background: "white", padding: "0 20px 32px", borderRadius: "0 0 20px 20px" }}>

        {/* Name + title */}
        <div style={{
          borderLeft: `4px solid ${accent}`, paddingLeft: "12px",
          marginBottom: profile.bio ? "14px" : "20px",
        }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1e293b", lineHeight: 1.2, margin: 0 }}>
            {profile.displayName}
          </h1>
          {profile.title && (
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>{profile.title}</p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p style={{
            fontSize: "14px", color: "#475569", lineHeight: 1.65,
            margin: "0 0 20px", padding: "12px 14px",
            background: "#f8fafc", borderRadius: "10px",
          }}>
            {profile.bio}
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
          <button
            onClick={handleSaveContact}
            style={{
              flex: 1, background: accent, color: "white",
              border: "none", borderRadius: "12px", padding: "13px 0",
              fontSize: "14px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            <UserPlus size={16} /> Save Contact
          </button>

          <button
            onClick={handleShare}
            style={{
              width: "48px", height: "48px", background: "#f1f5f9", color: "#475569",
              border: "none", borderRadius: "12px", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            <Share size={19} />
          </button>
        </div>

        {/* Social links — all of them, fully clickable */}
        {profile.socialLinks && profile.socialLinks.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
              color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px",
            }}>Connect</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={getLinkHref(link.platform, link.url)}
                  target={link.platform.toLowerCase() !== "phone" && link.platform.toLowerCase() !== "email" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 14px", borderRadius: "12px",
                    background: "#f8fafc", border: "1px solid #f1f5f9",
                    transition: "background 0.15s",
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: accent, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <PlatformIcon platform={link.platform} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: "11px", fontWeight: 600, color: "#94a3b8",
                        textTransform: "capitalize", letterSpacing: "0.3px",
                      }}>
                        {link.platform}
                      </div>
                      <div style={{
                        fontSize: "13px", color: "#334155", fontWeight: 500,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {formatLinkLabel(link.platform, link.url)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Theme fan badge in content area */}
        {themeTeam && theme && (
          <div style={{
            margin: "16px 0",
            padding: "14px 16px",
            borderRadius: "14px",
            background: themeTeam.primary + "14",
            border: `1px solid ${themeTeam.primary}30`,
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <span style={{ fontSize: "32px" }}>{themeTeam.flag}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: themeTeam.primary }}>
                {theme.badge}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                {theme.name}
              </div>
              {themeTeam.players.length > 0 && (
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  {themeTeam.players.map(p => `#${p.number} ${p.name}`).join(" · ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: "center", paddingTop: "20px",
          borderTop: "1px solid #f1f5f9",
        }}>
          {themeTeam ? (
            <>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 6px" }}>
                {theme?.emoji} Share your FIFA 2026 fan card — it's free!
              </p>
              <Link href="/">
                <span style={{
                  display: "inline-block", padding: "8px 20px",
                  background: themeTeam.primary, color: "white",
                  borderRadius: "20px", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer",
                }}>
                  Create yours on QrMingle →
                </span>
              </Link>
            </>
          ) : (
            <>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 4px" }}>Created with</p>
              <Link href="/">
                <span style={{ fontSize: "13px", color: accent, fontWeight: 600, cursor: "pointer" }}>
                  QrMingle
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* QR Widget Generator (kept for power users) */}
      <QrWidgetGenerator
        profileName={profile.name}
        profileDisplayName={profile.displayName}
        qrCodeUrl={window.location.href}
        open={showQrWidget}
        onOpenChange={setShowQrWidget}
      />
    </div>
  );
}
