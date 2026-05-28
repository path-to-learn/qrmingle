import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import Home from "@/pages/home";
import NativeAuthShell, { NativeAuthField } from "@/components/auth/NativeAuthShell";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isCapacitor = Capacitor.isNativePlatform();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) navigate("/profiles");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: t('login.error.fillAll'), variant: "destructive" });
      return;
    }
    loginMutation.mutate({ username, password });
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
