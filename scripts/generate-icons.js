import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconDir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset';
const sourceLogo = 'public/qrmingle-logo-bright.svg';

const sizes = [
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
  { name: 'AppIcon-1024.png', size: 1024 },
];

async function generateIcons() {
  for (const icon of sizes) {
    const outputPath = path.join(iconDir, icon.name);
    await sharp(sourceLogo)
      .resize(icon.size, icon.size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
  }
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
