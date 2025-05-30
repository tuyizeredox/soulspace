import React from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

/**
 * SEOMetaTags Component
 * 
 * This component manages SEO meta tags for each page in the application.
 * It should be included in each page component to provide specific SEO metadata.
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Comma-separated keywords
 * @param {string} props.canonicalUrl - Canonical URL for the page
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (default: 'website')
 * @param {string} props.twitterCard - Twitter card type (default: 'summary_large_image')
 */
const SEOMetaTags = ({
  title = 'SoulSpace Health',
  description = 'SoulSpace Health provides comprehensive healthcare management solutions with AI-powered insights, patient monitoring, and secure medical records.',
  keywords = 'healthcare, medical management, patient monitoring, health records, AI healthcare, medical system',
  canonicalUrl,
  ogImage = '/favicons/favicon-512x512.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
}) => {
  // Construct the full title with brand name
  const fullTitle = title.includes('SoulSpace Health') 
    ? title 
    : `${title} | SoulSpace Health`;
  
  // Construct the canonical URL
  const baseUrl = 'https://soulspace-health.com';
  const fullCanonicalUrl = canonicalUrl 
    ? `${baseUrl}${canonicalUrl}` 
    : window.location.href;
  
  // Construct the full image URL
  const fullImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
};

SEOMetaTags.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonicalUrl: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  twitterCard: PropTypes.string,
};

export default SEOMetaTags;