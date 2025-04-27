const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const message = new Message({ senderId: req.user.id, receiverId, content });
    await message.save();
    res.status(201).json({ message });
};

exports.getMessages = async (req, res) => {
    const messages = await Message.find({ receiverId: req.user.id }).populate('senderId');
    res.json(messages);
}; 