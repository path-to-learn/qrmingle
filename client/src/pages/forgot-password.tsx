import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { ArrowLeftIcon, MailIcon } from "lucide-react";

export default function ForgotPassword() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the API to request password reset
      const response = await apiRequest("POST", "/api/forgot-password", { email });
      const data = await response.json();
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: "Success",
        description: "Password reset instructions have been sent to your email if an account exists with this address.",
      });
    } catch (error) {
      console.error("Password reset request failed:", error);
      toast({
        title: "Error",
        description: "Failed to send password reset instructions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSuccess ? "Check Your Email" : "Forgot Password"}</CardTitle>
          <CardDescription>
            {isSuccess 
              ? "If an account exists with that email address, we have sent you instructions to reset your password." 
              : "Enter your email address and we'll send you instructions to reset your password."}
          </CardDescription>
        </CardHeader>
        
        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
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
                  <>Sending Instructions...</>
                ) : (
                  <>
                    <MailIcon className="mr-2 h-4 w-4" />
                    Send Reset Instructions
                  </>
                )}
              </Button>
              <Link href="/login" className="text-sm text-center text-muted-foreground mt-2 hover:underline flex items-center justify-center">
                <ArrowLeftIcon className="mr-1 h-3 w-3" /> Back to Login
              </Link>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg flex items-center border border-primary/20">
              <MailIcon className="h-5 w-5 text-primary mr-3" />
              <p className="text-sm">
                We've sent instructions to <strong>{email}</strong> if this account exists in our system.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              If you don't receive an email within a few minutes, please check your spam folder
              or make sure you entered the correct email address.
            </p>
            <Button 
              onClick={() => setLocation("/login")} 
              className="w-full mt-4" 
              variant="outline"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Return to Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}