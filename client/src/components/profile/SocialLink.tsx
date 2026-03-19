// Removing unused import
import {
  FaLinkedin,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaGithub,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaTelegram,
  FaGlobe,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

type SocialLinkProps = {
  platform: string;
  url: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function SocialLink({ platform, url, className = "", style }: SocialLinkProps) {
  // Check if this is a custom QR code URL
  const isCustomQrCode = url.startsWith('qrCodeImage:');
  
  // Format the URL based on the platform
  const formatUrl = (platform: string, url: string) => {
    // If this is a custom QR code, we'll handle it specially in the render
    if (isCustomQrCode) return "#";
    if (!url) return "#";

    switch (platform.toLowerCase()) {
      case "email":
        return url.startsWith("mailto:") ? url : `mailto:${url}`;
      case "phone":
        return url.startsWith("tel:") ? url : `tel:${url}`;
      case "website":
        return url.startsWith("http") ? url : `https://${url}`;
      case "linkedin":
        return url.includes("linkedin.com") ? url : `https://linkedin.com/in/${url}`;
      case "twitter":
        return url.includes("twitter.com") ? url : `https://twitter.com/${url}`;
      case "facebook":
        return url.includes("facebook.com") ? url : `https://facebook.com/${url}`;
      case "instagram":
        return url.includes("instagram.com") ? url : `https://instagram.com/${url}`;
      case "github":
        return url.includes("github.com") ? url : `https://github.com/${url}`;
      case "youtube":
        return url.includes("youtube.com") ? url : `https://youtube.com/${url}`;
      case "tiktok":
        return url.includes("tiktok.com") ? url : `https://tiktok.com/@${url}`;
      case "whatsapp":
        return url.startsWith("https://wa.me/") ? url : `https://wa.me/${url}`;
      case "telegram":
        return url.startsWith("https://t.me/") ? url : `https://t.me/${url}`;
      default:
        return url.startsWith("http") ? url : `https://${url}`;
    }
  };

  // Get the appropriate icon for the platform
  const getIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "linkedin":
        return <FaLinkedin className="w-5 h-5" />;
      case "facebook":
        return <FaFacebook className="w-5 h-5" />;
      case "twitter":
        return <FaTwitter className="w-5 h-5" />;
      case "instagram":
        return <FaInstagram className="w-5 h-5" />;
      case "github":
        return <FaGithub className="w-5 h-5" />;
      case "youtube":
        return <FaYoutube className="w-5 h-5" />;
      case "tiktok":
        return <FaTiktok className="w-5 h-5" />;
      case "whatsapp":
        return <FaWhatsapp className="w-5 h-5" />;
      case "telegram":
        return <FaTelegram className="w-5 h-5" />;
      case "website":
        return <FaGlobe className="w-5 h-5" />;
      case "phone":
        return <FaPhone className="w-5 h-5" />;
      case "email":
        return <FaEnvelope className="w-5 h-5" />;
      default:
        return <FaGlobe className="w-5 h-5" />;
    }
  };

  const formattedUrl = formatUrl(platform, url);
  const qrCodeImageUrl = isCustomQrCode ? url.replace('qrCodeImage:', '') : null;

  return (
    <a
      href={formattedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors ${className}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full">
        <div className="flex-shrink-0 mr-3 text-primary">
          {isCustomQrCode ? (
            <div className="w-10 h-10 rounded overflow-hidden">
              <img 
                src={qrCodeImageUrl!}
                alt={`${platform} QR Code`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            getIcon(platform)
          )}
        </div>
        <div className="flex-grow max-w-[70%]">
          <p className="font-medium text-sm">{platform}</p>
          {isCustomQrCode ? (
            <p className="text-xs text-muted-foreground">Custom QR code</p>
          ) : (
            <p className="text-xs text-muted-foreground truncate">{url}</p>
          )}
        </div>
        <div className="flex-shrink-0 ml-3 w-5"></div> {/* This empty div creates balanced spacing */}
      </div>
    </a>
  );
}
