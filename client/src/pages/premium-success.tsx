import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect back to the cards screen after a short delay.
    const timer = setTimeout(() => {
      setLocation("/profiles");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          Your action was completed successfully.
        </p>
        
        <p className="mb-6 text-sm text-gray-500">
          QrMingle Pro is active. Unlimited card profiles, unlimited AI profile-builder usage, analytics, and premium QR styles are unlocked.
        </p>
        <div className="flex flex-col space-y-3">
          <Button onClick={() => setLocation("/profiles")}>
            Go to My Profiles
          </Button>
          <Button variant="outline" onClick={() => setLocation("/analytics")}>
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
