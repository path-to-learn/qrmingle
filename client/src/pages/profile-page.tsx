import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SocialLink from "@/components/profile/SocialLink";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProfilePage() {
  const [_, params] = useRoute("/p/:slug");
  const slug = params?.slug;

  // Fetch profile data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: [`/api/p/${slug}`],
    enabled: !!slug,
  });

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
    <div className="max-w-md mx-auto">
      <Card className="overflow-hidden">
        <div className={`h-32 bg-gradient-to-r ${getBgGradient(profile.name)}`} />
        
        <CardContent className="relative p-6">
          <div className="flex flex-col items-center -mt-16 mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-background">
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

          <div className="flex justify-center mb-6">
            <QrCodeDisplay
              value={window.location.href}
              fgColor={profile.qrColor || "#3B82F6"}
              size={150}
            />
          </div>

          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg mb-2">Connect with me</h2>
              {profile.socialLinks.map((link: any) => (
                <SocialLink 
                  key={link.id}
                  platform={link.platform}
                  url={link.url}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8 text-xs text-muted-foreground">
            <p>Created with ContactQrConnect</p>
            <Link href="/">
              <a className="text-primary hover:underline">Create your own QR profile</a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
