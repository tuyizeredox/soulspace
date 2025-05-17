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
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PatientInfoSidebar = ({
  patient,
  patientDetails,
  recentAppointments,
  upcomingAppointments,
  medicalRecords,
  onScheduleAppointment,
  onViewMedicalRecords,
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
          Patient Information
        </Typography>
        
        {onClose && (
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      {/* Patient Profile */}
      <Box sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1
      }}>
        <Avatar
          src={patient?.avatar}
          alt={patient?.name}
          sx={{ width: 80, height: 80 }}
        >
          {patient?.name?.charAt(0)}
        </Avatar>
        
        <Typography variant="h6" fontWeight="medium">
          {patient?.name || 'Patient Name'}
        </Typography>
        
        <Chip
          label={patientDetails?.insuranceProvider || 'No Insurance'}
          size="small"
          color={patientDetails?.insuranceProvider ? "primary" : "default"}
          sx={{ mt: 0.5 }}
        />
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          mt: 2,
          gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {patient?.phone || 'No phone number'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {patient?.email || 'No email'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {patientDetails?.address || 'No address'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Medical Information */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Medical Information
        </Typography>
        
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MedicalIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Blood Type"
              secondary={patientDetails?.bloodType || 'Not specified'}
            />
          </ListItem>
          
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MedicalIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Allergies"
              secondary={patientDetails?.allergies || 'None reported'}
            />
          </ListItem>
          
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <MedicalIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Chronic Conditions"
              secondary={patientDetails?.chronicConditions || 'None reported'}
            />
          </ListItem>
        </List>
        
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<MedicalIcon />}
          onClick={onViewMedicalRecords}
          sx={{ mt: 2 }}
        >
          View Medical Records
        </Button>
      </Box>
      
      <Divider />
      
      {/* Upcoming Appointments */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Upcoming Appointments
        </Typography>
        
        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <List dense disablePadding>
            {upcomingAppointments.slice(0, 3).map((appointment, index) => (
              <Paper
                key={appointment._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight="medium">
                    {appointment.type || 'Appointment'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(appointment.date)} at {formatTime(appointment.time)}
                  </Typography>
                </Box>
                
                {appointment.notes && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {appointment.notes}
                  </Typography>
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No upcoming appointments
          </Typography>
        )}
        
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<CalendarIcon />}
          onClick={onScheduleAppointment}
          sx={{ mt: 2 }}
        >
          Schedule Appointment
        </Button>
      </Box>
      
      <Divider />
      
      {/* Recent Appointments */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Recent Appointments
        </Typography>
        
        {recentAppointments && recentAppointments.length > 0 ? (
          <List dense disablePadding>
            {recentAppointments.slice(0, 3).map((appointment, index) => (
              <Paper
                key={appointment._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="medium">
                    {appointment.type || 'Appointment'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(appointment.date)} at {formatTime(appointment.time)}
                  </Typography>
                </Box>
                
                {appointment.diagnosis && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <MedicalIcon fontSize="small" color="error" />
                    <Typography variant="body2">
                      {appointment.diagnosis}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No recent appointments
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      {/* Recent Medical Records */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Recent Medical Records
        </Typography>
        
        {medicalRecords && medicalRecords.length > 0 ? (
          <List dense disablePadding>
            {medicalRecords.slice(0, 3).map((record, index) => (
              <Paper
                key={record._id || index}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="body2" fontWeight="medium">
                    {record.type || 'Medical Record'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(record.date)}
                  </Typography>
                </Box>
                
                {record.description && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {record.description}
                  </Typography>
                )}
              </Paper>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No recent medical records
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PatientInfoSidebar;
