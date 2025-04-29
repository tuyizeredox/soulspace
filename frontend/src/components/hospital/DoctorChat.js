import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  IconButton,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';

const DoctorChat = ({ doctor, onBack }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/users/me');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch messages on component mount and when doctor changes
  useEffect(() => {
    if (doctor) {
      fetchMessages();
    }
  }, [doctor]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to fetch messages
  const fetchMessages = async () => {
    if (!doctor) return;
    
    setLoading(true);
    try {
      // In a real app, you would fetch messages from your API
      // For now, we'll use mock data
      const response = await axios.get(`/api/messages/doctor/${doctor.id}`).catch(() => {
        // If API fails, use mock data
        return { 
          data: generateMockMessages() 
        };
      });
      
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data if API fails
      setMessages(generateMockMessages());
      setLoading(false);
    }
  };

  // Function to generate mock messages
  const generateMockMessages = () => {
    const mockMessages = [];
    const now = new Date();
    
    // Add some mock messages
    mockMessages.push({
      id: '1',
      sender: 'admin',
      receiver: doctor.id,
      content: `Hello Dr. ${doctor.name}, I wanted to check in about your schedule for next week.`,
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      read: true
    });
    
    mockMessages.push({
      id: '2',
      sender: doctor.id,
      receiver: 'admin',
      content: 'Hello! I'm available Monday through Thursday from 9 AM to 5 PM.',
      timestamp: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      read: true
    });
    
    mockMessages.push({
      id: '3',
      sender: 'admin',
      receiver: doctor.id,
      content: 'Great! We have several patients scheduled for Tuesday. Could you extend your hours until 6 PM that day?',
      timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
      read: true
    });
    
    mockMessages.push({
      id: '4',
      sender: doctor.id,
      receiver: 'admin',
      content: 'Yes, I can stay until 6 PM on Tuesday. Please update my schedule accordingly.',
      timestamp: new Date(now.getTime() - 21 * 60 * 60 * 1000).toISOString(),
      read: true
    });
    
    mockMessages.push({
      id: '5',
      sender: 'admin',
      receiver: doctor.id,
      content: 'Thank you! I've updated your schedule. Also, we have a new patient with a complex case that I'd like you to review.',
      timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      read: true
    });
    
    return mockMessages;
  };

  // Function to send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !doctor || !user) return;
    
    setSending(true);
    try {
      // In a real app, you would send the message to your API
      // For now, we'll just add it to the local state
      const message = {
        id: Date.now().toString(),
        sender: 'admin',
        receiver: doctor.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages([...messages, message]);
      setNewMessage('');
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
    }}>
      {/* Chat Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <IconButton 
          onClick={onBack} 
          sx={{ mr: 1, display: { sm: 'flex', md: 'none' } }}
        >
          <ArrowBackIcon />
        </IconButton>
        
        <Avatar 
          src={doctor.profileImage}
          sx={{ 
            width: 48, 
            height: 48, 
            mr: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.8)
          }}
        >
          {doctor.name.charAt(0)}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {doctor.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doctor.specialization}
          </Typography>
        </Box>
        
        <Chip 
          label="Online" 
          size="small" 
          color="success"
          sx={{ fontWeight: 500 }}
        />
      </Box>
      
      {/* Messages Area */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 2, 
        overflowY: 'auto',
        bgcolor: alpha(theme.palette.background.default, 0.5),
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={40} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: 2,
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h6" color="text.secondary">
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start a conversation with Dr. {doctor.name}
            </Typography>
          </Box>
        ) : (
          messages.map((message) => {
            const isAdmin = message.sender === 'admin';
            
            return (
              <Box 
                key={message.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: isAdmin ? 'flex-end' : 'flex-start',
                  mb: 1.5,
                }}
              >
                {!isAdmin && (
                  <Avatar 
                    src={doctor.profileImage}
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      mr: 1,
                      mt: 0.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.8)
                    }}
                  >
                    {doctor.name.charAt(0)}
                  </Avatar>
                )}
                
                <Box sx={{ maxWidth: '70%' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: isAdmin 
                        ? alpha(theme.palette.primary.main, 0.1) 
                        : alpha(theme.palette.background.paper, 1),
                      color: isAdmin 
                        ? theme.palette.primary.dark
                        : theme.palette.text.primary,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography variant="body1">
                      {message.content}
                    </Typography>
                  </Paper>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block', 
                      mt: 0.5,
                      textAlign: isAdmin ? 'right' : 'left',
                    }}
                  >
                    {formatTimestamp(message.timestamp)}
                  </Typography>
                </Box>
                
                {isAdmin && (
                  <Avatar 
                    src={user?.profileImage}
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      ml: 1,
                      mt: 0.5,
                      bgcolor: alpha(theme.palette.secondary.main, 0.8)
                    }}
                  >
                    {user?.name?.charAt(0) || 'A'}
                  </Avatar>
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Message Input */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
        }}>
          <IconButton color="primary" size="small">
            <AttachFileIcon />
          </IconButton>
          
          <IconButton color="primary" size="small">
            <EmojiIcon />
          </IconButton>
          
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            multiline
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            sx={{ 
              borderRadius: 3,
              px: 2,
              py: 1,
              minWidth: 'auto',
            }}
          >
            {sending ? <CircularProgress size={24} /> : 'Send'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorChat;
