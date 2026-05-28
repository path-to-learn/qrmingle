import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeftIcon, MailIcon, KeyIcon, LockIcon, CheckCircleIcon } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import Home from "@/pages/home";
import NativeAuthShell, { NativeAuthField, NativeAuthPill } from "@/components/auth/NativeAuthShell";

export default function ForgotPassword() {
  if (!Capacitor.isNativePlatform()) {
    return <Home authMode="forgot" />;
  }

  return <NativeForgotPassword />;
}

function NativeForgotPassword() {
  const [location, setLocation] = useLocation();
  const search = useSearch(); // reactive — updates when wouter navigates (e.g. Universal Link deep link)
  const urlToken = new URLSearchParams(search).get("token") || "";
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResetMode, setIsResetMode] = useState(!!urlToken);
  const [resetComplete, setResetComplete] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // Sync token from URL when navigated via Universal Link after app is already open
  useEffect(() => {
    const t = new URLSearchParams(search).get("token");
    if (t) {
      setToken(t);
      setIsResetMode(true);
    }
  }, [search]);

  // Handle token requests
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address or username",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the API to request password reset
      const response = await apiRequest("POST", "/api/forgot-password", { email });
      const data = await response.json();
      
      if (data.resetToken) {
        // Store token details
        setResetToken(data.resetToken);
        setExpiresAt(data.expiresAt);
        // Show success and token message instead of "check your email"
        setIsSuccess(true);
      } else {
        // Standard success message (for non-existent accounts)
        setIsSuccess(true);
        toast({
          title: "Request Processed",
          description: "If an account exists with this username, you will receive a reset token.",
        });
      }
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the API to reset password
      const response = await apiRequest("POST", "/api/reset-password", { 
        token: token || resetToken, 
        newPassword 
      });
      const data = await response.json();
      
      // Show success message
      setResetComplete(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      });
    } catch (error) {
      console.error("Password reset failed:", error);
      toast({
        title: "Error",
        description: "Failed to reset your password. The token may be invalid or expired.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render forgot password request form
  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address / Username
          </label>
          <Input
            id="email"
            type="text"
            placeholder="Enter your email address or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Processing Request...</>
          ) : (
            <>
              <KeyIcon className="mr-2 h-4 w-4" />
              Request Reset Token
            </>
          )}
        </Button>
        <Link href="/login" className="text-sm text-center text-muted-foreground mt-2 hover:underline flex items-center justify-center">
          <ArrowLeftIcon className="mr-1 h-3 w-3" /> Back to Login
        </Link>
      </CardFooter>
    </form>
  );

  // Render token received success
  const renderTokenSuccess = () => (
    <CardContent className="space-y-4">
      {resetToken ? (
        <>
          <div className="bg-primary/10 p-4 rounded-lg flex flex-col items-start border border-primary/20">
            <div className="flex items-center w-full mb-2">
              <KeyIcon className="h-5 w-5 text-primary mr-3" />
              <p className="text-sm font-medium">Your Reset Token</p>
            </div>
            <div className="p-3 bg-background border rounded w-full break-all mb-1">
              <code className="text-sm">{resetToken}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              Expires at: {new Date(expiresAt).toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Please copy this token to reset your password. This token will expire in 1 hour.
          </p>
          <Button 
            onClick={() => setIsResetMode(true)} 
            className="w-full mt-4"
          >
            <LockIcon className="mr-2 h-4 w-4" />
            Reset My Password
          </Button>
        </>
      ) : (
        <>
          <div className="bg-primary/10 p-4 rounded-lg flex items-center border border-primary/20">
            <MailIcon className="h-5 w-5 text-primary mr-3" />
            <p className="text-sm">
              We've processed your request for <strong>{email}</strong>.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            If an account exists with this username, you will receive a reset token.
          </p>
        </>
      )}
      <Button 
        onClick={() => setLocation("/login")} 
        className={`w-full mt-4 ${!resetToken ? '' : 'opacity-50'}`}
        variant={resetToken ? "outline" : "default"}
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Return to Login
      </Button>
    </CardContent>
  );

  // Render password reset form
  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword}>
      <CardContent className="space-y-4">
        {(urlToken || token) && !resetToken ? (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-green-700">
            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />
            Reset link verified — enter your new password below
          </div>
        ) : !resetToken && !urlToken ? (
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">
              Reset Token
            </label>
            <Input
              id="token"
              type="text"
              placeholder="Enter your reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Resetting Password...</>
          ) : (
            <>
              <LockIcon className="mr-2 h-4 w-4" />
              Reset Password
            </>
          )}
        </Button>
        {!resetToken && (
          <Button 
            type="button"
            onClick={() => setIsResetMode(false)}
            className="w-full mt-2"
            variant="outline"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Request Token
          </Button>
        )}
      </CardFooter>
    </form>
  );

  // Render reset success
  const renderResetSuccess = () => (
    <CardContent className="space-y-4">
      <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg flex items-start border border-green-200 dark:border-green-800">
        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-300">Password Reset Complete</h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Your password has been reset successfully.
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        You can now log in with your new password.
      </p>
      <Button 
        onClick={() => setLocation("/login")} 
        className="w-full mt-4"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Go to Login
      </Button>
    </CardContent>
  );

  const resetTitle = resetComplete
    ? <>Password reset<br />complete.</>
    : isResetMode
      ? <>Choose your<br />new password.</>
      : isSuccess
        ? <>Reset link is<br />ready.</>
        : <>Reset access<br />without friction.</>;

  const resetSubtitle = resetComplete
    ? <>You can now sign in with your new password.</>
    : isResetMode
      ? <>Create a new password and get back to your QrMingle cards.</>
      : isSuccess
        ? <>Use the reset token below or continue straight to the password form.</>
        : <>A calm reset flow that feels like part of the same QrMingle app.</>;

  const shellSubmit = resetComplete || isSuccess ? undefined : isResetMode ? handleResetPassword : handleForgotPassword;
  const shellPrimaryLabel = resetComplete
    ? "Go to Login"
    : isSuccess
      ? resetToken ? "Reset My Password" : "Return to Login"
      : isResetMode
        ? isSubmitting ? "Resetting Password..." : "Reset Password"
        : isSubmitting ? "Processing Request..." : "Send reset link";
  const shellPrimaryAction = resetComplete
    ? () => setLocation("/login")
    : isSuccess
      ? resetToken ? () => setIsResetMode(true) : () => setLocation("/login")
      : undefined;

  const resetContent = resetComplete ? (
    <div style={{ alignItems: "flex-start", display: "flex", gap: "14px" }}>
      <div style={{ alignItems: "center", background: "#dcfce7", borderRadius: "18px", display: "flex", height: "54px", justifyContent: "center", width: "54px", flexShrink: 0 }}>
        <CheckCircleIcon color="#166534" size={28} />
      </div>
      <div>
        <h3 style={{ color: "#172033", fontSize: "19px", fontWeight: 900, margin: 0 }}>Password Reset Complete</h3>
        <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 650, lineHeight: 1.45, margin: "8px 0 0" }}>
          Your password has been reset successfully.
        </p>
      </div>
    </div>
  ) : isResetMode ? (
    <div style={{ display: "grid", gap: "14px" }}>
      {(urlToken || token) && !resetToken ? (
        <div style={{ alignItems: "center", background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: "16px", color: "#166534", display: "flex", gap: "10px", fontSize: "13px", fontWeight: 800, padding: "13px 14px" }}>
          <CheckCircleIcon size={18} />
          Reset link verified
        </div>
      ) : !resetToken && !urlToken ? (
        <NativeAuthField
          label="Reset Token"
          icon="key"
          type="text"
          placeholder="Enter your reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isSubmitting}
          required
        />
      ) : null}
      <NativeAuthField
        label="New Password"
        icon="password"
        type="password"
        placeholder="Enter your new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isSubmitting}
        required
      />
      <NativeAuthField
        label="Confirm Password"
        icon="password"
        type="password"
        placeholder="Confirm your new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isSubmitting}
        required
      />
    </div>
  ) : isSuccess ? (
    <div style={{ display: "grid", gap: "16px" }}>
      {resetToken ? (
        <>
          <NativeAuthPill tone="green">Reset token created</NativeAuthPill>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "18px", color: "#172033", fontSize: "13px", fontWeight: 800, lineHeight: 1.45, padding: "16px", wordBreak: "break-all" }}>
            {resetToken}
          </div>
          <p style={{ color: "#64748b", fontSize: "13px", fontWeight: 650, lineHeight: 1.5, margin: 0 }}>
            Expires at: {new Date(expiresAt).toLocaleString()}
          </p>
        </>
      ) : (
        <div style={{ alignItems: "center", display: "flex", gap: "14px" }}>
          <div style={{ alignItems: "center", background: "#eef2ff", borderRadius: "18px", display: "flex", height: "54px", justifyContent: "center", width: "54px", flexShrink: 0 }}>
            <MailIcon color="#4f46e5" size={26} />
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 650, lineHeight: 1.45, margin: 0 }}>
            If an account exists for <strong>{email}</strong>, the reset request has been processed.
          </p>
        </div>
      )}
    </div>
  ) : (
    <div style={{ display: "grid", gap: "18px" }}>
      <div style={{ alignItems: "center", display: "flex", gap: "14px" }}>
        <div style={{ alignItems: "center", background: "#eef2ff", borderRadius: "18px", display: "flex", height: "54px", justifyContent: "center", width: "54px", flexShrink: 0 }}>
          <KeyIcon color="#4f46e5" size={26} />
        </div>
        <div>
          <h3 style={{ color: "#172033", fontSize: "19px", fontWeight: 900, margin: 0 }}>Secure reset</h3>
          <p style={{ color: "#64748b", fontSize: "14px", fontWeight: 650, lineHeight: 1.45, margin: "8px 0 0" }}>
            Enter your account email and we will send a reset link.
          </p>
        </div>
      </div>
      <NativeAuthField
        label="Email"
        icon="email"
        type="text"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
    </div>
  );

  return (
    <NativeAuthShell
      chip="Account recovery"
      title={resetTitle}
      subtitle={resetSubtitle}
      activeMode="login"
      onModeChange={(mode) => setLocation(mode === "login" ? "/login" : "/register")}
      onBack={() => setLocation("/login")}
      backLabel="Back"
      onSubmit={shellSubmit}
      onPrimaryAction={shellPrimaryAction}
      primaryLabel={shellPrimaryLabel}
      isSubmitting={isSubmitting}
      footer={
        <>
          {!resetComplete && !isSuccess && isResetMode && !resetToken && (
            <button
              type="button"
              onClick={() => setIsResetMode(false)}
              style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", font: "inherit", fontWeight: 700, padding: 0 }}
            >
              Back to reset request
            </button>
          )}
          <div style={{ marginTop: !resetComplete && !isSuccess && isResetMode && !resetToken ? "24px" : 0 }}>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              style={{ background: "transparent", border: "none", color: "#4f46e5", cursor: "pointer", font: "inherit", fontWeight: 700, padding: 0 }}
            >
              Remembered it? Back to sign in
            </button>
          </div>
          <div style={{ marginTop: "28px" }}>Your existing cards stay exactly as they are.</div>
        </>
      }
    >
      {resetContent}
    </NativeAuthShell>
  );
}
