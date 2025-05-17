import { io } from 'socket.io-client';

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isInitiator = false;
    this.isStarted = false;
    this.isChannelReady = false;
    this.room = null;
    this.userId = null;
    this.remoteUserId = null;
    this.onRemoteStreamCallback = null;
    this.onConnectionStateChangeCallback = null;
    this.onIceCandidateCallback = null;
    this.onMessageCallback = null;
    this.onCallRequestCallback = null;
    this.onCallAcceptedCallback = null;
    this.onCallRejectedCallback = null;

    // WebRTC configuration
    this.pcConfig = {
      'iceServers': [
        {
          'urls': 'stun:stun.l.google.com:19302'
        },
        {
          'urls': 'stun:stun1.l.google.com:19302'
        },
        {
          'urls': 'stun:stun2.l.google.com:19302'
        }
      ]
    };
  }

  // Initialize the WebRTC service
  initialize(userId, remoteUserId, roomId) {
    this.userId = userId;
    this.remoteUserId = remoteUserId;
    this.room = roomId || `call-${userId}-${remoteUserId}`;

    // Connect to signaling server
    this.socket = io('http://localhost:5000');

    // Setup socket event listeners
    this.setupSocketListeners();

    // Join room
    this.socket.emit('join-room', {
      room: this.room,
      userId: this.userId
    });

    console.log(`WebRTC service initialized for user ${userId} in room ${this.room}`);
    return this;
  }

  // Initiate a call to a user
  initiateCall(callerInfo, receiverId, callType = 'video') {
    console.log(`Initiating ${callType} call to user ${receiverId}`);

    // Emit call-request event
    this.socket.emit('call-request', {
      caller: {
        id: this.userId,
        name: callerInfo.name || 'Unknown',
        role: callerInfo.role || 'doctor',
        avatar: callerInfo.avatar || null
      },
      receiverId: receiverId,
      room: this.room,
      callType: callType,
      timestamp: new Date().toISOString()
    });

    return this.room;
  }

  // Setup socket event listeners
  setupSocketListeners() {
    // When another user joins the room
    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      this.isChannelReady = true;

      // If we're the initiator, start the call
      if (this.isInitiator && !this.isStarted) {
        this.maybeStart();
      }
    });

    // Call request received
    this.socket.on('call-request', (data) => {
      console.log('Call request received:', data);

      if (this.onCallRequestCallback) {
        this.onCallRequestCallback(data);
      }
    });

    // Call accepted
    this.socket.on('call-accepted', (data) => {
      console.log('Call accepted:', data);

      // Set channel as ready
      this.isChannelReady = true;

      // If we're the initiator, start the call
      if (this.isInitiator && !this.isStarted && this.localStream) {
        this.maybeStart();
      }

      if (this.onCallAcceptedCallback) {
        this.onCallAcceptedCallback(data);
      }
    });

    // Call rejected
    this.socket.on('call-rejected', (data) => {
      console.log('Call rejected:', data);

      if (this.onCallRejectedCallback) {
        this.onCallRejectedCallback(data);
      }
    });

    // When we receive an offer
    this.socket.on('offer', (data) => {
      console.log('Received offer:', data);
      if (!this.isInitiator && !this.isStarted) {
        this.maybeStart();
      }
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      this.doAnswer();
    });

    // When we receive an answer
    this.socket.on('answer', (data) => {
      console.log('Received answer:', data);
      if (this.isStarted) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    // When we receive an ICE candidate
    this.socket.on('ice-candidate', (data) => {
      console.log('Received ICE candidate:', data);
      if (this.isStarted) {
        const candidate = new RTCIceCandidate({
          sdpMLineIndex: data.candidate.sdpMLineIndex,
          sdpMid: data.candidate.sdpMid,
          candidate: data.candidate.candidate
        });
        this.peerConnection.addIceCandidate(candidate);
      }
    });

    // When we receive a message
    this.socket.on('message', (data) => {
      console.log('Received message:', data);
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    });

    // When we join a room
    this.socket.on('joined', (data) => {
      console.log('Joined room:', data);
      this.isInitiator = data.isInitiator;
    });

    // When the call is ended
    this.socket.on('call-ended', () => {
      console.log('Call ended by remote user');
      this.hangup();
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback('ended');
      }
    });
  }

  // Start the call
  async startCall(audioOnly = false) {
    try {
      console.log(`Starting ${audioOnly ? 'audio-only' : 'video'} call`);

      // Get user media
      const constraints = {
        video: !audioOnly,
        audio: true
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Got local stream:', this.localStream);
      } catch (mediaError) {
        console.error('Error getting user media:', mediaError);

        // If video fails but this is a video call, try falling back to audio-only
        if (!audioOnly && (mediaError.name === 'NotAllowedError' || mediaError.name === 'NotFoundError')) {
          console.log('Video failed, falling back to audio-only');
          this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
        } else {
          throw mediaError;
        }
      }

      // If we're the initiator or the channel is ready, start the call
      if (this.isInitiator || this.isChannelReady) {
        this.maybeStart();
      }

      return this.localStream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  // Maybe start the call
  maybeStart() {
    console.log('Maybe start call:',
      !this.isStarted,
      !!this.localStream,
      this.isChannelReady || this.isInitiator
    );

    if (!this.isStarted && this.localStream && (this.isChannelReady || this.isInitiator)) {
      console.log('Creating peer connection');
      this.createPeerConnection();

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.isStarted = true;

      // If we're the initiator, create an offer
      if (this.isInitiator) {
        this.doCall();
      }
    }
  }

  // Create peer connection
  createPeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.pcConfig);

      // Set up ICE candidate handling
      this.peerConnection.onicecandidate = (event) => {
        console.log('ICE candidate event:', event);
        if (event.candidate) {
          this.socket.emit('ice-candidate', {
            room: this.room,
            candidate: event.candidate
          });

          if (this.onIceCandidateCallback) {
            this.onIceCandidateCallback(event.candidate);
          }
        }
      };

      // Set up remote stream handling
      this.peerConnection.ontrack = (event) => {
        console.log('Remote track added:', event);
        this.remoteStream = event.streams[0];

        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(this.remoteStream);
        }
      };

      // Set up connection state change handling
      this.peerConnection.onconnectionstatechange = (event) => {
        console.log('Connection state change:', this.peerConnection.connectionState);

        if (this.onConnectionStateChangeCallback) {
          this.onConnectionStateChangeCallback(this.peerConnection.connectionState);
        }
      };

      console.log('Created RTCPeerConnection');
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  // Create an offer
  async doCall() {
    try {
      console.log('Creating offer');
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log('Sending offer:', offer);
      this.socket.emit('offer', {
        room: this.room,
        offer: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  // Create an answer
  async doAnswer() {
    try {
      console.log('Creating answer');
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('Sending answer:', answer);
      this.socket.emit('answer', {
        room: this.room,
        answer: answer
      });
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  }

  // Send a message
  sendMessage(message) {
    this.socket.emit('message', {
      room: this.room,
      message: message
    });
  }

  // Toggle video
  toggleVideo(enabled) {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = enabled;
      }
    }
  }

  // Toggle audio
  toggleAudio(enabled) {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = enabled;
      }
    }
  }

  // Share screen
  async shareScreen(enabled) {
    if (enabled) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoTrack = screenStream.getVideoTracks()[0];

        // Get the sender that's currently sending the video track
        const sender = this.peerConnection.getSenders().find(s =>
          s.track && s.track.kind === 'video'
        );

        // Replace the track
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // When the screen sharing ends
        videoTrack.onended = () => {
          this.shareScreen(false);
        };

        return screenStream;
      } catch (error) {
        console.error('Error sharing screen:', error);
        throw error;
      }
    } else {
      // Switch back to camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];

        // Get the sender that's currently sending the video track
        const sender = this.peerConnection.getSenders().find(s =>
          s.track && s.track.kind === 'video'
        );

        // Replace the track
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        return stream;
      } catch (error) {
        console.error('Error switching back to camera:', error);
        throw error;
      }
    }
  }

  // End the call
  hangup() {
    console.log('Hanging up call');

    // Notify the other user if socket is available
    if (this.socket) {
      try {
        this.socket.emit('call-ended', {
          room: this.room
        });
      } catch (error) {
        console.error('Error emitting call-ended event:', error);
      }
    } else {
      console.warn('Cannot emit call-ended: Socket is not initialized');
    }

    // Stop the peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Stop the local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.isStarted = false;
  }

  // Accept a call
  acceptCall(callData) {
    console.log('Accepting call:', callData);

    // Emit call-accepted event
    this.socket.emit('call-accepted', {
      room: callData.room,
      callerId: callData.caller.id,
      receiverId: this.userId,
      timestamp: new Date().toISOString()
    });

    // Join the room
    this.room = callData.room;
    this.remoteUserId = callData.caller.id;

    this.socket.emit('join-room', {
      room: this.room,
      userId: this.userId
    });

    return this.room;
  }

  // Reject a call
  rejectCall(callData) {
    console.log('Rejecting call:', callData);

    // Emit call-rejected event
    this.socket.emit('call-rejected', {
      room: callData.room,
      callerId: callData.caller.id,
      receiverId: this.userId,
      reason: 'declined',
      timestamp: new Date().toISOString()
    });
  }

  // Set callbacks
  setCallbacks(callbacks) {
    if (callbacks.onRemoteStream) {
      this.onRemoteStreamCallback = callbacks.onRemoteStream;
    }

    if (callbacks.onConnectionStateChange) {
      this.onConnectionStateChangeCallback = callbacks.onConnectionStateChange;
    }

    if (callbacks.onIceCandidate) {
      this.onIceCandidateCallback = callbacks.onIceCandidate;
    }

    if (callbacks.onMessage) {
      this.onMessageCallback = callbacks.onMessage;
    }

    if (callbacks.onCallRequest) {
      this.onCallRequestCallback = callbacks.onCallRequest;
    }

    if (callbacks.onCallAccepted) {
      this.onCallAcceptedCallback = callbacks.onCallAccepted;
    }

    if (callbacks.onCallRejected) {
      this.onCallRejectedCallback = callbacks.onCallRejected;
    }
  }

  // Clean up
  cleanup() {
    try {
      // Only call hangup if socket exists
      if (this.socket) {
        this.hangup();
      }

      // Disconnect socket if it exists
      if (this.socket) {
        try {
          this.socket.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
        this.socket = null;
      }

      // Reset all properties
      this.peerConnection = null;
      this.localStream = null;
      this.remoteStream = null;
      this.isInitiator = false;
      this.isStarted = false;
      this.isChannelReady = false;
      this.room = null;
      this.userId = null;
      this.remoteUserId = null;

      console.log('WebRTCService cleaned up successfully');
    } catch (error) {
      console.error('Error during WebRTCService cleanup:', error);
    }
  }
}

export default new WebRTCService();
