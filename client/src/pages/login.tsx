import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

const GRADIENT = "linear-gradient(170deg, #0f0c29 0%, #1e1b4b 30%, #312e81 60%, #4338ca 85%, #6366f1 100%)";

export default function Login() {
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isCapacitor = !!(window as any).Capacitor;
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

  // ── iOS layout ──────────────────────────────────────────────────────
  if (isCapacitor) {
    return (
      <div style={{
        minHeight: "100vh",
        background: GRADIENT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "5%", left: "-20%", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(99,102,241,0.2)", filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-15%", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(139,92,246,0.15)", filter: "blur(60px)", pointerEvents: "none" }} />

        {/* Back button */}
        <div style={{ width: "100%", paddingTop: "16px", marginBottom: "8px" }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "15px", padding: "8px 0", WebkitTapHighlightColor: "transparent" }}
          >
            <ChevronLeft size={20} /> {t('login.back')}
          </button>
        </div>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <svg width="36" height="36" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" rx="256" fill="rgba(255,255,255,0.18)"/>
            <g opacity="0.95">
              <rect x="144" y="144" width="80" height="80" rx="16" fill="white"/><rect x="160" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
              <rect x="288" y="144" width="80" height="80" rx="16" fill="white"/><rect x="304" y="160" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
              <rect x="144" y="288" width="80" height="80" rx="16" fill="white"/><rect x="160" y="304" width="48" height="48" rx="8" fill="rgba(255,255,255,0.3)"/>
              <rect x="240" y="144" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)"/>
              <rect x="240" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.7)"/>
              <rect x="288" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.6)"/>
              <rect x="144" y="240" width="32" height="32" rx="6" fill="rgba(255,255,255,0.6)"/>
            </g>
          </svg>
          <span style={{ color: "white", fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>QrMingle</span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>{t('login.title')}</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", marginTop: "8px" }}>{t('login.subtitle')}</p>
        </div>

        {/* Form card */}
        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "380px" }}>
          <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: "24px", padding: "28px 24px", border: "1px solid rgba(255,255,255,0.12)", marginBottom: "16px" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>{t('login.username')}</label>
              <input
                type="text"
                placeholder={t('login.usernamePlaceholder')}
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", padding: "14px 16px", fontSize: "16px",
                  color: "white", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600, display: "block", marginBottom: "8px" }}>{t('login.password')}</label>
              <input
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px", padding: "14px 16px", fontSize: "16px",
                  color: "white", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              width: "100%", background: "white", color: "#1e293b",
              border: "none", borderRadius: "16px", padding: "18px",
              fontSize: "17px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              WebkitTapHighlightColor: "transparent",
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
          >
            {loginMutation.isPending ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", marginTop: "24px", textAlign: "center" }}>
          {t('login.noAccount')}{" "}
          <span onClick={() => navigate("/register")} style={{ color: "white", fontWeight: 700, cursor: "pointer" }}>
            {t('login.signUp')}
          </span>
        </p>
      </div>
    );
  }

  // ── Web layout (unchanged) ───────────────────────────────────────────
  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Username</label>
              <Input id="username" type="text" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} disabled={loginMutation.isPending} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
              </div>
              <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} disabled={loginMutation.isPending} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Don't have an account?{" "}
              <Link href="/register"><span className="text-primary hover:underline cursor-pointer">Sign up here</span></Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
