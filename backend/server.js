require('events').EventEmitter.defaultMaxListeners = 15;

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes'); // New user auth routes
const hospitalRoutes = require('./routes/hospitalRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const staffRoutes = require('./routes/staffRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const emergencyResponderRoutes = require('./routes/emergencyResponderRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statsRoutes = require('./routes/statsRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const healthRoutes = require('./routes/healthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const patientDoctorChatRoutes = require('./routes/patientDoctorChatRoutes');
const profileRoutes = require('./routes/profileRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const patientAssignmentRoutes = require('./routes/patientAssignmentRoutes');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const hospitalRegistrationRoutes = require('./routes/hospitalRegistrationRoutes');

dotenv.config();

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is not set!');
  console.error('Please check your .env file and ensure JWT_SECRET is properly configured.');
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI environment variable is not set!');
  console.error('Please check your .env file and ensure MONGO_URI is properly configured.');
  process.exit(1);
}

console.log('Environment variables loaded successfully:');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? `SET (length: ${process.env.JWT_SECRET.length})` : 'NOT SET');
console.log('- MONGO_URI:', process.env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('- PORT:', process.env.PORT || '5000');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:3000');

const app = express();
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Create avatars subdirectory
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('Created avatars directory');
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
    origin: ['https://soulspacehealth.vercel.app/', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(morgan('dev'));

// Test endpoint to verify API is accessible
app.get('/api/test', (_, res) => {
  console.log('Root test endpoint hit');
  res.json({
    message: 'API is working!',
    jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '5000'
    }
  });
});

// Initialize the server with database connection
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Only set up routes after database connection is established
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userAuthRoutes); // New user auth routes
    // Add these routes
    app.use('/api/hospitals', hospitalRoutes);
    app.use('/api/hospital-registrations', hospitalRegistrationRoutes);
    app.use('/api/stats', statsRoutes);

    app.use('/api/patients', patientRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/pharmacists', pharmacistRoutes);
    app.use('/api/nurses', nurseRoutes);
    app.use('/api/staff', staffRoutes);
    app.use('/api/insurance', insuranceRoutes);
    app.use('/api/emergency', emergencyResponderRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/doctors', doctorRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/ai-assistant', aiAssistantRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/chats', chatRoutes);
    app.use('/api/patient-doctor-chat', patientDoctorChatRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/uploads', uploadRoutes);
    app.use('/api/medical-records', require('./routes/medicalRecordRoutes'));
    app.use('/api/patient-assignments', patientAssignmentRoutes);
    app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));

    // Error handling middleware
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Set up Socket.io after server is started
    setupSocketIO(server);

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Socket.io setup function
const setupSocketIO = (server) => {
    const io = require('socket.io')(server, {
        cors: {
            origin: ['https://soulspacehealth.vercel.app/', 'http://127.0.0.1:3000'],
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        },
        pingTimeout: 60000
    });

    // Store online users and their roles
    const onlineUsers = new Map();

    // Store typing status
    const typingUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User connects with their ID
    socket.on('setup', (userData) => {
        if (userData && userData._id) {
            const userId = userData._id.toString();
            socket.join(userId);

            // Store user info with role for role-based notifications
            onlineUsers.set(userId, {
                socketId: socket.id,
                role: userData.role || 'unknown'
            });

            socket.emit('connected');

            // Broadcast user online status
            io.emit('user-online', {
                userId: userId,
                online: true,
                role: userData.role
            });

            console.log('User connected:', userId, 'Role:', userData.role, '- Total online:', onlineUsers.size);

            // If user is a doctor, notify their patients
            if (userData.role === 'doctor') {
                // Find all chats where this doctor is a participant
                const Chat = require('./models/Chat');
                Chat.find({
                    participants: userId,
                    isGroup: false
                })
                .then(chats => {
                    // For each chat, notify the other participant if they're online
                    chats.forEach(chat => {
                        const patientId = chat.participants.find(p => p.toString() !== userId)?.toString();
                        if (patientId && onlineUsers.has(patientId)) {
                            io.to(patientId).emit('doctor-online', {
                                doctorId: userId,
                                online: true
                            });
                        }
                    });
                })
                .catch(err => console.error('Error notifying patients of doctor online status:', err));
            }

            // If user is a patient, notify their doctor
            if (userData.role === 'patient') {
                // Find all chats where this patient is a participant
                const Chat = require('./models/Chat');
                Chat.find({
                    participants: userId,
                    isGroup: false
                })
                .then(chats => {
                    // For each chat, notify the other participant if they're online
                    chats.forEach(chat => {
                        const doctorId = chat.participants.find(p => p.toString() !== userId)?.toString();
                        if (doctorId && onlineUsers.has(doctorId)) {
                            io.to(doctorId).emit('patient-online', {
                                patientId: userId,
                                online: true
                            });
                        }
                    });
                })
                .catch(err => console.error('Error notifying doctors of patient online status:', err));
            }
        }
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
        console.log('User joined chat:', chatId);
    });

    // Typing indicator with user info
    socket.on('typing', (data) => {
        const { chatId, userId, userName } = data;

        // Store typing status
        typingUsers.set(`${chatId}-${userId}`, {
            userId,
            userName,
            timestamp: Date.now()
        });

        // Emit to all users in the chat except the sender
        socket.to(chatId).emit('typing', {
            chatId,
            userId,
            userName
        });
    });

    // Stop typing indicator
    socket.on('stop-typing', (data) => {
        const { chatId, userId } = data;

        // Remove typing status
        typingUsers.delete(`${chatId}-${userId}`);

        // Emit to all users in the chat except the sender
        socket.to(chatId).emit('stop-typing', {
            chatId,
            userId
        });
    });

    // New message
    socket.on('new-message', (messageData) => {
        console.log('New message received:', messageData);

        // Validate messageData
        if (!messageData) {
            console.log('Invalid message data received: messageData is null or undefined');
            return;
        }

        // Get chat from messageData
        let chat;
        let chatId;

        if (messageData.chat) {
            chat = messageData.chat;
            chatId = chat._id;
        } else if (messageData.chatId) {
            chatId = messageData.chatId;
        } else {
            console.log('Chat information not found in message data');
            return;
        }

        // Clear typing status for this user in this chat
        if (messageData.sender && messageData.sender._id) {
            const senderId = messageData.sender._id.toString();
            typingUsers.delete(`${chatId}-${senderId}`);
        }

        // Emit stop-typing event to clear typing indicators
        socket.to(chatId).emit('stop-typing', {
            chatId,
            userId: messageData.sender?._id
        });

        // If we have chat object with participants, use it
        if (chat && chat.participants && Array.isArray(chat.participants) && chat.participants.length > 0) {
            // Validate sender
            if (!messageData.sender || !messageData.sender._id) {
                console.log('Message sender not defined');
                return;
            }

            // Emit message to all participants except sender
            chat.participants.forEach(participant => {
                // Skip if participant is the sender or if participant._id is not defined
                if (!participant || !participant._id) {
                    console.log('Skipping invalid participant');
                    return;
                }

                // Convert IDs to strings for comparison
                const participantId = typeof participant === 'object' ? participant._id.toString() : participant.toString();
                const senderId = messageData.sender._id.toString();

                if (participantId === senderId) {
                    console.log('Skipping sender:', senderId);
                    return;
                }

                console.log('Emitting message to participant:', participantId);
                socket.to(participantId).emit('message-received', messageData);

                // If this is a patient-doctor chat, send specific events
                if (onlineUsers.has(participantId)) {
                    const recipientInfo = onlineUsers.get(participantId);
                    const recipientRole = recipientInfo.role;

                    const senderRole = messageData.sender?.role ||
                                      (onlineUsers.has(senderId) ?
                                       onlineUsers.get(senderId).role : 'unknown');

                    // If doctor is sending to patient
                    if (senderRole === 'doctor' && recipientRole === 'patient') {
                        socket.to(participantId).emit('doctor-message', {
                            message: messageData,
                            doctorId: senderId
                        });
                    }

                    // If patient is sending to doctor
                    if (senderRole === 'patient' && recipientRole === 'doctor') {
                        socket.to(participantId).emit('patient-message', {
                            message: messageData,
                            patientId: senderId
                        });
                    }
                }
            });

            // Also emit to the chat room if available
            if (chat._id) {
                console.log('Emitting message to chat room:', chat._id);
                socket.to(chat._id.toString()).emit('message-received', messageData);
            }
        }
        // If we only have chatId, we need to look up the chat
        else if (chatId) {
            console.log('Attempting to find chat by ID:', chatId);

            // Get the chat from the database
            const Chat = require('./models/Chat');
            Chat.findById(chatId)
                .then(foundChat => {
                    if (!foundChat) {
                        console.log(`Chat not found with ID: ${chatId}`);
                        return;
                    }

                    // Send message to all participants except sender
                    foundChat.participants.forEach(participant => {
                        // Skip sending to the sender
                        if (messageData.sender && participant.toString() === messageData.sender._id) {
                            return;
                        }

                        const participantId = participant.toString();
                        console.log(`Sending message to participant: ${participantId}`);
                        socket.to(participantId).emit('message-received', messageData);

                        // Send role-specific events
                        if (onlineUsers.has(participantId)) {
                            const recipientInfo = onlineUsers.get(participantId);
                            const recipientRole = recipientInfo.role;

                            const senderRole = messageData.sender?.role ||
                                              (onlineUsers.has(messageData.sender?._id) ?
                                               onlineUsers.get(messageData.sender?._id).role : 'unknown');

                            // Role-specific events
                            if (senderRole === 'doctor' && recipientRole === 'patient') {
                                socket.to(participantId).emit('doctor-message', {
                                    message: messageData,
                                    doctorId: messageData.sender?._id
                                });
                            }

                            if (senderRole === 'patient' && recipientRole === 'doctor') {
                                socket.to(participantId).emit('patient-message', {
                                    message: messageData,
                                    patientId: messageData.sender?._id
                                });
                            }
                        }
                    });

                    // Also emit to the chat room
                    socket.to(chatId).emit('message-received', messageData);
                })
                .catch(err => console.error(`Error finding chat ${chatId}:`, err));
        } else {
            console.log('Cannot determine chat participants');
        }
    });

    // Message read status
    socket.on('message-read', (data) => {
        console.log('Message read event received:', data);

        if (!data || !data.chatId) {
            console.log('Invalid message read data');
            return;
        }

        const { chatId, userId } = data;

        // Skip mock chat IDs
        if (chatId.startsWith('mock-')) {
            console.log(`Ignoring message-read event for mock chat: ${chatId}`);
            return;
        }

        // Validate chat ID format (should be a valid MongoDB ObjectId)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);
        if (!isValidObjectId) {
            console.log(`Invalid chat ID format: ${chatId}`);
            return;
        }

        // Emit to the chat room that messages have been read
        socket.to(chatId).emit('messages-marked-read', {
            chatId,
            readBy: userId
        });

        console.log(`Emitted read status for chat ${chatId} by user ${userId}`);
    });

    // WebRTC signaling

    // Call request
    socket.on('call-request', (data) => {
        if (!data || !data.receiverId || !data.room || !data.caller) {
            console.log('Invalid call request data');
            return;
        }

        const { receiverId, room, caller } = data;
        // Log call type if available
        console.log(`Call type: ${data.callType || 'unknown'}`);

        console.log(`Call request from ${caller.id} to ${receiverId} in room ${room}`);

        // Find the receiver's socket
        let receiverSocketId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (userId === receiverId) {
                receiverSocketId = socketId;
                break;
            }
        }

        if (receiverSocketId) {
            // Forward the call request to the receiver
            io.to(receiverSocketId).emit('call-request', data);
            console.log(`Call request forwarded to ${receiverId}`);
        } else {
            // Receiver is offline, send call-rejected event back to caller
            socket.emit('call-rejected', {
                room,
                callerId: caller.id,
                receiverId,
                reason: 'offline',
                timestamp: new Date().toISOString()
            });
            console.log(`Receiver ${receiverId} is offline, call rejected`);
        }
    });

    // Call accepted
    socket.on('call-accepted', (data) => {
        if (!data || !data.callerId || !data.room) {
            console.log('Invalid call accepted data');
            return;
        }

        const { callerId, room, receiverId } = data;

        console.log(`Call accepted by ${receiverId} for caller ${callerId} in room ${room}`);

        // Find the caller's socket
        let callerSocketId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (userId === callerId) {
                callerSocketId = socketId;
                break;
            }
        }

        if (callerSocketId) {
            // Forward the call accepted to the caller
            io.to(callerSocketId).emit('call-accepted', data);
            console.log(`Call accepted forwarded to ${callerId}`);
        }
    });

    // Call rejected
    socket.on('call-rejected', (data) => {
        if (!data || !data.callerId || !data.room) {
            console.log('Invalid call rejected data');
            return;
        }

        const { callerId, room, receiverId, reason } = data;

        console.log(`Call rejected by ${receiverId} for caller ${callerId} in room ${room}, reason: ${reason}`);

        // Find the caller's socket
        let callerSocketId = null;
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (userId === callerId) {
                callerSocketId = socketId;
                break;
            }
        }

        if (callerSocketId) {
            // Forward the call rejected to the caller
            io.to(callerSocketId).emit('call-rejected', data);
            console.log(`Call rejected forwarded to ${callerId}`);
        }
    });

    // Join a call room
    socket.on('join-room', (data) => {
        if (!data || !data.room) {
            console.log('Invalid room data');
            return;
        }

        const { room, userId } = data;

        console.log(`User ${userId || socket.id} joining room: ${room}`);

        // Join the room
        socket.join(room);

        // Check if this is the first user in the room
        const clients = io.sockets.adapter.rooms.get(room);
        const isInitiator = clients.size === 1;

        // Notify the user that they've joined
        socket.emit('joined', {
            room,
            userId: userId || socket.id,
            isInitiator
        });

        // If this is not the first user, notify others that a new user has joined
        if (!isInitiator) {
            socket.to(room).emit('user-joined', {
                room,
                userId: userId || socket.id
            });
        }
    });

    // Handle offer
    socket.on('offer', (data) => {
        if (!data || !data.room || !data.offer) {
            console.log('Invalid offer data');
            return;
        }

        console.log(`Received offer for room: ${data.room}`);

        // Forward the offer to others in the room
        socket.to(data.room).emit('offer', data);
    });

    // Handle answer
    socket.on('answer', (data) => {
        if (!data || !data.room || !data.answer) {
            console.log('Invalid answer data');
            return;
        }

        console.log(`Received answer for room: ${data.room}`);

        // Forward the answer to others in the room
        socket.to(data.room).emit('answer', data);
    });

    // Handle ICE candidate
    socket.on('ice-candidate', (data) => {
        if (!data || !data.room || !data.candidate) {
            console.log('Invalid ICE candidate data');
            return;
        }

        console.log(`Received ICE candidate for room: ${data.room}`);

        // Forward the ICE candidate to others in the room
        socket.to(data.room).emit('ice-candidate', data);
    });

    // Handle call ended
    socket.on('call-ended', (data) => {
        if (!data || !data.room) {
            console.log('Invalid call ended data');
            return;
        }

        console.log(`Call ended in room: ${data.room}`);

        // Notify others in the room that the call has ended
        socket.to(data.room).emit('call-ended');
    });

    // Handle message during call
    socket.on('message', (data) => {
        if (!data || !data.room || !data.message) {
            console.log('Invalid message data');
            return;
        }

        console.log(`Received message for room: ${data.room}`);

        // Forward the message to others in the room
        socket.to(data.room).emit('message', data);
    });

    // User disconnects
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Find and remove the disconnected user
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);

                // Broadcast user offline status
                io.emit('user-online', {
                    userId: userId,
                    online: false
                });

                console.log('User disconnected:', userId, '- Total online:', onlineUsers.size);
                break;
            }
        }
    });
});
};
