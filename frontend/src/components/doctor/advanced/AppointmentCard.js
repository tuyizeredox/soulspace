import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Divider,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from '../../../utils/axiosConfig';

// Import sub-components
import TreatmentCompletion from './TreatmentCompletion';
import PatientQuickView from './PatientQuickView';

const AppointmentCard = ({ appointment, onUpdate, showActions = true }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date and time
  const formatDateTime = (dateString, timeString) => {
    try {
      const date = new Date(dateString);
      const formattedDate = format(date, 'MMM dd, yyyy');
      const formattedTime = timeString || format(date, 'HH:mm');
      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      return { date: 'Invalid date', time: 'Invalid time' };
    }
  };

  const { date, time } = formatDateTime(appointment.date, appointment.time);

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          color: theme.palette.success.main,
          bgcolor: alpha(theme.palette.success.main, 0.1),
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'pending':
        return {
          color: theme.palette.warning.main,
          bgcolor: alpha(theme.palette.warning.main, 0.1),
          icon: <AccessTimeIcon fontSize="small" />
        };
      case 'completed':
        return {
          color: theme.palette.info.main,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          icon: <CheckCircleIcon fontSize="small" />
        };
      case 'cancelled':
        return {
          color: theme.palette.error.main,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          icon: <CancelIcon fontSize="small" />
        };
      default:
        return {
          color: theme.palette.grey[600],
          bgcolor: alpha(theme.palette.grey[600], 0.1),
          icon: <AccessTimeIcon fontSize="small" />
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);

  // Handle appointment completion
  const handleCompleteAppointment = async (treatmentData) => {
    try {
      setLoading(true);
      
      const response = await axios.put(`/api/appointments/${appointment._id}/status`, {
        status: 'completed',
        notes: JSON.stringify(treatmentData)
      });

      if (onUpdate) {
        onUpdate(response.data);
      }
      
      setShowTreatmentDialog(false);
    } catch (error) {
      console.error('Error completing appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    try {
      setLoading(true);
      
      const response = await axios.put(`/api/appointments/${appointment._id}/status`, {
        status: 'cancelled',
        notes: 'Cancelled by doctor'
      });

      if (onUpdate) {
        onUpdate(response.data);
      }
      
      setAnchorEl(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[8],
              borderColor: statusConfig.color
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              {/* Patient Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontSize: '1.5rem',
                    fontWeight: 600
                  }}
                >
                  {(appointment.patient?.name || appointment.patientName)?.charAt(0) || 'P'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {appointment.patient?.name || appointment.patientName || 'Unknown Patient'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {date} at {time}
                      </Typography>
                    </Box>
                    <Chip
                      icon={statusConfig.icon}
                      label={appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: statusConfig.bgcolor,
                        color: statusConfig.color,
                        fontWeight: 500,
                        '& .MuiChip-icon': {
                          color: statusConfig.color
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.reason || 'No reason specified'}
                  </Typography>
                </Box>
              </Box>

              {/* Actions Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {appointment.type === 'online' && (
                  <Tooltip title="Online Appointment">
                    <IconButton size="small" color="primary">
                      <VideoCallIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={loading}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Appointment Details */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.type === 'online' ? 'Online Consultation' : 'In-Person Visit'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {appointment.type || 'Consultation'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {showActions && appointment.status === 'confirmed' && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setShowTreatmentDialog(true)}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Complete Treatment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={() => setShowPatientDialog(true)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  View Patient
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ChatIcon />}
                  onClick={() => {
                    // Navigate to chat with patient
                    const patientId = appointment.patient?._id || appointment.patientId;
                    if (patientId) {
                      window.location.href = `/doctor/patients/chat/${patientId}`;
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Chat
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          setShowPatientDialog(true);
          setAnchorEl(null);
        }}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Patient Details
        </MenuItem>
        <MenuItem onClick={() => {
          setShowTreatmentDialog(true);
          setAnchorEl(null);
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Add Treatment Notes
        </MenuItem>
        <MenuItem onClick={() => {
          const patientId = appointment.patient?._id || appointment.patientId;
          if (patientId) {
            window.location.href = `/doctor/patients/chat/${patientId}`;
          }
          setAnchorEl(null);
        }}>
          <ChatIcon sx={{ mr: 1 }} fontSize="small" />
          Message Patient
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleCancelAppointment}
          sx={{ color: 'error.main' }}
        >
          <CancelIcon sx={{ mr: 1 }} fontSize="small" />
          Cancel Appointment
        </MenuItem>
      </Menu>

      {/* Treatment Completion Dialog */}
      <TreatmentCompletion
        open={showTreatmentDialog}
        onClose={() => setShowTreatmentDialog(false)}
        onComplete={handleCompleteAppointment}
        appointment={appointment}
        loading={loading}
      />

      {/* Patient Quick View Dialog */}
      <PatientQuickView
        open={showPatientDialog}
        onClose={() => setShowPatientDialog(false)}
        patient={appointment.patient}
        appointment={appointment}
      />
    </>
  );
};

export default AppointmentCard;