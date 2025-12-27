const sharp = require('sharp');
const path = require('path');

const BLUE = '#3b82f6';
const WHITE = '#ffffff';

async function generateIcon(size, outputPath, isAdaptive = false) {
  // For adaptive icons, the safe zone is about 66% of the full size
  const padding = isAdaptive ? Math.floor(size * 0.17) : Math.floor(size * 0.1);
  const fontSize = Math.floor((size - padding * 2) * 0.5);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${BLUE}" rx="${isAdaptive ? 0 : Math.floor(size * 0.2)}"/>
      <text 
        x="50%" 
        y="55%" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${WHITE}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >CU</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateSplashIcon(size, outputPath) {
  const fontSize = Math.floor(size * 0.4);
  
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${WHITE}"/>
      <text 
        x="50%" 
        y="55%" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${BLUE}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >CU</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function generateNotificationIcon(size, outputPath) {
  const fontSize = Math.floor(size * 0.5);
  
  // Notification icons should be white on transparent for Android
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <text 
        x="50%" 
        y="55%" 
        font-family="Arial, Helvetica, sans-serif" 
        font-size="${fontSize}" 
        font-weight="bold" 
        fill="${WHITE}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >CU</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`Generated: ${outputPath}`);
}

async function main() {
  const assetsDir = path.join(__dirname, '..', 'assets');
  
  // Main app icon (1024x1024 for app stores, will be scaled down)
  await generateIcon(1024, path.join(assetsDir, 'icon.png'), false);
  
  // Adaptive icon for Android (1024x1024)
  await generateIcon(1024, path.join(assetsDir, 'adaptive-icon.png'), true);
  
  // Splash icon (200x200 as per Expo defaults)
  await generateSplashIcon(200, path.join(assetsDir, 'splash-icon.png'));
  
  // Notification icon (96x96)
  await generateNotificationIcon(96, path.join(assetsDir, 'notification-icon.png'));
  
  // Favicon for web (48x48)
  await generateIcon(48, path.join(assetsDir, 'favicon.png'), false);
  
  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
