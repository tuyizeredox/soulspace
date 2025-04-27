import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Description as DescriptionIcon,
  MedicalServices as MedicalServicesIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const UserActionsList = () => {
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

  // Mock data for recent user actions
  const recentActions = [
    {
      id: 1,
      user: {
        name: 'John Smith',
        avatar: null,
        role: 'Patient',
      },
      action: 'Booked an appointment',
      target: 'Dr. Sarah Johnson',
      time: '5 minutes ago',
      icon: <EventIcon />,
      iconColor: theme.palette.primary.main,
    },
    {
      id: 2,
      user: {
        name: 'Dr. Sarah Johnson',
        avatar: null,
        role: 'Doctor',
      },
      action: 'Updated medical record',
      target: 'Patient: John Smith',
      time: '12 minutes ago',
      icon: <DescriptionIcon />,
      iconColor: theme.palette.info.main,
    },
    {
      id: 3,
      user: {
        name: 'Emily Davis',
        avatar: null,
        role: 'Patient',
      },
      action: 'Sent a message',
      target: 'Dr. Michael Chen',
      time: '25 minutes ago',
      icon: <MessageIcon />,
      iconColor: theme.palette.success.main,
    },
    {
      id: 4,
      user: {
        name: 'Dr. Michael Chen',
        avatar: null,
        role: 'Doctor',
      },
      action: 'Created a prescription',
      target: 'Patient: Emily Davis',
      time: '32 minutes ago',
      icon: <MedicalServicesIcon />,
      iconColor: theme.palette.warning.main,
    },
    {
      id: 5,
      user: {
        name: 'Admin User',
        avatar: null,
        role: 'Admin',
      },
      action: 'Updated system settings',
      target: 'Notification preferences',
      time: '45 minutes ago',
      icon: <SettingsIcon />,
      iconColor: theme.palette.secondary.main,
    },
    {
      id: 6,
      user: {
        name: 'Robert Johnson',
        avatar: null,
        role: 'Patient',
      },
      action: 'Viewed health records',
      target: 'Lab results',
      time: '1 hour ago',
      icon: <VisibilityIcon />,
      iconColor: theme.palette.info.main,
    },
    {
      id: 7,
      user: {
        name: 'Dr. Lisa Wong',
        avatar: null,
        role: 'Doctor',
      },
      action: 'Completed appointment',
      target: 'Patient: Robert Johnson',
      time: '1 hour ago',
      icon: <EventIcon />,
      iconColor: theme.palette.primary.main,
    },
    {
      id: 8,
      user: {
        name: 'James Wilson',
        avatar: null,
        role: 'Patient',
      },
      action: 'Registered for an account',
      target: 'New patient',
      time: '2 hours ago',
      icon: <PersonIcon />,
      iconColor: theme.palette.success.main,
    },
  ];

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'Patient':
        return theme.palette.primary.main;
      case 'Doctor':
        return theme.palette.info.main;
      case 'Admin':
        return theme.palette.error.main;
      default:
        return theme.palette.secondary.main;
    }
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        background: `linear-gradient(to right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent User Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Latest activities from users across the platform
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden',
          }}
        >
          <List sx={{ p: 0 }}>
            {recentActions.map((action, index) => (
              <React.Fragment key={action.id}>
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <Tooltip title="View Details">
                      <IconButton edge="end" aria-label="view details">
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  }
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(action.iconColor, 0.1),
                          color: action.iconColor,
                          mb: 1,
                        }}
                      >
                        {action.user.avatar ? (
                          <img src={action.user.avatar} alt={action.user.name} />
                        ) : (
                          getInitials(action.user.name)
                        )}
                      </Avatar>
                      <Chip
                        label={action.user.role}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          backgroundColor: alpha(getRoleColor(action.user.role), 0.1),
                          color: getRoleColor(action.user.role),
                          border: `1px solid ${alpha(getRoleColor(action.user.role), 0.2)}`,
                        }}
                      />
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {action.user.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            color: action.iconColor,
                            mx: 1,
                          }}
                        >
                          {action.icon}
                        </Box>
                        <Typography variant="body2">
                          {action.action}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          {action.target}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {action.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentActions.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </CardContent>
    </Card>
  );
};

export default UserActionsList;
