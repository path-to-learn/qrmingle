import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VideoUploader } from "@/components/ui/video-uploader";
import { isAdmin, getTutorialVideo } from "@/lib/video";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewsAdmin from "@/components/reviews/ReviewsAdmin";
import GlobalAnalytics from "@/components/analytics/GlobalAnalytics";

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
              <GlobalAnalytics />
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