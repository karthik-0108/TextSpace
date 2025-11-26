// backend/controllers/messageController.js
const Message = require("../models/Message");


// @desc Send a message (HTTP fallback)
exports.sendMessage = async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ message: "Text required" });

  const msg = await Message.create({
    sender: req.user._id,
    receiver: req.params.receiverId,
    text,
  });

  res.status(201).json(msg);
};


// @desc Get conversation between two users
exports.getMessages = async (req, res) => {
  const otherId = req.params.userId;

  const msgs = await Message.find({
    $or: [
      { sender: req.user._id, receiver: otherId },
      { sender: otherId, receiver: req.user._id },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "username")
    .populate("receiver", "username");

  res.json(msgs);
};
