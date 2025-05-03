import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CountryVisitorsGrid from "./CountryVisitorsGrid";
import { isAdmin } from "@/lib/video";
import { useAuth } from "@/hooks/use-auth";

interface CountryData {
  country: string;
  countryCode: string;
  visitors: number;
}

interface GlobalAnalyticsData {
  totalScans: number;
  totalProfiles: number;
  totalUsers: number;
  profileScans: { id: number, name: string, scans: number }[];
  deviceDistribution: Record<string, number>;
  browserDistribution: Record<string, number>;
  osDistribution: Record<string, number>;
  countryData: CountryData[];
}

export default function GlobalAnalytics() {
  const { user } = useAuth();

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery<GlobalAnalyticsData>({
    queryKey: ["/api/admin/global-analytics"],
    enabled: isAdmin(user),
  });

  if (!isAdmin(user)) {
    return (
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Global Analytics</CardTitle>
          <CardDescription>
            This feature is only available to administrators.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Global Analytics</CardTitle>
          <CardDescription>Loading global data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !analyticsData) {
    return (
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Global Analytics</CardTitle>
          <CardDescription>
            Error loading global analytics data. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Global Analytics</CardTitle>
        <CardDescription>
          View global statistics across all user profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{analyticsData.totalUsers}</CardTitle>
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{analyticsData.totalProfiles}</CardTitle>
              <CardDescription>Total Profiles</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{analyticsData.totalScans}</CardTitle>
              <CardDescription>Total QR Scans</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="countries">
          <TabsList className="mb-4">
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="browsers">Browsers</TabsTrigger>
            <TabsTrigger value="profiles">Top Profiles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="countries" className="space-y-4">
            <CountryVisitorsGrid countryVisitors={analyticsData.countryData as any} />
          </TabsContent>
          
          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData.deviceDistribution).map(([device, count]) => (
                <Card key={device}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{count}</CardTitle>
                    <CardDescription>{device}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="browsers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsData.browserDistribution).map(([browser, count]) => (
                <Card key={browser}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{count}</CardTitle>
                    <CardDescription>{browser}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="profiles" className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Profile Name</th>
                    <th className="text-right p-2">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.profileScans.map((profile) => (
                    <tr key={profile.id} className="border-b">
                      <td className="p-2">{profile.name}</td>
                      <td className="text-right p-2">{profile.scans}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}