import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  InputBase,
  Paper,
  Divider,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  useTheme,
  alpha,
  AvatarGroup,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Group as GroupIcon,
  Circle as CircleIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from '../../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import EditGroupModal from './EditGroupModal';
import AddUserModal from './AddUserModal';
import RemoveUserModal from './RemoveUserModal';
import AdminProfileModal from './AdminProfileModal';
import { fetchUserByIdWithCache } from '../../../utils/userUtils';

const ChatBox = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    selectedChat,
    setSelectedChat,
    messages,
    sendMessage,
    loading,
    isTyping,
    handleTyping,
    isUserOnline
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditGroup, setOpenEditGroup] = useState(false);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [openRemoveUser, setOpenRemoveUser] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [emojiPickerWidth, setEmojiPickerWidth] = useState(window.innerWidth < 600 ? 280 : 320);
  const [userDetails, setUserDetails] = useState({});
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get token from all possible sources
  const getToken = () => {
    // Try to get token from all possible sources
    const authToken = user?.token;
    const userAuthToken = localStorage.getItem('userToken');
    const oldAuthToken = localStorage.getItem('token');

    // Return the first available token
    return authToken || userAuthToken || oldAuthToken;
  };

  // Get the token
  const token = getToken();

  // Function to fetch user details for all participants in the selected chat
  const fetchUserDetailsForChat = useCallback(async () => {
    if (!selectedChat || !selectedChat.participants || !token || fetchingUsers) return;

    try {
      setFetchingUsers(true);
      console.log('Fetching user details for chat participants');

      // Collect all unique user IDs from chat participants
      const userIds = new Set();
      selectedChat.participants.forEach(participant => {
        if (participant) {
          // Handle different formats of participant data
          if (participant._id) {
            // If participant has _id property
            userIds.add(participant._id.toString());
          } else if (typeof participant === 'string') {
            // If participant is just a string ID
            userIds.add(participant);
          } else if (typeof participant === 'object') {
            // If participant is an object without _id (shouldn't happen, but just in case)
            console.warn('Participant without _id:', participant);
          }
        }
      });

      // Also add message sender IDs if they're not already in the set
      if (messages && messages.length > 0) {
        messages.forEach(message => {
          if (message.sender) {
            if (message.sender._id) {
              userIds.add(message.sender._id.toString());
            } else if (typeof message.sender === 'string') {
              userIds.add(message.sender);
            }
          }
        });
      }

      console.log(`Found ${userIds.size} unique users to fetch`);

      // Fetch details for each user
      const userDetailsMap = { ...userDetails };
      const fetchPromises = Array.from(userIds).map(async userId => {
        // Skip if we already have details for this user
        if (userDetailsMap[userId]) return;

        try {
          const userData = await fetchUserByIdWithCache(userId, token);
          if (userData) {
            // Store with both the original ID and the cleaned ID to ensure we can find it
            userDetailsMap[userId] = userData;

            // Also store by the _id from the response if it's different
            if (userData._id && userData._id.toString() !== userId) {
              userDetailsMap[userData._id.toString()] = userData;
            }

            console.log(`Successfully fetched user: ${userData.name} (${userData._id})`);
          }
        } catch (err) {
          console.error(`Error fetching user ${userId}:`, err);
        }
      });

      await Promise.all(fetchPromises);
      setUserDetails(userDetailsMap);
      console.log('Fetched user details:', Object.keys(userDetailsMap).length, 'users');
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setFetchingUsers(false);
    }
  }, [selectedChat, messages, token, fetchingUsers, userDetails]);

  // Fetch user details when selected chat or messages change
  useEffect(() => {
    fetchUserDetailsForChat();
  }, [fetchUserDetailsForChat]);

  // Update emoji picker width on window resize
  useEffect(() => {
    const handleResize = () => {
      setEmojiPickerWidth(window.innerWidth < 600 ? 280 : 320);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Debug selected chat
  useEffect(() => {
    if (selectedChat) {
      console.log('Selected chat in ChatBox:', {
        id: selectedChat._id,
        isGroup: selectedChat.isGroup,
        participantCount: selectedChat.participants ? selectedChat.participants.length : 0
      });

      if (selectedChat.participants && selectedChat.participants.length > 0) {
        console.log('Selected chat participants:');
        selectedChat.participants.forEach((p, index) => {
          console.log(`Participant ${index + 1}:`, {
            id: p._id,
            name: p.name,
            role: p.role,
            hospital: p.hospital ?
              (typeof p.hospital === 'object' ? p.hospital.name : p.hospital)
              : 'None'
          });
        });
      }
    }
  }, [selectedChat]);

  // Handle typing indicator
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    // If user is typing, send typing indicator
    if (!isTyping && e.target.value && selectedChat && selectedChat._id) {
      try {
        handleTyping(selectedChat._id, true);
      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    if (selectedChat && selectedChat._id) {
      typingTimeoutRef.current = setTimeout(() => {
        try {
          handleTyping(selectedChat._id, false);
        } catch (error) {
          console.error('Error handling typing indicator:', error);
        }
      }, 3000);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 files at a time
      const newFiles = files.slice(0, 5);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 10)); // Max 10 files total
    }
  };

  // Remove a file from the selected files
  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Don't send if no message and no files
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    // Check if selectedChat exists and has an _id
    if (!selectedChat || !selectedChat._id) {
      console.error('Cannot send message: No chat selected or invalid chat');
      return;
    }

    try {
      setSending(true);

      // If we have files, we need to upload them first
      let attachments = [];

      if (selectedFiles.length > 0) {
        // Here we would normally upload the files to the server
        // For now, we'll just simulate it
        console.log('Uploading files:', selectedFiles);

        // In a real implementation, you would:
        // 1. Create a FormData object
        // 2. Append each file to it
        // 3. Send it to your server
        // 4. Get back URLs or IDs for the uploaded files
        // 5. Add those to the message

        // Simulate file URLs for now
        attachments = selectedFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file) // This is temporary and will be replaced with actual URLs
        }));
      }

      // Send the message with any attachments
      const result = await sendMessage(newMessage, selectedChat._id, attachments);

      if (!result) {
        console.error('Failed to send message: No result returned');
      }

      // Clear the message and files
      setNewMessage('');
      setSelectedFiles([]);
      setSending(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setSending(false);
    }
  };

  // Get chat name
  const getChatName = () => {
    if (!selectedChat) return '';

    if (selectedChat.isGroup) {
      return selectedChat.groupName || 'Unnamed Group';
    }

    // Check if participants array exists and is valid
    if (!selectedChat.participants || !Array.isArray(selectedChat.participants) || selectedChat.participants.length === 0) {
      return 'Unknown User';
    }

    try {
      // Get current user ID
      const userId = user?.id || user?._id;
      if (!userId) {
        console.warn('No user ID found in getChatName');
        return 'Unknown User';
      }

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // Find the other user by comparing string IDs
      let otherParticipant = null;
      let otherUserId = null;

      // First try to find participant with _id property
      otherParticipant = selectedChat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
        console.log(`Found other participant with ID: ${otherUserId}`);
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = selectedChat.participants.find(p => {
          if (typeof p === 'string') {
            return p !== userIdStr;
          }
          return false;
        });

        if (otherParticipantId) {
          otherUserId = otherParticipantId;
          console.log(`Found other participant with string ID: ${otherUserId}`);
        }
      }

      if (!otherUserId) {
        console.warn('Could not find other user in chat participants');
        return 'Unknown User';
      }

      // Try to get user from our fetched details
      const otherUserDetails = userDetails[otherUserId];

      if (otherUserDetails) {
        console.log('Using fetched user details for:', otherUserDetails.name);

        // Return the name with hospital info for hospital admins
        if (otherUserDetails.role === 'hospital_admin' && otherUserDetails.hospital) {
          return `${otherUserDetails.name} (${otherUserDetails.hospital.name})`;
        }

        return otherUserDetails.name;
      }

      // Fall back to participant data from the chat if we don't have fetched details
      if (otherParticipant && otherParticipant.name) {
        // Return the name with role indicator for hospital admins
        if (otherParticipant.role === 'hospital_admin') {
          const hospitalName = otherParticipant.hospital && typeof otherParticipant.hospital === 'object'
            ? otherParticipant.hospital.name
            : '';

          return hospitalName
            ? `${otherParticipant.name} (${hospitalName})`
            : otherParticipant.name;
        }

        return otherParticipant.name;
      }

      // If we got here, we couldn't find a name for the user
      console.warn(`Could not find name for user with ID: ${otherUserId}`);
      return 'Unknown User';
    } catch (error) {
      console.error('Error getting chat name:', error);
      return 'Unknown User';
    }
  };

  // Get chat avatar
  const getChatAvatar = () => {
    if (!selectedChat) return null;

    if (selectedChat.isGroup) {
      return null; // Group icon will be shown instead
    }

    // Check if participants array exists and is valid
    if (!selectedChat.participants || !Array.isArray(selectedChat.participants) || selectedChat.participants.length === 0) {
      return null;
    }

    try {
      // Get current user ID
      const userId = user?.id || user?._id;
      if (!userId) {
        console.warn('No user ID found in getChatAvatar');
        return null;
      }

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // Find the other user by comparing string IDs
      let otherParticipant = null;
      let otherUserId = null;

      // First try to find participant with _id property
      otherParticipant = selectedChat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = selectedChat.participants.find(p => {
          if (typeof p === 'string') {
            return p !== userIdStr;
          }
          return false;
        });

        if (otherParticipantId) {
          otherUserId = otherParticipantId;
        }
      }

      if (!otherUserId) return null;

      // First try to get avatar from our fetched user details
      const otherUserDetails = userDetails[otherUserId];
      if (otherUserDetails && otherUserDetails.avatar) {
        return otherUserDetails.avatar;
      }

      // Fall back to participant data from the chat
      if (otherParticipant && otherParticipant.avatar) {
        return otherParticipant.avatar;
      }

      return null;
    } catch (error) {
      console.error('Error getting chat avatar:', error);
      return null;
    }
  };

  // Check if the other user is online
  const isOtherUserOnline = () => {
    if (!selectedChat || selectedChat.isGroup || !isUserOnline) return false;

    // Check if participants array exists and is valid
    if (!selectedChat.participants || !Array.isArray(selectedChat.participants) || selectedChat.participants.length === 0) {
      return false;
    }

    try {
      // Get current user ID
      const userId = user?.id || user?._id;
      if (!userId) {
        console.warn('No user ID found in isOtherUserOnline');
        return false;
      }

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // Find the other user by comparing string IDs
      let otherParticipant = null;
      let otherUserId = null;

      // First try to find participant with _id property
      otherParticipant = selectedChat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = selectedChat.participants.find(p => {
          if (typeof p === 'string') {
            return p !== userIdStr;
          }
          return false;
        });

        if (otherParticipantId) {
          otherUserId = otherParticipantId;
        }
      }

      if (!otherUserId) {
        console.warn('Could not find other user in chat participants for online status');
        return false;
      }

      // Get user name for logging
      let userName = 'Unknown User';
      const otherUserDetails = userDetails[otherUserId];
      if (otherUserDetails && otherUserDetails.name) {
        userName = otherUserDetails.name;
      } else if (otherParticipant && otherParticipant.name) {
        userName = otherParticipant.name;
      }

      // Check if the user is online
      const isOnline = isUserOnline(otherUserId);
      console.log('Checking if user is online:', userName, 'ID:', otherUserId, 'Online:', isOnline);
      return isOnline;
    } catch (error) {
      console.error('Error checking if other user is online:', error);
      return false;
    }
  };

  // Format message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Check if user is admin of the group
  const isGroupAdmin = () => {
    if (!selectedChat || !user) return false;

    try {
      const userId = user?.id || user?._id;

      if (!userId) {
        console.warn('No user ID found in isGroupAdmin');
        return false;
      }

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // If user is super_admin, they are always considered an admin
      if (user.role === 'super_admin') {
        console.log('User is super_admin, granting admin privileges');
        return true;
      }

      // Check if the user is the group admin
      if (selectedChat.groupAdmin) {
        let adminIdStr;

        if (typeof selectedChat.groupAdmin === 'object' && selectedChat.groupAdmin._id) {
          adminIdStr = selectedChat.groupAdmin._id.toString();
        } else if (typeof selectedChat.groupAdmin === 'string') {
          adminIdStr = selectedChat.groupAdmin;
        } else {
          console.warn('Invalid groupAdmin format:', selectedChat.groupAdmin);
          return false;
        }

        const isAdmin = adminIdStr === userIdStr;
        console.log('Checking if user is group admin:', 'User ID:', userIdStr, 'Admin ID:', adminIdStr, 'Is admin:', isAdmin);
        return isAdmin;
      }

      return false;
    } catch (error) {
      console.error('Error checking if user is group admin:', error);
      return false;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Chat header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
            onClick={() => setSelectedChat(null)}
          >
            <ArrowBackIcon />
          </IconButton>

          {selectedChat?.isGroup ? (
            <AvatarGroup max={3} sx={{ mr: 2 }}>
              {selectedChat.participants && Array.isArray(selectedChat.participants) ?
                selectedChat.participants.slice(0, 3).map((participant) => (
                  <Avatar
                    key={participant?._id || Math.random().toString()}
                    src={participant?.avatar}
                    alt={participant?.name || 'User'}
                  >
                    {participant?.name ? participant.name.charAt(0) : 'U'}
                  </Avatar>
                )) :
                <Avatar>G</Avatar>
              }
            </AvatarGroup>
          ) : (
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isOtherUserOnline() ? (
                  <CircleIcon
                    sx={{
                      color: theme.palette.success.main,
                      fontSize: 12,
                      bgcolor: 'white',
                      borderRadius: '50%'
                    }}
                  />
                ) : null
              }
            >
              {selectedChat?.isGroup ? (
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <GroupIcon />
                </Avatar>
              ) : (
                <Avatar src={getChatAvatar()} alt={getChatName()} sx={{ mr: 2 }}>
                  {getChatName().charAt(0)}
                </Avatar>
              )}
            </Badge>
          )}

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {getChatName()}
            </Typography>
            {selectedChat?.isGroup ? (
              <Typography variant="caption" color="text.secondary">
                {selectedChat.participants.length} members
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {isOtherUserOnline() ? 'Online' : 'Offline'}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenProfile(true)}
                  startIcon={
                    <Avatar
                      src={getChatAvatar()}
                      sx={{
                        width: { xs: 14, sm: 16 },
                        height: { xs: 14, sm: 16 }
                      }}
                    />
                  }
                  sx={{
                    minWidth: 0,
                    height: { xs: 24, sm: 26 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    py: 0,
                    px: { xs: 0.5, sm: 1 },
                    borderRadius: 5,
                    textTransform: 'none',
                    boxShadow: 1,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    }
                  }}
                >
                  {window.innerWidth < 350 ? 'Profile' : 'View Profile'}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {selectedChat?.isGroup && (
            <>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setOpenEditGroup(true);
                }}
                disabled={!isGroupAdmin()}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Group</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setOpenAddUser(true);
                }}
                disabled={!isGroupAdmin()}
              >
                <ListItemIcon>
                  <PersonAddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add User</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  setOpenRemoveUser(true);
                }}
                disabled={!isGroupAdmin()}
              >
                <ListItemIcon>
                  <PersonRemoveIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove User</ListItemText>
              </MenuItem>
              <Divider />
            </>
          )}
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clear Chat</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
          backgroundBlendMode: 'overlay'
        }}
      >
        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center'
          }}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading messages...
            </Typography>
          </Box>
        ) : messages.length > 0 ? (
          messages.map((message, index) => {
            const userId = user?.id || user?._id;

            // Convert IDs to strings for consistent comparison
            const userIdStr = userId ? userId.toString() : '';
            const senderIdStr = message.sender && message.sender._id ? message.sender._id.toString() : '';

            const isSender = senderIdStr === userIdStr;
            console.log('Message sender check:', 'User ID:', userIdStr, 'Sender ID:', senderIdStr, 'Is sender:', isSender);

            // Check if this message should show an avatar (if it's from a different sender than the previous message)
            const prevSenderIdStr = index > 0 && messages[index - 1].sender && messages[index - 1].sender._id
              ? messages[index - 1].sender._id.toString()
              : '';
            const showAvatar = !isSender && (!index || prevSenderIdStr !== senderIdStr);

            return (
              <Box
                key={message._id}
                sx={{
                  display: 'flex',
                  justifyContent: isSender ? 'flex-end' : 'flex-start',
                  mb: 1,
                  px: { xs: 0.5, sm: 1 },
                  maxWidth: '100%'
                }}
              >
                {!isSender && showAvatar && (
                  <>
                    {/* Desktop avatar */}
                    <Avatar
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      sx={{
                        mr: 1,
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        display: { xs: 'none', sm: 'flex' }
                      }}
                    >
                      {message.sender.name.charAt(0)}
                    </Avatar>

                    {/* Mobile-only smaller avatar */}
                    <Avatar
                      src={message.sender.avatar}
                      alt={message.sender.name}
                      sx={{
                        mr: 0.5,
                        width: 24,
                        height: 24,
                        display: { xs: 'flex', sm: 'none' }
                      }}
                    >
                      {message.sender.name.charAt(0)}
                    </Avatar>
                  </>
                )}

                {!isSender && !showAvatar && (
                  <>
                    <Box sx={{ width: 40, display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ width: 24, display: { xs: 'block', sm: 'none' } }} />
                  </>
                )}

                <Box
                  sx={{
                    maxWidth: { xs: '85%', sm: '70%' },
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: isSender
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.background.paper, 0.9),
                    boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.1)}`,
                    position: 'relative',
                    ...(isSender
                      ? {
                          borderBottomRightRadius: 0,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
                          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }
                      : {
                          borderBottomLeftRadius: 0,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          borderRight: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        }),
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      width: 10,
                      height: 10,
                      transform: 'translateY(50%) rotate(45deg)',
                      backgroundColor: isSender
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.background.paper, 0.85),
                      borderBottom: `1px solid ${isSender
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.divider, 0.7)}`,
                      borderRight: `1px solid ${isSender
                        ? alpha(theme.palette.primary.main, 0.2)
                        : alpha(theme.palette.divider, 0.7)}`,
                      ...(isSender
                        ? { right: -5 }
                        : { left: -5 })
                    }
                  }}
                >
                  {!isSender && (
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {message.sender.name}
                    </Typography>
                  )}
                  {message.content && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                  )}

                  {/* Display attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <Box sx={{
                      mt: message.content ? 1.5 : 0,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: { xs: 0.5, sm: 1 }
                    }}>
                      {message.attachments.map((attachment, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: attachment.type.startsWith('image/')
                              ? { xs: 120, sm: 150 }
                              : { xs: 80, sm: 100 },
                            height: attachment.type.startsWith('image/')
                              ? { xs: 120, sm: 150 }
                              : { xs: 70, sm: 80 },
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            bgcolor: 'background.paper',
                            flexShrink: 0
                          }}
                        >
                          {attachment.type.startsWith('image/') ? (
                            <Box
                              component="img"
                              src={attachment.url}
                              alt={attachment.name}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onClick={() => window.open(attachment.url, '_blank')}
                            />
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                p: 1,
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(attachment.url, '_blank')}
                            >
                              <InsertDriveFileIcon color="primary" />
                              <Typography variant="caption" noWrap sx={{ maxWidth: '100%', textAlign: 'center' }}>
                                {attachment.name.length > 15 ? `${attachment.name.substring(0, 12)}...` : attachment.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                                {(attachment.size / 1024).toFixed(0)} KB
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
                  >
                    {formatMessageTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        ) : (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            p: 3
          }}>
            <Box
              component="img"
              src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png"
              alt="No messages"
              sx={{
                width: 80,
                height: 80,
                opacity: 0.5,
                mb: 2,
                filter: 'grayscale(1)'
              }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No messages yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Start the conversation by sending a message or sharing a file.
            </Typography>
          </Box>
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    p: 1.2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    width: 'fit-content'
                  }}
                >
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mr: 0.8,
                        display: 'inline-block'
                      }}
                    />
                    Someone is typing
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.8 }}>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                    >
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: theme.palette.primary.main, mx: 0.3 }} />
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.3 }}
                    >
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: theme.palette.primary.main, mx: 0.3 }} />
                    </motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.6 }}
                    >
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: theme.palette.primary.main, mx: 0.3 }} />
                    </motion.div>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box
        sx={{
          p: { xs: 0.75, sm: 1.5 },
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'sticky',
          bottom: 0,
          zIndex: 5
        }}
      >
        {/* File preview area */}
        {selectedFiles.length > 0 && (
          <Box
            sx={{
              mb: { xs: 1, sm: 1.5 },
              p: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1 },
              maxHeight: { xs: 120, sm: 'auto' },
              overflow: 'auto'
            }}
          >
            {selectedFiles.map((file, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  bgcolor: 'background.paper',
                  flexShrink: 0
                }}
              >
                {file.type.startsWith('image/') ? (
                  <Box
                    component="img"
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      p: 1
                    }}
                  >
                    <InsertDriveFileIcon color="primary" />
                    <Typography variant="caption" noWrap sx={{ maxWidth: '100%' }}>
                      {file.name.length > 10 ? `${file.name.substring(0, 7)}...` : file.name}
                    </Typography>
                  </Box>
                )}
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    p: 0.5,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.7)'
                    }
                  }}
                  onClick={() => handleRemoveFile(index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Message input form */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: { xs: '2px 2px', sm: '2px 4px' },
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            boxShadow: showEmojiPicker ? 3 : 'none',
            position: 'relative',
            minHeight: { xs: 48, sm: 56 }
          }}
        >
          {/* Emoji picker */}
          {showEmojiPicker && (
            <Box
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: { xs: '50%', sm: 0 },
                transform: { xs: 'translateX(-50%)', sm: 'none' },
                mb: 1,
                zIndex: 10,
                boxShadow: 3,
                borderRadius: 2,
                overflow: 'hidden',
                maxWidth: { xs: '90vw', sm: 'auto' },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  zIndex: 1,
                  bgcolor: 'background.paper',
                  borderRadius: '50%'
                }}
              >
                <IconButton size="small" onClick={() => setShowEmojiPicker(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                width={emojiPickerWidth}
                height={350}
                searchDisabled={false}
                skinTonesDisabled
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis
              />
            </Box>
          )}

          <IconButton
            sx={{
              p: { xs: '6px', sm: '10px' },
              color: showEmojiPicker ? 'primary.main' : 'text.secondary'
            }}
            aria-label="emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            size={window.innerWidth < 600 ? "small" : "medium"}
          >
            <EmojiIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
          </IconButton>

          <input
            type="file"
            id="file-upload"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <label htmlFor="file-upload">
            <IconButton
              sx={{ p: { xs: '6px', sm: '10px' } }}
              aria-label="attach file"
              component="span"
              size={window.innerWidth < 600 ? "small" : "medium"}
            >
              <AttachFileIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
            </IconButton>
          </label>

          <InputBase
            sx={{
              ml: { xs: 0.5, sm: 1 },
              flex: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              px: { xs: 0.5, sm: 1 }
            }}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleMessageChange}
            disabled={sending}
            multiline
            maxRows={window.innerWidth < 600 ? 3 : 4}
          />

          <IconButton
            type="submit"
            sx={{
              p: { xs: '6px', sm: '10px' },
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2)
              },
              mr: { xs: 0, sm: 0.5 }
            }}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
            size={window.innerWidth < 600 ? "small" : "medium"}
          >
            {sending ?
              <CircularProgress size={window.innerWidth < 600 ? 16 : 20} /> :
              <SendIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
            }
          </IconButton>
        </Paper>
      </Box>

      {/* Modals */}
      {selectedChat && (
        <>
          <EditGroupModal
            open={openEditGroup}
            onClose={() => setOpenEditGroup(false)}
            chat={selectedChat}
          />
          <AddUserModal
            open={openAddUser}
            onClose={() => setOpenAddUser(false)}
            chat={selectedChat}
          />
          <RemoveUserModal
            open={openRemoveUser}
            onClose={() => setOpenRemoveUser(false)}
            chat={selectedChat}
          />
          {!selectedChat.isGroup && (() => {
            // Find the other user
            const userId = user?.id || user?._id;
            if (!userId) return null;

            // Convert user ID to string for consistent comparison
            const userIdStr = userId.toString();

            // Find the other user by comparing string IDs
            let otherParticipant = null;
            let otherUserId = null;

            // First try to find participant with _id property
            otherParticipant = selectedChat.participants.find(p => {
              if (!p || !p._id) return false;
              const participantIdStr = p._id.toString();
              return participantIdStr !== userIdStr;
            });

            if (otherParticipant && otherParticipant._id) {
              otherUserId = otherParticipant._id.toString();
            } else {
              // If no participant with _id found, try to find by string ID
              const otherParticipantId = selectedChat.participants.find(p => {
                if (typeof p === 'string') {
                  return p !== userIdStr;
                }
                return false;
              });

              if (otherParticipantId) {
                otherUserId = otherParticipantId;
              }
            }

            if (!otherUserId) return null;

            // Get user details
            const otherUserDetails = userDetails[otherUserId];

            // Use fetched details if available, otherwise use participant data
            const adminData = otherUserDetails || otherParticipant || { _id: otherUserId };

            return (
              <AdminProfileModal
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                admin={adminData}
              />
            );
          })()}
        </>
      )}
    </Box>
  );
};

export default ChatBox;
