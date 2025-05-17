import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Divider,
  Tooltip,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Event as EventIcon,
  VideoCall as VideoCallIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const AppointmentsList = ({ 
  appointments, 
  loading, 
  title = "Upcoming Appointments", 
  emptyMessage = "No appointments", 
  limit = 5,
  onViewAll 
}) => {
  const theme = useTheme();
  
  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Helper function to format date
  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Helper function to format time
  const formatAppointmentTime = (timeString) => {
    if (!timeString) return 'No time specified';
    return timeString;
  };
  
  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return theme.palette.success;
      case 'scheduled':
      case 'confirmed':
        return theme.palette.info;
      case 'pending':
        return theme.palette.warning;
      case 'cancelled':
        return theme.palette.error;
      default:
        return theme.palette.grey;
    }
  };
  
  // Helper function to get appointment type icon
  const getAppointmentTypeIcon = (type) => {
    return type?.toLowerCase() === 'online' ? 
      <VideoCallIcon fontSize="small" /> : 
      <PersonIcon fontSize="small" />;
  };
  
  // Filter upcoming appointments (future dates)
  const upcomingAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date || appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  }) || [];
  
  // Sort by date (closest first)
  upcomingAppointments.sort((a, b) => {
    const dateA = new Date(a.date || a.appointmentDate);
    const dateB = new Date(b.date || b.appointmentDate);
    return dateA - dateB;
  });
  
  // Loading skeleton
  if (loading) {
    return (
      <Card
        component={motion.div}
        variants={itemVariants}
        elevation={2}
        sx={{ mb: 3, borderRadius: 3 }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            <Skeleton width={80} height={36} />
          </Box>
          <List>
            {[1, 2, 3].map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton width="60%" />}
                    secondary={
                      <>
                        <Skeleton width="40%" />
                        <Skeleton width="30%" />
                      </>
                    }
                  />
                  <Skeleton width={80} height={32} />
                </ListItem>
                {index < 2 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      elevation={2}
      sx={{ mb: 3, borderRadius: 3 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={onViewAll}
          >
            View All
          </Button>
        </Box>

        {upcomingAppointments.length > 0 ? (
          <List>
            {upcomingAppointments.slice(0, limit).map((appointment, index) => (
              <React.Fragment key={appointment._id || appointment.id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                    borderRadius: 1,
                    py: 1.5
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main
                      }}
                    >
                      <EventIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {appointment.patientName || appointment.patient?.name || 'Patient'}
                        </Typography>
                        <Tooltip title={appointment.type === 'online' ? 'Online Appointment' : 'In-person Appointment'}>
                          <Chip
                            icon={getAppointmentTypeIcon(appointment.type)}
                            label={appointment.type || 'In-person'}
                            size="small"
                            sx={{ 
                              height: 24,
                              bgcolor: appointment.type?.toLowerCase() === 'online' ? 
                                alpha(theme.palette.success.main, 0.1) : 
                                alpha(theme.palette.info.main, 0.1),
                              color: appointment.type?.toLowerCase() === 'online' ? 
                                theme.palette.success.main : 
                                theme.palette.info.main
                            }}
                          />
                        </Tooltip>
                      </Box>
                    }
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary" component="span">
                            {formatAppointmentDate(appointment.date || appointment.appointmentDate)}{' '}
                            {formatAppointmentTime(appointment.time || appointment.appointmentTime)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {appointment.reason || appointment.description || 'No reason specified'}
                        </Typography>
                      </>
                    }
                  />
                  <Chip
                    label={appointment.status || 'Pending'}
                    size="small"
                    sx={{ 
                      height: 24,
                      bgcolor: alpha(getStatusColor(appointment.status).main, 0.1),
                      color: getStatusColor(appointment.status).main,
                      fontWeight: 500
                    }}
                  />
                </ListItem>
                {index < upcomingAppointments.slice(0, limit).length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;
