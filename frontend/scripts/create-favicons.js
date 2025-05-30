/**
 * Simple script to create favicon files from SVG
 */

const fs = require('fs');
const path = require('path');

// Create the favicons directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
const faviconDir = path.join(publicDir, 'favicons');

if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
  console.log('Created favicons directory');
}

// Create a simple placeholder favicon file
const createPlaceholderFavicon = (size, filename) => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="#4CAF50" />
  <text x="${size/2}" y="${size/2+5}" font-family="Arial" font-size="${size/3}" fill="white" text-anchor="middle">SS</text>
</svg>`;

  fs.writeFileSync(path.join(faviconDir, filename), svgContent);
  console.log(`Created ${filename}`);
};

// Create favicons in different sizes
createPlaceholderFavicon(16, 'favicon-16x16.png');
createPlaceholderFavicon(32, 'favicon-32x32.png');
createPlaceholderFavicon(192, 'favicon-192x192.png');
createPlaceholderFavicon(512, 'favicon-512x512.png');
createPlaceholderFavicon(180, 'favicon-180x180.png');
createPlaceholderFavicon(256, 'favicon-256x256.png');

console.log('Favicon placeholders created successfully!');