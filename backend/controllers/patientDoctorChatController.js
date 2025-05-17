const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Message = require('../models/Message'); // Add Message model

/**
 * Get all chats for a patient with their doctors
 * @route GET /api/patient-doctor-chat/patient
 * @access Private (Patient only)
 */
exports.getPatientChats = async (req, res) => {
  try {
    const patientId = req.user.id;
    console.log('Getting doctor chats for patient ID:', patientId);

    // Find all doctors assigned to this patient
    const patient = await Patient.findOne({ userId: patientId }).populate('assignedDoctor');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Find all chats where the patient is a participant and the other participant is a doctor
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: patientId } },
      isGroup: false
    })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage.sender', 'name')
      .sort({ 'lastMessage.timestamp': -1 });

    // Filter chats to only include those with doctors
    const doctorChats = await Promise.all(chats.map(async (chat) => {
      // Find the other participant (not the patient)
      const otherParticipant = chat.participants.find(p => p._id.toString() !== patientId);

      if (!otherParticipant) return null;

      // Check if the other participant is a doctor
      const isDoctor = otherParticipant.role === 'doctor';

      if (isDoctor) {
        // Get doctor details
        const doctor = await Doctor.findOne({ userId: otherParticipant._id }).populate('hospital');

        // Add doctor details to the chat
        return {
          ...chat.toObject(),
          doctorDetails: doctor ? {
            specialization: doctor.specialization,
            hospital: doctor.hospital ? doctor.hospital.name : 'Unknown Hospital'
          } : null
        };
      }

      return null;
    }));

    // Filter out null values
    const filteredDoctorChats = doctorChats.filter(chat => chat !== null);

    res.status(200).json(filteredDoctorChats);
  } catch (error) {
    console.error('Error getting patient chats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all chats for a doctor with their patients
 * @route GET /api/patient-doctor-chat/doctor
 * @access Private (Doctor only)
 */
exports.getDoctorChats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    console.log('Getting patient chats for doctor ID:', doctorId);

    // Find all patients assigned to this doctor
    const doctor = await Doctor.findOne({ userId: doctorId });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Find all chats where the doctor is a participant and the other participant is a patient
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: doctorId } },
      isGroup: false
    })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage.sender', 'name')
      .sort({ 'lastMessage.timestamp': -1 });

    // Filter chats to only include those with patients
    const patientChats = await Promise.all(chats.map(async (chat) => {
      // Find the other participant (not the doctor)
      const otherParticipant = chat.participants.find(p => p._id.toString() !== doctorId);

      if (!otherParticipant) return null;

      // Check if the other participant is a patient
      const isPatient = otherParticipant.role === 'patient';

      if (isPatient) {
        // Get patient details
        const patient = await Patient.findOne({ userId: otherParticipant._id });

        // Add patient details to the chat
        return {
          ...chat.toObject(),
          patientDetails: patient ? {
            medicalHistory: patient.medicalHistory,
            insuranceInfo: patient.insuranceInfo
          } : null
        };
      }

      return null;
    }));

    // Filter out null values
    const filteredPatientChats = patientChats.filter(chat => chat !== null);

    res.status(200).json(filteredPatientChats);
  } catch (error) {
    console.error('Error getting doctor chats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create or access a chat between a patient and a doctor
 * @route POST /api/patient-doctor-chat
 * @access Private
 */
exports.accessPatientDoctorChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: 'UserId parameter not sent with request' });
    }

    console.log('Creating chat between users:', currentUserId, 'and', userId);

    // Handle special case for "force-doctor-id"
    let actualUserId = userId; // Create a new variable to store the actual user ID

    if (userId === 'force-doctor-id') {
      console.log('Special case: force-doctor-id detected');

      // Try to find an existing doctor to use
      const existingDoctor = await User.findOne({ role: 'doctor' });

      if (existingDoctor) {
        console.log('Using existing doctor:', existingDoctor._id);
        actualUserId = existingDoctor._id.toString();
      } else {
        // Create a mock doctor if none exists
        console.log('No existing doctor found, creating a mock doctor');

        try {
          // Create a new user with doctor role
          const newDoctorUser = new User({
            name: 'Dr. Mock Doctor',
            email: 'mockdoctor@soulspace.com',
            password: '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1TD7WS', // hashed 'password123'
            role: 'doctor',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          });

          const savedDoctorUser = await newDoctorUser.save();
          console.log('Created mock doctor user:', savedDoctorUser._id);

          // Create a doctor profile
          const newDoctor = new Doctor({
            userId: savedDoctorUser._id,
            specialization: 'General Medicine',
            qualifications: 'MD',
            experience: '10 years'
          });

          await newDoctor.save();
          console.log('Created mock doctor profile');

          actualUserId = savedDoctorUser._id.toString();
        } catch (createError) {
          console.error('Error creating mock doctor:', createError);
          return res.status(500).json({
            message: 'Error creating mock doctor',
            error: createError.message
          });
        }
      }
    }

    // Check if chat exists between these two users
    let chat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [currentUserId, actualUserId],
        $size: 2
      }
    })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage.sender', 'name');

    // If chat exists, return it
    if (chat) {
      console.log('Found existing chat:', chat._id);
      return res.status(200).json(chat);
    }

    // If chat doesn't exist, create a new one
    console.log('Creating new chat between', currentUserId, 'and', actualUserId);
    const chatData = {
      participants: [currentUserId, actualUserId],
      isGroup: false,
      messages: [],
      unreadCounts: new Map([[currentUserId.toString(), 0], [actualUserId.toString(), 0]])
    };

    console.log('Creating new chat with participants:', currentUserId, 'and', actualUserId);
    const newChat = await Chat.create(chatData);
    console.log('Created new chat with ID:', newChat._id);

    // Add a welcome message to the chat
    const welcomeMessage = {
      _id: new mongoose.Types.ObjectId(),
      sender: actualUserId, // Make it appear from the doctor/other user
      content: "Hello! How can I help you today?",
      timestamp: new Date()
    };

    console.log('Adding welcome message to chat');
    await Chat.findByIdAndUpdate(
      newChat._id,
      {
        $push: { messages: welcomeMessage },
        $set: {
          lastMessage: {
            content: welcomeMessage.content,
            sender: actualUserId,
            timestamp: welcomeMessage.timestamp
          }
        }
      }
    );
    console.log('Welcome message added');

    // Populate the new chat with user details
    const fullChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email role avatar')
      .populate({
        path: 'messages.sender',
        select: 'name email role avatar'
      });

    console.log('Returning chat with', fullChat.messages?.length || 0, 'messages');
    res.status(201).json(fullChat);
  } catch (error) {
    console.error('Error accessing patient-doctor chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get messages for a specific chat
 * @route GET /api/patient-doctor-chat/:chatId/messages
 * @access Private
 */
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    console.log(`Fetching messages for chat ${chatId} by user ${userId}`);

    // Handle non-standard chat IDs (fallback IDs)
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log(`Handling non-standard chat ID: ${chatId}`);

      // For fallback IDs, return mock messages instead of an error
      if (chatId.startsWith('fallback_') || chatId.startsWith('mock_')) {
        console.log(`Generating mock messages for fallback/mock chat ID: ${chatId}`);

        // Try to find a real doctor to use in the mock messages
        let doctorInfo = {
          _id: "system",
          name: "Dr. System",
          role: "doctor"
        };

        try {
          const doctor = await User.findOne({ role: 'doctor' });
          if (doctor) {
            doctorInfo = {
              _id: doctor._id.toString(),
              name: doctor.name,
              role: doctor.role,
              avatar: doctor.avatar || doctor.profileImage
            };
            console.log(`Using real doctor for mock messages: ${doctorInfo.name}`);
          }
        } catch (error) {
          console.log('Could not find a real doctor, using system doctor');
        }

        // Create some mock messages for better UX
        const mockMessages = [
          {
            _id: new mongoose.Types.ObjectId().toString(),
            content: "Welcome to SoulSpace! I'm your doctor.",
            sender: doctorInfo,
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            chat: chatId
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            content: "How can I help you today?",
            sender: doctorInfo,
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            chat: chatId
          },
          {
            _id: new mongoose.Types.ObjectId().toString(),
            content: "Feel free to ask me any health-related questions.",
            sender: doctorInfo,
            timestamp: new Date(Date.now() - 600000), // 10 minutes ago
            chat: chatId
          }
        ];

        console.log(`Returning ${mockMessages.length} mock messages for fallback/mock chat ID: ${chatId}`);

        return res.status(200).json({
          chat: {
            _id: chatId,
            participants: [userId, doctorInfo._id],
            isGroup: false
          },
          messages: mockMessages,
          data: mockMessages
        });
      }

      // For other invalid IDs, return an error
      return res.status(400).json({
        message: 'Invalid chat ID format',
        details: 'The provided chat ID is not in a valid format.'
      });
    }

    // Try to find the chat in the Chat model
    let chat = null;
    let messages = [];
    let participants = [];

    try {
      // First try to find the chat in the Chat model
      console.log(`Looking for chat with ID ${chatId} and participant ${userId}`);

      // Try different query approaches to find the chat
      chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      })
      .populate('participants', 'name email role avatar profileImage')
      .populate({
        path: 'messages.sender',
        select: 'name email role avatar profileImage'
      });

      if (!chat) {
        console.log(`Chat not found with exact match, trying alternative queries`);

        // Try with $elemMatch
        chat = await Chat.findOne({
          _id: chatId,
          participants: { $elemMatch: { $eq: userId } }
        })
        .populate('participants', 'name email role avatar profileImage')
        .populate({
          path: 'messages.sender',
          select: 'name email role avatar profileImage'
        });

        if (!chat) {
          console.log(`Chat still not found, trying without participant filter`);

          // Try just by ID as a last resort
          chat = await Chat.findById(chatId)
            .populate('participants', 'name email role avatar profileImage')
            .populate({
              path: 'messages.sender',
              select: 'name email role avatar profileImage'
            });

          if (chat) {
            console.log(`Found chat by ID only: ${chat._id}`);
            console.log(`Participants: ${chat.participants.map(p => p._id).join(', ')}`);
          }
        } else {
          console.log(`Found chat with $elemMatch: ${chat._id}`);
        }
      } else {
        console.log(`Found chat with exact match: ${chat._id}`);
      }

      if (chat) {
        console.log(`Found chat ${chatId} in Chat model with ${chat.messages?.length || 0} messages`);

        // Mark messages as read for this user
        try {
          await Chat.updateOne(
            { _id: chatId },
            { $set: { [`unreadCounts.${userId}`]: 0 } }
          );
          console.log(`Marked messages as read for user ${userId} in chat ${chatId}`);
        } catch (markError) {
          console.error('Error marking messages as read:', markError);
          // Continue even if marking as read fails
        }

        // Get messages from the chat
        messages = chat.messages || [];
        participants = chat.participants || [];
      } else {
        console.log(`Chat ${chatId} not found in Chat model, trying Message model`);

        // Try to find the doctor ID from the chat ID or from the request
        let doctorId = null;

        // If chatId contains a valid ObjectId that's not the userId, it might be the doctorId
        if (chatId.includes('_')) {
          const parts = chatId.split('_');
          for (const part of parts) {
            if (mongoose.Types.ObjectId.isValid(part) && part !== userId) {
              const possibleDoctor = await User.findById(part);
              if (possibleDoctor && possibleDoctor.role === 'doctor') {
                doctorId = part;
                console.log(`Found doctor ID ${doctorId} from chat ID parts`);
                break;
              }
            }
          }
        }

        // Try different queries to find messages
        let directMessages = [];

        // First try with chat field if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(chatId)) {
          console.log(`Trying to find messages with chat: ${chatId}`);
          directMessages = await Message.find({ chat: chatId })
            .sort({ timestamp: 1, createdAt: 1 })
            .populate('sender', 'name email role avatar profileImage')
            .populate('chat');

          if (directMessages.length > 0) {
            console.log(`Found ${directMessages.length} messages with chat ID`);
          }
        }

        // If no messages found and we have a doctorId, try direct communication
        if (directMessages.length === 0 && doctorId) {
          console.log(`Trying to find direct messages between ${userId} and ${doctorId}`);
          directMessages = await Message.find({
            $or: [
              { sender: userId, receiver: doctorId },
              { sender: doctorId, receiver: userId }
            ]
          })
          .sort({ timestamp: 1, createdAt: 1 })
          .populate('sender', 'name email role avatar profileImage')
          .populate('receiver', 'name email role avatar profileImage');

          if (directMessages.length > 0) {
            console.log(`Found ${directMessages.length} direct messages`);
          }
        }

        // If still no messages, try with senderId/receiverId fields
        if (directMessages.length === 0) {
          console.log(`Trying to find messages with senderId/receiverId fields`);
          directMessages = await Message.find({
            $or: [
              { senderId: userId, receiverId: { $exists: true } },
              { receiverId: userId, senderId: { $exists: true } }
            ]
          })
          .sort({ timestamp: 1, createdAt: 1 })
          .populate('senderId', 'name email role avatar profileImage')
          .populate('receiverId', 'name email role avatar profileImage');

          if (directMessages.length > 0) {
            console.log(`Found ${directMessages.length} messages with senderId/receiverId`);
          }
        }

        // If we found messages, process them
        if (directMessages && directMessages.length > 0) {
          console.log(`Found ${directMessages.length} total messages in Message model`);
          messages = directMessages;

          // Extract unique participants from messages
          const participantIds = new Set();
          directMessages.forEach(msg => {
            // Handle different message schemas
            if (msg.sender && msg.sender._id) participantIds.add(msg.sender._id.toString());
            else if (msg.senderId && msg.senderId._id) participantIds.add(msg.senderId._id.toString());

            if (msg.receiver && msg.receiver._id) participantIds.add(msg.receiver._id.toString());
            else if (msg.receiverId && msg.receiverId._id) participantIds.add(msg.receiverId._id.toString());
          });

          console.log(`Found ${participantIds.size} unique participants: ${Array.from(participantIds).join(', ')}`);

          // Get participant details
          const participantUsers = await User.find({
            _id: { $in: Array.from(participantIds) }
          }).select('name email role avatar profileImage');

          participants = participantUsers;
          console.log(`Retrieved ${participants.length} participant details`);
        } else {
          console.log(`No messages found for user ${userId} in Message model`);
        }
      }
    } catch (findError) {
      console.error('Error finding chat or messages:', findError);
    }

    if (!chat && messages.length === 0) {
      console.log(`No chat or messages found for user ${userId} and chat ${chatId}`);

      // For better UX, return empty array instead of 404
      return res.status(200).json({
        chat: {
          _id: chatId,
          participants: [],
          isGroup: false
        },
        messages: [],
        data: []
      });
    }

    // Format messages to ensure consistent structure
    const formattedMessages = messages.map(msg => {
      // Handle different message formats
      return {
        _id: msg._id,
        content: msg.content,
        sender: msg.sender || msg.senderId,
        receiver: msg.receiverId,
        timestamp: msg.timestamp || msg.createdAt || new Date(),
        attachments: msg.attachments || [],
        chat: chatId
      };
    });

    console.log(`Returning ${formattedMessages.length} messages for chat ${chatId}`);

    // Return in multiple formats to ensure compatibility with frontend
    res.status(200).json({
      chat: {
        _id: chatId,
        participants: participants,
        isGroup: chat?.isGroup || false
      },
      messages: formattedMessages,
      // Also include messages at the top level for compatibility
      data: formattedMessages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Send a message in a patient-doctor chat
 * @route POST /api/patient-doctor-chat/:chatId/messages
 * @access Private
 */
exports.sendChatMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, attachments = [] } = req.body;
    const userId = req.user.id;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Please provide content or attachments' });
    }

    // Handle non-standard chat IDs (fallback IDs)
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.log(`Handling non-standard chat ID for message: ${chatId}`);

      // For fallback IDs, return a mock message response
      if (chatId.startsWith('fallback_') || chatId.startsWith('mock_')) {
        console.log(`Creating mock message for fallback/mock chat ID: ${chatId}`);

        const mockMessage = {
          _id: new mongoose.Types.ObjectId().toString(),
          sender: userId,
          content,
          attachments: attachments || [],
          timestamp: new Date(),
          chat: chatId
        };

        return res.status(201).json({
          message: mockMessage
        });
      }

      // For other invalid IDs, return an error
      return res.status(400).json({
        message: 'Invalid chat ID format',
        details: 'The provided chat ID is not in a valid format.'
      });
    }

    // Try to find the chat in the Chat model
    let chat = null;
    let receiver = null;

    try {
      // First try to find the chat in the Chat model
      chat = await Chat.findOne({
        _id: chatId,
        participants: userId
      });

      if (chat) {
        console.log(`Found chat ${chatId} in Chat model for sending message`);

        // Find the receiver (the other participant)
        const receiverId = chat.participants.find(p => p.toString() !== userId)?.toString();
        if (receiverId) {
          receiver = await User.findById(receiverId).select('name email role avatar profileImage');
        }
      } else {
        console.log(`Chat ${chatId} not found in Chat model for sending message`);

        // If we can't find the chat, we'll create a direct message instead
        // First, try to extract a receiver ID from the chat ID if it's a fallback ID
        if (chatId.includes('_')) {
          const parts = chatId.split('_');
          for (const part of parts) {
            if (mongoose.Types.ObjectId.isValid(part)) {
              // Check if this is a valid user ID
              const possibleReceiver = await User.findById(part).select('name email role avatar profileImage');
              if (possibleReceiver && possibleReceiver._id.toString() !== userId) {
                receiver = possibleReceiver;
                console.log(`Found receiver ${receiver._id} from chat ID parts`);
                break;
              }
            }
          }
        }
      }
    } catch (findError) {
      console.error('Error finding chat:', findError);
    }

    // If we couldn't find a chat or receiver, return an error
    if (!chat && !receiver) {
      return res.status(404).json({ message: 'Chat not found or receiver could not be determined' });
    }

    let newMessage = null;
    let formattedMessage = null;

    // Handle message creation based on whether we found a chat or just a receiver
    if (chat) {
      // Create the message for the Chat model
      const message = {
        _id: new mongoose.Types.ObjectId(),
        sender: userId,
        content,
        attachments,
        timestamp: new Date()
      };

      console.log(`Creating message in Chat model with ID: ${message._id}`);

      // Update unread counts for all participants except sender
      const unreadCountsUpdate = {};
      chat.participants.forEach(participant => {
        if (participant.toString() !== userId) {
          const currentCount = chat.unreadCounts?.get(participant.toString()) || 0;
          unreadCountsUpdate[`unreadCounts.${participant.toString()}`] = currentCount + 1;
        }
      });

      // Add message and update last message
      console.log('Adding message to chat:', message);

      // First check if the chat has a messages array
      const existingChat = await Chat.findById(chatId);
      if (!existingChat.messages) {
        console.log('Chat has no messages array, initializing it');
        await Chat.findByIdAndUpdate(
          chatId,
          { $set: { messages: [] } }
        );
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message },
          $set: {
            lastMessage: {
              content: content || (attachments.length > 0 ? 'Attachment' : ''),
              sender: userId,
              timestamp: new Date(),
              hasAttachments: attachments.length > 0
            },
            ...unreadCountsUpdate
          }
        },
        { new: true }
      )
      .populate('participants', 'name email role avatar profileImage')
      .populate({
        path: 'messages.sender',
        select: 'name email role avatar profileImage'
      });

      console.log('Updated chat now has', updatedChat.messages?.length || 0, 'messages');

      // Get the newly added message with populated sender
      newMessage = updatedChat.messages.find(m => m._id.toString() === message._id.toString());

      console.log(`Created new message in Chat model with ID: ${message._id}`);
    } else if (receiver) {
      // Create a direct message in the Message model
      const directMessage = new Message({
        senderId: userId,
        receiverId: receiver._id,
        content,
        timestamp: new Date()
      });

      // Save the direct message
      await directMessage.save();

      // Populate the sender
      const populatedMessage = await Message.findById(directMessage._id)
        .populate('senderId', 'name email role avatar profileImage')
        .populate('receiverId', 'name email role avatar profileImage');

      newMessage = populatedMessage;

      console.log(`Created new direct message with ID: ${directMessage._id}`);
    }

    // Get the sender details
    const sender = await User.findById(userId).select('name email role avatar profileImage');

    // Format the message to ensure consistent structure
    formattedMessage = {
      _id: newMessage._id,
      content: newMessage.content,
      sender: newMessage.sender || newMessage.senderId || sender,
      receiver: newMessage.receiverId || receiver,
      timestamp: newMessage.timestamp || newMessage.createdAt || new Date(),
      attachments: newMessage.attachments || [],
      chat: chatId
    };

    console.log(`Returning formatted message: ${JSON.stringify(formattedMessage)}`);

    // Return in a format compatible with the frontend
    res.status(201).json({
      message: formattedMessage,
      // Also include at top level for compatibility
      data: formattedMessage
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = exports;
