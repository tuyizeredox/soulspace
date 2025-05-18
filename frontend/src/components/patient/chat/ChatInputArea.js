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
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

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

    // Check file size (limit to 10MB per file)
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      // Show error for files that are too large
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Some files were not added because they exceed the 10MB size limit',
          severity: 'warning'
        }
      }));
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setShowFileDialog(true);

    // Reset file input
    e.target.value = '';
  };

  // Handle remove file
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/uploads/chat-attachment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('userToken') || localStorage.getItem('patientToken')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      return response.data.files.map(file => ({
        url: file.url,
        name: file.originalname,
        type: file.mimetype,
        size: file.size
      }));
    } catch (error) {
      console.error('Error uploading files:', error);

      // Show error message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Failed to upload files. Please try again.',
          severity: 'error'
        }
      }));

      return [];
    } finally {
      setIsUploading(false);
    }
  };

  // Start voice recording
  const handleStartRecording = async () => {
    try {
      await startRecording();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);

      // Show error message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Failed to start recording. Please check microphone permissions.',
          severity: 'error'
        }
      }));
    }
  };

  // Stop voice recording
  const handleStopRecording = async () => {
    try {
      const audioBlob = await stopRecording();
      setIsRecording(false);

      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Create audio preview
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setAudioPreview({
        blob: audioBlob,
        url: audioUrl,
        duration: recordingTime,
        audio
      });
    } catch (error) {
      console.error('Error stopping recording:', error);

      // Show error message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Failed to process recording. Please try again.',
          severity: 'error'
        }
      }));

      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Toggle audio playback
  const handleTogglePlay = () => {
    if (!audioPreview) return;

    if (isPlaying) {
      audioPreview.audio.pause();
      setIsPlaying(false);
    } else {
      audioPreview.audio.play();
      setIsPlaying(true);

      // Set event listener to update state when audio ends
      audioPreview.audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  // Send voice message
  const handleSendVoiceMessage = async () => {
    if (!audioPreview) return;

    try {
      // Create file from blob
      const file = await createAudioFile(audioPreview.blob);

      // Add to selected files
      setSelectedFiles([file]);

      // Clear audio preview
      setAudioPreview(null);

      // Show file dialog
      setShowFileDialog(true);
    } catch (error) {
      console.error('Error creating audio file:', error);

      // Show error message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Failed to process audio. Please try again.',
          severity: 'error'
        }
      }));
    }
  };

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
              <Typography variant="body1" fontWeight="medium">
                Recording... {formatRecordingTime(recordingTime)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="error"
              onClick={handleStopRecording}
              startIcon={<StopIcon />}
            >
              Stop
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
              onClick={handleTogglePlay}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Voice Message • {formatRecordingTime(audioPreview.duration)}
              </Typography>
              <Box
                sx={{
                  height: 4,
                  width: '100%',
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: 2,
                  mt: 0.5
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: isPlaying ? '100%' : '0%',
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 2,
                    transition: 'width 0.1s linear'
                  }}
                />
              </Box>
            </Box>
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
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Attach File">
                <IconButton
                  color="primary"
                  onClick={handleFileSelect}
                  disabled={sending}
                  sx={{
                    padding: { xs: '8px', sm: '10px' },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <AttachFileIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Voice Message">
                <IconButton
                  color="primary"
                  onClick={handleStartRecording}
                  disabled={sending}
                  sx={{
                    padding: { xs: '8px', sm: '10px' },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
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
              label="How are you doing today?"
              onClick={() => setMessage("How are you doing today?")}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                height: { xs: '28px', sm: '32px' }
              }}
              size="small"
            />
            <Chip
              label="I need to reschedule my appointment"
              onClick={() => setMessage("I need to reschedule my appointment.")}
              sx={{
                cursor: 'pointer',
                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                height: { xs: '28px', sm: '32px' }
              }}
              size="small"
            />
            <Chip
              label="I have a question about my medication"
              onClick={() => setMessage("I have a question about my medication.")}
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

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        multiple
      />

      {/* File Dialog */}
      <Dialog
        open={showFileDialog}
        onClose={() => !isUploading && setShowFileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Files
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

              <Box sx={{ mt: 2 }}>
                <Button
                  startIcon={<AttachFileIcon />}
                  onClick={handleFileSelect}
                  disabled={isUploading}
                >
                  Add More Files
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}>
              <Typography variant="body1" gutterBottom>
                No files selected
              </Typography>
              <Button
                variant="contained"
                startIcon={<AttachFileIcon />}
                onClick={handleFileSelect}
                sx={{ mt: 2 }}
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
