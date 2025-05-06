// Configuration options for QR widget
export interface QrWidgetOptions {
  qrCodeUrl: string;      // URL to the QR code image (data URL or image URL)
  displayName: string;    // User's display name
  bgColor?: string;       // Background color for the widget
  textColor?: string;     // Text color for the widget
  size?: number;          // Size of the widget (square)
}

/**
 * Generates a widget-friendly QR code image that includes
 * the user's name and a properly formatted QR code for
 * easy scanning from a home screen widget
 */
export async function generateQrWidget(options: QrWidgetOptions): Promise<string> {
  const {
    qrCodeUrl,
    displayName,
    bgColor = '#ffffff',
    textColor = '#000000',
    size = 400,
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
  
      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
  
      // Draw header with app name
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.floor(size / 16)}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('QrMingle', size / 2, size / 10);
  
      // Draw user's name
      ctx.font = `${Math.floor(size / 20)}px Arial, sans-serif`;
      ctx.fillText(displayName, size / 2, size / 6);
  
      // Load and draw the QR code
      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      
      qrImage.onload = () => {
        // Calculate QR code size (about 70% of the canvas)
        const qrSize = size * 0.7;
        const qrX = (size - qrSize) / 2;
        const qrY = size / 5;
        
        // Draw the QR code
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  
        // Add instructions at the bottom
        ctx.font = `${Math.floor(size / 25)}px Arial, sans-serif`;
        ctx.fillText('Scan to view profile', size / 2, size * 0.92);
        
        // Return as data URL
        resolve(canvas.toDataURL('image/png'));
      };
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      
      // Set the source to load the image
      qrImage.src = qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR widget:', error);
      reject(error);
    }
  });
}

/**
 * Instructions for adding a QR widget to different phone types
 */
export const widgetInstructions = {
  android: [
    "1. Save the QR widget image to your phone",
    "2. Install a widget app like KWGT or Photo Widget",
    "3. Add a new widget to your home screen",
    "4. Select the QR widget image",
    "5. Resize and position as needed"
  ],
  ios: [
    "1. Save the QR widget image to your Photos",
    "2. Press and hold on your home screen",
    "3. Tap the '+' button to add a widget",
    "4. Search for 'Photos' widget",
    "5. Choose the size and add to home screen",
    "6. Tap the widget to edit and select your QR image"
  ]
};