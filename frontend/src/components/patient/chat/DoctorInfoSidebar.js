import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  MedicalInformation as MedicalIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  VideoCall as VideoCallIcon,
  LocalHospital as HospitalIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const DoctorInfoSidebar = ({
  doctor,
  doctorDetails,
  hospital,
  recentAppointments,
  upcomingAppointments,
  onScheduleAppointment,
  onVideoCall,
  onClose
}) => {
  const theme = useTheme();
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.paper,
      overflow: 'auto'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <Typography variant="h6" fontWeight="medium">
          Doctor Information
        </Typography>
        
        {onClose && (
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      {/* Doctor Profile */}
      <Box sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Avatar
          src={doctor?.avatar || doctor?.profileImage}
          alt={doctor?.name}
          sx={{ width: 80, height: 80 }}
        >
          {doctor?.name?.charAt(0)}
        </Avatar>
        
        <Typography variant="h6" fontWeight="medium">
          Dr. {doctor?.name || 'Doctor Name'}
        </Typography>
        
        <Chip
          label={doctor?.specialization || 'Specialist'}
          size="small"
          color="primary"
          sx={{ mt: 0.5 }}
        />
        
        {hospital && (
          <Chip
            icon={<HospitalIcon fontSize="small" />}
            label={hospital.name}
            size="small"
            variant="outlined"
            sx={{ mt: 0.5 }}
          />
        )}
        
        {doctor?.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="body2">
              {doctor.rating} / 5
            </Typography>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          mt: 2,
          gap: 1
        }}>
          {doctor?.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {doctor.phone}
              </Typography>
            </Box>
          )}
          
          {doctor?.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {doctor.email}
              </Typography>
            </Box>
          )}
          
          {hospital?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {hospital.address}
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex',
          gap: 1,
          mt: 2,
          width: '100%'
        }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<CalendarIcon />}
            onClick={onScheduleAppointment}
          >
            Schedule
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            startIcon={<VideoCallIcon />}
            onClick={onVideoCall}
          >
            Video Call
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Upcoming Appointments */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Upcoming Appointments
        </Typography>
        
        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <List disablePadding>
            {upcomingAppointments.slice(0, 3).map((appointment, index) => (
              <Paper
                key={appointment._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(appointment.date)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatTime(appointment.time || appointment.date)}
                  </Typography>
                </Box>
                
                {appointment.type && (
                  <Chip
                    label={appointment.type}
                    size="small"
                    color={appointment.type === 'Online' ? 'info' : 'success'}
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No upcoming appointments
          </Typography>
        )}
        
        {upcomingAppointments && upcomingAppointments.length > 0 && (
          <Button
            fullWidth
            variant="text"
            onClick={onScheduleAppointment}
            sx={{ mt: 1 }}
          >
            View All
          </Button>
        )}
      </Box>
      
      <Divider />
      
      {/* Recent Appointments */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Recent Appointments
        </Typography>
        
        {recentAppointments && recentAppointments.length > 0 ? (
          <List disablePadding>
            {recentAppointments.slice(0, 3).map((appointment, index) => (
              <Paper
                key={appointment._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.default
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(appointment.date)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatTime(appointment.time || appointment.date)}
                  </Typography>
                </Box>
                
                {appointment.status && (
                  <Chip
                    label={appointment.status}
                    size="small"
                    color={
                      appointment.status === 'Completed' ? 'success' :
                      appointment.status === 'Cancelled' ? 'error' :
                      'default'
                    }
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No recent appointments
          </Typography>
        )}
      </Box>
      
      {/* Hospital Information */}
      {hospital && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Hospital Information
            </Typography>
            
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: theme.palette.background.default
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {hospital.name}
              </Typography>
              
              {hospital.address && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                  <LocationIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">
                    {hospital.address}
                  </Typography>
                </Box>
              )}
              
              {hospital.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {hospital.phone}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
};

export default DoctorInfoSidebar;
