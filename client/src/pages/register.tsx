import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import Home from "@/pages/home";
import NativeAuthShell, { NativeAuthField, NativeAuthPill } from "@/components/auth/NativeAuthShell";
import { FREE_AI_ASSIST_LIMIT, FREE_PROFILE_LIMIT } from "@shared/premium";

export default function Register() {
  const [, navigate] = useLocation();
  const { user, registerMutation } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isCapacitor = Capacitor.isNativePlatform();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      toast({ title: "Error", description: t('register.error.fillAll'), variant: "destructive" });
      return;
    }
    if (!isValidEmail(username)) {
      toast({ title: "Error", description: "Please enter a valid email address as your username.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: t('register.error.passwordMismatch'), variant: "destructive" });
      return;
    }
    registerMutation.mutate({ username, password });
  };

  if (isCapacitor) {
    return (
      <NativeAuthShell
        chip="Start in seconds"
        title={<>Create your first<br />shareable card.</>}
        subtitle={<>Use AI, scan a card, or start clean. Your QR profile is ready to edit.</>}
        activeMode="register"
        onModeChange={(mode) => navigate(mode === "login" ? "/login" : "/register")}
        onBack={() => navigate("/")}
        backLabel={t('register.back')}
        onSubmit={handleRegister}
        primaryLabel={registerMutation.isPending ? t('register.submitting') : t('register.submit')}
        isSubmitting={registerMutation.isPending}
        footer={
          <>
            {t('register.haveAccount')}{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", font: "inherit", fontWeight: 700, padding: 0 }}
            >
              {t('register.signIn')}
            </button>
            <div style={{ marginTop: "28px" }}>Create now. Refine your card after signup.</div>
          </>
        }
      >
        <div style={{ display: "grid", gap: "14px" }}>
          <NativeAuthField
            label={t('register.username')}
            icon="email"
            type="email"
            placeholder={t('register.usernamePlaceholder')}
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            enterKeyHint="next"
            disabled={registerMutation.isPending}
          />
          <NativeAuthField
            label={t('register.password')}
            icon="password"
            type="password"
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            disabled={registerMutation.isPending}
          />
          <NativeAuthField
            label={t('register.confirmPassword')}
            icon="password"
            type="password"
            placeholder={t('register.confirmPlaceholder')}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            disabled={registerMutation.isPending}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <NativeAuthPill tone="green">{FREE_AI_ASSIST_LIMIT} free AI assist{FREE_AI_ASSIST_LIMIT === 1 ? "" : "s"}</NativeAuthPill>
            <NativeAuthPill>{FREE_PROFILE_LIMIT} profiles</NativeAuthPill>
          </div>
        </div>
      </NativeAuthShell>
    );
  }

  return <Home authMode="register" />;
}
