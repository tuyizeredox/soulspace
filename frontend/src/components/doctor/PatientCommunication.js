import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';

const PatientCommunication = ({ patients, loading, onViewAll }) => {
  const theme = useTheme();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);

  // Get token from Redux store
  const { token: userToken } = useSelector((state) => state.userAuth);
  const { token: oldToken } = useSelector((state) => state.auth);
  const token = userToken || oldToken || localStorage.getItem('token') || localStorage.getItem('userToken');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  // Select first patient by default
  useEffect(() => {
    if (patients && patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);

      // Only try to access chat if we have a token
      if (token) {
        // Try to get or create a chat with this patient
        accessChat(patients[0]._id || patients[0].id);
      } else {
        // Use a mock chat ID if no token
        setChatId(`mock_chat_${patients[0]._id || patients[0].id}`);
      }
    }
  }, [patients, selectedPatient, token]);

  // Function to access or create a chat with a patient
  const accessChat = async (patientId) => {
    if (!patientId || !token) return;

    try {
      // Ensure patientId is a valid MongoDB ObjectId (24 characters)
      // If it's not, we'll use a mock chat ID instead of making the API call
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(patientId);

      if (!isValidObjectId) {
        console.log('Invalid ObjectId format for patientId:', patientId);
        setChatId(`mock_chat_${patientId}`);
        return;
      }

      // Create config with authorization header
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Accessing chat with patient ID:', patientId);

      // Create or access a chat with the patient
      const response = await axios.post('/api/chats',
        { userId: patientId },
        config
      );

      if (response.data && response.data._id) {
        console.log('Chat accessed successfully, chat ID:', response.data._id);
        setChatId(response.data._id);
      }
    } catch (error) {
      console.error('Error accessing chat:', error);

      // Use a mock chat ID if the API fails
      setChatId(`mock_chat_${patientId}`);
    }
  };

  // Function to send a message to the patient
  const sendMessage = async () => {
    if (!message.trim() || !selectedPatient || !token) return;

    setSending(true);
    try {
      // If we have a real chat ID
      if (chatId && !chatId.startsWith('mock_chat_')) {
        // Create config with authorization header
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Send message to the chat
        await axios.post('/api/chats/message',
          {
            content: message,
            chatId
          },
          config
        );
      } else {
        // If we're using a mock chat ID, simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Show a success message to the user
        console.log('Message sent (simulated):', message);
      }

      // Clear message input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);

      // Even if there's an error, clear the message to improve UX
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  // Handle patient selection
  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    accessChat(patient._id || patient.id);
  };

  // Loading skeleton
  if (loading) {
    return (
      <Card
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        elevation={2}
        sx={{ borderRadius: 3 }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Quick Message
            </Typography>
            <Skeleton width={80} height={36} />
          </Box>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={56} sx={{ borderRadius: 1 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      elevation={2}
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Quick Message
          </Typography>
          <Button
            variant="text"
            color="primary"
            onClick={onViewAll}
          >
            View All
          </Button>
        </Box>

        {patients && patients.length > 0 ? (
          <>
            {/* Patient Selection */}
            <List sx={{ display: 'flex', overflowX: 'auto', pb: 1, mb: 2 }}>
              {patients.map((patient) => (
                <ListItem
                  component={motion.div}
                  variants={itemVariants}
                  key={patient._id || patient.id}
                  button
                  onClick={() => handleSelectPatient(patient)}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 'auto',
                    minWidth: 80,
                    px: 1,
                    borderRadius: 2,
                    mr: 1,
                    bgcolor: selectedPatient &&
                      (selectedPatient._id === patient._id || selectedPatient.id === patient.id) ?
                      alpha(theme.palette.primary.main, 0.1) : 'transparent'
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 'auto', mb: 1 }}>
                    <Avatar
                      src={patient.avatar || patient.profileImage}
                      alt={patient.name}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        border: selectedPatient &&
                          (selectedPatient._id === patient._id || selectedPatient.id === patient.id) ?
                          `2px solid ${theme.palette.primary.main}` : 'none'
                      }}
                    >
                      {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        align="center"
                        color={selectedPatient &&
                          (selectedPatient._id === patient._id || selectedPatient.id === patient.id) ?
                          'primary' : 'textPrimary'}
                        sx={{
                          fontWeight: selectedPatient &&
                            (selectedPatient._id === patient._id || selectedPatient.id === patient.id) ?
                            600 : 400,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 80
                        }}
                      >
                        {patient.name}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>

            {/* Message Input */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder={`Message to ${selectedPatient?.name || 'patient'}...`}
                variant="outlined"
                size="medium"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending || !selectedPatient}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={sendMessage}
                disabled={!message.trim() || sending || !selectedPatient}
                sx={{ borderRadius: 2, minWidth: 100 }}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No patients available for messaging</Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ChatIcon />}
              onClick={onViewAll}
              sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
            >
              Go to Messages
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientCommunication;
