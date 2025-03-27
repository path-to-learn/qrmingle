import { useState } from "react";
import { useAuth } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Loader2 } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7days");

  // Fetch user profiles
  const {
    data: profiles,
    isLoading: isLoadingProfiles,
  } = useQuery({
    queryKey: [`/api/profiles?userId=${user?.id}`],
    enabled: !!user,
  });

  // Fetch analytics for selected profile
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
  } = useQuery({
    queryKey: [`/api/analytics/profile/${selectedProfile}`],
    enabled: !!selectedProfile,
  });

  // Helper function to process data for charts
  const processChartData = () => {
    if (!analytics) return { scanData: [], deviceData: [], locationData: [] };

    const scansByDate = analytics.scansByDate || {};
    const deviceDistribution = analytics.deviceDistribution || {};
    const locationDistribution = analytics.locationDistribution || {};

    // Process scan data for area chart
    const scanData = Object.keys(scansByDate).map((date) => ({
      date,
      scans: scansByDate[date],
    }));

    // Sort by date
    scanData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Process device data for pie chart
    const deviceData = Object.keys(deviceDistribution).map((device) => ({
      name: device,
      value: deviceDistribution[device],
    }));

    // Process location data for bar chart
    const locationData = Object.keys(locationDistribution || {}).map((location) => ({
      name: location || "Unknown",
      value: locationDistribution[location],
    }));

    // Sort location data by value in descending order
    locationData.sort((a, b) => b.value - a.value);

    return { scanData, deviceData, locationData };
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const { scanData, deviceData, locationData } = processChartData();

  // Colors for the pie chart
  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <p className="text-muted-foreground mb-6">
          Please log in to view your profile analytics
        </p>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">QR Code Analytics</h2>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-4 sm:mb-0">
            <h3 className="font-semibold">Select Profile</h3>
            <Select
              value={selectedProfile || ""}
              onValueChange={(value) => setSelectedProfile(value)}
              disabled={isLoadingProfiles}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent>
                {profiles?.map((profile: any) => (
                  <SelectItem key={profile.id} value={profile.id.toString()}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedProfile && (
            <div>
              <Select
                value={timeRange}
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {!selectedProfile ? (
          <div className="h-64 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>Select a profile to view scan activity</p>
            </div>
          </div>
        ) : isLoadingAnalytics ? (
          <div className="h-64 bg-muted/20 rounded-lg p-4 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="activity">Scan Activity</TabsTrigger>
              <TabsTrigger value="devices">Device Types</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="mt-0">
              <div className="h-64 bg-muted/10 rounded-lg p-4">
                {scanData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scanData}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickCount={5}
                        tick={{ fontSize: 12 }}
                      />
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <Tooltip 
                        formatter={(value) => [`${value} scans`, 'Scans']}
                        labelFormatter={formatDate}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="scans" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorScans)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No scan data available
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="devices" className="mt-0">
              <div className="h-64 bg-muted/10 rounded-lg p-4">
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No device data available
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="locations" className="mt-0">
              <div className="h-64 bg-muted/10 rounded-lg p-4">
                {locationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationData.slice(0, 7)} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                      <Bar 
                        dataKey="value" 
                        fill="#8B5CF6"
                        background={{ fill: '#eee' }}
                        animationDuration={500}
                        label={{ position: 'right', formatter: (val) => val }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No location data available
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {isLoadingAnalytics ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary inline" />
              ) : (
                analytics?.totalScans || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProfile ? (
              <div className="text-muted-foreground text-sm">Select a profile</div>
            ) : isLoadingProfiles || isLoadingAnalytics ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <>
                <div className="text-lg font-semibold">
                  {profiles?.find((p: any) => p.id.toString() === selectedProfile)?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {analytics?.totalScans || 0} scans
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Device</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProfile ? (
              <div className="text-muted-foreground text-sm">Select a profile</div>
            ) : isLoadingAnalytics ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : deviceData.length > 0 ? (
              <>
                <div className="text-lg font-semibold">
                  {deviceData.sort((a, b) => b.value - a.value)[0]?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round((deviceData.sort((a, b) => b.value - a.value)[0]?.value / analytics.totalScans) * 100)}% of scans
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Location</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedProfile ? (
              <div className="text-muted-foreground text-sm">Select a profile</div>
            ) : isLoadingAnalytics ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : locationData.length > 0 ? (
              <>
                <div className="text-lg font-semibold">
                  {locationData[0]?.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {locationData[0]?.value} scans
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth summary section */}
      {selectedProfile && !isLoadingAnalytics && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Growth Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scan Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {scanData.length > 0 ? (
                    <span>Your QR code was scanned on {scanData.length} different days</span>
                  ) : (
                    <span>No scan activity recorded yet</span>
                  )}
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, scanData.length * 3)}%`,
                        transition: 'width 0.5s ease-in-out'
                      }} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Device Diversity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {deviceData.length > 0 ? (
                    <span>Your QR code was scanned on {deviceData.length} different device types</span>
                  ) : (
                    <span>No device data recorded yet</span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1 mt-4">
                  {COLORS.map((color, index) => (
                    index < deviceData.length ? (
                      <div 
                        key={index}
                        className="h-3 rounded-sm" 
                        style={{ backgroundColor: color }}
                      />
                    ) : (
                      <div 
                        key={index}
                        className="h-3 rounded-sm bg-muted" 
                      />
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
