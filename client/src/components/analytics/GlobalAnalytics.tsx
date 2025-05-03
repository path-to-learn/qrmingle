import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CountryVisitorsGrid from "./CountryVisitorsGrid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

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

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#6366F1'];

export default function GlobalAnalytics() {
  const { data: analytics, isLoading } = useQuery<GlobalAnalyticsData>({
    queryKey: ['/api/admin/global-analytics'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Process data for charts
  const profileData = analytics.profileScans.sort((a, b) => b.scans - a.scans).slice(0, 10);
  
  const deviceData = Object.entries(analytics.deviceDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }));
  
  const browserData = Object.entries(analytics.browserDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }));
  
  const osData = Object.entries(analytics.osDistribution || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.totalScans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.totalProfiles}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 h-auto gap-4">
          <TabsTrigger value="profiles" className="px-4 py-2">Top Profiles</TabsTrigger>
          <TabsTrigger value="devices" className="px-4 py-2">Devices</TabsTrigger>
          <TabsTrigger value="software" className="px-4 py-2">Browsers & OS</TabsTrigger>
          <TabsTrigger value="countries" className="px-4 py-2">Countries</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="profiles" className="mt-0">
            <div className="bg-muted/10 rounded-lg p-4 h-[400px]">
              {profileData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profileData} layout="vertical" margin={{ left: 160 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={160}
                    />
                    <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                    <Bar 
                      dataKey="scans" 
                      fill="#3B82F6"
                      background={{ fill: '#eee' }}
                      animationDuration={500}
                      label={{ position: 'right', formatter: (val: number) => val }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No profile data available
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="devices" className="mt-0">
            <div className="bg-muted/10 rounded-lg p-4 h-[400px]">
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
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
          
          <TabsContent value="software" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Browsers</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {browserData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={browserData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {browserData.map((entry, index) => (
                            <Cell key={`browser-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No browser data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Operating Systems</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {osData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={osData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          {osData.map((entry, index) => (
                            <Cell key={`os-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => [`${value} scans`, 'Scans']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No OS data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="countries" className="mt-0">
            <div className="bg-muted/10 rounded-lg">
              {analytics.countryData && analytics.countryData.length > 0 ? (
                <CountryVisitorsGrid countryData={analytics.countryData} />
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground p-4">
                  No country data available
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}