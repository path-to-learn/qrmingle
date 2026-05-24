import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";

const GRADIENT = "linear-gradient(170deg, #0f0c29 0%, #1e1b4b 30%, #312e81 60%, #4338ca 85%, #6366f1 100%)";

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

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px", padding: "14px 16px", fontSize: "16px",
    color: "white", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.75)", fontSize: "13px", fontWeight: 600,
    display: "block", marginBottom: "8px",
  };

  // ── iOS layout ──────────────────────────────────────────────────────
  if (isCapacitor) {
    return (
      <div className="native-auth-screen" style={{
        height: "100%",
        minHeight: "100%",
        background: GRADIENT,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
        maxWidth: "100vw",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "max(24px, env(safe-area-inset-top))",
        paddingBottom: "calc(32px + env(safe-area-inset-bottom))",
        position: "relative",
        overflowX: "hidden",
        overflowY: "hidden",
        boxSizing: "border-box",
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
      }}>
        {/* Back button */}
        <div style={{
          position: "absolute",
          top: "max(12px, env(safe-area-inset-top))",
          left: "20px",
          zIndex: 2,
        }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              color: "rgba(255,255,255,0.78)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "14px",
              fontWeight: 600,
              padding: "8px 12px 8px 8px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <ChevronLeft size={18} /> {t('register.back')}
          </button>
        </div>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "22px", flexShrink: 0 }}>
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
        <div style={{ textAlign: "center", marginBottom: "22px", flexShrink: 0 }}>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>{t('register.title')}</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", marginTop: "8px" }}>{t('register.subtitle')}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} style={{ width: "100%", maxWidth: "380px", flexShrink: 0 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px", border: "1px solid rgba(255,255,255,0.12)", marginBottom: "16px" }}>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{t('register.username')}</label>
              <input type="email" placeholder={t('register.usernamePlaceholder')} value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" enterKeyHint="next" disabled={registerMutation.isPending} style={inputStyle} />
            </div>
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>{t('register.password')}</label>
              <input type="password" placeholder={t('register.passwordPlaceholder')} value={password} onChange={e => setPassword(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" disabled={registerMutation.isPending} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t('register.confirmPassword')}</label>
              <input type="password" placeholder={t('register.confirmPlaceholder')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="go" disabled={registerMutation.isPending} style={inputStyle} />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              width: "100%", background: "white", color: "#1e293b",
              border: "none", borderRadius: "16px", padding: "18px",
              fontSize: "17px", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              WebkitTapHighlightColor: "transparent",
              opacity: registerMutation.isPending ? 0.7 : 1,
            }}
          >
            {registerMutation.isPending ? t('register.submitting') : t('register.submit')}
          </button>
        </form>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", marginTop: "24px", textAlign: "center" }}>
          {t('register.haveAccount')}{" "}
          <span onClick={() => navigate("/login")} style={{ color: "white", fontWeight: 700, cursor: "pointer" }}>
            {t('register.signIn')}
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
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Email</label>
              <Input id="username" type="email" placeholder="Enter your email" value={username} onChange={e => setUsername(e.target.value)} disabled={registerMutation.isPending} />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" type="password" placeholder="Choose a password" value={password} onChange={e => setPassword(e.target.value)} disabled={registerMutation.isPending} />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={registerMutation.isPending} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-center text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link href="/login"><span className="text-primary hover:underline cursor-pointer">Login here</span></Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
