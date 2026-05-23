import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ImageCropperProps {
  image: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageData: string) => void;
  aspect?: number;
  title?: string;
  actionLabel?: string;
}

// Function to create a canvas with the cropped image
const createCroppedImage = (
  image: HTMLImageElement,
  crop: { x: number; y: number; width: number; height: number }
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return '';
  }

  const sourceX = Math.max(0, Math.round(crop.x));
  const sourceY = Math.max(0, Math.round(crop.y));
  const sourceWidth = Math.max(1, Math.round(crop.width));
  const sourceHeight = Math.max(1, Math.round(crop.height));

  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight
  );

  return canvas.toDataURL('image/jpeg', 0.95);
};

export default function ImageCropper({
  image,
  open,
  onClose,
  onCropComplete,
  aspect = 1,
  title = "Crop Image",
  actionLabel = "Crop & Save",
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, [image, open]);

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (zoomValue: number) => {
    setZoom(zoomValue);
  };

  const onCropAreaChange = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      // Create an image element from the source
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const croppedImageData = createCroppedImage(img, croppedAreaPixels);
        onCropComplete(croppedImageData);
        onClose();
      };
      
      img.src = image;
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  }, [croppedAreaPixels, image, onCropComplete, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full h-80 my-4 bg-gray-100 rounded-md overflow-hidden">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onCropComplete={onCropAreaChange}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zoom">Zoom</Label>
            <Slider
              id="zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCropImage} disabled={!croppedAreaPixels}>{actionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
