import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Info, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { VideoUploader } from "@/components/ui/video-uploader";
import { isAdmin, getTutorialVideo } from "@/lib/video";
import { useToast } from "@/hooks/use-toast";
import ReviewsSection from "@/components/reviews/ReviewsSection";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Redirect logged-in users to profiles dashboard
  useEffect(() => {
    if (user) {
      navigate('/profiles');
    }
  }, [user, navigate]);

  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  // Initialize video and make sure it's unmuted on load
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [videoRef, isMuted]);
  
  // Toggle video play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute/unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main app info section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column - Video tutorial */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-3">How QrMingle Works</h2>
            <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-video mb-4">
              {isVideoLoading ? (
                // Loading state
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : tutorialVideoUrl ? (
                // Video player with limited controls - autoplay, muted, and no fullscreen
                <div className="relative w-full h-full">
                  <video 
                    ref={videoRef}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    className="w-full h-full object-cover"
                    poster="/video-thumbnail.svg"
                  >
                    <source src={tutorialVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom play/pause control */}
                  <button 
                    onClick={togglePlayPause}
                    className="absolute left-4 bottom-4 bg-primary/75 hover:bg-primary p-2 rounded-full text-white transition-colors"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Custom mute/unmute control */}
                  <button 
                    onClick={toggleMute}
                    className="absolute right-4 bottom-4 bg-primary/75 hover:bg-primary p-2 rounded-full text-white transition-colors"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ) : (
                // Message when no video exists
                <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                  <Info className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-gray-600 mb-1">Tutorial video coming soon</h3>
                  <p className="text-sm text-gray-500">
                    Our team is working on creating a helpful tutorial video.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">1</div>
                <p className="ml-3 text-sm">Sign up for a free account</p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">2</div>
                <p className="ml-3 text-sm">Create your personal or professional profile</p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">3</div>
                <p className="ml-3 text-sm">Share your custom QR code with new connections</p>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">4</div>
                <p className="ml-3 text-sm">They can instantly save your contact info with one scan</p>
              </div>
            </div>
          </div>
          
          {/* Right column - Welcome message and buttons */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to QrMingle</h1>
            <p className="text-muted-foreground mb-6">
              The easiest way to share your contact information at networking events, conferences, and meetings
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <a href="/register" className="w-full sm:w-auto">
                <Button className="w-full">Sign Up</Button>
              </a>
              <a href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">Log In</Button>
              </a>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <h3 className="font-medium mb-2">Available Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Up to 3 profiles</li>
                <li>✓ Custom QR code styles</li>
                <li>✓ Detailed scan analytics</li>
                <li>✓ VCard generation</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Premium plans with additional features coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User reviews section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">What Our Users Say</h2>
        <div className="max-w-3xl mx-auto">
          <ReviewsSection />
        </div>
      </div>
    </div>
  );
}