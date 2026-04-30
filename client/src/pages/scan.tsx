import { QrCode, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Scan() {

  const handleScan = () => {
    // On iOS, opening camera:// or using the native share will trigger QR scanning
    // The simplest approach is to direct users to use the native camera
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor) {
      // On native app, user can use iPhone's built-in camera which auto-detects QR
      alert("To scan a QR code, open your iPhone's Camera app and point it at the QR code. It will automatically detect and open the QRMingle profile.");
    } else {
      alert("Use your device camera to scan QR codes.");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      gap: "24px",
      padding: "24px",
      paddingBottom: "80px",
    }}>
      <div style={{
        width: "120px", height: "120px", borderRadius: "32px",
        background: "var(--app-accent, #6366f1)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <QrCode size={60} color="white" />
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Scan a QR Code</h2>
        <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.5 }}>
          Point your iPhone camera at any QRMingle card to instantly view and save their contact
        </p>
      </div>
      <div style={{
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "20px",
        width: "100%",
        maxWidth: "320px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "24px" }}>1️⃣</div>
          <p style={{ fontSize: "14px", color: "#475569" }}>Open your iPhone's <strong>Camera app</strong></p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "24px" }}>2️⃣</div>
          <p style={{ fontSize: "14px", color: "#475569" }}>Point it at a <strong>QRMingle QR code</strong></p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ fontSize: "24px" }}>3️⃣</div>
          <p style={{ fontSize: "14px", color: "#475569" }}>Tap the notification to <strong>view their profile</strong></p>
        </div>
      </div>
      <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
        Built-in QR scanner coming in a future update
      </p>
    </div>
  );
}
