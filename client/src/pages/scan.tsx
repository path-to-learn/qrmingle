import { useState } from "react";
import { AlertCircle, Camera as CameraIcon, Check, IdCard, Image as ImageIcon, Loader2, QrCode, RotateCcw, Sparkles, UserPlus } from "lucide-react";
import { Camera as CameraPlugin, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ImageCropper from "@/components/profile/ImageCropper";
import type { ProfileFormData } from "@shared/schema";

type ScannedLink = {
  platform: string;
  url: string;
};

type ScannedContact = {
  name: string;
  title: string;
  company?: string;
  bio?: string;
  suggestedLinks: ScannedLink[];
};

type ScanError = {
  title: string;
  message: string;
  expected: boolean;
};

const accent = "var(--app-accent, #6366f1)";
const PENDING_CREATED_PROFILE_ID_KEY = "cardsPendingCreatedProfileId";

function normalizeImageDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return dataUrl;

  const header = dataUrl.slice(0, commaIndex).trim();
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64$/i.exec(header);
  const mediaType = match?.[1]?.toLowerCase() === "image/jpg"
    ? "image/jpeg"
    : match?.[1]?.toLowerCase() || "image/jpeg";
  const base64 = dataUrl
    .slice(commaIndex + 1)
    .replace(/[^A-Za-z0-9+/=]/g, "");

  return `data:${mediaType};base64,${base64}`;
}

function normalizeLink(link: ScannedLink): ScannedLink {
  const platform = link.platform.trim();
  let url = link.url.trim();
  if (platform === "Website" && url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return { platform, url };
}

function formatScanError(error: any): ScanError {
  const rawMessage = String(error?.message || "Could not scan this business card.");
  const message = rawMessage.replace(/^\d{3}:\s*/, "");
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("expected pattern")) {
    return {
      title: "Image format issue",
      message: "Crop again or choose a PNG/JPEG card photo.",
      expected: false,
    };
  }

  if (
    lowerMessage.includes("no readable contact details") ||
    lowerMessage.includes("does not look like a business card") ||
    lowerMessage.includes("no contact details")
  ) {
    return {
      title: "No card details found",
      message: "Use a business-card or contact-card photo where the text fills the frame.",
      expected: true,
    };
  }

  return {
    title: "Scan failed",
    message,
    expected: false,
  };
}

function buildProfilePayload(contact: ScannedContact): ProfileFormData {
  const name = contact.name?.trim() || contact.company?.trim() || "Scanned Contact";
  const links = (contact.suggestedLinks || [])
    .map(normalizeLink)
    .filter((link) => link.platform && link.url);

  return {
    name,
    displayName: name,
    title: contact.title || contact.company || "",
    bio: contact.bio || "",
    photoUrl: "",
    photoSize: 120,
    backgroundUrl: "",
    backgroundOpacity: 100,
    cardColor: "#ffffff",
    qrStyle: "basic",
    qrColor: "#3B82F6",
    qrSize: 150,
    qrPosition: "bottom",
    photoPosition: "hidden",
    layoutStyle: "standard",
    shortBio: null,
    themeId: null,
    teamId: null,
    socialLinks: links.length ? links : [{ platform: "Website", url: "https://qrmingle.com" }],
  };
}

export default function Scan() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isNativeApp = Capacitor.isNativePlatform();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [contact, setContact] = useState<ScannedContact | null>(null);
  const [scanError, setScanError] = useState<ScanError | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const analyzeBusinessCard = async (dataUrl: string) => {
    setIsScanning(true);
    setContact(null);
    setScanError(null);

    try {
      const res = await apiRequest("POST", "/api/ai/business-card-ocr", {
        imageDataUrl: normalizeImageDataUrl(dataUrl),
      });
      const data = await res.json();
      setContact(data.result);
      toast({ title: "Card details found", description: "Review the details before creating a card." });
    } catch (error: any) {
      const scanFailure = formatScanError(error);
      if (!scanFailure.message.toLowerCase().includes("cancel")) {
        setScanError(scanFailure);
        if (!scanFailure.expected) {
          toast({ title: scanFailure.title, description: scanFailure.message, variant: "destructive" });
        }
      }
    } finally {
      setIsScanning(false);
    }
  };

  const scanBusinessCard = async (source: CameraSource) => {
    if (isScanning) return;
    setContact(null);
    setScanError(null);

    try {
      const photo = await CameraPlugin.getPhoto({
        source,
        resultType: CameraResultType.DataUrl,
        quality: 90,
        width: 2200,
        allowEditing: false,
        promptLabelHeader: "Business Card",
        promptLabelPhoto: "Choose Photo",
        promptLabelPicture: "Take Photo",
      });

      if (!photo.dataUrl) throw new Error("No image was captured.");
      setImageDataUrl(photo.dataUrl);
      setShowCropper(true);
    } catch (error: any) {
      const message = error?.message || "Could not scan this business card.";
      if (!message.toLowerCase().includes("cancel")) {
        toast({ title: "Scan failed", description: message, variant: "destructive" });
      }
    }
  };

  const createCard = async () => {
    if (!contact || isCreating) return;
    setIsCreating(true);

    try {
      const payload = buildProfilePayload(contact);
      const res = await apiRequest("POST", "/api/profiles", payload);
      const createdProfile = await res.json();

      queryClient.setQueryData<any[]>(["/api/profiles"], (current = []) => {
        if (!createdProfile?.id || current.some((profile: any) => profile.id === createdProfile.id)) {
          return current;
        }
        sessionStorage.setItem("cardsCurrentIndex", String(current.length));
        return [...current, createdProfile];
      });
      if (createdProfile?.id) {
        sessionStorage.setItem(PENDING_CREATED_PROFILE_ID_KEY, String(createdProfile.id));
      }
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });

      toast({ title: "Card created", description: "The scanned contact is now in your cards." });
      navigate("/profiles");
    } catch (error: any) {
      toast({ title: "Could not create card", description: error?.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100dvh - 140px)",
      padding: "18px 18px calc(92px + env(safe-area-inset-bottom))",
      overflowX: "hidden",
      boxSizing: "border-box",
      width: "100%",
      maxWidth: "100%",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        minWidth: 0,
      }}>
        <section style={{ textAlign: "center", paddingTop: "14px" }}>
          <div style={{
            width: "104px",
            height: "104px",
            borderRadius: "28px",
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: "0 16px 36px rgba(99,102,241,0.24)",
          }}>
            <IdCard size={52} color="white" />
          </div>
          <h2 style={{ fontSize: "24px", lineHeight: 1.15, fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>
            Scan a Business Card
          </h2>
          <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.5, margin: 0 }}>
            {isNativeApp
              ? "Take a photo of a physical card and QrMingle will extract the contact details into a new digital card."
              : "Upload a business card image and QrMingle will extract the contact details into a new digital card."}
          </p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%" }}>
          {isNativeApp ? (
            <>
              <Button
                onClick={() => scanBusinessCard(CameraSource.Camera)}
                disabled={isScanning || isCreating}
                style={{ height: "52px", borderRadius: "14px", background: accent, color: "white", fontWeight: 700, fontSize: "15px" }}
              >
                {isScanning ? <Loader2 size={18} className="animate-spin" /> : <CameraIcon size={18} />}
                Camera
              </Button>
              <Button
                onClick={() => scanBusinessCard(CameraSource.Photos)}
                disabled={isScanning || isCreating}
                variant="outline"
                style={{ height: "52px", borderRadius: "14px", fontWeight: 700, fontSize: "15px", background: "white" }}
              >
                <ImageIcon size={18} />
                Card Photo
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => scanBusinessCard(CameraSource.Photos)}
                disabled={isScanning || isCreating}
                style={{ height: "52px", borderRadius: "14px", background: accent, color: "white", fontWeight: 700, fontSize: "15px" }}
              >
                {isScanning ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                Upload Card
              </Button>
              <Button
                onClick={() => scanBusinessCard(CameraSource.Camera)}
                disabled={isScanning || isCreating}
                variant="outline"
                style={{ height: "52px", borderRadius: "14px", fontWeight: 700, fontSize: "15px", background: "white" }}
              >
                <CameraIcon size={18} />
                Camera
              </Button>
            </>
          )}
        </div>

        {imageDataUrl && (
          <div style={{
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "10px",
            background: "white",
            boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
          }}>
            <img
              src={imageDataUrl}
              alt="Scanned business card"
              style={{ width: "100%", borderRadius: "12px", display: "block", maxHeight: "190px", objectFit: "contain", background: "#f8fafc" }}
            />
          </div>
        )}

        {imageDataUrl && !contact && !isScanning && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Button
              onClick={() => setShowCropper(true)}
              variant="outline"
              style={{ height: "46px", borderRadius: "14px", fontWeight: 700, background: "white" }}
            >
              Crop Again
            </Button>
            <Button
              onClick={() => analyzeBusinessCard(imageDataUrl)}
              style={{ height: "46px", borderRadius: "14px", background: accent, color: "white", fontWeight: 800 }}
            >
              Scan Image
            </Button>
          </div>
        )}

        {scanError && !contact && !isScanning && (
          <section style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px 14px",
            borderRadius: "14px",
            background: scanError.expected ? "#fffbeb" : "#fef2f2",
            border: `1px solid ${scanError.expected ? "#fde68a" : "#fecaca"}`,
            color: scanError.expected ? "#92400e" : "#991b1b",
            fontSize: "13px",
            lineHeight: 1.4,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, marginBottom: "2px" }}>{scanError.title}</div>
              <div>{scanError.message}</div>
            </div>
          </section>
        )}

        {isScanning && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px",
            borderRadius: "16px",
            background: "#eef2ff",
            color: "#3730a3",
            fontSize: "14px",
            fontWeight: 600,
          }}>
            <Sparkles size={18} />
            Reading the business card...
          </div>
        )}

        {contact && (
          <section style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 10px 30px rgba(15,23,42,0.07)",
            minWidth: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#16a34a", fontSize: "13px", fontWeight: 800, marginBottom: "12px" }}>
              <Check size={16} />
              Details extracted
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, overflowWrap: "anywhere" }}>
              {contact.name || contact.company || "Scanned Contact"}
            </div>
            <div style={{ color: "#64748b", fontSize: "15px", marginTop: "6px", overflowWrap: "anywhere" }}>
              {contact.title || contact.company || "New contact"}
            </div>
            {contact.bio && (
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: 1.45, margin: "12px 0 0" }}>{contact.bio}</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              {(contact.suggestedLinks || []).map((link, index) => (
                <div key={`${link.platform}-${index}`} style={{
                  display: "grid",
                  gridTemplateColumns: "86px minmax(0, 1fr)",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#475569",
                  minWidth: 0,
                }}>
                  <strong style={{ color: "#0f172a" }}>{link.platform}</strong>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.url}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "18px" }}>
              <Button
                onClick={() => {
                  setContact(null);
                  setImageDataUrl(null);
                  setScanError(null);
                  setShowCropper(false);
                }}
                disabled={isCreating}
                variant="outline"
                style={{ height: "48px", borderRadius: "14px", fontWeight: 700 }}
              >
                <RotateCcw size={16} />
                Retake
              </Button>
              <Button
                onClick={createCard}
                disabled={isCreating}
                style={{ height: "48px", borderRadius: "14px", background: accent, color: "white", fontWeight: 800 }}
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                Create
              </Button>
            </div>
          </section>
        )}

        {!contact && !isScanning && (
          <section style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "16px",
            color: "#475569",
            fontSize: "14px",
            lineHeight: 1.45,
          }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <QrCode size={20} color="#64748b" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                To scan QR codes, use the iPhone Camera app. For this tab, use a business-card or contact-card photo where the text fills the frame.
              </div>
            </div>
          </section>
        )}
      </div>

      {imageDataUrl && (
        <ImageCropper
          image={imageDataUrl}
          open={showCropper}
          onClose={() => setShowCropper(false)}
          onCropComplete={(croppedImageData) => {
            const normalizedImage = normalizeImageDataUrl(croppedImageData);
            setImageDataUrl(normalizedImage);
            analyzeBusinessCard(normalizedImage);
          }}
          aspect={1.72}
          title="Frame the Business Card"
          actionLabel="Crop & Scan"
        />
      )}
    </div>
  );
}
