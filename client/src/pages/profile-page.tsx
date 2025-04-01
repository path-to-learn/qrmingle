import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SocialLink from "@/components/profile/SocialLink";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Download, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Copy, 
  Share, 
  UserPlus,
  X
} from "lucide-react";
import { Link } from "wouter";
import { downloadVCard, getVCardDataUrl } from "@/lib/vcard";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Type definition for profile data
type SocialLinkType = {
  id: number;
  platform: string;
  url: string;
  profileId: number;
};

type ProfileData = {
  id: number;
  name: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  photoUrl: string | null;
  qrStyle: string | null;
  qrColor: string | null;
  slug: string;
  scanCount: number;
  socialLinks: SocialLinkType[];
};

export default function ProfilePage() {
  const [_, params] = useRoute("/p/:slug");
  const slug = params?.slug;
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: [`/api/p/${slug}`],
    enabled: !!slug,
  });

  // Mutation for submitting contact form
  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactFormData) => {
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.id,
          ...data,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully!",
      });
      setShowContactForm(false);
      setContactFormData({
        name: "",
        email: "",
        message: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactFormData);
  };

  // Handle contact form input changes
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get vCard data URL for direct linking
  const getVCardUrl = () => {
    if (!profile) return "";
    return getVCardDataUrl(profile, profile.socialLinks);
  };

  // Handle vCard download/add to contacts
  const handleDownloadVCard = () => {
    if (!profile) return;
    
    // On mobile devices, try to open the vCard directly in contacts app
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      // Create the data URL and open it directly
      const dataUrl = getVCardUrl();
      window.location.href = dataUrl;
      
      toast({
        title: "Adding Contact",
        description: "Your contacts app should open to save this contact."
      });
    } else {
      // On desktop, download the vCard file
      downloadVCard(profile, profile.socialLinks);
      
      toast({
        title: "Contact Downloaded",
        description: "Contact information has been saved to your device.",
      });
    }
  };

  // Copy profile URL to clipboard
  const copyProfileUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    
    toast({
      title: "URL Copied",
      description: "Profile link copied to clipboard!",
    });
  };

  // Share profile
  const shareProfile = async () => {
    if (!profile) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName}'s Contact Profile`,
          text: profile.bio || `Connect with ${profile.displayName}`,
          url: window.location.href,
        });
      } catch (err) {
        copyProfileUrl();
      }
    } else {
      copyProfileUrl();
    }
  };

  // Log the scan (would normally be done server-side)
  useEffect(() => {
    // Get location for analytics
    const getLocation = async () => {
      try {
        // In a real app, this would be done server-side
        // Logging scan would be part of the initial profile fetch
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    if (profile) {
      getLocation();
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-light to-primary" />
          <CardContent className="relative p-6">
            <div className="flex flex-col items-center -mt-16 mb-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-48 mt-4" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
            
            <div className="space-y-4 mt-8">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto text-center p-6">
        <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  // Determine background color based on profile name
  const getBgGradient = (name: string) => {
    switch (name.toLowerCase()) {
      case 'professional':
        return 'from-blue-400 to-blue-600';
      case 'social':
        return 'from-green-400 to-green-600';
      case 'personal':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-primary-light to-primary';
    }
  };

  return (
    <div className="max-w-md mx-auto mb-10">
      <Card className="overflow-hidden shadow-lg">
        <div className={`h-32 bg-gradient-to-r ${getBgGradient(profile.name)}`} />
        
        <CardContent className="relative p-6">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
              {profile.photoUrl ? (
                <AvatarImage src={profile.photoUrl} alt={profile.displayName} />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <h1 className="text-2xl font-bold mt-4">{profile.displayName}</h1>
            {profile.title && (
              <p className="text-muted-foreground">{profile.title}</p>
            )}
          </div>

          {profile.bio && (
            <div className="mb-6">
              <p className="text-muted-foreground text-center">{profile.bio}</p>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    className="rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={handleDownloadVCard}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Save Contact
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ? 
                    "Add to your device's contacts" : 
                    "Download contact as vCard (.vcf)"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Sheet>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Me
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send a message to {profile.displayName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Send a Message</SheetTitle>
                  <SheetDescription>
                    Leave your contact information and a message for {profile.displayName}.
                  </SheetDescription>
                </SheetHeader>
                
                <form onSubmit={handleContactSubmit} className="space-y-4 mt-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <Input 
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={contactFormData.name}
                      onChange={handleContactInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">Your Email</label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={contactFormData.email}
                      onChange={handleContactInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea 
                      id="message"
                      name="message"
                      placeholder="Enter your message"
                      value={contactFormData.message}
                      onChange={handleContactInputChange}
                      required
                      className="mt-1 h-24"
                    />
                  </div>
                  
                  <SheetFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Sending...
                        </>
                      ) : "Send Message"}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>

          {/* QR Code with actions */}
          <div className="flex flex-col items-center mb-6 bg-muted/10 p-4 rounded-lg">
            <QrCodeDisplay
              value={window.location.href}
              fgColor={profile.qrColor || "#3B82F6"}
              size={150}
              qrStyle={profile.qrStyle || "basic"}
            />
            
            <div className="flex justify-center gap-2 mt-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyProfileUrl}
                className="text-xs text-muted-foreground"
              >
                <Copy className="h-3 w-3 mr-1" />
                {isCopied ? "Copied!" : "Copy Link"}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={shareProfile}
                className="text-xs text-muted-foreground"
              >
                <Share className="h-3 w-3 mr-1" />
                Share
              </Button>
            </div>
          </div>

          {/* Social links section */}
          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <Card className="border-none shadow-none">
              <CardHeader className="px-0 pt-0 pb-2">
                <CardTitle className="text-base font-medium">Connect with me</CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-1 space-y-2">
                {profile.socialLinks.map((link: any) => (
                  <SocialLink 
                    key={link.id}
                    platform={link.platform}
                    url={link.url}
                    className="border-muted/40 hover:bg-muted/20"
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <div className="text-center mt-8 text-xs text-muted-foreground">
            <p>Created with ContactQrConnect</p>
            <Link href="/">
              <span className="text-primary hover:underline">Create your own QR profile</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
