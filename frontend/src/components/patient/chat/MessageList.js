import React, { memo, useMemo } from 'react';
import { Box, Typography, Divider, CircularProgress, alpha, useTheme } from '@mui/material';
import MessageItem from './MessageItem';

// Memoized component to prevent unnecessary re-renders
const MessageList = memo(({ 
  messages, 
  user, 
  loading, 
  formatTime, 
  formatDate,
  messagesEndRef 
}) => {
  const theme = useTheme();

  // Group messages by date for better organization
  const messagesByDate = useMemo(() => {
    if (!messages || !messages.length) return {};

    const result = {};
    
    messages.forEach(msg => {
      const timestamp = msg.timestamp || msg.createdAt || new Date();
      const date = new Date(timestamp);
      const dateStr = date.toDateString();
      
      if (!result[dateStr]) {
        result[dateStr] = [];
      }
      
      result[dateStr].push(msg);
    });
    
    return result;
  }, [messages]);

  // Loading state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          p: 3
        }}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading messages...
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (!messages || messages.length === 0) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          p: 3
        }}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          No messages yet. Start the conversation by sending a message.
        </Typography>
      </Box>
    );
  }

  // Render messages grouped by date
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
      {Object.keys(messagesByDate).map(dateStr => (
        <Box key={dateStr}>
          {/* Date separator */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              my: 2,
              position: 'relative'
            }}
          >
            <Divider sx={{ width: '100%', position: 'absolute', top: '50%' }} />
            <Box
              sx={{
                bgcolor: 'background.paper',
                px: 2,
                zIndex: 1,
                borderRadius: 10,
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {formatDate(dateStr)}
              </Typography>
            </Box>
          </Box>

          {/* Messages for this date */}
          {messagesByDate[dateStr].map((msg, index, arr) => {
            const isCurrentUser = msg.sender && (msg.sender._id === user?._id || msg.sender.id === user?.id);
            const isFirstInGroup = index === 0 || 
                                  (arr[index - 1].sender && 
                                   msg.sender && 
                                   arr[index - 1].sender._id !== msg.sender._id);
            const isLastInGroup = index === arr.length - 1 || 
                                 (arr[index + 1].sender && 
                                  msg.sender && 
                                  arr[index + 1].sender._id !== msg.sender._id);
            
            return (
              <MessageItem
                key={msg._id}
                msg={msg}
                isCurrentUser={isCurrentUser}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                formatTime={formatTime}
              />
            );
          })}
        </Box>
      ))}
      
      {/* Reference for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </Box>
  );
});

export default MessageList;
