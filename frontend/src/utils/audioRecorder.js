/**
 * Audio Recorder Utility
 * Provides functions for recording, processing, and playing audio messages
 */

// Start recording audio
export const startRecording = async () => {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create a MediaRecorder instance
    const mediaRecorder = new MediaRecorder(stream);
    
    // Array to store audio chunks
    const audioChunks = [];
    
    // Event handler for when data is available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    // Start recording
    mediaRecorder.start();
    
    // Return the recorder and stream for later use
    return {
      mediaRecorder,
      stream,
      audioChunks
    };
  } catch (error) {
    console.error('Error starting audio recording:', error);
    throw error;
  }
};

// Stop recording and get the audio blob
export const stopRecording = async (recorderState) => {
  return new Promise((resolve, reject) => {
    try {
      const { mediaRecorder, stream, audioChunks } = recorderState;
      
      // Event handler for when recording stops
      mediaRecorder.onstop = () => {
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Create a URL for the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Resolve with the audio data
        resolve({
          blob: audioBlob,
          url: audioUrl,
          type: 'audio/webm',
          size: audioBlob.size
        });
      };
      
      // Stop recording
      mediaRecorder.stop();
    } catch (error) {
      console.error('Error stopping audio recording:', error);
      reject(error);
    }
  });
};

// Format recording time (seconds to MM:SS)
export const formatRecordingTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// Format audio file size
export const formatAudioFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// Create a file object from an audio blob
export const createAudioFile = (audioData) => {
  const { blob, type } = audioData;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `voice-message-${timestamp}.webm`;
  
  // Create a File object from the blob
  return new File([blob], filename, { type });
};

// Create a preview for an audio file
export const createAudioPreview = (audioFile) => {
  return {
    file: audioFile,
    url: URL.createObjectURL(audioFile),
    name: audioFile.name,
    type: audioFile.type,
    size: audioFile.size,
    isVoiceMessage: true,
    duration: 0 // Will be updated when metadata is loaded
  };
};

// Get audio duration
export const getAudioDuration = async (audioUrl) => {
  return new Promise((resolve) => {
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration);
    });
    audio.addEventListener('error', () => {
      console.error('Error loading audio metadata');
      resolve(0); // Default to 0 if there's an error
    });
  });
};
