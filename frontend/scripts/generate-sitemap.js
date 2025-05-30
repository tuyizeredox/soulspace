const fs = require('fs');
const path = require('path');

/**
 * Generate a sitemap.xml file for the SoulSpace Health website
 * This script creates a sitemap.xml file based on the routes defined in the application
 */

// Base URL of the website
const BASE_URL = 'https://soulspace-health.com';

// Define the routes to include in the sitemap
// Each route has a path, lastmod date, changefreq, and priority
const routes = [
  { path: '/', lastmod: '2023-12-01', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.8' },
  { path: '/services', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.7' },
  { path: '/login', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.9' },
  { path: '/register', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.9' },
  { path: '/forgot-password', lastmod: '2023-12-01', changefreq: 'yearly', priority: '0.5' },
  { path: '/help', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.6' },
  { path: '/resources/user-guides', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.6' },
  { path: '/resources/video-tutorials', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.6' },
  { path: '/resources/knowledge-base', lastmod: '2023-12-01', changefreq: 'monthly', priority: '0.6' },
  { path: '/community/forum', lastmod: '2023-12-01', changefreq: 'daily', priority: '0.7' },
  { path: '/community/guidelines', lastmod: '2023-12-01', changefreq: 'yearly', priority: '0.4' },
  { path: '/hospitals/directory', lastmod: '2023-12-01', changefreq: 'weekly', priority: '0.8' },
];

// Generate the sitemap XML content
const generateSitemapXml = () => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  // Add each route to the sitemap
  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

// Write the sitemap to a file
const writeSitemap = () => {
  const sitemap = generateSitemapXml();
  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  
  fs.writeFileSync(outputPath, sitemap);
  console.log(`Sitemap generated at ${outputPath}`);
};

// Execute the script
writeSitemap();