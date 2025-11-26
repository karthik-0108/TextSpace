const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const router = express.Router();
router.post("/:receiverId", auth, sendMessage);
router.get("/:userId", auth, getMessages);

// POST /api/messages/:receiverId
router.post("/:receiverId", auth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Text is required" });

  const msg = await Message.create({
    sender: req.user._id,
    receiver: req.params.receiverId,
    text,
  });

  res.status(201).json(msg);
});

// GET /api/messages/:userId (conversation between me & userId)
router.get("/:userId", auth, async (req, res) => {
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
});

module.exports = router;
