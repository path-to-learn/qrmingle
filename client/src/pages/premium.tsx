import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Palette, BarChart2, LayoutGrid } from "lucide-react";

export default function Premium() {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">QrMingle Features</h2>
            <p className="text-muted-foreground mt-1">
              All features are currently available for free to all users!
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 mb-8 rounded-md">
          <div className="flex items-start">
            <div className="text-blue-600 mr-3 flex-shrink-0 mt-1">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <p className="text-blue-700 font-medium mb-1">Everything is included!</p>
              <p className="text-blue-700">
                We've made all features available to all users. You can create up to 3 profiles and access all customization options, analytics, and other features for free. Premium subscriptions may be available in the future as our user base grows.
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
