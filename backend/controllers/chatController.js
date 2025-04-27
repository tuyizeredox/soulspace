const Chat = require('../models/Chat');
const User = require('../models/User');
const mongoose = require('mongoose');

// Debug imports
console.log('Chat model:', Chat);
console.log('User model:', User);

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting chats for user ID:', userId);

    // Find all chats where the user is a participant
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: userId } }
    })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage.sender', 'name')
      .populate('groupAdmin', 'name email')
      .sort({ 'lastMessage.timestamp': -1 });

    console.log('Found chats:', chats.length);

    // Debug the first chat if available
    if (chats.length > 0) {
      console.log('First chat participants:', chats[0].participants.map(p => ({
        _id: p._id,
        name: p.name,
        role: p.role
      })));
    }

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create or access a one-on-one chat
exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'UserId parameter not sent with request' });
    }

    console.log('Creating chat between users:', req.user.id, 'and', userId);

    // Check if chat exists between these two users
    let chat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [req.user.id, userId],
        $size: 2
      }
    })
      .populate('participants', 'name email role avatar')
      .populate('lastMessage.sender', 'name');

    // If chat exists, return it
    if (chat) {
      return res.status(200).json(chat);
    }

    // If chat doesn't exist, create a new one
    const chatData = {
      participants: [req.user.id, userId],
      isGroup: false,
      messages: [],
      unreadCounts: new Map([[req.user.id.toString(), 0], [userId.toString(), 0]])
    };

    const newChat = await Chat.create(chatData);

    // Populate the new chat with user details
    const fullChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email role avatar');

    res.status(201).json(fullChat);
  } catch (error) {
    console.error('Error accessing chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participants } = req.body;

    if (!name || !participants || !participants.length) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Add current user to participants if not already included
    let users = JSON.parse(participants);
    if (!users.includes(req.user.id)) {
      users.push(req.user.id);
    }

    // Create the group chat
    const groupChat = await Chat.create({
      groupName: name,
      participants: users,
      isGroup: true,
      groupAdmin: req.user.id,
      messages: [],
      unreadCounts: new Map(users.map(userId => [userId.toString(), 0]))
    });

    // Fetch the complete group chat with populated user details
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', 'name email role avatar')
      .populate('groupAdmin', 'name email');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error('Error creating group chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Rename a group chat
exports.renameGroupChat = async (req, res) => {
  try {
    const { chatId, name } = req.body;

    if (!chatId || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find and update the chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupName: name },
      { new: true }
    )
      .populate('participants', 'name email role avatar')
      .populate('groupAdmin', 'name email');

    if (!updatedChat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Error renaming group chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add user to a group chat
exports.addToGroupChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find the chat and check if the requester is the admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.groupAdmin.toString() !== req.user.id.toString() && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only group admin can add members' });
    }

    // Add user to the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $addToSet: { participants: userId },
        $set: { [`unreadCounts.${userId}`]: 0 }
      },
      { new: true }
    )
      .populate('participants', 'name email role avatar')
      .populate('groupAdmin', 'name email');

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Error adding user to group chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove user from a group chat
exports.removeFromGroupChat = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find the chat and check if the requester is the admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Allow removal if requester is admin or the user is removing themselves
    if (chat.groupAdmin.toString() !== req.user.id.toString() && req.user.id.toString() !== userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only group admin can remove members' });
    }

    // Remove user from the group
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { participants: userId },
        $unset: { [`unreadCounts.${userId}`]: "" }
      },
      { new: true }
    )
      .populate('participants', 'name email role avatar')
      .populate('groupAdmin', 'name email');

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Error removing user from group chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, attachments = [] } = req.body;

    if (!chatId || (!content && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ message: 'Please provide content or attachments' });
    }

    // Create the message
    const message = {
      sender: req.user.id,
      content,
      attachments,
      timestamp: new Date()
    };

    // Find the chat and add the message
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user.id.toString())) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    // Update unread counts for all participants except sender
    const unreadCountsUpdate = {};
    chat.participants.forEach(participant => {
      if (participant.toString() !== req.user.id.toString()) {
        const currentCount = chat.unreadCounts.get(participant.toString()) || 0;
        unreadCountsUpdate[`unreadCounts.${participant.toString()}`] = currentCount + 1;
      }
    });

    // Add message and update last message
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { messages: message },
        $set: {
          lastMessage: {
            content: content || (attachments.length > 0 ? 'Attachment' : ''),
            sender: req.user.id,
            timestamp: new Date(),
            hasAttachments: attachments.length > 0
          },
          ...unreadCountsUpdate
        }
      },
      { new: true }
    )
      .populate('participants', 'name email role avatar')
      .populate({
        path: 'messages.sender',
        select: 'name email role avatar'
      })
      .populate('lastMessage.sender', 'name email');

    // Get the newly added message
    const newMessage = updatedChat.messages[updatedChat.messages.length - 1];

    res.status(201).json({
      message: newMessage,
      chat: updatedChat
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Find the chat and check if user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.some(p => p.toString() === req.user.id.toString()) && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    // Reset unread count for the user
    await Chat.findByIdAndUpdate(
      chatId,
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } }
    );

    // Get the chat with populated messages
    const fullChat = await Chat.findById(chatId)
      .populate('participants', 'name email role avatar')
      .populate({
        path: 'messages.sender',
        select: 'name email role avatar'
      })
      .populate('groupAdmin', 'name email');

    res.status(200).json(fullChat);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get hospital admins for super admin or hospital admin
exports.getHospitalAdmins = async (req, res) => {
  try {
    // Check if user is super admin or hospital admin
    if (req.user.role !== 'super_admin' && req.user.role !== 'hospital_admin') {
      return res.status(403).json({ message: 'Access denied. Only super admins or hospital admins can access this resource.' });
    }

    let hospitalAdmins = [];

    if (req.user.role === 'super_admin') {
      // Super admin gets all hospital admins
      hospitalAdmins = await User.find({ role: 'hospital_admin' })
        .select('_id name email role avatar hospitalId phone')
        .lean();
    } else {
      // Hospital admin gets admins from their own hospital
      const Hospital = mongoose.model('Hospital');
      let hospital;

      // If the user has a hospitalId, use it directly
      if (req.user.hospitalId) {
        hospital = await Hospital.findById(req.user.hospitalId)
          .select('_id name city state adminId admins')
          .lean();
      }

      // If no hospitalId or no hospital found, try to find the hospital where this admin is listed
      if (!hospital) {
        console.log(`No hospitalId found for admin ${req.user.id}, searching for hospital...`);

        hospital = await Hospital.findOne({
          $or: [
            { adminId: req.user.id },
            { admins: req.user.id }
          ]
        })
        .select('_id name city state adminId admins')
        .lean();

        if (hospital) {
          console.log(`Found hospital ${hospital.name} for admin ${req.user.id}`);
        }
      }

      if (!hospital) {
        return res.status(404).json({ message: 'Could not find hospital for this admin. Please contact support.' });
      }

      // Get all admin IDs from this hospital (primary + additional)
      const adminIds = [];
      if (hospital.adminId) {
        adminIds.push(hospital.adminId);
      }
      if (hospital.admins && hospital.admins.length > 0) {
        hospital.admins.forEach(adminId => {
          if (!adminIds.includes(adminId.toString())) {
            adminIds.push(adminId);
          }
        });
      }

      // Fetch all these admins
      hospitalAdmins = await User.find({
        _id: { $in: adminIds },
        role: 'hospital_admin'
      })
      .select('_id name email role avatar hospitalId phone')
      .lean();
    }

    console.log('Found hospital admins:', hospitalAdmins.length);

    // Get all hospitals
    const Hospital = mongoose.model('Hospital');
    const hospitals = await Hospital.find()
      .select('_id name city state adminId admins')
      .lean();

    console.log('Found hospitals:', hospitals.length);

    // Create a map of admin IDs to their primary status and hospital info
    const adminInfoMap = new Map();

    // First, process hospitals to identify primary admins
    for (const hospital of hospitals) {
      // Set primary admin
      if (hospital.adminId) {
        const adminId = hospital.adminId.toString();
        adminInfoMap.set(adminId, {
          isPrimaryAdmin: true,
          hospital: {
            _id: hospital._id,
            name: hospital.name,
            city: hospital.city,
            state: hospital.state
          }
        });
      }

      // Process all admins (including secondary)
      if (hospital.admins && hospital.admins.length > 0) {
        for (const adminId of hospital.admins) {
          const adminIdStr = adminId.toString();
          // Only set if not already set as primary
          if (!adminInfoMap.has(adminIdStr)) {
            adminInfoMap.set(adminIdStr, {
              isPrimaryAdmin: false,
              hospital: {
                _id: hospital._id,
                name: hospital.name,
                city: hospital.city,
                state: hospital.state
              }
            });
          }
        }
      }
    }

    // For any admins not found in hospital.admins, try to find their hospital by hospitalId
    for (const admin of hospitalAdmins) {
      const adminId = admin._id.toString();

      if (!adminInfoMap.has(adminId) && admin.hospitalId) {
        // Find the hospital by ID
        const hospitalId = admin.hospitalId.toString();
        const hospital = hospitals.find(h => h._id.toString() === hospitalId);

        if (hospital) {
          // Check if this admin is the primary admin
          const isPrimaryAdmin = hospital.adminId &&
                                hospital.adminId.toString() === adminId;

          adminInfoMap.set(adminId, {
            isPrimaryAdmin,
            hospital: {
              _id: hospital._id,
              name: hospital.name,
              city: hospital.city,
              state: hospital.state
            }
          });
        }
      }
    }

    // If we still have admins without hospital info, try to find hospitals where they are listed as admins
    for (const admin of hospitalAdmins) {
      const adminId = admin._id.toString();

      if (!adminInfoMap.has(adminId)) {
        // Find any hospital that has this admin in its admins array
        const hospital = hospitals.find(h =>
          h.admins && h.admins.some(a => a.toString() === adminId)
        );

        if (hospital) {
          // Check if this admin is the primary admin
          const isPrimaryAdmin = hospital.adminId &&
                                hospital.adminId.toString() === adminId;

          adminInfoMap.set(adminId, {
            isPrimaryAdmin,
            hospital: {
              _id: hospital._id,
              name: hospital.name,
              city: hospital.city,
              state: hospital.state
            }
          });
        }
      }
    }

    // As a last resort, directly query the Hospital model for each admin
    const adminsWithoutInfo = hospitalAdmins.filter(admin =>
      !adminInfoMap.has(admin._id.toString())
    );

    console.log('Admins without hospital info after initial processing:',
      adminsWithoutInfo.map(a => a.name));

    // For each admin without info, directly query the Hospital model
    for (const admin of adminsWithoutInfo) {
      const adminId = admin._id.toString();

      // Try to find a hospital where this admin is either the primary admin or in the admins array
      const hospital = await Hospital.findOne({
        $or: [
          { adminId: admin._id },
          { admins: admin._id }
        ]
      }).select('_id name city state adminId').lean();

      if (hospital) {
        const isPrimaryAdmin = hospital.adminId &&
                              hospital.adminId.toString() === adminId;

        adminInfoMap.set(adminId, {
          isPrimaryAdmin,
          hospital: {
            _id: hospital._id,
            name: hospital.name,
            city: hospital.city,
            state: hospital.state
          }
        });
      }
    }

    // Combine admin data with hospital info
    const adminsWithHospitalInfo = hospitalAdmins.map(admin => {
      const adminId = admin._id.toString();
      const info = adminInfoMap.get(adminId) || { isPrimaryAdmin: false, hospital: null };

      return {
        ...admin,
        isPrimaryAdmin: info.isPrimaryAdmin,
        hospital: info.hospital
      };
    });

    // Log admins still missing hospital info
    const missingHospitalInfo = adminsWithHospitalInfo
      .filter(admin => !admin.hospital)
      .map(admin => admin.name);

    console.log('Admins still missing hospital info:', missingHospitalInfo);

    // Return the enhanced admin objects
    res.status(200).json(adminsWithHospitalInfo);
  } catch (error) {
    console.error('Error fetching hospital admins:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a super admin group with all hospital admins
exports.createSuperAdminGroup = async (req, res) => {
  try {
    // Check if user is super admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Only super admins can access this resource.' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Please provide a group name' });
    }

    // Get all hospital admin IDs
    const hospitalAdmins = await User.find({ role: 'hospital_admin' }).select('_id');
    const adminIds = hospitalAdmins.map(admin => admin._id);

    // Add super admin to the list
    adminIds.push(req.user.id);

    // Check if a group with all these participants already exists
    const existingGroup = await Chat.findOne({
      isGroup: true,
      participants: { $all: adminIds, $size: adminIds.length }
    });

    if (existingGroup) {
      return res.status(200).json({
        message: 'Group already exists',
        chat: await Chat.findById(existingGroup._id)
          .populate('participants', 'name email role avatar')
          .populate('groupAdmin', 'name email')
      });
    }

    // Create unread counts map
    const unreadCounts = new Map();
    adminIds.forEach(id => {
      unreadCounts.set(id.toString(), 0);
    });

    // Create the group chat
    const groupChat = await Chat.create({
      groupName: name,
      participants: adminIds,
      isGroup: true,
      groupAdmin: req.user.id,
      messages: [],
      unreadCounts
    });

    // Fetch the complete group chat with populated user details
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', 'name email role avatar')
      .populate('groupAdmin', 'name email');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error('Error creating super admin group:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Find the chat and check if user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!chat.participants.some(p => p.toString() === req.user.id.toString()) && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    // Reset unread count for the user
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $set: { [`unreadCounts.${req.user.id}`]: 0 } },
      { new: true }
    );

    res.status(200).json({ success: true, unreadCounts: updatedChat.unreadCounts });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
