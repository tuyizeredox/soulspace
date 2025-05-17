import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import GameBoardBackground from './GameBoardBackground';
import HealthPathBackground from './HealthPathBackground';

const GamifiedBackground = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);

      // Hide background completely when scrolled very far down
      if (position > 2000) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate opacity based on scroll position with smoother transitions
  const calculateOpacity = (startFade, endFade, initialOpacity, minOpacity = 0) => {
    if (scrollPosition < startFade) return initialOpacity;
    if (scrollPosition > endFade) return minOpacity;

    return initialOpacity - ((scrollPosition - startFade) / (endFade - startFade)) * (initialOpacity - minOpacity);
  };

  // Game board is more visible at the top but never completely disappears
  const gameBoardOpacity = calculateOpacity(300, 1200, 0.45, 0.05);

  // Health path is more visible as you scroll down with a smoother transition
  const healthPathOpacity = scrollPosition < 300 ? 0.25 :
                           scrollPosition > 1200 ? 0.4 :
                           0.25 + ((scrollPosition - 300) / 900) * 0.15;

  // Calculate blur effect based on scroll position
  const blurAmount = Math.min(1 + (scrollPosition / 1000), 2);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0.15))',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}
    >
      <Box
        sx={{
          opacity: gameBoardOpacity,
          transition: 'opacity 0.5s ease',
          filter: `blur(${blurAmount}px)`
        }}
      >
        <GameBoardBackground />
      </Box>

      <Box
        sx={{
          opacity: healthPathOpacity,
          transition: 'opacity 0.5s ease',
          filter: `blur(${blurAmount * 0.8}px)`
        }}
      >
        <HealthPathBackground />
      </Box>
    </Box>
  );
};

export default GamifiedBackground;
