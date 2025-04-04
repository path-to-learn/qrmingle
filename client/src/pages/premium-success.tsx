import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumSuccess() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Refresh user data to get updated premium status
    const refreshUserData = async () => {
      try {
        if (user) {
          // Simulate a login to refresh the user data
          await loginMutation.mutateAsync({
            username: user.username,
            password: "" // Using the special case we added to the server
          });
          
          toast({
            title: "Premium Activated",
            description: "Your account has been upgraded to premium!",
          });
        }
      } catch (error) {
        console.error("Failed to refresh user data", error);
        // Even if refresh fails, we still want to show success
        toast({
          title: "Premium Activated",
          description: "Your account has been upgraded to premium! Please log out and log back in to see all premium features.",
        });
      }
    };

    refreshUserData();
  }, [user, loginMutation, toast]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your payment was successful and your premium features are now active.
        </p>
        
        {loginMutation.isPending ? (
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Activating premium features...</span>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">
              You can now enjoy all premium features including custom QR codes, advanced analytics, and more!
            </p>
            <div className="flex flex-col space-y-3">
              <Button onClick={() => setLocation("/")}>
                Go to My Profiles
              </Button>
              <Button variant="outline" onClick={() => setLocation("/analytics")}>
                View Analytics
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}