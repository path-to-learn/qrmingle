import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { VideoUploader } from "@/components/ui/video-uploader";
import { isAdmin, getTutorialVideo } from "@/lib/video";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsAdmin from "@/components/reviews/ReviewsAdmin";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Globe, Users, QrCode, ScanLine } from "lucide-react";


export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  // Check if user is admin
  const userIsAdmin = isAdmin(user);
  
  // Redirect non-admin users
  useEffect(() => {
    if (user && !userIsAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access the admin page",
        variant: "destructive",
      });
      navigate('/');
    } else if (!user) {
      navigate('/login');
    }
  }, [user, userIsAdmin, navigate, toast]);

  // Fetch the current tutorial video on component mount
  useEffect(() => {
    const fetchTutorialVideo = async () => {
      setIsVideoLoading(true);
      try {
        const videoUrl = await getTutorialVideo();
        setTutorialVideoUrl(videoUrl);
      } catch (error) {
        console.error("Error fetching tutorial video:", error);
      } finally {
        setIsVideoLoading(false);
      }
    };
    
    fetchTutorialVideo();
  }, []);
  
  const { data: globalAnalytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: () => apiRequest('GET', '/api/admin/analytics').then(r => r.json()),
    enabled: !!userIsAdmin,
  });

  const handleVideoUploaded = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    toast({
      title: "Video uploaded",
      description: "Your tutorial video has been uploaded and is now visible to all users",
    });
  };

  if (!user || !userIsAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          Welcome, {user.username}. This is the admin dashboard for managing QrMingle site content.
        </p>
        
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 h-auto gap-4">
            <TabsTrigger value="analytics" className="px-4 py-2">Analytics</TabsTrigger>
            <TabsTrigger value="video" className="px-4 py-2">Tutorial Video</TabsTrigger>
            <TabsTrigger value="reviews" className="px-4 py-2">User Reviews</TabsTrigger>
            <TabsTrigger value="settings" className="px-4 py-2">Site Settings</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="analytics" className="mt-0">
              {!globalAnalytics ? (
                <div className="p-8 text-center text-muted-foreground">Loading analytics…</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Summary stat cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {[
                      { icon: ScanLine, label: "Total Scans", value: globalAnalytics.totalScans, color: "#6366f1" },
                      { icon: Users,    label: "Total Users",    value: globalAnalytics.totalUsers,    color: "#10b981" },
                      { icon: QrCode,   label: "Total Profiles", value: globalAnalytics.totalProfiles, color: "#f59e0b" },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} style={{ padding: "16px", background: "white", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={16} style={{ color }} />
                          </div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{label}</span>
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Scan activity over last 30 days */}
                  {(() => {
                    const scanData = Object.entries(globalAnalytics.scansByDate as Record<string, number>)
                      .map(([date, count]) => ({ date: date.slice(5), count }))
                      .sort((a, b) => a.date.localeCompare(b.date));
                    return scanData.length > 0 ? (
                      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #f1f5f9", padding: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b", marginBottom: "14px" }}>Scan Activity — Last 30 Days</div>
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={scanData}>
                            <defs>
                              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#ag)" name="Scans" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null;
                  })()}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    {/* Country breakdown */}
                    {(() => {
                      const countryData = (globalAnalytics.countryData as { country: string; count: number }[]).slice(0, 10);
                      return countryData.length > 0 ? (
                        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #f1f5f9", padding: "16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                            <Globe size={16} style={{ color: "#6366f1" }} />
                            <span style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b" }}>Top Countries</span>
                          </div>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={countryData} layout="vertical" margin={{ left: 60 }}>
                              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                              <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={60} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Scans" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : null;
                    })()}

                    {/* Device distribution */}
                    {(() => {
                      const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#64748b"];
                      const deviceData = Object.entries(globalAnalytics.deviceDistribution as Record<string, number>)
                        .map(([name, value]) => ({ name, value }));
                      return deviceData.length > 0 ? (
                        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #f1f5f9", padding: "16px" }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b", marginBottom: "14px" }}>Devices</div>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  {/* Top profiles */}
                  {(() => {
                    const topProfiles = globalAnalytics.topProfiles as { name: string; slug: string; count: number }[];
                    return topProfiles.length > 0 ? (
                      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #f1f5f9", padding: "16px" }}>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e293b", marginBottom: "12px" }}>Top Profiles by Scans</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {topProfiles.map((p, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <span style={{ width: "20px", textAlign: "right", fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</span>
                              <div style={{ flex: 1, background: "#f8fafc", borderRadius: "8px", padding: "8px 12px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>{p.name}</span>
                                {p.slug && <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "8px" }}>/{p.slug}</span>}
                              </div>
                              <span style={{ fontSize: "14px", fontWeight: 700, color: "#6366f1", minWidth: "40px", textAlign: "right" }}>{p.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="video" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium mb-2">Current Tutorial Video</h3>
                  {isVideoLoading ? (
                    <div className="rounded-lg bg-gray-100 aspect-video flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : tutorialVideoUrl ? (
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                      <video 
                        controls
                        controlsList="nodownload nofullscreen noremoteplayback"
                        disablePictureInPicture
                        className="w-full h-full object-cover"
                        poster="/video-thumbnail.svg"
                      >
                        <source src={tutorialVideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-100 aspect-video flex flex-col items-center justify-center p-6">
                      <p className="text-muted-foreground">No tutorial video has been uploaded yet.</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Upload New Tutorial Video</h3>
                  <div className="rounded-lg border border-dashed p-4">
                    <VideoUploader 
                      onVideoUploaded={handleVideoUploaded}
                      className="h-full"
                    />
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Video specifications:</h4>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                      <li>Format: MP4 (recommended for best compatibility)</li>
                      <li>Resolution: 720p HD (1280x720 pixels)</li>
                      <li>Maximum file size: 50MB</li>
                      <li>Aspect ratio: 16:9 (widescreen)</li>
                      <li>Content: Tutorial showing how to use QrMingle effectively</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-0">
              <ReviewsAdmin />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <div className="p-6 bg-muted/30 rounded-lg text-center">
                <p>Site settings will be available in future updates.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}