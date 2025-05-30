import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchUserNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
} from '../../store/slices/notificationSlice';
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  CalendarMonth as CalendarIcon,
  Message as MessageIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
  Alarm as AlarmIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { notifications = [], unreadCount = 0, loading = false } = useSelector((state) => state.notifications || {});
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  useEffect(() => {
    // Fetch unread count on mount
    dispatch(fetchUnreadCount());
  }, [dispatch]);
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
    // Fetch notifications when menu is opened
    dispatch(fetchUserNotifications({ limit: 10 }));
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };
  
  const handleDelete = (id) => {
    dispatch(removeNotification(id));
  };
  
  const handleViewAll = () => {
    navigate('/notifications');
    handleCloseMenu();
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }
    
    // Navigate to the appropriate page based on notification type and actionLink
    if (notification.actionLink) {
      navigate(notification.actionLink);
    } else {
      switch (notification.type) {
        case 'appointment':
          navigate('/appointments');
          break;
        case 'message':
          navigate('/messages');
          break;
        case 'prescription':
          navigate('/prescriptions');
          break;
        case 'lab_result':
          navigate('/records/lab-results');
          break;
        default:
          // For other types, just close the menu
          break;
      }
    }
    
    handleCloseMenu();
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CalendarIcon color="primary" />;
      case 'message':
        return <MessageIcon color="info" />;
      case 'prescription':
        return <MedicationIcon color="secondary" />;
      case 'lab_result':
        return <ScienceIcon color="success" />;
      case 'reminder':
        return <AlarmIcon color="warning" />;
      default:
        return <InfoIcon color="action" />;
    }
  };
  
  // Format date
  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpenMenu}
          size="large"
          aria-label="show notifications"
          aria-controls={open ? 'notifications-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
            mt: 1.5,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.common.black, 0.05),
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !notifications || notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {Array.isArray(notifications) && notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                  bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={notification.read ? 400 : 600}
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {notification.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontSize: '0.75rem',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                      >
                        {formatDate(notification.createdAt)}
                      </Typography>
                    </>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {!notification.read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          sx={{ mb: 1 }}
                        >
                          <CircleIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" onClick={handleViewAll}>
            View All Notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter;
