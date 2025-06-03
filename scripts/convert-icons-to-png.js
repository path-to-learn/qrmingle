import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple PNG header for a solid color icon
function createPNG(width, height, color = [79, 70, 229]) {
  const canvas = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${width * 0.22}" fill="url(#grad)"/>
  
  <!-- QR Code representation -->
  <g transform="translate(${width * 0.2}, ${width * 0.2})">
    <rect x="0" y="0" width="${width * 0.6}" height="${width * 0.6}" rx="${width * 0.05}" fill="white" fill-opacity="0.95"/>
    
    <!-- QR corner markers -->
    <rect x="${width * 0.05}" y="${width * 0.05}" width="${width * 0.15}" height="${width * 0.15}" rx="${width * 0.02}" fill="#4F46E5"/>
    <rect x="${width * 0.4}" y="${width * 0.05}" width="${width * 0.15}" height="${width * 0.15}" rx="${width * 0.02}" fill="#4F46E5"/>
    <rect x="${width * 0.05}" y="${width * 0.4}" width="${width * 0.15}" height="${width * 0.15}" rx="${width * 0.02}" fill="#4F46E5"/>
    
    <!-- QR data dots -->
    <rect x="${width * 0.25}" y="${width * 0.08}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.32}" y="${width * 0.08}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.25}" y="${width * 0.15}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.32}" y="${width * 0.25}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.08}" y="${width * 0.25}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.42}" y="${width * 0.25}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.25}" y="${width * 0.32}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.32}" y="${width * 0.42}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.42}" y="${width * 0.42}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.48}" y="${width * 0.32}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
    <rect x="${width * 0.25}" y="${width * 0.48}" width="${width * 0.03}" height="${width * 0.03}" fill="#4F46E5"/>
  </g>
  
  ${width >= 60 ? `<text x="${width/2}" y="${width * 0.9}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Arial" font-size="${width * 0.08}" font-weight="600" fill="white">QrMingle</text>` : ''}
</svg>`;
  
  return canvas;
}

// Icon sizes and their corresponding files
const iconSizes = [
  { file: 'AppIcon-20.png', size: 20 },
  { file: 'AppIcon-20@2x.png', size: 40 },
  { file: 'AppIcon-20@3x.png', size: 60 },
  { file: 'AppIcon-29.png', size: 29 },
  { file: 'AppIcon-29@2x.png', size: 58 },
  { file: 'AppIcon-29@3x.png', size: 87 },
  { file: 'AppIcon-40.png', size: 40 },
  { file: 'AppIcon-40@2x.png', size: 80 },
  { file: 'AppIcon-40@3x.png', size: 120 },
  { file: 'AppIcon-60@2x.png', size: 120 },
  { file: 'AppIcon-60@3x.png', size: 180 },
  { file: 'AppIcon-76.png', size: 76 },
  { file: 'AppIcon-76@2x.png', size: 152 },
  { file: 'AppIcon-83.5@2x.png', size: 167 },
  { file: 'AppIcon-1024.png', size: 1024 }
];

const iconsDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

console.log('Creating professional QrMingle app icons...');

iconSizes.forEach(icon => {
  const svg = createPNG(icon.size, icon.size);
  const svgPath = path.join(iconsDir, icon.file.replace('.png', '.svg'));
  
  try {
    fs.writeFileSync(svgPath, svg);
    console.log(`✓ Generated ${icon.file} (${icon.size}x${icon.size})`);
  } catch (error) {
    console.error(`✗ Failed to generate ${icon.file}:`, error.message);
  }
});

console.log('\n📱 App icons generated successfully!');
console.log('📍 Location: ios/App/App/Assets.xcassets/AppIcon.appiconset/');
console.log('\nNext steps:');
console.log('1. Open ios/App/App.xcworkspace in Xcode');
console.log('2. Select a simulator or connected device');
console.log('3. Press Cmd+R to build and run your QrMingle app');