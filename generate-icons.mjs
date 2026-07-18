import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputPath = path.resolve('public/icons/solajero-icon.png');
const outputDir = path.resolve('public/icons');

const sizes = [192, 512];

async function generate() {
  // Check if input exists
  if (!fs.existsSync(inputPath)) {
    console.error('Input icon not found at', inputPath);
    process.exit(1);
  }

  for (const size of sizes) {
    // any (standard icon)
    await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
    
    // maskable (designed to fill the shape)
    // To make it maskable, we add a solid background if it has transparency, or just use cover.
    // Assuming the solajero icon might have transparency, let's add the theme color background (#030b1a)
    await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: '#030b1a' })
      .toFile(path.join(outputDir, `icon-${size}x${size}-maskable.png`));
    console.log(`Generated icon-${size}x${size}-maskable.png`);
  }
  
  // apple touch icon
  await sharp(inputPath)
    .resize(180, 180, { fit: 'contain', background: '#030b1a' })
    .toFile(path.join(outputDir, `apple-touch-icon.png`));
  console.log(`Generated apple-touch-icon.png`);
    
  console.log('Icons generated successfully');
}

generate().catch(console.error);
