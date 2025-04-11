import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { PlusIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileFormData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { VideoUploader } from "@/components/ui/video-uploader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { user, isEffectivelyPremium } = useAuth();
  const { toast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Log user state for debugging
  console.log("Home component auth state:", { user, isLoggedIn: !!user });
  useEffect(() => {
    console.log("Home component auth state:", { user, isLoggedIn: !!user });
  }, [user]);

  // Fetch profiles
  const { data: profiles = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/profiles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      console.log("Fetching profiles for user ID:", user.id);
      const response = await fetch(`/api/profiles?userId=${user.id}`);
      
      // Log the response for debugging
      console.log("Profile API response status:", response.status);
      const data = await response.json();
      console.log("Profiles data received:", data);
      
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return data;
    },
    enabled: !!user,
  });

  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      console.log("Starting create profile mutation with data:", data);
      
      if (!user) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }
      
      try {
        const requestData = {
          ...data,
          userId: user.id,
        };
        console.log("Sending profile create request with:", requestData);
        
        const response = await fetch("/api/profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
        
        console.log("Profile creation API response status:", response.status);
        
        const responseData = await response.json();
        console.log("Profile creation API response data:", responseData);
        
        if (!response.ok) {
          // Check if this is a profile limit error
          if (responseData.type === "PROFILE_LIMIT_REACHED") {
            throw new Error(responseData.message, { cause: "PROFILE_LIMIT_REACHED" });
          }
          throw new Error(responseData.message || "Failed to create profile");
        }
        
        return responseData;
      } catch (err) {
        console.error("Error creating profile:", err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log("Profile created successfully");
      toast({
        title: "Profile created successfully",
        description: "Your new profile is ready to share!",
      });
      refetch();
      setShowEditor(false);
    },
    onError: (error: any) => {
      console.error("Profile creation error:", error);
      
      // Show upgrade dialog if profile limit is reached
      if (error.cause === "PROFILE_LIMIT_REACHED") {
        setShowEditor(false);
        setShowUpgradeDialog(true);
        return;
      }
      
      toast({
        title: "Failed to create profile",
        description: error.message || "An error occurred while creating your profile.",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProfileFormData }) => {
      return apiRequest("PUT", `/api/profiles/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your profile changes have been saved.",
      });
      refetch();
      setShowEditor(false);
      setEditingProfileId(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Profile deleted",
        description: "Your profile has been permanently removed.",
      });
      refetch();
      setProfileToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNewProfile = () => {
    setEditingProfileId(null);
    setShowEditor(true);
  };

  const handleEditProfile = (id: number) => {
    setEditingProfileId(id);
    setShowEditor(true);
  };

  const handleProfileSubmit = (data: ProfileFormData) => {
    if (editingProfileId) {
      updateProfile.mutate({ id: editingProfileId, data });
    } else {
      createProfile.mutate(data);
    }
  };

  const handleDeleteProfile = (id: number) => {
    setProfileToDelete(id);
  };

  const confirmDeleteProfile = () => {
    if (profileToDelete) {
      deleteProfile.mutate(profileToDelete);
    }
  };

  const cancelEditor = () => {
    setShowEditor(false);
    setEditingProfileId(null);
  };

  // Get the profile being edited
  const editingProfile = editingProfileId
    ? profiles?.find((p: any) => p.id === editingProfileId)
    : undefined;

  // Add debugging to see what's going on with the user
  console.log("Auth state:", { user });

  const [tutorialVideoUrl, setTutorialVideoUrl] = useState<string | null>(null);
  
  const handleVideoUploaded = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    toast({
      title: "Video uploaded",
      description: "Your tutorial video has been uploaded and is now visible to users",
    });
  };
  
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left column - Video tutorial */}
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-3">How QrMingle Works</h2>
            <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-video mb-4">
              {tutorialVideoUrl ? (
                <video 
                  controls
                  className="w-full h-full object-cover"
                  poster="/video-thumbnail.jpg"
                >
                  <source src={tutorialVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 bg-gray-100">
                  <VideoUploader 
                    onVideoUploaded={handleVideoUploaded} 
                    className="h-full"
                  />
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
    );
  }

  return (
    <>
      {/* Video tutorial section for logged-in users */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">How QrMingle Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video player/uploader */}
          <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-video">
            {tutorialVideoUrl ? (
              <video 
                controls
                className="w-full h-full object-cover"
                poster="/video-thumbnail.jpg"
              >
                <source src={tutorialVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 bg-gray-100">
                <VideoUploader 
                  onVideoUploaded={handleVideoUploaded} 
                  className="h-full"
                />
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div>
            <h3 className="font-medium text-lg mb-3">Quick Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs mt-0.5">1</div>
                <p className="ml-3 text-sm">Create a profile with your contact information and social links</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs mt-0.5">2</div>
                <p className="ml-3 text-sm">Customize your QR code style, colors, and size to match your brand</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs mt-0.5">3</div>
                <p className="ml-3 text-sm">Share your QR code at networking events, conferences, or on your business cards</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs mt-0.5">4</div>
                <p className="ml-3 text-sm">Track who scans your code with detailed analytics on devices, locations and times</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* My QR Profiles section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">My QR Profiles</h1>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <p className="text-muted-foreground">
            Create and manage your contact profiles with custom QR codes
          </p>
          <Button onClick={handleNewProfile}>
            <PlusIcon className="mr-2 h-5 w-5" />
            Create New Profile
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-muted rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles?.map((profile: any) => (
              <ProfileCard
                key={profile.id}
                {...profile}
                onEdit={handleEditProfile}
                onDelete={handleDeleteProfile}
              />
            ))}

            <div
              className="border border-dashed border-muted-foreground rounded-lg flex items-center justify-center p-8 hover:border-primary cursor-pointer transition-colors"
              onClick={handleNewProfile}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <PlusIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">
                  Create New Profile
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a new contact profile
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showEditor && (
        <ProfileEditor
          profileData={editingProfile}
          onSubmit={handleProfileSubmit}
          onCancel={cancelEditor}
          isEditing={!!editingProfileId}
          isPremium={isEffectivelyPremium()}
        />
      )}

      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              profile and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProfile} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Profile limit reached dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Profile Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              You have reached the current limit of 3 profiles. To create more space, try deleting profiles you no longer need. Additional profiles will be available in future premium plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Got It</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
