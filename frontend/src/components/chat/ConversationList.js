import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  CircularProgress,
  Divider,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({
  conversations = [],
  loading = false,
  onSelectConversation,
  selectedChatId = null
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Format the last message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return '';
    }
  };

  // Get the other participant in a conversation (not the current user)
  const getOtherParticipant = (chat, currentUserId) => {
    if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
      return { name: 'Unknown', role: 'unknown' };
    }

    // Find the participant that is not the current user
    return chat.participants.find(p =>
      p._id !== currentUserId && p._id.toString() !== currentUserId.toString()
    ) || { name: 'Unknown', role: 'unknown' };
  };

  // Handle conversation selection
  const handleSelectConversation = (chat) => {
    if (onSelectConversation) {
      onSelectConversation(chat);
    } else {
      // Find the doctor in the participants
      const doctor = chat.participants.find(p => p.role === 'doctor');
      if (doctor) {
        navigate(`/patient/chat/${doctor._id}`);
      }
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render empty state
  if (conversations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No conversations yet. Start by booking an appointment with a doctor.
        </Typography>
      </Box>
    );
  }

  // Render conversation list
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {conversations.map((chat, index) => {
        // Find the doctor in the participants
        const doctor = chat.doctor || chat.participants?.find(p => p.role === 'doctor');
        const isSelected = selectedChatId === chat._id;

        // Skip invalid chats
        if (!chat._id || !chat.participants) {
          console.warn('Invalid chat object:', chat);
          return null;
        }

        // Log each chat for debugging
        console.log(`Rendering chat ${index}:`, {
          id: chat._id,
          doctor: doctor ? `${doctor.name} (${doctor._id})` : 'No doctor found',
          participants: chat.participants?.map(p => `${p.name} (${p.role})`),
          lastMessage: chat.lastMessage?.content?.substring(0, 20) || 'No message'
        });

        return (
          <React.Fragment key={chat._id}>
            <ListItem
              button
              onClick={() => handleSelectConversation(chat)}
              sx={{
                borderRadius: 1,
                bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  color="success"
                  variant="dot"
                  invisible={!doctor?.isOnline}
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Avatar
                    src={doctor?.profile?.avatar}
                    alt={doctor?.name}
                    sx={{
                      bgcolor: doctor?.isOnline ? 'success.main' : 'grey.400'
                    }}
                  >
                    {doctor?.name?.charAt(0) || 'D'}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    component="span"
                    fontWeight={chat.unreadCount > 0 ? 'bold' : 'medium'}
                  >
                    {doctor?.name || 'Doctor'}
                    {doctor?._id && <Typography variant="caption" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                      (ID: {doctor._id.substring(0, 6)}...)
                    </Typography>}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        maxWidth: '150px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: chat.unreadCount > 0 ? 'medium' : 'normal'
                      }}
                    >
                      {chat.lastMessage?.content || 'No messages yet'}
                    </Typography>
                    <Typography
                      variant="caption"
                      component="span"
                      sx={{ ml: 1, color: 'text.secondary' }}
                    >
                      {formatMessageTime(chat.lastMessage?.timestamp)}
                    </Typography>
                  </Box>
                }
              />
              {chat.unreadCount > 0 && (
                <Badge
                  badgeContent={chat.unreadCount}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItem>
            {index < conversations.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        );
      }).filter(Boolean)}
    </List>
  );
};

export default ConversationList;
