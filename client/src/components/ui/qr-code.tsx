import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './button';
import { Loader2, Download, Share2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Define our own QrImageSettings type to avoid conflicts with qrcode.react
type QrImageSettings = {
  src: string;
  x?: number;
  y?: number;
  height: number;
  width: number;
  excavate?: boolean;
};

type QRCodeProps = {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  renderAs?: 'svg' | 'canvas';
  includeMargin?: boolean;
  imageSettings?: QrImageSettings;
  style?: React.CSSProperties;
  className?: string;
  profileName?: string;
  scanCount?: number;
  qrStyle?: 'basic' | 'bordered' | 'gradient' | 'rounded' | 'shadow' | string;
};

export function QrCodeDisplay({
  value,
  size = 128,
  bgColor = '#FFFFFF',
  fgColor = '#3B82F6',
  level = 'L',
  renderAs = 'svg',
  includeMargin = true,
  imageSettings,
  style,
  className,
  profileName,
  scanCount,
  qrStyle = 'basic',
}: QRCodeProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sparklePosition, setSparklePosition] = useState({ x: 0, y: 0 });
  const qrContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => {
        setIsGenerating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [value]);
  
  // Function to randomly position sparkles within the QR code container
  const updateSparklePosition = () => {
    if (qrContainerRef.current) {
      const containerRect = qrContainerRef.current.getBoundingClientRect();
      const maxX = containerRect.width - 20; // Prevent sparkles from going outside container
      const maxY = containerRect.height - 20;
      
      setSparklePosition({
        x: Math.random() * maxX,
        y: Math.random() * maxY
      });
    }
  };
  
  // Set a new sparkle position every second when hovered
  useEffect(() => {
    if (!isHovered) return;
    
    updateSparklePosition();
    const interval = setInterval(updateSparklePosition, 1000);
    
    return () => clearInterval(interval);
  }, [isHovered]);

  const handleDownload = () => {
    // Get the SVG element
    const svgElement = document.getElementById('qr-code');
    if (!svgElement) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to match SVG size
    canvas.width = size;
    canvas.height = size;
    
    // Create a new Image element
    const img = new Image();
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Handle image load
    img.onload = () => {
      // Draw image on canvas with background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${profileName || 'qrcode'}.png`;
      link.href = pngUrl;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(svgUrl);
    };
    
    // Set image source to SVG URL
    img.src = svgUrl;
  };

  const handleShare = async () => {
    // If Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: profileName || 'My QR Code',
          text: 'Check out my contact profile!',
          url: value,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className={`flex flex-col items-center ${className}`} style={style}>
      <div className="bg-neutral-50 p-4 rounded-lg flex justify-center items-center">
        {isGenerating ? (
          <div className="flex items-center justify-center h-32 w-32">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <motion.div 
            className={`relative ${qrStyle !== 'basic' ? 'fancy-qr' : ''}`}
            ref={qrContainerRef}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          >
            {/* Animated effects for premium QR styles */}
            {qrStyle === 'bordered' && (
              <motion.div 
                className="absolute inset-0 rounded-lg" 
                style={{ 
                  border: `2px solid ${fgColor}`,
                  borderRadius: '16px',
                  zIndex: -1,
                  transform: 'scale(1.15)'
                }}
                animate={{
                  boxShadow: isHovered 
                    ? [
                        `0 0 0 ${fgColor}22`,
                        `0 0 10px ${fgColor}44`,
                        `0 0 5px ${fgColor}22`
                      ]
                    : `0 0 0 ${fgColor}00`
                }}
                transition={{
                  duration: 1.5,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse"
                }}
              />
            )}
            
            {qrStyle === 'gradient' && (
              <motion.div 
                className="absolute inset-0 rounded-lg" 
                style={{ 
                  background: `linear-gradient(135deg, ${fgColor}33, ${fgColor}11)`,
                  zIndex: -1,
                  transform: 'scale(1.15)'
                }}
                animate={{
                  background: isHovered 
                    ? [
                        `linear-gradient(135deg, ${fgColor}33, ${fgColor}11)`,
                        `linear-gradient(225deg, ${fgColor}33, ${fgColor}11)`,
                        `linear-gradient(315deg, ${fgColor}33, ${fgColor}11)`,
                        `linear-gradient(45deg, ${fgColor}33, ${fgColor}11)`
                      ]
                    : `linear-gradient(135deg, ${fgColor}33, ${fgColor}11)`
                }}
                transition={{
                  duration: 3,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "loop"
                }}
              />
            )}
            
            {qrStyle === 'shadow' && (
              <motion.div 
                className="absolute inset-0 rounded-lg shadow-lg" 
                style={{ 
                  zIndex: -1,
                  transform: 'scale(1.05)'
                }}
                animate={{
                  boxShadow: isHovered 
                    ? [
                        `0 4px 12px ${fgColor}44`,
                        `0 8px 24px ${fgColor}66`,
                        `0 4px 12px ${fgColor}44`
                      ]
                    : `0 4px 12px ${fgColor}44`
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Infinity : 0,
                  repeatType: "reverse"
                }}
              />
            )}
            
            {qrStyle === 'rounded' && isHovered && (
              <motion.div
                className="absolute"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  top: sparklePosition.y,
                  left: sparklePosition.x,
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <Sparkles className="h-5 w-5 text-primary sparkle" />
              </motion.div>
            )}
            
            {/* Add extra sparkles for non-rounded premium styles */}
            {qrStyle !== 'basic' && qrStyle !== 'rounded' && isHovered && (
              <>
                <motion.div
                  className="absolute"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    top: sparklePosition.y * 0.6,
                    left: sparklePosition.x * 0.7,
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                >
                  <Sparkles className="h-4 w-4 text-primary sparkle" />
                </motion.div>
                <motion.div
                  className="absolute"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    top: sparklePosition.y * 0.3,
                    right: sparklePosition.x * 0.4,
                    zIndex: 10,
                    pointerEvents: 'none'
                  }}
                >
                  <Sparkles className="h-3 w-3 text-primary sparkle" />
                </motion.div>
              </>
            )}
            
            <motion.div
              whileHover={{ 
                scale: qrStyle !== 'basic' ? 1.02 : 1,
                transition: { duration: 0.2 }
              }}
            >
              <QRCodeSVG
                id="qr-code"
                value={value}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level={level}
                includeMargin={includeMargin}
                imageSettings={imageSettings as any}
                style={{
                  borderRadius: qrStyle === 'rounded' ? '8px' : '0',
                  padding: qrStyle !== 'basic' ? '8px' : '0',
                  background: bgColor,
                  boxShadow: qrStyle === 'shadow' ? `0 4px 12px ${fgColor}44` : 'none'
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </div>

      {scanCount !== undefined && (
        <div className="mt-2 text-sm text-muted-foreground flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          {scanCount} scans
        </div>
      )}

      <div className="mt-2 flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="text-primary hover:text-primary-foreground hover:bg-primary"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="text-primary hover:text-primary-foreground hover:bg-primary"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-1" />
          {isCopied ? 'Copied!' : 'Share'}
        </Button>
      </div>
    </div>
  );
}
