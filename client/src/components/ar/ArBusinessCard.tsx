import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Box3D, 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  Play, 
  Pause,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Check if WebXR is supported
const isWebXRSupported = () => {
  return 'xr' in navigator && navigator.xr !== null;
};

// Check if the device supports AR
const isArSupported = async () => {
  if (!isWebXRSupported()) {
    return false;
  }
  
  try {
    return await navigator.xr?.isSessionSupported('immersive-ar');
  } catch (error) {
    console.error('Error checking AR support:', error);
    return false;
  }
};

interface ArBusinessCardProps {
  profile: {
    id: number;
    displayName: string;
    title?: string;
    arModelUrl?: string;
    arScale?: number;
    arAnimationEnabled?: boolean;
    hasArEnabled: boolean;
  };
  onBack?: () => void;
  isPreview?: boolean;
}

const ArBusinessCard: React.FC<ArBusinessCardProps> = ({
  profile,
  onBack,
  isPreview = false,
}) => {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [arSession, setArSession] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelScale, setModelScale] = useState(profile.arScale || 100);
  const [isAnimating, setIsAnimating] = useState(profile.arAnimationEnabled || true);
  const [showControls, setShowControls] = useState(true);
  const { toast } = useToast();

  // Check AR support on component mount
  useEffect(() => {
    const checkArSupport = async () => {
      const isSupported = await isArSupported();
      setSupported(isSupported);
    };
    
    checkArSupport();
  }, []);

  // Initialize AR viewer
  useEffect(() => {
    if (!canvasRef.current || !profile.hasArEnabled) {
      return;
    }

    // This would be replaced with actual Three.js or model-viewer code
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // For the demo, just draw a placeholder
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple 3D card representation
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    // Front face
    ctx.beginPath();
    ctx.rect(canvas.width/2 - 80, canvas.height/2 - 50, 160, 100);
    ctx.stroke();
    
    // Text
    ctx.fillStyle = '#000';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(profile.displayName, canvas.width/2, canvas.height/2 - 20);
    
    if (profile.title) {
      ctx.font = '12px sans-serif';
      ctx.fillText(profile.title, canvas.width/2, canvas.height/2 + 10);
    }
    
    // Placeholder text
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('AR model would load here', canvas.width/2, canvas.height/2 + 40);
    
    // Add 3D effect with connecting lines
    const offset = 20 * (modelScale / 100);
    
    ctx.beginPath();
    // Top-left corner
    ctx.moveTo(canvas.width/2 - 80, canvas.height/2 - 50);
    ctx.lineTo(canvas.width/2 - 80 - offset, canvas.height/2 - 50 - offset);
    
    // Top-right corner
    ctx.moveTo(canvas.width/2 + 80, canvas.height/2 - 50);
    ctx.lineTo(canvas.width/2 + 80 + offset, canvas.height/2 - 50 - offset);
    
    // Bottom-right corner
    ctx.moveTo(canvas.width/2 + 80, canvas.height/2 + 50);
    ctx.lineTo(canvas.width/2 + 80 + offset, canvas.height/2 + 50 + offset);
    
    // Draw back face
    ctx.rect(
      canvas.width/2 - 80 - offset, 
      canvas.height/2 - 50 - offset, 
      160 + offset*2, 
      100 + offset*2
    );
    
    ctx.stroke();

    // Animation effect for demo
    let angle = 0;
    let animationFrameId: number;
    
    const animate = () => {
      if (!isAnimating) return;
      
      angle += 0.01;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation based on angle
      ctx.save();
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(angle);
      ctx.translate(-canvas.width/2, -canvas.height/2);
      
      // Draw the business card
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.rect(canvas.width/2 - 80, canvas.height/2 - 50, 160, 100);
      ctx.stroke();
      
      // Text
      ctx.fillStyle = '#000';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(profile.displayName, canvas.width/2, canvas.height/2 - 20);
      
      if (profile.title) {
        ctx.font = '12px sans-serif';
        ctx.fillText(profile.title, canvas.width/2, canvas.height/2 + 10);
      }
      
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#6b7280';
      ctx.fillText('AR model would load here', canvas.width/2, canvas.height/2 + 40);
      
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    if (isAnimating) {
      animate();
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [profile.hasArEnabled, profile.displayName, profile.title, supported, modelScale, isAnimating]);

  // Function to start AR session
  const startArSession = async () => {
    if (!supported) {
      toast({
        title: "AR Not Supported",
        description: "Your device or browser doesn't support AR features.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "AR Mode",
        description: "In a real implementation, this would launch AR view. For demo purposes, we're showing a simulated view.",
      });
      
      // In a real implementation, this would actually start the AR session
      // setArSession(await navigator.xr.requestSession('immersive-ar'));
    } catch (error) {
      console.error('Error starting AR session:', error);
      toast({
        title: "AR Error",
        description: "There was a problem starting the AR experience.",
        variant: "destructive"
      });
    }
  };

  // Handle scale changes
  const handleScaleChange = (direction: 'up' | 'down') => {
    setModelScale(prev => {
      const newScale = direction === 'up' 
        ? Math.min(prev + 10, 200) 
        : Math.max(prev - 10, 10);
      return newScale;
    });
  };

  if (!profile.hasArEnabled) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>AR Not Enabled</AlertTitle>
            <AlertDescription>
              AR Business Card is not enabled for this profile.
            </AlertDescription>
          </Alert>
          {onBack && (
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={onBack}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="ar-business-card">
      <Card className="w-full">
        <CardContent className="pt-6">
          {supported === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>AR Not Supported</AlertTitle>
              <AlertDescription>
                Your device or browser doesn't support AR features.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={360} 
              className="w-full h-full"
            />
            
            {/* Overlay controls */}
            {showControls && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <div className="bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 flex gap-1 items-center shadow-md">
                  {!isPreview && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={startArSession}
                      className="h-8 w-8"
                    >
                      <Box3D className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsAnimating(!isAnimating)}
                    className="h-8 w-8"
                  >
                    {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => handleScaleChange('up')}
                    className="h-8 w-8"
                    disabled={modelScale >= 200}
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="icon"
                    variant="ghost"
                    onClick={() => handleScaleChange('down')}
                    className="h-8 w-8"
                    disabled={modelScale <= 10}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-xs font-medium mx-1">{modelScale}%</div>
                </div>
              </div>
            )}
            
            {/* Button to toggle controls */}
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowControls(!showControls)}
              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm"
            >
              {showControls ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{profile.displayName}</h3>
              {profile.title && <p className="text-sm text-muted-foreground">{profile.title}</p>}
            </div>
            
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              {isPreview 
                ? "This is a preview of your AR Business Card. In the real AR view, users can place your 3D card in their environment."
                : "Tap the cube icon to view this business card in augmented reality."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArBusinessCard;