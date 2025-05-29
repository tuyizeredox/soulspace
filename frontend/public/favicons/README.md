# SoulSpace Health Favicons

This directory contains favicon options for the SoulSpace Health platform.

## Available Options

We've created several favicon options for you to choose from:

1. **Option 1** (favicon.svg): A green circular design with a heart and pulse line
2. **Option 2** (favicon-option2.svg): A blue circular design with a stylized S and heart
3. **Option 3** (favicon-option3.svg): A purple square design with a stylized S and health cross
4. **Option 4** (favicon-option4.svg): A blue circular design with stylized SS and health cross
5. **Option 5** (favicon-option5.svg): A gradient circular design with an abstract S and heartbeat line

## How to Generate PNG and ICO Files

To convert the SVG files to PNG and ICO formats:

1. Install the required package:
   ```
   npm install sharp
   ```

2. Run the generation script:
   ```
   node scripts/generate-favicons.js
   ```

3. This will create PNG files in various sizes (16x16, 32x32, 48x48, 64x64, 128x128, 192x192, 256x256)

## How to Use the Favicons

1. Choose your preferred favicon design
2. Copy the files to the appropriate locations
3. Update your `index.html` file with the following code:

```html
<!-- Basic favicon -->
<link rel="icon" href="%PUBLIC_URL%/favicon.ico" />

<!-- iOS icon -->
<link rel="apple-touch-icon" sizes="180x180" href="%PUBLIC_URL%/favicons/favicon-180x180.png" />

<!-- Android icons -->
<link rel="icon" type="image/png" sizes="192x192" href="%PUBLIC_URL%/favicons/favicon-192x192.png" />
<link rel="icon" type="image/png" sizes="32x32" href="%PUBLIC_URL%/favicons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="%PUBLIC_URL%/favicons/favicon-16x16.png" />
```

4. Update your `manifest.json` file with the icon references:

```json
{
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "favicons/favicon-192x192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "favicons/favicon-256x256.png",
      "type": "image/png",
      "sizes": "256x256"
    }
  ]
}
```

## Online Favicon Generators

If you prefer to use an online tool to generate favicons, you can use:

1. [Favicon.io](https://favicon.io/)
2. [RealFaviconGenerator](https://realfavicongenerator.net/)
3. [Favicon Generator](https://www.favicon-generator.org/)

These tools can convert your chosen SVG into all the necessary formats and provide the HTML code to include in your site.