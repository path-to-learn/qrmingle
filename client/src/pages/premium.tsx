import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Palette, BarChart2, LayoutGrid } from "lucide-react";

// Initialize Stripe with public key
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing Stripe public key. Please add VITE_STRIPE_PUBLIC_KEY to your environment variables.');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/premium/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Confirm premium status on the server
        const confirmResponse = await fetch("/api/confirm-premium", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.id,
            paymentIntentId: paymentIntent.id,
          }),
        });
        
        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.message || "Failed to confirm premium status");
        }
        
        toast({
          title: "Payment Successful",
          description: "Thank you for upgrading to premium!",
        });

        // Reload the page to update the user's premium status
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      <Button 
        type="submit" 
        className="w-full bg-accent hover:bg-accent-dark" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : "Upgrade Now - $19.99"}
      </Button>
    </form>
  );
}

export default function Premium() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Create PaymentIntent when the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "Failed to create payment intent");
        }
        
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error("Payment intent error:", error);
        toast({
          title: "Payment Error",
          description: error.message || "Unable to initialize payment. Please try again.",
          variant: "destructive",
        });
      }
    };

    createPaymentIntent();
  }, [user, toast]);

  if (user?.isPremium) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <Crown className="h-16 w-16 text-accent mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">You're a Premium Member!</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your support. You have access to all premium features.
        </p>
        <Button asChild>
          <a href="/">Go to My Profiles</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Upgrade to Premium</h2>
            <p className="text-muted-foreground mt-1">Get more features and customization options</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <Palette className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Custom QR Designs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose from multiple QR code styles, colors, and add your logo to make it stand out.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <BarChart2 className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Advanced Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get detailed insights on when and where your QR codes are scanned with visual reports.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <LayoutGrid className="h-8 w-8 text-accent mb-2" />
              <CardTitle className="text-lg">Multiple Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create unlimited profiles for different purposes with custom landing page themes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Premium Upgrade</CardTitle>
            <CardDescription>
              One-time payment of $19.99 for lifetime access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
