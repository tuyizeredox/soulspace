import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';

const AppointmentActions = ({ 
  appointment, 
  onUpdate, 
  onComplete, 
  onCancel, 
  onViewPatient,
  showQuickActions = true 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle appointment completion
  const handleCompleteAppointment = async () => {
    try {
      setLoading(true);
      
      if (onComplete) {
        await onComplete(appointment);
      } else {
        // Default completion logic
        const response = await axios.put(`/api/appointments/${appointment._id}/status`, {
          status: 'completed',
          notes: 'Appointment completed'
        });

        if (onUpdate) {
          onUpdate(response.data);
        }
      }
      
      setAnchorEl(null);
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    try {
      setLoading(true);
      
      if (onCancel) {
        await onCancel(appointment, cancelReason);
      } else {
        // Default cancellation logic
        const response = await axios.put(`/api/appointments/${appointment._id}/status`, {
          status: 'cancelled',
          notes: cancelReason || 'Cancelled by doctor'
        });

        if (onUpdate) {
          onUpdate(response.data);
        }
      }
      
      setShowCancelDialog(false);
      setCancelReason('');
      setAnchorEl(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  // Handle patient view
  const handleViewPatient = () => {
    if (onViewPatient) {
      onViewPatient(appointment.patient || appointment);
    }
    setAnchorEl(null);
  };

  // Handle chat navigation
  const handleStartChat = () => {
    const patientId = appointment.patient?._id || appointment.patientId;
    if (patientId) {
      window.location.href = `/doctor/patients/chat/${patientId}`;
    }
    setAnchorEl(null);
  };

  // Handle video call
  const handleStartVideoCall = () => {
    // Implement video call logic here
    console.log('Starting video call with patient:', appointment.patient?.name || appointment.patientName);
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Quick Action Buttons */}
        {showQuickActions && appointment.status === 'confirmed' && (
          <>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleCompleteAppointment}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Complete
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={handleViewPatient}
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              View
            </Button>
          </>
        )}

        {/* Video Call Button for Online Appointments */}
        {appointment.type === 'online' && (
          <IconButton
            size="small"
            color="primary"
            onClick={handleStartVideoCall}
            sx={{ ml: 1 }}
          >
            <VideoCallIcon />
          </IconButton>
        )}

        {/* More Actions Menu */}
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          disabled={loading}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewPatient}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Patient Details
        </MenuItem>
        
        {appointment.status === 'confirmed' && (
          <MenuItem onClick={handleCompleteAppointment}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Complete Appointment
          </MenuItem>
        )}
        
        <MenuItem onClick={handleStartChat}>
          <ChatIcon sx={{ mr: 1 }} fontSize="small" />
          Message Patient
        </MenuItem>
        
        {appointment.type === 'online' && (
          <MenuItem onClick={handleStartVideoCall}>
            <VideoCallIcon sx={{ mr: 1 }} fontSize="small" />
            Start Video Call
          </MenuItem>
        )}
        
        <Divider />
        
        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <MenuItem 
            onClick={() => setShowCancelDialog(true)}
            sx={{ color: 'error.main' }}
          >
            <CancelIcon sx={{ mr: 1 }} fontSize="small" />
            Cancel Appointment
          </MenuItem>
        )}
      </Menu>

      {/* Cancel Appointment Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Cancel Appointment
            </Typography>
            <IconButton onClick={() => setShowCancelDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Are you sure you want to cancel this appointment? The patient will be notified automatically.
          </Alert>
          
          <TextField
            fullWidth
            label="Cancellation Reason (Optional)"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setShowCancelDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Keep Appointment
          </Button>
          <Button
            onClick={handleCancelAppointment}
            variant="contained"
            color="error"
            disabled={loading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentActions;