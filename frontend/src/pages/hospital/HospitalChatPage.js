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
  Tooltip,
  useMediaQuery,
  Fab
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SimpleSuperAdminChat from '../../components/admin/chat/SimpleSuperAdminChat';
import AddHospitalUserChat from '../../components/hospital/AddHospitalUserChat';
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

  // State for the add user dialog
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);

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

  // Handle opening the add user dialog
  const handleOpenAddUserDialog = () => {
    setOpenAddUserDialog(true);
  };

  // Handle closing the add user dialog
  const handleCloseAddUserDialog = () => {
    setOpenAddUserDialog(false);
  };

  return (
    <Container maxWidth="xl">
      {/* Page Header */}
      <Box sx={{ mb: 4, mt: 3 }}>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{
            mb: 2,
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
            },
            '& .MuiBreadcrumbs-li': {
              display: 'flex',
              alignItems: 'center',
            }
          }}
        >
          <Link
            component={RouterLink}
            to="/hospital/dashboard"
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: theme.palette.primary.main
              }
            }}
          >
            <DashboardIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
            <ChatIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Communication Hub
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              component={RouterLink}
              to="/hospital/dashboard"
              sx={{
                mr: 1.5,
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
              aria-label="back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
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
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.15)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ maxWidth: { md: '60%' } }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{
                color: theme.palette.primary.dark,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                mb: 1.5
              }}
            >
              Complete Hospital Communication Hub
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha(theme.palette.text.primary, 0.8),
                fontSize: '1.05rem',
                lineHeight: 1.6,
                mb: 1
              }}
            >
              Connect with doctors, patients, and all hospital staff in one centralized platform.
            </Typography>
            <Box
              component="ul"
              sx={{
                pl: 2,
                mb: 0,
                '& li': {
                  mb: 0.5,
                  color: alpha(theme.palette.text.primary, 0.7)
                }
              }}
            >
              <li>Create group chats for departments or care teams</li>
              <li>Coordinate patient care with real-time messaging</li>
              <li>Share updates and collaborate securely</li>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-start' },
              alignItems: 'center',
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 2, md: 0 }
            }}
          >
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
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                '&:hover': {
                  boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s'
                }
              }}
            >
              Start Chatting
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenAddUserDialog}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              Add User to Chat
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<GroupIcon />}
              onClick={() => {
                setOpenAddUserDialog(true);
                // The group mode will be handled in the dialog
              }}
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                fontSize: '0.95rem',
                fontWeight: 500,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.05)
                }
              }}
            >
              Create Group Chat
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
          mb: 6,
          height: { xs: 'calc(100vh - 200px)', md: '750px' },
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          position: 'relative',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          '&:hover': {
            boxShadow: `0 15px 50px ${alpha(theme.palette.common.black, 0.15)}`,
            transition: 'box-shadow 0.3s ease-in-out'
          }
        }}
      >
        <SimpleSuperAdminChat />

        {/* Floating Action Button for adding users */}
        <Tooltip title="Add new chat" arrow placement="left">
          <Fab
            color="primary"
            aria-label="add new chat"
            onClick={handleOpenAddUserDialog}
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              zIndex: 1000,
              width: 64,
              height: 64,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                transition: 'all 0.2s'
              }
            }}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>
      </Box>

      {/* Add User Dialog */}
      <AddHospitalUserChat
        open={openAddUserDialog}
        onClose={handleCloseAddUserDialog}
      />
    </Container>
  );
};

export default HospitalChatPage;
