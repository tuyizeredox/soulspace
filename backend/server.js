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
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const hospitalRegistrationRoutes = require('./routes/hospitalRegistrationRoutes');

dotenv.config();
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
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

// Connect to MongoDB
connectDB();

app.use(morgan('dev'));

// Test endpoint to verify API is accessible
app.get('/api/test', (req, res) => {
  console.log('Root test endpoint hit');
  res.json({ message: 'API is working!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userAuthRoutes); // New user auth routes
// Add these routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/hospital-registrations', hospitalRegistrationRoutes);
app.use('/api/stats', statsRoutes);

app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pharmacists', pharmacistRoutes);
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
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Socket.io setup
const io = require('socket.io')(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    pingTimeout: 60000
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User connects with their ID
    socket.on('setup', (userData) => {
        if (userData && userData._id) {
            socket.join(userData._id.toString());
            onlineUsers.set(userData._id.toString(), socket.id);
            socket.emit('connected');

            // Broadcast user online status
            io.emit('user-online', {
                userId: userData._id.toString(),
                online: true
            });

            console.log('User connected:', userData._id, '- Total online:', onlineUsers.size);
        }
    });

    // Join chat room
    socket.on('join-chat', (chatId) => {
        socket.join(chatId);
        console.log('User joined chat:', chatId);
    });

    // Typing indicator
    socket.on('typing', (chatId) => {
        socket.to(chatId).emit('typing', chatId);
    });

    // Stop typing indicator
    socket.on('stop-typing', (chatId) => {
        socket.to(chatId).emit('stop-typing', chatId);
    });

    // New message
    socket.on('new-message', (messageData) => {
        console.log('New message received:', messageData);

        // Validate messageData
        if (!messageData || !messageData.chat) {
            console.log('Invalid message data received');
            return;
        }

        const chat = messageData.chat;

        // Validate chat participants
        if (!chat.participants || !Array.isArray(chat.participants) || chat.participants.length === 0) {
            console.log('Chat participants not defined or invalid');
            return;
        }

        // Validate sender
        if (!messageData.sender || !messageData.sender._id) {
            console.log('Message sender not defined');
            return;
        }

        // Emit message to all participants except sender
        chat.participants.forEach(participant => {
            // Skip if participant is the sender or if participant._id is not defined
            if (!participant || !participant._id || participant._id === messageData.sender._id) return;

            console.log('Emitting message to participant:', participant._id);
            socket.to(participant._id).emit('message-received', messageData);
        });
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
