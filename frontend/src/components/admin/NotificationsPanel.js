import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Button,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Paper,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Link,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Warning,
  Info,
  Error,
  MoreVert,
  AccessTime,
  Person,
  DoneAll,
  LocalHospital,
  People,
  Security,
  Analytics,
  Settings,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MarkEmailRead as MarkReadIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  AdminPanelSettings as AdminIcon,
  MedicalServices as MedicalIcon,
  Computer as ComputerIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CloudSync as CloudSyncIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const NotificationsPanel = ({ notifications, recentActivities, onMarkAllRead, onMarkAsRead, onDeleteNotification }) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Handle menu open
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle mark as read
  const handleMarkAsRead = () => {
    if (selectedNotification && onMarkAsRead) {
      onMarkAsRead(selectedNotification.id);
    }
    handleMenuClose();
  };

  // Handle delete notification
  const handleDeleteNotification = () => {
    if (selectedNotification && onDeleteNotification) {
      onDeleteNotification(selectedNotification.id);
    }
    handleMenuClose();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
      case 'appointment':
        return <NotificationsActive sx={{ color: theme.palette.error.main }} />;
      case 'warning':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'info':
      case 'system':
        return <Info sx={{ color: theme.palette.info.main }} />;
      case 'success':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'error':
        return <Error sx={{ color: theme.palette.error.main }} />;
      case 'hospital':
        return <LocalHospital sx={{ color: theme.palette.primary.main }} />;
      case 'user':
        return <People sx={{ color: theme.palette.secondary.main }} />;
      case 'security':
        return <Security sx={{ color: theme.palette.warning.main }} />;
      case 'analytics':
        return <Analytics sx={{ color: theme.palette.info.main }} />;
      case 'settings':
        return <Settings sx={{ color: theme.palette.grey[700] }} />;
      default:
        return <Info sx={{ color: theme.palette.info.main }} />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'alert':
      case 'appointment':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
      case 'system':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'hospital':
        return theme.palette.primary.main;
      case 'user':
        return theme.palette.secondary.main;
      case 'security':
        return theme.palette.warning.main;
      case 'analytics':
        return theme.palette.info.main;
      case 'settings':
        return theme.palette.grey[700];
      default:
        return theme.palette.info.main;
    }
  };

  // Get action link based on notification type and metadata
  const getActionLink = (notification) => {
    if (notification.actionLink) {
      return notification.actionLink;
    }

    switch (notification.type) {
      case 'hospital':
        return '/admin/hospitals';
      case 'user':
        return '/admin/users';
      case 'appointment':
        return '/admin/appointments';
      case 'analytics':
        return '/admin/analytics';
      case 'security':
        return '/admin/security';
      case 'settings':
        return '/admin/settings';
      default:
        return '#';
    }
  };

  // Get unread notification count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Get activity icon based on user and action
  const getActivityIcon = (activity) => {
    if (activity.user === 'System') {
      if (activity.action.includes('backup')) return <BackupIcon />;
      if (activity.action.includes('sync')) return <CloudSyncIcon />;
      if (activity.action.includes('database')) return <StorageIcon />;
      return <ComputerIcon />;
    }

    if (activity.user.includes('Admin')) {
      if (activity.action.includes('hospital')) return <LocalHospital />;
      if (activity.action.includes('user')) return <People />;
      if (activity.action.includes('updated')) return <EditIcon />;
      if (activity.action.includes('created')) return <AddIcon />;
      return <AdminIcon />;
    }

    if (activity.user.includes('Dr.')) {
      return <MedicalIcon />;
    }

    return <Person />;
  };

  // Get activity avatar color
  const getActivityAvatarColor = (activity) => {
    if (activity.user === 'System') {
      return alpha(theme.palette.info.main, 0.8);
    }

    if (activity.user.includes('Admin')) {
      return alpha(theme.palette.secondary.main, 0.8);
    }

    if (activity.user.includes('Dr.')) {
      return alpha(theme.palette.primary.main, 0.8);
    }

    return alpha(theme.palette.success.main, 0.8);
  };

  // Get activity avatar text color
  const getActivityAvatarTextColor = (activity) => {
    return '#fff';
  };

  // Get activity user color
  const getActivityUserColor = (activity) => {
    if (activity.user === 'System') {
      return theme.palette.info.main;
    }

    if (activity.user.includes('Admin')) {
      return theme.palette.secondary.main;
    }

    if (activity.user.includes('Dr.')) {
      return theme.palette.primary.main;
    }

    return theme.palette.success.main;
  };

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Notifications Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              badgeContent={getUnreadCount()}
              color="error"
              sx={{ mr: 1 }}
            >
              <Notifications color="primary" />
            </Badge>
            <Typography variant="h6" fontWeight={600}>
              Notifications
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<DoneAll />}
            onClick={onMarkAllRead}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Mark All Read
          </Button>
        </Box>

        {/* Notifications List */}
        <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  component={motion.div}
                  variants={itemVariants}
                  alignItems="flex-start"
                  button
                  component={RouterLink}
                  to={getActionLink(notification)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(getNotificationColor(notification.type), 0.1),
                        color: getNotificationColor(notification.type),
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                          {notification.title || notification.message}
                        </Typography>
                        {!notification.read && (
                          <Chip
                            label="New"
                            size="small"
                            color="primary"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {notification.time || new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={(e) => handleMenuOpen(e, notification)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))
          )}
        </List>

        {/* Notification Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={handleMarkAsRead} disabled={selectedNotification?.read}>
            <MarkReadIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Read
          </MenuItem>
          <MenuItem component={RouterLink} to={selectedNotification ? getActionLink(selectedNotification) : '#'} onClick={handleMenuClose}>
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteNotification} sx={{ color: theme.palette.error.main }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        {/* Recent Activities Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(to right, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
              }}
            >
              <AccessTime fontSize="small" />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              Recent Activities
            </Typography>
          </Box>
          <Tooltip title="View all activities">
            <Button
              component={RouterLink}
              to="/admin/activity"
              size="small"
              endIcon={<KeyboardArrowRightIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            >
              View All
            </Button>
          </Tooltip>
        </Box>

        {/* Recent Activities List */}
        <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
          {recentActivities.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No recent activities
              </Typography>
            </Box>
          ) : (
            recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem
                  component={motion.div}
                  variants={itemVariants}
                  alignItems="flex-start"
                  sx={{
                    px: 2,
                    py: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      transform: 'translateX(5px)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getActivityAvatarColor(activity),
                        color: getActivityAvatarTextColor(activity),
                        boxShadow: `0 2px 8px ${alpha(getActivityAvatarColor(activity), 0.3)}`,
                      }}
                    >
                      {getActivityIcon(activity)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            mr: 0.5,
                            color: getActivityUserColor(activity),
                          }}
                        >
                          {activity.user}
                        </Typography>
                        <Typography variant="body2">
                          {activity.action}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {activity.details && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.8rem',
                              mb: 0.5,
                              mt: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {activity.details}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AccessTime sx={{ fontSize: 14, mr: 0.5, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  {activity.actionLink && (
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        component={RouterLink}
                        to={activity.actionLink}
                        sx={{
                          ml: 1,
                          color: theme.palette.secondary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          },
                        }}
                      >
                        <KeyboardArrowRightIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
                {index < recentActivities.length - 1 && (
                  <Divider
                    component="li"
                    variant="inset"
                    sx={{
                      ml: 2,
                      borderStyle: 'dashed',
                    }}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
