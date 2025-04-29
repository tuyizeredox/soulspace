import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  useMediaQuery,
  IconButton,
  Drawer,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  Circle as CircleIcon,
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import axios from '../../../utils/axiosConfig';
import { formatDistanceToNow } from 'date-fns';
import { fixResizeObserverErrors } from '../../../utils/resizeObserverFix';
import { fixTextDirection, normalizeText, applyTextDirectionFix } from '../../../utils/textDirectionFix';
import { getAvatarUrl, getInitials } from '../../../utils/avatarUtils';
import AddHospitalAdminChat from './AddHospitalAdminChat';

// Simple chat component without animations or complex features
const SimpleSuperAdminChat = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);

  // Use the user from any available auth source
  const user = authUser || userAuthUser || oldAuthUser;

  // Chat state
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [userDetails, setUserDetails] = useState({});
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [addAdminDialogOpen, setAddAdminDialogOpen] = useState(false);
  const [connectingToAdmin, setConnectingToAdmin] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get token from all possible sources
  const getToken = useCallback(() => {
    const authToken = authUser?.token;
    const userAuthToken = localStorage.getItem('userToken');
    const oldAuthToken = localStorage.getItem('token');
    return authToken || userAuthToken || oldAuthToken;
  }, [authUser]);

  // Fetch chats from API
  const fetchChats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = getToken();

      const response = await axios.get('/api/chats', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response && response.data) {
        setChats(response.data);
        setFilteredChats(response.data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, getToken]);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      setLoadingMessages(true);
      const token = getToken();

      const response = await axios.get(`/api/chats/${chatId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response && response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoadingMessages(false);
    }
  }, [getToken]);

  // Send a message with improved user feedback
  const sendMessage = async () => {
    // Validate inputs
    if (!newMessage.trim()) {
      return; // Don't send empty messages
    }

    if (!selectedChat) {
      setError('Please select a chat first.');
      return;
    }

    // Store message locally for optimistic UI update
    const messageToSend = newMessage.trim();

    // Clear input immediately for better UX
    setNewMessage('');

    // Add optimistic message to UI (optional)
    // This would require additional state management

    try {
      const token = getToken();

      // Show sending indicator
      setSendingMessage(true);

      // Send message to server
      await axios.post('/api/chats/message', {
        content: messageToSend,
        chatId: selectedChat._id
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      // Fetch updated messages
      fetchMessages(selectedChat._id);

      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');

      // Restore message in input field if sending failed
      setNewMessage(messageToSend);
    } finally {
      // Hide sending indicator
      setSendingMessage(false);
    }
  };

  // Handle typing events with aggressive text direction normalization
  const handleTyping = (e) => {
    // Get the input value and normalize it with LTR mark
    let value = normalizeText(e.target.value);

    // Apply text direction fixes to the input element
    if (e.target) {
      applyTextDirectionFix(e.target);

      // Force the cursor position to the end
      const length = value.length;
      setTimeout(() => {
        try {
          e.target.setSelectionRange(length, length);
        } catch (err) {
          console.log('Could not set selection range');
        }
      }, 0);
    }

    // Apply text direction fixes to the input ref
    if (inputRef.current) {
      applyTextDirectionFix(inputRef.current);
    }

    // Update the message state with normalized text
    setNewMessage(value);

    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }

    // Set a timeout to clear typing indicator after 1 second of inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  // Handle starting a chat with a hospital admin
  const handleStartChatWithAdmin = async (admin) => {
    if (!admin || !admin._id) {
      setError('Invalid admin selected');
      return;
    }

    try {
      setConnectingToAdmin(true);
      console.log('Starting chat with admin:', admin.name, 'ID:', admin._id);

      const token = getToken();

      // Access or create a chat with the selected admin
      // The correct endpoint is /api/chats (not /api/chats/access)
      const response = await axios.post('/api/chats',
        { userId: admin._id },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response && response.data) {
        console.log('Chat created/accessed successfully:', response.data);

        // Refresh chats list
        await fetchChats();

        // Select the new chat
        const newChat = response.data;
        handleSelectChat(newChat);

        // Show success message
        setError(null); // Clear any existing errors
      } else {
        console.warn('Empty or invalid response when creating chat:', response);
        setError('Failed to create chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat with admin:', error);

      // Provide more specific error messages
      if (error.response) {
        console.error('Server responded with error:', error.response.status, error.response.data);
        setError(`Failed to start chat: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('Failed to start chat: No response from server. Please check your connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setError(`Failed to start chat: ${error.message}`);
      }
    } finally {
      setConnectingToAdmin(false);
    }
  };

  // Handle chat selection with input focus and scroll to top
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);

    if (isMobile) {
      setSidebarOpen(false);
    }

    // Scroll to the top of the message area to show the header
    setTimeout(() => {
      // Find the message area container
      const messageArea = document.querySelector('.message-area-container');
      if (messageArea) {
        // Scroll to top to show header
        messageArea.scrollTop = 0;
      }

      // Focus the input field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  };

  // Filter chats based on search term
  useEffect(() => {
    if (!chats.length) {
      setFilteredChats([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat => {
      // For group chats, search in group name
      if (chat.isGroup) {
        return chat.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
      }

      // For one-on-one chats, search in participant names
      if (chat.participants && Array.isArray(chat.participants)) {
        return chat.participants.some(p =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return false;
    });

    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  // Fetch chats on component mount and handle selectedChatId from localStorage
  useEffect(() => {
    const initializeChats = async () => {
      await fetchChats();

      // Check if there's a selectedChatId in localStorage (from doctor chat)
      const selectedChatId = localStorage.getItem('selectedChatId');
      if (selectedChatId && chats.length > 0) {
        // Find the chat with the matching ID
        const chatToSelect = chats.find(chat => chat._id === selectedChatId);
        if (chatToSelect) {
          // Select the chat
          handleSelectChat(chatToSelect);
          // Clear the selectedChatId from localStorage to avoid reselecting on refresh
          localStorage.removeItem('selectedChatId');
        }
      }
    };

    initializeChats();
  }, [fetchChats, chats.length]);

  // Fix ResizeObserver errors and text direction issues
  useEffect(() => {
    // Apply the fix for ResizeObserver errors
    const cleanup = fixResizeObserverErrors();

    // Disable transitions and fix text direction issues
    const style = document.createElement('style');
    style.innerHTML = `
      /* Temporarily disable transitions and animations */
      .MuiDrawer-root, .MuiPaper-root, .MuiBox-root {
        transition: none !important;
        animation: none !important;
      }

      /* Fix text direction issues - aggressive approach */
      .MuiInputBase-input, .MuiOutlinedInput-input, textarea, input, [contenteditable="true"] {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: plaintext !important;
        text-orientation: upright !important;
        writing-mode: horizontal-tb !important;
      }

      /* Force all text inputs to be LTR */
      .MuiTextField-root, .MuiOutlinedInput-root {
        direction: ltr !important;
      }

      /* Add dir attribute to all inputs */
      .MuiInputBase-input[dir], .MuiOutlinedInput-input[dir] {
        direction: ltr !important;
      }

      /* Ensure chat components are properly positioned */
      .message-area-container {
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
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

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  // Ensure input field always has correct text direction
  useEffect(() => {
    // Apply global text direction fixes
    const cleanup = fixTextDirection(inputRef);

    // Add event listeners for focus and click to maintain direction
    if (inputRef.current) {
      const handleFocusOrClick = () => {
        applyTextDirectionFix(inputRef.current);
      };

      // Add event listeners
      inputRef.current.addEventListener('focus', handleFocusOrClick);
      inputRef.current.addEventListener('click', handleFocusOrClick);
      inputRef.current.addEventListener('keydown', handleFocusOrClick);
      inputRef.current.addEventListener('input', handleFocusOrClick);

      // Clean up
      return () => {
        if (cleanup) cleanup();

        if (inputRef.current) {
          inputRef.current.removeEventListener('focus', handleFocusOrClick);
          inputRef.current.removeEventListener('click', handleFocusOrClick);
          inputRef.current.removeEventListener('keydown', handleFocusOrClick);
          inputRef.current.removeEventListener('input', handleFocusOrClick);
        }
      };
    }

    return cleanup;
  }, [inputRef.current]);

  // Scroll to bottom when messages change - with debounce to prevent ResizeObserver issues
  useEffect(() => {
    if (!messagesEndRef.current) return;

    // Use requestAnimationFrame to ensure DOM is ready
    const scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
          console.error('Error scrolling to bottom:', error);
          // Fallback to instant scroll if smooth scroll fails
          messagesEndRef.current?.scrollIntoView();
        }
      });
    }, 100); // Small delay to ensure messages are rendered

    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  // Handle responsive sidebar
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handle swipe gestures for mobile
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      // Swipe right to open sidebar
      if (touchEndX - touchStartX > 100 && touchStartX < 50) {
        setSidebarOpen(true);
      }

      // Swipe left to close sidebar
      if (touchStartX - touchEndX > 100 && sidebarOpen) {
        setSidebarOpen(false);
      }

      // Reset values
      touchStartX = 0;
      touchEndX = 0;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Clean up
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, sidebarOpen]);

  // Get chat name
  const getChatName = (chat) => {
    if (!chat) return 'Unknown Chat';

    if (chat.isGroup) {
      return chat.groupName || 'Unnamed Group';
    }

    if (!chat.participants || !Array.isArray(chat.participants)) {
      return 'Unknown User';
    }

    // Find the other participant (not the current user)
    const userId = user?.id || user?._id;
    const otherParticipant = chat.participants.find(p =>
      p._id && p._id.toString() !== userId?.toString()
    );

    return otherParticipant?.name || 'Unknown User';
  };

  // Get the other user in a chat (not the current user)
  const getOtherUser = (chat) => {
    if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
      return null;
    }

    if (chat.isGroup) {
      return null;
    }

    // Find the other participant (not the current user)
    const userId = user?.id || user?._id;
    if (!userId) return null;

    return chat.participants.find(p =>
      p && p._id && p._id.toString() !== userId.toString()
    );
  };

  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Check if message is from current user
  const isCurrentUser = (senderId) => {
    if (!user || !senderId) return false;

    const userId = user.id || user._id;
    if (!userId) return false;

    const senderIdStr = typeof senderId === 'object' && senderId._id
      ? senderId._id.toString()
      : senderId.toString();

    return userId.toString() === senderIdStr;
  };

  // Clear error message
  const handleCloseError = () => {
    setError(null);
  };

  // Chat Sidebar Component - defined outside the return statement
  const ChatSidebar = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        {/* Close button for mobile */}
        {isMobile && (
          <IconButton
            onClick={() => setSidebarOpen(false)}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 10,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <ClearIcon />
          </IconButton>
        )}

        {/* Header */}
        <Box
          sx={{
            p: 2,
            pb: 3,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.03)
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            color="primary"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              mt: isMobile ? 1 : 0
            }}
          >
            Admin Communication
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={connectingToAdmin ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
              size="small"
              fullWidth={isMobile}
              onClick={() => setAddAdminDialogOpen(true)}
              disabled={connectingToAdmin}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 2,
                py: 1
              }}
            >
              {connectingToAdmin ? 'Connecting...' : user?.role === 'super_admin' ? 'Add Hospital Admin' : 'Add Admin from Your Hospital'}
            </Button>
          </Box>
        </Box>

        {/* Search bar */}
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: alpha(theme.palette.common.black, 0.04),
              borderRadius: 2,
              p: '2px 8px'
            }}
          >
            <IconButton sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true }}
            />
            {searchTerm && (
              <IconButton
                sx={{ p: '10px' }}
                aria-label="clear"
                onClick={() => setSearchTerm('')}
              >
                <ClearIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Chats list */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredChats.length > 0 ? (
            <List sx={{ p: 0 }}>
              {filteredChats.map((chat) => (
                <ListItem
                  key={chat._id}
                  button
                  selected={selectedChat?._id === chat._id}
                  onClick={() => handleSelectChat(chat)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15)
                      }
                    }
                  }}
                >
                  <ListItemAvatar>
                    {chat.isGroup ? (
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                        <GroupIcon />
                      </Avatar>
                    ) : (
                      <Avatar
                        src={getAvatarUrl(getOtherUser(chat))}
                        imgProps={{
                          onError: (e) => {
                            console.error('Chat List: Error loading avatar image');
                            e.target.src = '/images/default-avatar.png';
                          }
                        }}
                      >
                        {getInitials(getChatName(chat))}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        fontWeight={500}
                        noWrap
                      >
                        {getChatName(chat)}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {chat.lastMessage?.content || 'No messages yet'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {searchTerm ? 'No chats found' : 'No chats yet'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  // Message Area Component - defined outside the return statement
  const MessageArea = () => {
    if (!selectedChat) return null;

    return (
      <>
        {/* Chat header - fixed position to ensure visibility */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`
          }}
        >
          {isMobile && (
            <IconButton
              onClick={() => setSidebarOpen(true)}
              sx={{
                mr: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
              color="primary"
              size="medium"
            >
              <MenuIcon />
            </IconButton>
          )}

          {selectedChat.isGroup ? (
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                mr: 2,
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
            >
              <GroupIcon />
            </Avatar>
          ) : (
            <Avatar
              sx={{
                mr: 2,
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 }
              }}
              src={getAvatarUrl(getOtherUser(selectedChat))}
              imgProps={{
                onError: (e) => {
                  console.error('Chat: Error loading avatar image');
                  e.target.src = '/images/default-avatar.png';
                }
              }}
            >
              {getInitials(getChatName(selectedChat))}
            </Avatar>
          )}

          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: { xs: '180px', sm: '250px', md: '300px' }
            }}
          >
            {getChatName(selectedChat)}
          </Typography>
        </Box>

        {/* Messages area - with fixed sizing to prevent ResizeObserver issues */}
        <Box
          sx={{
            flexGrow: 1, // Changed to 1 to take available space
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: alpha(theme.palette.background.default, 0.5),
            // Fixed height to prevent ResizeObserver issues but allow scrolling
            height: {
              xs: 'calc(100% - 120px)', // Subtract header and input height
              sm: 'calc(100% - 130px)',
              md: 'calc(100% - 140px)'
            },
            // Add containment to prevent ResizeObserver issues
            contain: 'content',
            // Ensure proper scrolling
            overflowY: 'auto',
            overflowX: 'hidden',
            // Disable all animations
            '& *': {
              transition: 'none !important',
              animation: 'none !important'
            }
          }}
        >
          {loadingMessages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : messages.length > 0 ? (
            // Limit the number of messages to render to prevent performance issues
            messages.slice(-50).map((message) => {
              if (!message || !message._id) return null;
              const isOwn = isCurrentUser(message.sender);

              return (
                <Box
                  key={message._id}
                  sx={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    mb: 1,
                    // Add containment to prevent ResizeObserver issues
                    contain: 'content'
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      ml: isOwn ? 1 : 0,
                      mr: isOwn ? 0 : 1,
                      display: { xs: isOwn ? 'none' : 'flex', sm: 'flex' }
                    }}
                    src={isOwn
                      ? getAvatarUrl(user)
                      : (message.sender && message.sender._id)
                        ? getAvatarUrl(message.sender)
                        : null}
                    imgProps={{
                      onError: (e) => {
                        console.error('Message: Error loading avatar image');
                        e.target.src = '/images/default-avatar.png';
                      }
                    }}
                  >
                    {isOwn
                      ? getInitials(user?.name)
                      : getInitials(message.sender?.name)}
                  </Avatar>

                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      maxWidth: { xs: '85%', sm: '75%', md: '70%' },
                      bgcolor: isOwn
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.background.paper, 1),
                      border: `1px solid ${alpha(
                        isOwn ? theme.palette.primary.main : theme.palette.divider,
                        isOwn ? 0.2 : 0.7
                      )}`,
                      position: 'relative',
                      '&::after': isOwn ? {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        top: 10,
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderLeft: `8px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        display: { xs: 'none', sm: 'block' }
                      } : {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: 10,
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: `8px solid ${alpha(theme.palette.divider, 0.7)}`,
                        display: { xs: 'none', sm: 'block' }
                      }
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {message.content}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        fontSize: { xs: '0.65rem', sm: '0.7rem' }
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              );
            })
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                No messages yet. Start the conversation!
              </Typography>
            </Box>
          )}
          {/* Typing indicator */}
          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'flex-start',
                mb: 1,
                mt: 1,
                ml: 2
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.background.paper, 0.7),
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& > span': {
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      mx: 0.3,
                      animation: 'typing-dot 1.4s infinite ease-in-out both',
                      '&:nth-of-type(1)': {
                        animationDelay: '0s'
                      },
                      '&:nth-of-type(2)': {
                        animationDelay: '0.2s'
                      },
                      '&:nth-of-type(3)': {
                        animationDelay: '0.4s'
                      }
                    },
                    '@keyframes typing-dot': {
                      '0%, 80%, 100%': {
                        transform: 'scale(0.6)'
                      },
                      '40%': {
                        transform: 'scale(1)'
                      }
                    }
                  }}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </Box>
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  Typing...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message input - enhanced for better user experience and fixed position */}
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            bgcolor: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            boxShadow: `0 -2px 4px ${alpha(theme.palette.common.black, 0.05)}`
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message here..."
            value={newMessage}
            onChange={handleTyping}
            // Handle key press for better user experience
            onKeyDown={(e) => {
              // Send message on Enter without Shift key
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (newMessage.trim() && !sendingMessage) {
                  sendMessage();
                }
              }

              // Apply text direction fix on every keypress
              if (inputRef.current) {
                applyTextDirectionFix(inputRef.current);
              }
            }}
            // Auto-focus when chat is selected
            autoFocus={!!selectedChat}
            // Use ref for programmatic focus
            inputRef={inputRef}
            // Disable while sending
            disabled={sendingMessage}
            // Force LTR direction with attributes
            inputProps={{
              dir: "ltr",
              style: {
                direction: "ltr",
                textAlign: "left",
                unicodeBidi: "plaintext",
                writingMode: "horizontal-tb"
              },
              // Add data attribute for CSS targeting
              "data-force-ltr": "true"
            }}
            // Use a simple single-line input instead of multiline to avoid direction issues
            multiline={false}
            size="small"
            sx={{
              direction: 'ltr !important', // Force left-to-right text direction
              textAlign: 'left !important', // Force left alignment
              '& .MuiInputBase-root': {
                direction: 'ltr !important', // Force input direction
                textAlign: 'left !important' // Force text alignment
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'none',
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                }
              },
              '& .MuiOutlinedInput-input': {
                direction: 'ltr !important', // Force input text direction
                textAlign: 'left !important', // Force text alignment
                unicodeBidi: 'plaintext !important', // Prevent bidirectional text issues
                writingMode: 'horizontal-tb !important', // Force horizontal writing mode
                padding: '10px 14px' // Adjust padding for single line input
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.divider, 0.8)
              }
            }}
            // Add end adornment for character count
            InputProps={{
              style: {
                direction: "ltr",
                textAlign: "left"
              },
              sx: {
                py: { xs: 0.5, sm: 0.75 }
              },
              endAdornment: newMessage.length > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 50,
                    bottom: 4,
                    fontSize: '0.7rem',
                    color: newMessage.length > 500 ? 'error.main' : 'text.secondary',
                    opacity: 0.7,
                    pointerEvents: 'none'
                  }}
                >
                  {newMessage.length > 500 ? `${newMessage.length}/1000` : ''}
                </Box>
              )
            }}
          />

          <Tooltip title={
            sendingMessage
              ? "Sending message..."
              : newMessage.trim()
                ? "Send message"
                : "Type a message first"
          }>
            <span>
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                aria-label="Send message"
                sx={{
                  bgcolor: newMessage.trim() && !sendingMessage
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  transition: 'all 0.2s ease',
                  transform: newMessage.trim() && !sendingMessage ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    bgcolor: newMessage.trim() && !sendingMessage
                      ? alpha(theme.palette.primary.main, 0.2)
                      : 'transparent',
                    transform: newMessage.trim() && !sendingMessage ? 'scale(1.1)' : 'scale(1)'
                  },
                  '&:active': {
                    bgcolor: newMessage.trim() && !sendingMessage
                      ? alpha(theme.palette.primary.main, 0.3)
                      : 'transparent',
                    transform: 'scale(0.95)'
                  }
                }}
              >
                {sendingMessage ? (
                  <CircularProgress size={20} thickness={5} />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        // Fixed height instead of dynamic to prevent ResizeObserver issues
        height: { xs: '600px', sm: '700px', md: '800px' },
        maxHeight: { xs: 'calc(100vh - 180px)', md: '80vh' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
        position: 'relative',
        bgcolor: theme.palette.background.paper,
        // Add containment to prevent ResizeObserver issues
        contain: 'strict',
        // Disable all animations and transitions
        '& *': {
          transition: 'none !important',
          animation: 'none !important'
        },
        // Prevent layout shifts
        minHeight: 400
      }}
    >
      {/* Mobile menu button */}
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1100,
            display: { xs: 'block', md: 'none' }
          }}
        >
          <IconButton
            onClick={() => setSidebarOpen(true)}
            size="medium"
            aria-label="open chat sidebar"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
              boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
              width: 40,
              height: 40,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.25)
              },
              '&:active': {
                bgcolor: alpha(theme.palette.primary.main, 0.3)
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Chat interface */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Chat sidebar - permanent on desktop, drawer on mobile */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            ModalProps={{ keepMounted: true }}
            SlideProps={{
              timeout: {
                enter: 300,
                exit: 200
              }
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiBackdrop-root': {
                backgroundColor: alpha(theme.palette.common.black, 0.5)
              },
              '& .MuiDrawer-paper': {
                width: { xs: '85%', sm: 320 },
                maxWidth: 320,
                boxSizing: 'border-box',
                borderRight: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                boxShadow: `4px 0 8px ${alpha(theme.palette.common.black, 0.1)}`,
              },
            }}
          >
            <ChatSidebar />
          </Drawer>
        ) : (
          <Box
            sx={{
              width: { md: 280, lg: 320 },
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              display: { xs: 'none', md: 'block' },
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <ChatSidebar />
          </Box>
        )}

        {/* Message area - with fixed sizing to prevent ResizeObserver issues */}
        <Box
          className="message-area-container"
          sx={{
            flexGrow: 0, // Changed from 1 to prevent dynamic sizing
            display: 'flex',
            flexDirection: 'column',
            bgcolor: alpha(theme.palette.background.default, 0.5),
            width: { xs: '100%', md: 'calc(100% - 320px)' },
            // Fixed height to prevent ResizeObserver issues
            height: { xs: '600px', sm: '700px', md: '800px' },
            // Add containment to prevent ResizeObserver issues
            contain: 'strict',
            // Prevent layout shifts
            minHeight: 300,
            // Improve performance
            overflowX: 'hidden',
            // Ensure the header is visible
            // Disable all animations
            '& *': {
              transition: 'none !important',
              animation: 'none !important'
            }
          }}
        >
          {selectedChat ? (
            <MessageArea />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                Select a chat to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Error alert */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Add Hospital Admin Dialog */}
      <AddHospitalAdminChat
        open={addAdminDialogOpen}
        onClose={() => setAddAdminDialogOpen(false)}
        onAdminSelected={handleStartChatWithAdmin}
      />
    </Paper>
  );
};

export default SimpleSuperAdminChat;
