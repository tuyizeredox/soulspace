import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { ErrorOutline, Refresh, AccessTime } from '@mui/icons-material';

/**
 * Component to display when API quota is exceeded
 * 
 * @param {Object} props
 * @param {string} props.retryAfter - Time to wait before retrying (e.g. "30s")
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {string} props.message - Custom message to display
 */
const QuotaExceededMessage = ({ retryAfter, onRetry, message }) => {
  const theme = useTheme();
  const [countdown, setCountdown] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Parse the retry delay
  useEffect(() => {
    if (retryAfter) {
      const seconds = parseInt(retryAfter.replace(/[^0-9]/g, ''), 10) || 30;
      setCountdown(seconds);
    }
  }, [retryAfter]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle retry
  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
      // Reset after a delay to prevent multiple clicks
      setTimeout(() => {
        setIsRetrying(false);
      }, 3000);
    } else {
      setIsRetrying(false);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.5)}`,
        bgcolor: alpha(theme.palette.warning.light, 0.1),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.warning.main.replace('#', '')}' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 0,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, zIndex: 1 }}>
        <ErrorOutline color="warning" sx={{ mr: 1, fontSize: '1.5rem' }} />
        <Typography variant="h6" color="warning.main" fontWeight={500}>
          Service Temporarily Busy
        </Typography>
      </Box>

      <Typography variant="body1" align="center" sx={{ mb: 2, zIndex: 1 }}>
        {message || "I'm currently experiencing high demand. I'll be ready to help you again in a few seconds."}
      </Typography>

      {countdown > 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, zIndex: 1 }}>
          <AccessTime color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Recommended wait time: {countdown} seconds
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 24, mb: 2 }} /> // Spacer when no countdown
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={isRetrying ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
        onClick={handleRetry}
        disabled={isRetrying || countdown > 5} // Disable if still counting down
        sx={{ zIndex: 1 }}
      >
        {isRetrying ? 'Retrying...' : countdown > 5 ? `Retry in ${countdown - 5}s` : 'Try Again Now'}
      </Button>
    </Paper>
  );
};

export default QuotaExceededMessage;