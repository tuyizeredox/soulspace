import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  Button,
  IconButton,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleSuperAdminChat from '../../components/admin/chat/SimpleSuperAdminChat';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { fixResizeObserverErrors } from '../../utils/resizeObserverFix';

const ChatPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { getTotalUnreadCount } = useChat();
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);

  // Use the user from any available auth source, prioritizing the AuthContext
  const user = authUser || userAuthUser || oldAuthUser;

  const [unreadCount, setUnreadCount] = useState(0);

  // Apply ResizeObserver fix
  useEffect(() => {
    // Apply the fix for ResizeObserver errors
    const cleanup = fixResizeObserverErrors();

    // Disable animations temporarily to prevent ResizeObserver issues
    const style = document.createElement('style');
    style.innerHTML = `
      /* Temporarily disable transitions and animations in chat page */
      .MuiContainer-root *, .MuiPaper-root *, .MuiBox-root * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Clean up
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
      document.head.removeChild(style);
    };
  }, []);

  // Update unread count every 5 seconds with improved error handling
  useEffect(() => {
    try {
      // Verify user is authenticated
      if (!user) {
        console.log('ChatPage: No authenticated user found');
        navigate('/login');
        return;
      }

      // Verify user is a super_admin
      if (user.role !== 'super_admin') {
        console.log('ChatPage: User is not a super_admin, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }

      console.log('ChatPage: Authenticated as', user.name, 'with role', user.role);

      const updateUnreadCount = () => {
        try {
          // Safely get unread count
          const count = getTotalUnreadCount();
          if (typeof count === 'number') {
            setUnreadCount(count);
          }
        } catch (error) {
          console.error('Error updating unread count:', error);
          // Don't update the count if there's an error
        }
      };

      // Initial update
      updateUnreadCount();

      // Set interval for updates
      const interval = setInterval(updateUnreadCount, 5000);

      // Clean up on unmount
      return () => {
        try {
          clearInterval(interval);
        } catch (error) {
          console.error('Error clearing interval:', error);
        }
      };
    } catch (error) {
      console.error('Error in ChatPage effect:', error);
      // Attempt to navigate to a safe page if there's an error
      try {
        navigate('/admin/dashboard');
      } catch (navError) {
        console.error('Error navigating away from error state:', navError);
      }
    }
  }, [getTotalUnreadCount, user, navigate]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header - removed animations to prevent ResizeObserver issues */}
      <Box
        sx={{ mb: 4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Communication Center
            </Typography>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
              <Link
                component={RouterLink}
                to="/admin/dashboard"
                color="inherit"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <DashboardIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Dashboard
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ChatIcon sx={{ mr: 0.5, fontSize: 20 }} />
                Chat
              </Typography>
            </Breadcrumbs>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Back to Dashboard">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  try {
                    navigate('/admin/dashboard');
                  } catch (error) {
                    console.error('Error navigating to dashboard:', error);
                    // Fallback to direct location change if navigation fails
                    window.location.href = '/admin/dashboard';
                  }
                }}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Dashboard
              </Button>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                color="primary"
                onClick={() => {
                  try {
                    navigate('/admin/notifications');
                  } catch (error) {
                    console.error('Error navigating to notifications:', error);
                    // Fallback to direct location change if navigation fails
                    window.location.href = '/admin/notifications';
                  }
                }}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.15)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Real-time Communication Hub
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect with hospital administrators, manage group conversations, and coordinate across your healthcare network.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ChatIcon />}
              onClick={() => {
                try {
                  const chatElement = document.getElementById('admin-chat');
                  if (chatElement) {
                    chatElement.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  } else {
                    console.warn('Chat element not found in DOM');
                  }
                } catch (error) {
                  console.error('Error scrolling to chat:', error);
                }
              }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1.2,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Start Chatting
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Chat Component - removed animations to prevent ResizeObserver issues */}
      <Box
        id="admin-chat"
      >
        <SimpleSuperAdminChat />
      </Box>
    </Container>
  );
};

export default ChatPage;
