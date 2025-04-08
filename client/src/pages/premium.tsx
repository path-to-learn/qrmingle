import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Palette, BarChart2, LayoutGrid } from "lucide-react";

export default function Premium() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
            <h2 className="text-xl font-bold">QrMingle Premium - Coming Soon</h2>
            <p className="text-muted-foreground mt-1">
              Premium features are currently available for free to all users!
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 mb-8 rounded-md">
          <div className="flex items-start">
            <div className="text-amber-600 mr-3 flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-700 font-medium mb-1">Good news!</p>
              <p className="text-amber-700">
                For a limited time, we've made all premium features available to all users. You can create up to 3 profiles and access all customization options, analytics, and other premium features for free. Premium subscriptions will be available in the future as our user base grows.
              </p>
            </div>
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
                Create up to 3 profiles for different purposes with custom landing page themes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={() => setLocation("/")} className="px-8">
            Go to My Profiles
          </Button>
        </div>
      </div>
    </>
  );
}
