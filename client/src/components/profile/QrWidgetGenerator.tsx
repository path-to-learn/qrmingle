import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { widgetInstructions } from '@/lib/qrWidget';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Download, Image as ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { celebrateQrGenerated } from '@/lib/confetti';

interface QrWidgetGeneratorProps {
  profileName: string;
  profileDisplayName: string;
  qrCodeUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrWidgetGenerator({
  profileName,
  profileDisplayName,
  qrCodeUrl,
  open,
  onOpenChange
}: QrWidgetGeneratorProps) {
  const [widgetImage, setWidgetImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [widgetSize, setWidgetSize] = useState(400);
  const [currentTab, setCurrentTab] = useState('android');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function handleGenerateWidget() {
    setIsGenerating(true);
    try {
      // First generate a QR code data URL using the qrcode library
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: Math.floor(widgetSize * 0.7),
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      // Create a temporary image to load the QR code
      const qrImage = new Image();
      qrImage.onload = () => {
        // Make sure we have a canvas reference
        const canvas = canvasRef.current;
        if (!canvas) {
          setIsGenerating(false);
          return;
        }

        // Get the canvas context and prepare it
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsGenerating(false);
          return;
        }

        // Set canvas dimensions
        canvas.width = widgetSize;
        canvas.height = widgetSize;

        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, widgetSize, widgetSize);
        
        // Draw header with app name
        ctx.fillStyle = textColor;
        ctx.font = `bold ${Math.floor(widgetSize / 16)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('QrMingle', widgetSize / 2, widgetSize / 10);
        
        // Draw user's name
        ctx.font = `${Math.floor(widgetSize / 20)}px Arial, sans-serif`;
        ctx.fillText(profileDisplayName, widgetSize / 2, widgetSize / 6);

        // Calculate QR code size and position
        const qrSize = Math.floor(widgetSize * 0.7);
        const qrX = (widgetSize - qrSize) / 2;
        const qrY = widgetSize / 5;
        
        // Draw the QR code
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
        
        // Add instructions at the bottom
        ctx.font = `${Math.floor(widgetSize / 25)}px Arial, sans-serif`;
        ctx.fillText('Scan to view profile', widgetSize / 2, widgetSize * 0.92);
        
        // Get the image data URL and set it to state
        const widgetDataUrl = canvas.toDataURL('image/png');
        setWidgetImage(widgetDataUrl);
        setIsGenerating(false);
        
        // Trigger confetti animation to celebrate successful QR widget generation
        celebrateQrGenerated();
      };

      qrImage.onerror = () => {
        console.error('Failed to load QR code image');
        setIsGenerating(false);
      };

      // Set the source to the generated QR code
      qrImage.src = qrCodeDataUrl;
    } catch (error) {
      console.error('Failed to generate widget:', error);
      setIsGenerating(false);
    }
  }

  function handleDownload() {
    if (!widgetImage) return;
    
    // Create a download link
    const link = document.createElement('a');
    link.href = widgetImage;
    link.download = `qrmingle-widget-${profileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create QR Code Widget</DialogTitle>
          <DialogDescription>
            Generate a custom QR widget for your phone's home screen.
          </DialogDescription>
        </DialogHeader>
        
        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Widget Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="border rounded-lg overflow-hidden w-48 h-48 flex items-center justify-center mb-4">
              {isGenerating ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : widgetImage ? (
                <img 
                  src={widgetImage} 
                  alt="QR Widget Preview" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground p-2">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-xs">Click "Generate" to create your widget</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button 
                onClick={handleGenerateWidget} 
                disabled={isGenerating || !qrCodeUrl}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!widgetImage}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
          
          {/* Widget Options */}
          <div>
            <div className="space-y-4">
              <div>
                <Label>Background Color</Label>
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-full"
                />
              </div>
              
              <div>
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-8 w-full"
                />
              </div>
              
              <div>
                <Label>Widget Size (px)</Label>
                <Input
                  type="number"
                  value={widgetSize}
                  onChange={(e) => setWidgetSize(Number(e.target.value))}
                  min={200}
                  max={1000}
                  step={50}
                />
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Instructions */}
        <div>
          <h3 className="mb-2 font-medium">How to add to your home screen:</h3>
          
          <Tabs defaultValue="android" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="android">Android</TabsTrigger>
              <TabsTrigger value="ios">iOS</TabsTrigger>
            </TabsList>
            
            <TabsContent value="android" className="space-y-2">
              <ul className="list-decimal pl-5 text-sm space-y-1">
                {widgetInstructions.android.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </TabsContent>
            
            <TabsContent value="ios" className="space-y-2">
              <ul className="list-decimal pl-5 text-sm space-y-1">
                {widgetInstructions.ios.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}