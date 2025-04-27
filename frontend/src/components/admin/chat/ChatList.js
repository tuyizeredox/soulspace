import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  InputBase,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Group as GroupIcon,
  Circle as CircleIcon,
  LocalHospital as HospitalIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from '../../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fetchUserByIdWithCache } from '../../../utils/userUtils';

const ChatList = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    chats,
    selectedChat,
    setSelectedChat,
    fetchMessages,
    loading,
    isUserOnline
  } = useChat();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [fetchingUsers, setFetchingUsers] = useState(false);

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

  // Function to fetch user details for all participants in chats
  const fetchUserDetailsForChats = useCallback(async () => {
    if (!chats.length || !token || fetchingUsers) return;

    try {
      setFetchingUsers(true);
      console.log('Fetching user details for chat participants');

      // Collect all unique user IDs from chat participants
      const userIds = new Set();
      chats.forEach(chat => {
        if (chat.participants && Array.isArray(chat.participants)) {
          chat.participants.forEach(participant => {
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
        }
      });

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
  }, [chats, token, fetchingUsers, userDetails]);

  // Fetch user details when chats change
  useEffect(() => {
    fetchUserDetailsForChats();
  }, [fetchUserDetailsForChats]);

  // Debug chats and user info
  useEffect(() => {
    console.log('Chats in ChatList:', chats.length);
    console.log('Current user in ChatList:', {
      id: user?.id,
      _id: user?._id,
      name: user?.name,
      role: user?.role
    });

    // Log detailed information about the first chat
    if (chats.length > 0) {
      const firstChat = chats[0];
      console.log('First chat details:', {
        id: firstChat._id,
        isGroup: firstChat.isGroup,
        participantCount: firstChat.participants ? firstChat.participants.length : 0
      });

      // Log participant details
      if (firstChat.participants && firstChat.participants.length > 0) {
        console.log('First chat participants:');
        firstChat.participants.forEach((p, index) => {
          console.log(`Participant ${index + 1}:`, {
            id: p._id,
            name: p.name,
            role: p.role,
            hospital: p.hospital ? (typeof p.hospital === 'object' ? p.hospital.name : p.hospital) : 'None'
          });
        });

        // Try to identify the other user
        const userId = user?.id || user?._id;
        if (userId) {
          const userIdStr = userId.toString();
          const otherUser = firstChat.participants.find(p => {
            if (!p || !p._id) return false;
            const participantIdStr = p._id.toString();
            const isOtherUser = participantIdStr !== userIdStr;
            console.log('ID comparison:', participantIdStr, userIdStr, isOtherUser);
            return isOtherUser;
          });

          console.log('Other user in first chat:', otherUser ? {
            id: otherUser._id,
            name: otherUser.name,
            role: otherUser.role
          } : 'Not found');
        }
      }
    }
  }, [chats, user]);

  // Filter chats based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      console.log('Setting filtered chats (no search):', chats);
      return;
    }

    const filtered = chats.filter(chat => {
      try {
        // For group chats, search in group name
        if (chat.isGroup) {
          return chat.groupName?.toLowerCase().includes(searchTerm.toLowerCase());
        }

        // For one-on-one chats, search in the other user's name
        if (!chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
          return false;
        }

        // Get current user ID
        const userId = user?.id || user?._id;
        if (!userId) return false;

        // Find the other user by comparing with the current user's ID
        const userIdStr = userId.toString();
        const otherUser = chat.participants.find(p => {
          if (!p || !p._id) return false;
          return p._id.toString() !== userIdStr;
        });

        if (!otherUser || !otherUser.name) return false;

        // Search in name, email, and hospital name
        const nameMatch = otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = otherUser.email?.toLowerCase().includes(searchTerm.toLowerCase());

        let hospitalMatch = false;
        if (otherUser.hospital) {
          const hospitalName = typeof otherUser.hospital === 'object'
            ? otherUser.hospital.name
            : otherUser.hospital.toString();
          hospitalMatch = hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
        }

        return nameMatch || emailMatch || hospitalMatch;
      } catch (error) {
        console.error('Error filtering chat:', error);
        return false;
      }
    });

    setFilteredChats(filtered);
  }, [searchTerm, chats, user]);

  // Handle chat selection
  const handleSelectChat = (chat) => {
    console.log('Selecting chat:', chat);
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  // Get chat name
  const getChatName = (chat) => {
    if (!chat) return 'Unknown Chat';

    if (chat.isGroup) {
      return chat.groupName || 'Unnamed Group';
    }

    if (!chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
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
      otherParticipant = chat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
        console.log(`Found other participant with ID: ${otherUserId}`);
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = chat.participants.find(p => {
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
      console.error('Error in getChatName:', error);
      return 'Unknown User';
    }
  };

  // Get chat avatar
  const getChatAvatar = (chat) => {
    if (!chat) return null;

    if (chat.isGroup) {
      return null; // Group icon will be shown instead
    }

    if (!chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
      return null;
    }

    try {
      // Get current user ID
      const userId = user?.id || user?._id;
      if (!userId) return null;

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // Find the other user by comparing string IDs
      let otherParticipant = null;
      let otherUserId = null;

      // First try to find participant with _id property
      otherParticipant = chat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = chat.participants.find(p => {
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
      console.error('Error in getChatAvatar:', error);
      return null;
    }
  };

  // Get unread count for a chat
  const getUnreadCount = (chat) => {
    if (!user || !chat || !chat.unreadCounts) return 0;

    try {
      const userId = user.id || user._id;
      if (!userId) return 0;

      // Handle both Map and object implementations
      if (typeof chat.unreadCounts.get === 'function') {
        return chat.unreadCounts.get(userId) || 0;
      }

      return chat.unreadCounts[userId] || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
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

  // Check if the other user is online
  const isOtherUserOnline = (chat) => {
    if (!chat || chat.isGroup) return false;
    if (!chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) return false;
    if (!isUserOnline) return false;

    try {
      // Get current user ID
      const userId = user?.id || user?._id;
      if (!userId) return false;

      // Convert user ID to string for consistent comparison
      const userIdStr = userId.toString();

      // Find the other user by comparing string IDs
      let otherParticipant = null;
      let otherUserId = null;

      // First try to find participant with _id property
      otherParticipant = chat.participants.find(p => {
        if (!p || !p._id) return false;
        const participantIdStr = p._id.toString();
        return participantIdStr !== userIdStr;
      });

      if (otherParticipant && otherParticipant._id) {
        otherUserId = otherParticipant._id.toString();
      } else {
        // If no participant with _id found, try to find by string ID
        const otherParticipantId = chat.participants.find(p => {
          if (typeof p === 'string') {
            return p !== userIdStr;
          }
          return false;
        });

        if (otherParticipantId) {
          otherUserId = otherParticipantId;
        }
      }

      if (!otherUserId) return false;

      // Check if the user is online
      return isUserOnline(otherUserId);
    } catch (error) {
      console.error('Error checking online status:', error);
      return false;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      isOtherUserOnline(chat) ? (
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
                    {chat.isGroup ? (
                      <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                        <GroupIcon />
                      </Avatar>
                    ) : (
                      <Avatar src={getChatAvatar(chat)} alt={getChatName(chat)}>
                        {getChatName(chat).charAt(0)}
                      </Avatar>
                    )}
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 150 }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={getUnreadCount(chat) > 0 ? 700 : 500}
                          noWrap
                        >
                          {getChatName(chat)}
                        </Typography>

                        {!chat.isGroup && (() => {
                          try {
                            // Get current user ID
                            const userId = user?.id || user?._id;
                            if (!userId) return null;

                            // Convert user ID to string for consistent comparison
                            const userIdStr = userId.toString();

                            // Find the other user by comparing string IDs
                            let otherParticipant = null;
                            let otherUserId = null;

                            // First try to find participant with _id property
                            otherParticipant = chat.participants.find(p => {
                              if (!p || !p._id) return false;
                              const participantIdStr = p._id.toString();
                              return participantIdStr !== userIdStr;
                            });

                            if (otherParticipant && otherParticipant._id) {
                              otherUserId = otherParticipant._id.toString();
                            } else {
                              // If no participant with _id found, try to find by string ID
                              const otherParticipantId = chat.participants.find(p => {
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

                            // Check if we have fetched user details
                            const otherUserDetails = userDetails[otherUserId];

                            // Check if the other user is a primary admin
                            let isPrimaryAdmin = false;

                            if (otherUserDetails) {
                              isPrimaryAdmin = otherUserDetails.isPrimaryAdmin === true;
                              console.log('Primary admin status from fetched details:', isPrimaryAdmin);
                            } else if (otherParticipant) {
                              isPrimaryAdmin = otherParticipant.isPrimaryAdmin === true;
                              console.log('Primary admin status from participant data:', isPrimaryAdmin);
                            }

                            if (isPrimaryAdmin) {
                              return (
                                <Chip
                                  label="Primary"
                                  size="small"
                                  color="secondary"
                                  sx={{ ml: 0.5, height: 16, fontSize: '0.6rem' }}
                                />
                              );
                            }
                          } catch (error) {
                            console.error('Error checking primary admin status:', error);
                          }
                          return null;
                        })()}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(chat.lastMessage?.timestamp)}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 180 }}>
                          {chat.lastMessage?.hasAttachments && (
                            <AttachFileIcon
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                color: getUnreadCount(chat) > 0 ? 'primary.main' : 'text.secondary',
                                transform: 'rotate(45deg)'
                              }}
                            />
                          )}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{
                              maxWidth: chat.lastMessage?.hasAttachments ? 160 : 180,
                              fontWeight: getUnreadCount(chat) > 0 ? 600 : 400
                            }}
                          >
                            {chat.lastMessage?.content || (chat.lastMessage?.hasAttachments ? 'Attachment' : 'No messages yet')}
                          </Typography>
                        </Box>
                        {getUnreadCount(chat) > 0 && (
                          <Badge
                            badgeContent={getUnreadCount(chat)}
                            color="primary"
                            sx={{
                              '& .MuiBadge-badge': {
                                fontSize: 10,
                                height: 18,
                                minWidth: 18
                              }
                            }}
                          />
                        )}
                      </Box>

                      {!chat.isGroup && (() => {
                        try {
                          // Get current user ID
                          const userId = user?.id || user?._id;
                          if (!userId) return null;

                          // Convert user ID to string for consistent comparison
                          const userIdStr = userId.toString();

                          // Find the other user by comparing string IDs
                          let otherParticipant = null;
                          let otherUserId = null;

                          // First try to find participant with _id property
                          otherParticipant = chat.participants.find(p => {
                            if (!p || !p._id) return false;
                            const participantIdStr = p._id.toString();
                            return participantIdStr !== userIdStr;
                          });

                          if (otherParticipant && otherParticipant._id) {
                            otherUserId = otherParticipant._id.toString();
                          } else {
                            // If no participant with _id found, try to find by string ID
                            const otherParticipantId = chat.participants.find(p => {
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

                          // Try to get user from our fetched details
                          const otherUserDetails = userDetails[otherUserId];

                          // Check if the other user is a hospital admin
                          let isHospitalAdmin = false;
                          let hospitalInfo = null;

                          if (otherUserDetails) {
                            isHospitalAdmin = otherUserDetails.role === 'hospital_admin';
                            hospitalInfo = otherUserDetails.hospital;
                            console.log('Hospital info from fetched details:', hospitalInfo);
                          } else if (otherParticipant) {
                            isHospitalAdmin = otherParticipant.role === 'hospital_admin';
                            hospitalInfo = otherParticipant.hospital || otherParticipant.hospitalId;
                            console.log('Hospital info from participant data:', hospitalInfo);
                          }

                          if (isHospitalAdmin) {
                            if (hospitalInfo) {
                              // Handle different hospital data structures
                              const hospitalName = typeof hospitalInfo === 'object'
                                ? hospitalInfo.name
                                : 'Hospital';

                              const hospitalCity = typeof hospitalInfo === 'object'
                                ? hospitalInfo.city
                                : null;

                              return (
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mt: 0.5,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  borderRadius: 1,
                                  py: 0.2,
                                  px: 0.5,
                                  maxWidth: 'fit-content'
                                }}>
                                  <HospitalIcon sx={{ fontSize: 12, mr: 0.5, color: theme.palette.primary.main }} />
                                  <Typography
                                    variant="caption"
                                    color="primary.main"
                                    fontWeight={600}
                                    noWrap
                                    sx={{ maxWidth: 120 }}
                                  >
                                    {hospitalName}
                                    {hospitalCity && ` (${hospitalCity})`}
                                  </Typography>
                                </Box>
                              );
                            } else {
                              // Show a badge indicating this is a hospital admin
                              return (
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mt: 0.5,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                                  borderRadius: 1,
                                  py: 0.2,
                                  px: 0.5,
                                  maxWidth: 'fit-content'
                                }}>
                                  <HospitalIcon sx={{ fontSize: 12, mr: 0.5, color: theme.palette.secondary.main }} />
                                  <Typography
                                    variant="caption"
                                    color="secondary.main"
                                    fontWeight={600}
                                    noWrap
                                  >
                                    Hospital Admin
                                  </Typography>
                                </Box>
                              );
                            }
                          }
                        } catch (error) {
                          console.error('Error displaying hospital info:', error);
                        }
                        return null;
                      })()}
                    </Box>
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

export default ChatList;
