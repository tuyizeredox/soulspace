/**
 * This script generates favicon files from SVG source files
 * To use this script:
 * 1. Install required packages: npm install sharp
 * 2. Run: node scripts/generate-favicons.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define the sizes for the favicons
const sizes = [16, 32, 48, 64, 128, 192, 256];

// Function to convert SVG to PNG in different sizes
async function convertSvgToPng(svgPath, outputDir, baseName) {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read the SVG file
    const svgBuffer = fs.readFileSync(svgPath);

    // Generate PNGs in different sizes
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${baseName}-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated: ${outputPath}`);
    }

    console.log('All favicon PNGs generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

// Main function
async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  const faviconDir = path.join(publicDir, 'favicons');
  
  // Process the main favicon
  await convertSvgToPng(
    path.join(publicDir, 'favicon.svg'),
    faviconDir,
    'favicon'
  );
  
  // Process the alternative options
  for (let i = 2; i <= 5; i++) {
    await convertSvgToPng(
      path.join(publicDir, `favicon-option${i}.svg`),
      faviconDir,
      `favicon-option${i}`
    );
  }
  
  console.log('\nTo use these favicons:');
  console.log('1. Choose your preferred design');
  console.log('2. Rename your chosen file to favicon.ico');
  console.log('3. Update the link tags in your index.html file');
}

main();