import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Close as CloseIcon,
  Videocam as VideocamIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import WebRTCService from '../../services/WebRTCService';

const CallNotification = ({ open, onClose, callData }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [callTimer, setCallTimer] = useState(30); // 30 seconds to answer

  // Start timer when call notification opens
  useEffect(() => {
    if (open && callData) {
      // Set up timer to auto-reject call after 30 seconds
      const timer = setInterval(() => {
        setCallTimer(prev => {
          if (prev <= 1) {
            // Auto-reject call when timer reaches 0
            handleRejectCall();
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Reset timer when dialog opens
      setCallTimer(30);

      return () => clearInterval(timer);
    }
  }, [open, callData]);

  // Accept call
  const handleAcceptCall = () => {
    if (!callData) return;

    setAccepting(true);

    try {
      // Accept the call
      WebRTCService.acceptCall(callData);

      // Navigate to call page
      const callerId = callData.caller.id;
      const callType = callData.callType || 'video';
      const audioOnly = callType === 'audio';

      // Close dialog
      onClose();

      // Navigate to call page with appropriate parameters
      setTimeout(() => {
        const callPath = `/patient/call/${callerId}${audioOnly ? '?audioOnly=true' : ''}`;
        console.log(`Navigating to call page: ${callPath}`);
        navigate(callPath);
      }, 500);
    } catch (error) {
      console.error('Error accepting call:', error);
      setAccepting(false);
    }
  };

  // Reject call
  const handleRejectCall = () => {
    if (!callData) return;

    setRejecting(true);

    try {
      // Reject the call
      WebRTCService.rejectCall(callData);

      // Close dialog
      setTimeout(() => {
        onClose();
        setRejecting(false);
      }, 500);
    } catch (error) {
      console.error('Error rejecting call:', error);
      setRejecting(false);
      onClose();
    }
  };

  if (!callData) return null;

  const { caller, callType } = callData;
  const isVideoCall = callType === 'video';

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!accepting && !rejecting) {
          handleRejectCall();
        }
      }}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: theme.palette.primary.main,
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2
      }}>
        <Typography variant="h6">
          Incoming {isVideoCall ? 'Video' : 'Voice'} Call
        </Typography>
        <IconButton
          size="small"
          onClick={handleRejectCall}
          disabled={accepting || rejecting}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Avatar
            src={caller.avatar}
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              mb: 2,
              bgcolor: theme.palette.secondary.main,
              fontSize: '2.5rem',
              border: `4px solid ${theme.palette.primary.main}`
            }}
          >
            {caller.name ? caller.name.charAt(0).toUpperCase() : 'C'}
          </Avatar>
        </motion.div>

        <Typography variant="h5" gutterBottom>
          {caller.name || 'Unknown Caller'}
        </Typography>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          {caller.role === 'doctor' ? 'Doctor' : caller.role || 'User'} is calling you
        </Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 2
        }}>
          {isVideoCall ? (
            <VideocamIcon color="primary" sx={{ mr: 1 }} />
          ) : (
            <PhoneIcon color="primary" sx={{ mr: 1 }} />
          )}
          <Typography variant="body2" color="primary">
            {isVideoCall ? 'Video Call' : 'Voice Call'}
          </Typography>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Call will be rejected in {callTimer} seconds
          </Typography>
          <Box sx={{
            width: '100%',
            height: 4,
            bgcolor: theme.palette.grey[200],
            borderRadius: 2,
            mt: 1,
            overflow: 'hidden'
          }}>
            <Box sx={{
              width: `${(callTimer / 30) * 100}%`,
              height: '100%',
              bgcolor: theme.palette.primary.main,
              transition: 'width 1s linear'
            }} />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        justifyContent: 'space-around',
        p: 2,
        bgcolor: theme.palette.grey[50]
      }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={rejecting ? <CircularProgress size={20} color="error" /> : <CallEndIcon />}
          onClick={handleRejectCall}
          disabled={accepting || rejecting}
          sx={{ borderRadius: 8, px: 3 }}
        >
          Decline
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={accepting ? <CircularProgress size={20} color="inherit" /> : <CallIcon />}
          onClick={handleAcceptCall}
          disabled={accepting || rejecting}
          sx={{ borderRadius: 8, px: 3 }}
        >
          Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CallNotification;
