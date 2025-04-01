import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { QrCodeDisplay } from "@/components/ui/qr-code";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";

type SocialLink = {
  id: number;
  platform: string;
  url: string;
};

type ProfileCardProps = {
  id: number;
  name: string;
  displayName: string;
  title?: string;
  photoUrl?: string;
  qrStyle?: string;
  qrColor?: string;
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
  qrStyle,
  qrColor,
  slug,
  scanCount,
  socialLinks,
  onEdit,
  onDelete,
}: ProfileCardProps) {
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/p/${slug}`;
  
  // Map platform to background color class
  const getBgColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'professional':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'social':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      case 'personal':
        return 'bg-gradient-to-r from-purple-400 to-purple-600';
      default:
        return 'bg-gradient-to-r from-primary-light to-primary';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`p-4 text-white ${getBgColor(name)}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={() => onEdit(id)}
            >
              <Pencil className="h-5 w-5" />
              <span className="sr-only">Edit profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-5 w-5" />
              <span className="sr-only">Delete profile</span>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <Avatar className="h-16 w-16 mr-4">
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
        </div>

        {socialLinks && socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {socialLinks.map((link) => (
              <Badge key={link.id} variant="secondary" className="text-xs">
                {link.platform}
              </Badge>
            ))}
          </div>
        )}

        <QrCodeDisplay 
          value={profileUrl}
          fgColor={qrColor || "#3B82F6"}
          className="mb-4"
          profileName={name}
          scanCount={scanCount}
          size={150}
          qrStyle={qrStyle}
        />
        
        <div className="flex justify-between mt-4 gap-2">
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
      </CardContent>
    </Card>
  );
}
