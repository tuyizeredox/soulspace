import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Component to display when the AI API quota has been exceeded
 * @param {Object} props
 * @param {string} props.retryAfter - Time to wait before retrying (e.g., "30s")
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {string} props.message - Custom message to display
 */
const QuotaExceededMessage = ({ 
  retryAfter = '30s', 
  onRetry, 
  message = "I'm currently experiencing high demand and need a brief moment to catch up."
}) => {
  const [countdown, setCountdown] = useState(30);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Parse the retry delay from the API response
  useEffect(() => {
    if (retryAfter) {
      // Extract the number from strings like "30s"
      const seconds = parseInt(retryAfter.replace(/[^0-9]/g, ''), 10) || 30;
      setCountdown(seconds);
    }
  }, [retryAfter]);
  
  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [countdown]);
  
  // Handle retry
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <Box 
      sx={{ 
        p: 3, 
        border: '1px solid #f0f0f0', 
        borderRadius: 2,
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        mt: 2
      }}
    >
      <ErrorOutlineIcon color="warning" sx={{ fontSize: 40, mb: 2 }} />
      
      <Typography variant="h6" gutterBottom>
        AI Assistant Temporarily Unavailable
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {message}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {countdown > 0 ? (
          `You can try again in ${countdown} seconds`
        ) : (
          "You can try again now"
        )}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={isRetrying ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
        onClick={handleRetry}
        disabled={isRetrying || countdown > 0}
      >
        {isRetrying ? "Retrying..." : "Try Again"}
      </Button>
    </Box>
  );
};

export default QuotaExceededMessage;