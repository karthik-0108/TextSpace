// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// --- CORS ---
app.use(cors());
app.use(express.json());

// --- SOCKET.IO ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User registered:", userId);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    const senderSocket = onlineUsers.get(senderId);
    if (senderSocket) io.to(senderSocket).emit("message", msg);

    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) io.to(receiverSocket).emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// --- API ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () =>
      console.log(`Server running with socket.io on port ${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection error:", err));
