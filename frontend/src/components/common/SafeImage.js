import React, { useState } from 'react';
import { Avatar, Box } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

/**
 * SafeImage component that handles image loading errors gracefully
 * Falls back to a default avatar if the image fails to load
 */
const SafeImage = ({ 
  src, 
  alt = 'Avatar', 
  size = 40, 
  fallbackIcon: FallbackIcon = PersonIcon,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Prevent the error from being logged to console
    console.debug('Image failed to load, using fallback:', src);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // If no src provided or error occurred, show fallback
  if (!src || hasError) {
    return (
      <Avatar 
        sx={{ 
          width: size, 
          height: size,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}
        {...props}
      >
        <FallbackIcon sx={{ fontSize: size * 0.6 }} />
      </Avatar>
    );
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        sx={{ 
          width: size, 
          height: size,
          opacity: isLoading ? 0.7 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
        {...props}
      />
    </Box>
  );
};

export default SafeImage;