import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Chip,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  VerifiedUser as VerifiedUserIcon,
  MedicalServices as MedicalServicesIcon,
  GetApp as DownloadIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { getSocket, joinChat } from '../../utils/socketConfig';
import chatApiService from '../../services/chatApiService';

const PatientChat = ({ doctor, onVideoCall }) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const initializationRef = useRef(false);

  // State variables
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');

  // Get user from Redux store
  const authUser = useSelector((state) => state.auth.user);
  const userAuthUser = useSelector((state) => state.userAuth.user);
  const user = authUser || userAuthUser || JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userData'));

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (!fileType) return <FileIcon />;

    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType.startsWith('audio/')) return <AudioIcon />;
    if (fileType.startsWith('video/')) return <VideoIcon />;
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <DocumentIcon />;
    }
    return <FileIcon />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Render attachment component
  const renderAttachment = (attachment, messageId) => {
    if (!attachment) return null;

    const isImage = attachment.type && attachment.type.startsWith('image/');
    const attachmentUrl = attachment.url?.startsWith('http')
      ? attachment.url
      : `${process.env.REACT_APP_API_URL || 'https://soulspacebackend.onrender.com'}${attachment.url}`;

    if (isImage) {
      return (
        <Box
          key={`${messageId}-${attachment.name}`}
          sx={{
            position: 'relative',
            maxWidth: 200,
            borderRadius: 2,
            overflow: 'hidden',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.9
            }
          }}
          onClick={() => window.open(attachmentUrl, '_blank')}
        >
          <img
            src={attachmentUrl}
            alt={attachment.name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 200,
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <Box
            sx={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
              bgcolor: 'grey.100',
              color: 'text.secondary'
            }}
          >
            <ImageIcon sx={{ mr: 1 }} />
            <Typography variant="body2">Image not available</Typography>
          </Box>
        </Box>
      );
    }

    // For non-image files, show a file card
    return (
      <Paper
        key={`${messageId}-${attachment.name}`}
        elevation={1}
        sx={{
          p: 1.5,
          maxWidth: 250,
          cursor: 'pointer',
          bgcolor: 'background.default',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        onClick={() => window.open(attachmentUrl, '_blank')}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ mr: 1.5, color: 'primary.main' }}>
            {getFileIcon(attachment.type)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {attachment.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(attachment.size)}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ ml: 1 }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  // Fetch messages using the new API service
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) {
      console.error('Cannot fetch messages: chatId is required');
      return;
    }

    try {
      console.log('Fetching messages for chat:', chatId);
      setLoading(true);
      setError('');

      const fetchedMessages = await chatApiService.fetchMessages(chatId);

      if (fetchedMessages && fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
        console.log(`Loaded ${fetchedMessages.length} messages`);
      } else {
        // Create welcome message if no messages exist
        if (doctor && (doctor._id || doctor.id)) {
          const welcomeMessage = {
            _id: `welcome-${Date.now()}`,
            content: `Hello! I'm Dr. ${doctor.name || 'Doctor'}. How can I help you today?`,
            sender: {
              _id: doctor._id || doctor.id,
              name: doctor.name || 'Doctor',
              role: 'doctor',
              avatar: doctor.avatar || doctor.profileImage
            },
            timestamp: new Date(Date.now() - 60000).toISOString(),
            chat: chatId
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages([]);
        }
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');

      // Create fallback welcome message
      if (doctor && (doctor._id || doctor.id)) {
        const fallbackMessage = {
          _id: `fallback-${Date.now()}`,
          content: `Hello! I'm Dr. ${doctor.name || 'Doctor'}. How can I help you today?`,
          sender: {
            _id: doctor._id || doctor.id,
            name: doctor.name || 'Doctor',
            role: 'doctor',
            avatar: doctor.avatar || doctor.profileImage
          },
          timestamp: new Date(Date.now() - 60000).toISOString(),
          chat: chatId
        };
        setMessages([fallbackMessage]);
      }
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  // Initialize chat and socket connection
  const initializeChat = useCallback(async () => {
    if (initializationRef.current || !user || !doctor) {
      return;
    }

    initializationRef.current = true;

    try {
      console.log('Initializing chat with doctor:', doctor.name);
      setLoading(true);
      setError('');

      // Create or access chat
      const doctorId = doctor._id || doctor.id;
      if (!doctorId) {
        throw new Error('Doctor ID is required');
      }

      const chat = await chatApiService.createOrAccessChat(doctorId, user);
      setChatId(chat._id);

      // Fetch messages
      await fetchMessages(chat._id);

      // Initialize socket connection
      try {
        const socketInstance = await getSocket(user);
        setSocket(socketInstance);

        // Join chat room
        await joinChat(chat._id, user);

        // Set up socket event listeners
        socketInstance.on('message-received', (newMessage) => {
          if (newMessage && newMessage.chat &&
              (newMessage.chat._id === chat._id || newMessage.chat === chat._id)) {
            setMessages(prev => [...prev, newMessage]);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        });

        socketInstance.on('typing', (chatRoomId) => {
          if (chatRoomId === chat._id) {
            setIsTyping(true);
          }
        });

        socketInstance.on('stop-typing', (chatRoomId) => {
          if (chatRoomId === chat._id) {
            setIsTyping(false);
          }
        });

      } catch (socketError) {
        console.warn('Socket connection failed:', socketError);
        // Continue without socket - chat will still work
      }

    } catch (error) {
      console.error('Error initializing chat:', error);
      setError('Failed to initialize chat. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, doctor, fetchMessages]);

  // Initialize chat when component mounts
  useEffect(() => {
    if (user && doctor) {
      initializeChat();
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.off('message-received');
        socket.off('typing');
        socket.off('stop-typing');
      }
      initializationRef.current = false;
    };
  }, [user, doctor, initializeChat]);

  // Send message using the new API service
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !chatId || sending) {
      return;
    }

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    // Create temporary message for immediate display
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      content: messageText,
      sender: {
        _id: user._id || user.id,
        name: user.name,
        role: user.role
      },
      timestamp: new Date().toISOString(),
      isTemp: true
    };

    try {
      console.log('Sending message:', messageText);

      // Add to messages immediately for better UX
      setMessages(prev => [...prev, tempMessage]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Send to server
      const sentMessage = await chatApiService.sendMessage(chatId, messageText);

      // Replace temp message with real one
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? sentMessage : msg
        )
      );

      // Emit socket event if connected
      if (socket && socket.connected) {
        socket.emit('new-message', sentMessage);
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Mark temp message as failed
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? {
            ...msg,
            status: 'failed',
            error: true
          } : msg
        )
      );

      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  }, [message, chatId, sending, user, socket]);

  // Handle key press (Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time for messages
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), 'HH:mm');
    } catch (error) {
      return '';
    }
  };

  // Handle file upload and send as message
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !chatId) return;

    setSending(true);

    try {
      console.log('Uploading files:', files.length);

      // Upload files first
      const uploadedFiles = await chatApiService.uploadFiles(files, chatId);

      if (uploadedFiles && uploadedFiles.length > 0) {
        // Create a message with attachments
        const messageContent = uploadedFiles.length === 1
          ? `Sent ${uploadedFiles[0].name}`
          : `Sent ${uploadedFiles.length} files`;

        // Create temporary message for immediate display
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          content: messageContent,
          attachments: uploadedFiles,
          sender: {
            _id: user._id || user.id,
            name: user.name,
            role: user.role
          },
          timestamp: new Date().toISOString(),
          isTemp: true
        };

        // Add to messages immediately for better UX
        setMessages(prev => [...prev, tempMessage]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        // Send message with attachments to server
        const sentMessage = await chatApiService.sendMessage(chatId, messageContent, uploadedFiles);

        // Replace temp message with real one
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempMessage._id ? sentMessage : msg
          )
        );

        // Emit socket event if connected
        if (socket && socket.connected) {
          socket.emit('new-message', sentMessage);
        }

        console.log('Files uploaded and message sent successfully');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading chat...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(theme.palette.secondary.light, 0.06)})`,
      }}
    >
      {/* Chat Header */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: '0 0 24px 24px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar
              src={doctor?.avatar || doctor?.profileImage}
              sx={{ width: 56, height: 56, mr: 2, boxShadow: 2, border: `2px solid ${theme.palette.primary.main}` }}
            >
              {doctor?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
                Dr. {doctor?.name || 'Doctor'}
              </Typography>
              <Box display="flex" alignItems="center">
                <Badge
                  variant="dot"
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Online
                </Typography>
                {isTyping && (
                  <Typography variant="body2" color="primary" sx={{ ml: 1, fontStyle: 'italic', fontWeight: 500 }}>
                    • typing...
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Video Call">
              <IconButton
                onClick={() => onVideoCall && onVideoCall(doctor)}
                color="primary"
                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), boxShadow: 1 }}
              >
                <VideoCallIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Voice Call">
              <IconButton color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), boxShadow: 1 }}>
                <PhoneIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Box
          sx={{
            p: 1,
            bgcolor: 'error.light',
            color: 'error.contrastText',
            textAlign: 'center',
            borderRadius: 2,
            m: 2,
            boxShadow: 1
          }}
        >
          <Typography variant="body2">{error}</Typography>
        </Box>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 1, sm: 2 },
          bgcolor: 'transparent',
          background: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.04)}, ${alpha(theme.palette.secondary.light, 0.03)})`,
        }}
      >
        {messages.map((msg, index) => {
          const isPatient = msg.sender?._id === (user?._id || user?.id);
          const isConsecutive = index > 0 && 
            messages[index - 1].sender?._id === msg.sender?._id;

          return (
            <Box
              key={msg._id}
              sx={{
                display: 'flex',
                justifyContent: isPatient ? 'flex-end' : 'flex-start',
                mb: isConsecutive ? 0.5 : 2,
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  maxWidth: { xs: '90%', sm: '70%' },
                  display: 'flex',
                  flexDirection: isPatient ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                {!isConsecutive && !isPatient && (
                  <Avatar
                    src={msg.sender?.avatar}
                    sx={{ width: 32, height: 32, mr: 1, boxShadow: 1 }}
                  >
                    {msg.sender?.name?.charAt(0)}
                  </Avatar>
                )}
                <Paper
                  elevation={isPatient ? 4 : 2}
                  sx={{
                    p: 1.5,
                    bgcolor: isPatient ? 'primary.main' : 'background.paper',
                    color: isPatient ? 'primary.contrastText' : 'text.primary',
                    borderRadius: isPatient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    ml: !isPatient && isConsecutive ? 5 : 0,
                    position: 'relative',
                    boxShadow: isPatient ? '0 2px 12px 0 rgba(33,150,243,0.10)' : 1,
                    border: isPatient ? `1.5px solid ${alpha(theme.palette.primary.dark, 0.18)}` : `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Message content */}
                  {msg.content && (
                    <Typography variant="body1" sx={{ mb: msg.attachments?.length > 0 ? 1 : 0, fontSize: '1.05rem', fontWeight: 400 }}>
                      {msg.content}
                    </Typography>
                  )}
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mt: msg.content ? 1 : 0
                    }}>
                      {msg.attachments.map((attachment, index) => (
                        <Box key={index}>
                          {renderAttachment(attachment, msg._id)}
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.75rem',
                      textAlign: isPatient ? 'right' : 'left',
                    }}
                  >
                    {formatTime(msg.timestamp)}
                    {msg.isTemp && ' • Sending...'}
                    {msg.error && ' • Failed'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Paper
        elevation={6}
        sx={{
          p: 2,
          borderRadius: '24px 24px 0 0',
          borderTop: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.08)}, ${alpha(theme.palette.secondary.light, 0.06)})`,
          boxShadow: '0 -4px 24px 0 rgba(0,0,0,0.07)',
        }}
      >
        <Box display="flex" alignItems="flex-end" gap={1}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            onChange={handleFileUpload}
          />
          <Tooltip title="Attach files (Images, Documents, Videos)">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              color="primary"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), boxShadow: 1 }}
            >
              <AttachFileIcon />
            </IconButton>
          </Tooltip>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.7),
                boxShadow: 1,
              }
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            color="primary"
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&:disabled': {
                bgcolor: 'action.disabled'
              }
            }}
          >
            {sending ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default PatientChat;
