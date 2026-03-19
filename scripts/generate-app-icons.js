import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon sizes required for iOS
const iconSizes = [
  { name: 'AppIcon-20.png', size: 20 },
  { name: 'AppIcon-20@2x.png', size: 40 },
  { name: 'AppIcon-20@3x.png', size: 60 },
  { name: 'AppIcon-29.png', size: 29 },
  { name: 'AppIcon-29@2x.png', size: 58 },
  { name: 'AppIcon-29@3x.png', size: 87 },
  { name: 'AppIcon-40.png', size: 40 },
  { name: 'AppIcon-40@2x.png', size: 80 },
  { name: 'AppIcon-40@3x.png', size: 120 },
  { name: 'AppIcon-60@2x.png', size: 120 },
  { name: 'AppIcon-60@3x.png', size: 180 },
  { name: 'AppIcon-76.png', size: 76 },
  { name: 'AppIcon-76@2x.png', size: 152 },
  { name: 'AppIcon-83.5@2x.png', size: 167 },
  { name: 'AppIcon-1024.png', size: 1024 }
];

// Generate SVG-based icons for each required size
function generateIcon(size, filename) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#gradient)"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.3}" height="${size * 0.3}" rx="${size * 0.05}" fill="white" opacity="0.9"/>
    <rect x="${size * 0.35}" y="${size * 0.25}" width="${size * 0.1}" height="${size * 0.1}" fill="white"/>
    <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" fill="white"/>
    <rect x="${size * 0.35}" y="${size * 0.35}" width="${size * 0.1}" height="${size * 0.1}" fill="white"/>
  </g>
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold" fill="white">QrMingle</text>
</svg>`;
  
  return svg;
}

// Create icons directory and generate all required sizes
const iconsDir = path.join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');

iconSizes.forEach(icon => {
  const svg = generateIcon(icon.size, icon.name);
  const svgPath = path.join(iconsDir, icon.name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svg);
  console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
});

console.log('App icons generated successfully!');
console.log('Note: Convert SVG files to PNG using an online converter or design tool for final production use.');