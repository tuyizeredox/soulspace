import React, { useEffect } from 'react';
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
  Tooltip,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleSuperAdminChat from '../../components/admin/chat/SimpleSuperAdminChat';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { fixResizeObserverErrors } from '../../utils/resizeObserverFix';

const HospitalChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { clearMessages } = useChat();
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);

  // Use the user from any available auth source
  const user = authUser || userAuthUser || oldAuthUser;

  // Fix ResizeObserver errors
  useEffect(() => {
    const cleanup = fixResizeObserverErrors();
    return cleanup;
  }, []);

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            component={RouterLink}
            to="/hospital/dashboard"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ChatIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Communication Hub
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              component={RouterLink}
              to="/hospital/dashboard"
              sx={{ mr: 1 }}
              aria-label="back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Hospital Communication Hub
          </Typography>
        </Box>

        <Paper
          elevation={0}
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              Connect with Super Admin and other Hospital Administrators. Coordinate care, share updates, and collaborate in real-time.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ChatIcon />}
              onClick={() => {
                try {
                  const chatElement = document.getElementById('hospital-chat');
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

      {/* Chat Component */}
      <Box
        id="hospital-chat"
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          mb: 4,
          height: { xs: 'calc(100vh - 200px)', md: '700px' },
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
        }}
      >
        <SimpleSuperAdminChat />
      </Box>
    </Container>
  );
};

export default HospitalChatPage;
