import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, UserPlus, Share, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { saveToContacts, isMobileDevice } from "@/lib/vcard";
import { useToast } from "@/hooks/use-toast";
import { SocialLink } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

type ProfileCardProps = {
  id: number;
  name: string;
  displayName: string;
  title?: string;
  photoUrl?: string;
  photoSize?: number;
  qrStyle?: string;
  qrColor?: string;
  qrSize?: number;
  qrPosition?: string;
  photoPosition?: string;
  layoutStyle?: string;
  slug: string;
  scanCount: number;
  socialLinks: SocialLink[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function ProfileCard({
  id,
  name,
  displayName,
  title,
  photoUrl,
  photoSize = 120,
  qrStyle,
  qrColor,
  qrSize = 150,
  qrPosition = "bottom",
  photoPosition = "top",
  layoutStyle = "standard",
  slug,
  scanCount,
  socialLinks,
  onEdit,
  onDelete,
}: ProfileCardProps) {
  const { toast } = useToast();
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/p/${slug}`;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Map platform to background color class
  const getBgColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'professional':
        return 'bg-gradient-to-r from-blue-100 to-blue-300';
      case 'social':
        return 'bg-gradient-to-r from-green-100 to-green-300';
      case 'personal':
        return 'bg-gradient-to-r from-purple-100 to-purple-300';
      default:
        return 'bg-gradient-to-r from-sky-100 to-sky-300';
    }
  };

  // Handle saving the contact to the device
  const handleSaveContact = async () => {
    try {
      // Create a profile-like object with the necessary fields for vCard
      const profileData = {
        id,
        name,
        displayName,
        title,
        photoUrl,
        slug,
      };
      
      // Save the contact to the device
      await saveToContacts(profileData, socialLinks);
      
      // Show appropriate toast message based on device
      if (isMobileDevice()) {
        toast({
          title: "Adding to Contacts",
          description: "Follow the prompts to save this contact to your phone."
        });
      } else {
        toast({
          title: "Contact Downloaded",
          description: "Contact information has been saved as a vCard file you can import."
        });
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({
        title: "Error",
        description: "There was a problem saving this contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`p-4 ${getBgColor(name)}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-blue-900">{name}</h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-900 hover:text-blue-900 hover:bg-white/20"
                onClick={() => onEdit(id)}
              >
                <Pencil className="h-5 w-5" />
                <span className="sr-only">Edit profile</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-blue-900 hover:text-blue-900 hover:bg-white/20"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Delete profile</span>
              </Button>
            </div>
          </div>
        </div>

        <CardContent className={`p-4 ${layoutStyle === "compact" ? "space-y-2" : "space-y-4"}`}>
          {/* Layout with conditional rendering based on photoPosition */}
          {photoPosition !== "hidden" && (
            <div className={`
              ${photoPosition === "top" ? "flex flex-col items-center text-center" : 
                photoPosition === "left" ? "flex items-center" : 
                photoPosition === "right" ? "flex flex-row-reverse items-center" : "hidden"}
              ${layoutStyle === "compact" ? "mb-2" : "mb-4"}
            `}>
              {(photoPosition === "left" || photoPosition === "right") ? (
                <>
                  <Avatar 
                    className={`${photoPosition === "left" ? "mr-4" : "ml-4"}`}
                    style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
                  >
                    {photoUrl ? (
                      <AvatarImage src={photoUrl} alt={`${displayName}'s profile`} />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className={photoPosition === "right" ? "text-right" : ""}>
                    <h3 className="font-semibold">{displayName}</h3>
                    {title && <p className="text-sm text-muted-foreground">{title}</p>}
                  </div>
                </>
              ) : (
                <>
                  <Avatar 
                    className="mb-3"
                    style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
                  >
                    {photoUrl ? (
                      <AvatarImage src={photoUrl} alt={`${displayName}'s profile`} />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{displayName}</h3>
                    {title && <p className="text-sm text-muted-foreground">{title}</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Display photo info even if photo is hidden */}
          {photoPosition === "hidden" && (
            <div className={`text-center ${layoutStyle === "compact" ? "mb-2" : "mb-4"}`}>
              <h3 className="font-semibold text-lg">{displayName}</h3>
              {title && <p className="text-sm text-muted-foreground">{title}</p>}
            </div>
          )}

          {socialLinks && socialLinks.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${socialLinks.length === 1 ? "justify-center" : ""} ${layoutStyle === "compact" ? "mb-2" : "mb-4"}`}>
              {socialLinks.map((link) => (
                <Badge key={link.id} variant="secondary" className="text-xs">
                  {link.platform}
                </Badge>
              ))}
            </div>
          )}

          {/* QR Code display based on position */}
          {qrPosition === "top" && (
            <div className="flex justify-center mb-4">
              <QrCodeDisplay 
                value={profileUrl}
                fgColor={qrColor || "#3B82F6"}
                profileName={name}
                scanCount={scanCount}
                size={qrSize || 150}
                qrStyle={qrStyle}
              />
            </div>
          )}

          {(qrPosition === "left" || qrPosition === "right") && (
            <div className={`flex ${qrPosition === "right" ? "justify-end" : "justify-start"} mb-4`}>
              <QrCodeDisplay 
                value={profileUrl}
                fgColor={qrColor || "#3B82F6"}
                profileName={name}
                scanCount={scanCount}
                size={qrSize || 150}
                qrStyle={qrStyle}
              />
            </div>
          )}
          
          {qrPosition === "bottom" && (
            <div className="flex justify-center mb-4">
              <QrCodeDisplay 
                value={profileUrl}
                fgColor={qrColor || "#3B82F6"}
                profileName={name}
                scanCount={scanCount}
                size={qrSize || 150}
                qrStyle={qrStyle}
              />
            </div>
          )}
          
          <div className="flex flex-col space-y-2 mt-4">
            {/* Save Contact Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                    onClick={handleSaveContact}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isMobileDevice() ? "Add to Contacts" : "Save Contact"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMobileDevice() ? 
                    "Save directly to your phone contacts" : 
                    "Download contact as vCard (.vcf)"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Add Preview Button */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview as others see it
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Preview: {displayName}'s Profile</DialogTitle>
                  <DialogDescription>
                    This is how your profile appears to others when they scan your QR code
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="flex flex-col items-center mb-6">
                    {photoUrl && (
                      <Avatar 
                        className="mb-4"
                        style={{ width: `${photoSize}px`, height: `${photoSize}px` }}
                      >
                        <AvatarImage src={photoUrl} alt={`${displayName}'s profile`} />
                        <AvatarFallback className="text-xl">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <h2 className="text-2xl font-bold">{displayName}</h2>
                    {title && <p className="text-muted-foreground mt-1">{title}</p>}
                  </div>
                  
                  {socialLinks && socialLinks.length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h3 className="text-lg font-semibold">Connect with {displayName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {socialLinks.map((link) => (
                          <a 
                            key={link.id} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg border px-3 py-2 hover:bg-muted"
                          >
                            <Badge variant="outline" className="mr-2">
                              {link.platform}
                            </Badge>
                            <span className="text-sm truncate max-w-[200px]">{link.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-4">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={handleSaveContact}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isMobileDevice() ? "Add to Contacts" : "Save Contact"}
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Close Preview</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Edit and View Buttons */}
            <div className="flex justify-between gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onEdit(id)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Link href={`/p/${slug}`} className="flex-1">
                <Button className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </Link>
            </div>
            
            {/* Share Button */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                // Use Web Share API if available
                if (navigator.share) {
                  navigator.share({
                    title: `${displayName}'s Contact Card`,
                    text: `Check out ${displayName}'s contact card`,
                    url: profileUrl
                  }).catch(err => console.error("Error sharing", err));
                } else {
                  // Copy to clipboard as fallback
                  navigator.clipboard.writeText(profileUrl);
                  toast({
                    title: "Link Copied",
                    description: "Profile link copied to clipboard!"
                  });
                }
              }}
            >
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}