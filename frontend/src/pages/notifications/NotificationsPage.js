import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
} from '../../store/slices/notificationSlice';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Button,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  CalendarMonth as CalendarIcon,
  Message as MessageIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
  Alarm as AlarmIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { notifications, totalPages, currentPage, loading, unreadCount } = useSelector(
    (state) => state.notifications
  );
  
  const [filters, setFilters] = useState({
    read: '',
    type: '',
  });
  
  useEffect(() => {
    // Fetch notifications on mount and when filters change
    dispatch(fetchUserNotifications({
      page: currentPage,
      limit: 10,
      ...filters
    }));
  }, [dispatch, currentPage, filters]);
  
  const handlePageChange = (event, value) => {
    dispatch(fetchUserNotifications({
      page: value,
      limit: 10,
      ...filters
    }));
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
          // For other types, do nothing
          break;
      }
    }
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
  
  // Get chip color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'default';
      case 'normal':
        return 'primary';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: 32 }} />
              <Typography variant="h4" component="h1" fontWeight="bold">
                Notifications
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} new`}
                    color="primary"
                    size="small"
                    sx={{ ml: 2, fontWeight: 'bold' }}
                  />
                )}
              </Typography>
            </Box>
            
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
          </Box>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Paper elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <FilterListIcon color="primary" />
                </Grid>
                <Grid item xs={12} sm>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Filters
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="read-filter-label">Status</InputLabel>
                    <Select
                      labelId="read-filter-label"
                      id="read-filter"
                      name="read"
                      value={filters.read}
                      label="Status"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="false">Unread</MenuItem>
                      <MenuItem value="true">Read</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="type-filter-label">Type</InputLabel>
                    <Select
                      labelId="type-filter-label"
                      id="type-filter"
                      name="type"
                      value={filters.type}
                      label="Type"
                      onChange={handleFilterChange}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="appointment">Appointments</MenuItem>
                      <MenuItem value="message">Messages</MenuItem>
                      <MenuItem value="prescription">Prescriptions</MenuItem>
                      <MenuItem value="lab_result">Lab Results</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                      <MenuItem value="reminder">Reminders</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 5, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No notifications found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {filters.read || filters.type
                    ? 'Try changing your filters'
                    : 'You have no notifications yet'}
                </Typography>
              </Box>
            ) : (
              <>
                <List sx={{ p: 0 }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification._id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem
                        button
                        onClick={() => handleNotificationClick(notification)}
                        sx={{
                          py: 2,
                          px: 3,
                          borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                          bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={notification.read ? 400 : 600}
                              >
                                {notification.title}
                              </Typography>
                              <Chip
                                label={notification.priority}
                                color={getPriorityColor(notification.priority)}
                                size="small"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {notification.message}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex' }}>
                            {!notification.read && (
                              <Tooltip title="Mark as read">
                                <IconButton
                                  edge="end"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  <MarkReadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton
                                edge="end"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(notification._id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default NotificationsPage;
