import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import Home from "@/pages/home";
import NativeAuthShell, { NativeAuthField } from "@/components/auth/NativeAuthShell";
import {
  checkBiometricAvailability,
  isFaceIdLoginEnabled,
  getFaceIdCredentials,
  enableFaceIdLogin,
  disableFaceIdLogin,
  type BiometryType,
} from "@/lib/biometric";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isCapacitor = Capacitor.isNativePlatform();
  const { t } = useTranslation();

  const [canUseFaceId, setCanUseFaceId] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>("none");
  const autoTriedRef = useRef(false);

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  useEffect(() => {
    if (!isCapacitor || !isFaceIdLoginEnabled()) return;
    checkBiometricAvailability().then(({ isAvailable, biometryType }) => {
      setCanUseFaceId(isAvailable);
      setBiometryType(biometryType);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCapacitor]);

  const faceIdLabel = biometryType === "touchId" ? "Log in with Touch ID" : "Log in with Face ID";

  const handleFaceIdLogin = async () => {
    try {
      const creds = await getFaceIdCredentials();
      loginMutation.mutate(creds);
    } catch (err: any) {
      if (err?.message === "NOT_FOUND") {
        // Stored credentials are gone (e.g. password changed elsewhere) — stop offering Face ID until re-enabled.
        setCanUseFaceId(false);
        await disableFaceIdLogin();
      } else if (err?.message !== "CANCELLED") {
        toast({ title: "Face ID login failed", description: "Please log in with your password.", variant: "destructive" });
      }
    }
  };

  useEffect(() => {
    if (canUseFaceId && !autoTriedRef.current && !user) {
      autoTriedRef.current = true;
      handleFaceIdLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseFaceId]);

  const offerFaceIdEnrollment = async (loggedInUsername: string, loggedInPassword: string) => {
    if (!isCapacitor || isFaceIdLoginEnabled()) return;
    const { isAvailable, biometryType } = await checkBiometricAvailability();
    if (!isAvailable) return;
    const label = biometryType === "touchId" ? "Touch ID" : "Face ID";
    if (!window.confirm(`Use ${label} to log in next time instead of typing your password?`)) return;
    try {
      await enableFaceIdLogin(loggedInUsername, loggedInPassword);
      toast({ title: `${label} enabled`, description: "You can now use it to log back in." });
    } catch {
      toast({ title: "Couldn't enable Face ID", description: "You can try again from Settings.", variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: t('login.error.fillAll'), variant: "destructive" });
      return;
    }
    loginMutation.mutate(
      { username, password },
      { onSuccess: () => offerFaceIdEnrollment(username, password) }
    );
  };

  if (isCapacitor) {
    return (
      <NativeAuthShell
        chip="Welcome back"
        title={<>Your cards are<br />ready when you are.</>}
        subtitle={<>Sign in to share, scan, and update your profile before the next intro.</>}
        activeMode="login"
        onModeChange={(mode) => navigate(mode === "login" ? "/login" : "/register")}
        onBack={() => navigate("/")}
        backLabel={t('login.back')}
        onSubmit={handleLogin}
        primaryLabel={loginMutation.isPending ? t('login.submitting') : t('login.submit')}
        isSubmitting={loginMutation.isPending}
        footer={
          <>
            {canUseFaceId && (
              <button
                type="button"
                onClick={handleFaceIdLogin}
                disabled={loginMutation.isPending}
                style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: "14px", fontWeight: 700, padding: 0, marginBottom: "16px", display: "block" }}
              >
                {faceIdLabel}
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: "14px", fontWeight: 700, padding: 0 }}
            >
              Forgot password?
            </button>
            <div style={{ marginTop: "28px" }}>
              {t('login.noAccount')}{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", font: "inherit", fontWeight: 700, padding: 0 }}
              >
                {t('login.signUp')}
              </button>
            </div>
          </>
        }
      >
        <div style={{ display: "grid", gap: "16px" }}>
          <NativeAuthField
            label={t('login.username')}
            icon="email"
            type="email"
            placeholder={t('login.usernamePlaceholder')}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            enterKeyHint="next"
            disabled={loginMutation.isPending}
          />
          <NativeAuthField
            label={t('login.password')}
            icon="password"
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            disabled={loginMutation.isPending}
          />
        </div>
      </NativeAuthShell>
    );
  }

  return <Home authMode="login" />;
}
