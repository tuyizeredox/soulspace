const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        // Allow command buffering to prevent errors when commands are issued before connection is complete
        mongoose.set('bufferCommands', true); // Enable command buffering (this is the default)

        // Connect with corrected options
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
            socketTimeoutMS: 75000, // Increase socket timeout to 75 seconds
            connectTimeoutMS: 60000, // Increase connection timeout to 60 seconds
            maxPoolSize: 50, // Increase connection pool size
            minPoolSize: 10, // Set minimum pool size
            // Note: keepAlive and keepAliveInitialDelay were causing errors
            // They are removed as they're not supported in the current MongoDB driver
        });

        // Log successful connection
        console.log('MongoDB connected successfully');

        // Set up connection error handler
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Set up disconnection handler
        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        // Set up reconnection handler
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;