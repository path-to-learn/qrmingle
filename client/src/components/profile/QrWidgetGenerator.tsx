import React, { useState } from 'react';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { ColorPicker } from '@/components/ui/color-picker';
import { generateQrWidget, widgetInstructions } from '@/lib/qrWidget';
import { Loader2, Download, Phone, Image as ImageIcon, Share2 } from 'lucide-react';

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

  async function handleGenerateWidget() {
    setIsGenerating(true);
    try {
      // Pass in the current qrCodeUrl and styling options
      const widgetImageUrl = await generateQrWidget({
        qrCodeUrl,
        displayName: profileDisplayName,
        bgColor,
        textColor,
        size: widgetSize
      });
      
      setWidgetImage(widgetImageUrl);
    } catch (error) {
      console.error('Failed to generate widget:', error);
      // Handle error here, maybe show a toast
    } finally {
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