import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Mic as MicIcon,
  InsertPhoto as PhotoIcon,
  Description as FileIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as GenericFileIcon,
  Delete as DeleteIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GraphicEq as WaveformIcon,
  FiberManualRecord as RecordIcon
} from '@mui/icons-material';
import {
  startRecording,
  stopRecording,
  formatRecordingTime,
  formatAudioFileSize,
  createAudioFile,
  createAudioPreview
} from '../../../utils/audioRecorder';
import axios from '../../../utils/axiosConfig';

const ChatInputArea = ({ onSendMessage, onTyping, sending }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingState, setRecordingState] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Typing timer
  const typingTimerRef = useRef(null);
  
  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Send typing indicator
    onTyping(true);
    
    // Clear previous timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    // Set new timer to stop typing indicator after 3 seconds
    typingTimerRef.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };
  
  // Handle key press (Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle send message
  const handleSendMessage = async () => {
    if ((!message || !message.trim()) && selectedFiles.length === 0) return;
    
    const messageText = message;
    setMessage('');
    
    // Upload files if any
    let attachments = [];
    if (selectedFiles.length > 0) {
      attachments = await uploadFiles();
      setSelectedFiles([]);
      setShowFileDialog(false);
    }
    
    // Send message
    onSendMessage(messageText, attachments);
    
    // Clear typing indicator
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    onTyping(false);
  };
  
  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Create preview for each file
    const newFiles = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setShowFileDialog(true);
    
    // Reset file input
    e.target.value = '';
  };
  
  // Handle file removal
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newFiles[index].url);
      
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    if (selectedFiles.length === 1) {
      setShowFileDialog(false);
    }
  };
  
  // Upload files to server
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      selectedFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Get token for authorization
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('doctorToken');
      
      // Create config with authorization header and upload progress
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };
      
      // Send the files to the server
      const response = await axios.post('/api/uploads/chat-attachment', formData, config);
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to upload files');
      }
      
      // Get the file URLs from the response
      const attachments = response.data.files;
      
      setIsUploading(false);
      setUploadProgress(100);
      
      return attachments;
    } catch (error) {
      console.error('Error uploading files:', error);
      setIsUploading(false);
      return [];
    }
  };
  
  // Start voice recording
  const handleStartRecording = async () => {
    try {
      const recorder = await startRecording();
      setRecordingState(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Stop voice recording
  const handleStopRecording = async () => {
    if (!recordingState) return;
    
    try {
      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Stop recording
      const audioData = await stopRecording(recordingState);
      
      // Create audio file
      const audioFile = createAudioFile(audioData);
      
      // Create preview
      const preview = createAudioPreview(audioFile);
      setAudioPreview(preview);
      
      setIsRecording(false);
      setRecordingState(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setRecordingState(null);
    }
  };
  
  // Cancel recording
  const handleCancelRecording = () => {
    // Stop timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    // Stop recording
    if (recordingState && recordingState.stream) {
      recordingState.stream.getTracks().forEach(track => track.stop());
    }
    
    // Reset states
    setIsRecording(false);
    setRecordingState(null);
    setAudioPreview(null);
    setRecordingTime(0);
  };
  
  // Play/pause audio preview
  const handleToggleAudioPlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlayingAudio(!isPlayingAudio);
  };
  
  // Send voice message
  const handleSendVoiceMessage = async () => {
    if (!audioPreview) return;
    
    try {
      // Create file object for upload
      const voiceFile = {
        file: audioPreview.file,
        name: audioPreview.name,
        type: audioPreview.type,
        size: audioPreview.size,
        url: audioPreview.url
      };
      
      // Add to selected files and upload
      setSelectedFiles([voiceFile]);
      
      // Upload and send
      const attachments = await uploadFiles();
      onSendMessage('Voice message', attachments);
      
      // Reset states
      setAudioPreview(null);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear timers
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Stop recording if active
      if (recordingState && recordingState.stream) {
        recordingState.stream.getTracks().forEach(track => track.stop());
      }
      
      // Revoke object URLs
      selectedFiles.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
      
      if (audioPreview && audioPreview.url) {
        URL.revokeObjectURL(audioPreview.url);
      }
    };
  }, [recordingState, selectedFiles, audioPreview]);
  
  // Handle audio ended event
  useEffect(() => {
    const audioElement = audioRef.current;
    
    if (audioElement) {
      const handleEnded = () => {
        setIsPlayingAudio(false);
      };
      
      audioElement.addEventListener('ended', handleEnded);
      
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioRef.current]);

  return (
    <Box sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
      {/* Voice Recording UI */}
      {isRecording ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}`
                    },
                    '70%': {
                      boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}`
                    },
                    '100%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                    }
                  }
                }}
              >
                <RecordIcon color="error" />
              </Box>
              <Typography variant="subtitle2">Recording voice message</Typography>
            </Box>
            <Typography variant="body2">{formatRecordingTime(recordingTime)}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCancelRecording}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleStopRecording}
              startIcon={<StopIcon />}
            >
              Stop Recording
            </Button>
          </Box>
        </Box>
      ) : audioPreview ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="primary"
              onClick={handleToggleAudioPlayback}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              {isPlayingAudio ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.divider, 0.2),
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: isPlayingAudio ? '50%' : '0%',
                    bgcolor: theme.palette.primary.main,
                    transition: 'width 0.1s linear'
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {formatAudioFileSize(audioPreview.size)}
              </Typography>
            </Box>
            
            <audio
              ref={audioRef}
              src={audioPreview.url}
              style={{ display: 'none' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setAudioPreview(null)}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSendVoiceMessage}
              startIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message here..."
              variant="outlined"
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={4}
              disabled={sending}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.default, 0.7)
                  },
                  '&.Mui-focused': {
                    bgcolor: alpha(theme.palette.background.default, 0.9)
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Tooltip title="Attach Files">
                <IconButton
                  color="primary"
                  onClick={handleFileSelect}
                  disabled={sending}
                  sx={{
                    padding: { xs: '8px', sm: '10px' },
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/*"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Tooltip title="Voice Message">
                <IconButton
                  color="primary"
                  onClick={handleStartRecording}
                  disabled={sending}
                  sx={{
                    padding: { xs: '8px', sm: '10px' },
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <MicIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Tooltip title="Send Message">
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={(!message || !message.trim()) && selectedFiles.length === 0 || sending}
                  sx={{
                    padding: { xs: '8px', sm: '10px' },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  {sending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <SendIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Quick Responses */}
          <Box sx={{
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Chip
              label="How are you feeling today?"
              onClick={() => setMessage("How are you feeling today?")}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                height: { xs: '28px', sm: '32px' }
              }}
              size="small"
            />
            <Chip
              label="Have you taken your medication?"
              onClick={() => setMessage("Have you taken your medication as prescribed?")}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                height: { xs: '28px', sm: '32px' }
              }}
              size="small"
            />
            <Chip
              label="Any side effects?"
              onClick={() => setMessage("Have you experienced any side effects from your medication?")}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                height: { xs: '28px', sm: '32px' }
              }}
              size="small"
            />
          </Box>
        </Box>
      )}
      
      {/* File Attachment Dialog */}
      <Dialog
        open={showFileDialog}
        onClose={() => setShowFileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Attach Files
          <IconButton
            onClick={() => setShowFileDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedFiles.length > 0 ? (
            <>
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {file.type.startsWith('image/') ? (
                        <ImageIcon color="primary" />
                      ) : file.type === 'application/pdf' ? (
                        <PdfIcon color="error" />
                      ) : file.type.startsWith('audio/') ? (
                        <WaveformIcon color="secondary" />
                      ) : (
                        <GenericFileIcon color="action" />
                      )}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={file.name}
                      secondary={formatAudioFileSize(file.size)}
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  onClick={handleFileSelect}
                >
                  Add More Files
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                gap: 2
              }}
            >
              <AttachFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="body1" color="text.secondary">
                No files selected
              </Typography>
              <Button
                variant="contained"
                startIcon={<AttachFileIcon />}
                onClick={handleFileSelect}
              >
                Select Files
              </Button>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowFileDialog(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={
              selectedFiles.length === 0 ||
              isUploading ||
              selectedFiles.reduce((total, file) => total + file.size, 0) > 10 * 1024 * 1024
            }
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Send Files'}
          </Button>
        </DialogActions>
        
        {isUploading && (
          <LinearProgress variant="determinate" value={uploadProgress} />
        )}
      </Dialog>
    </Box>
  );
};

export default ChatInputArea;
