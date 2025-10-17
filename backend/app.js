import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http"; // ⬅ new
import { Server } from "socket.io"; // ⬅ new
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (allow cookies from frontend)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5178",
  "http://localhost:3000",
  "https://socia-back.onrender.com", // Your deployed backend
  "https://socia-zeta.vercel.app", // Your Vercel frontend URL
  process.env.FRONTEND_URL, // Add your deployed frontend URL here
  // Add any other domains you need
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV === "development"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Cookie parser
app.use(cookieParser());

// Serve your frontend build files (React/Vue/Angular/etc) at root URL
// app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve uploaded images statically at /images URL prefix with CORS headers
app.use(
  "/images",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  },
  express.static(path.join(process.cwd(), "public/images"))
);
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
  try {
    const User = (await import("./models/userModel.js")).default;
    const userCount = await User.countDocuments();
    const sampleUsers = await User.find().limit(3).select("email username");

    // Get database info
    const dbName = mongoose.connection.db.databaseName;
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();

    res.json({
      status: "connected",
      currentDatabase: dbName,
      userCount,
      sampleUsers,
      collections: collections.map((c) => c.name),
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message,
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set",
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/music", musicRoutes);

// start server with socket.io
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io instance available to routes
app.set("io", io);

// SOCKET.IO LOGIC
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  // Join a personal room (userId)
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.userId = userData._id; // Store user ID on socket
    console.log("✅ User joined room:", userData._id);
    socket.emit("connected");
  });

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log("✅ User joined chat:", chatId);
  });

  // Send message
  socket.on("send_message", (newMessage) => {
    console.log("📤 Message sent:", newMessage);
    const chat = newMessage.chat;

    if (!chat?.participants) {
      console.log("❌ No participants found in chat");
      return;
    }

    // Emit to all participants except sender
    chat.participants.forEach((user) => {
      if (user._id.toString() !== newMessage.sender._id.toString()) {
        console.log("📨 Sending message to user:", user._id);
        // Send to both user room and chat room
        socket.to(user._id).emit("message_received", newMessage);
        socket.to(chat._id).emit("message_received", newMessage);
      }
    });
  });

  // Typing indicators
  socket.on("typing", (chatId) => {
    console.log("⌨️ User typing in chat:", chatId);
    socket.to(chatId).emit("typing", chatId);
  });

  socket.on("stop_typing", (chatId) => {
    console.log("⌨️ User stopped typing in chat:", chatId);
    socket.to(chatId).emit("stop_typing", chatId);
  });

  // Call events
  socket.on("initiate_call", (callData) => {
    console.log("📞 Call initiated:", callData);
    const { chatId, callType, caller, recipient } = callData;

    // Send call notification to recipient
    socket.to(recipient._id).emit("incoming_call", {
      chatId,
      callType,
      caller,
      callId: socket.id + Date.now(),
    });
  });

  socket.on("accept_call", (callData) => {
    console.log("✅ Call accepted:", callData);
    const { callId, chatId, accepter } = callData;

    // Notify caller that call was accepted
    socket.to(chatId).emit("call_accepted", {
      callId,
      accepter,
    });

    // Also notify the chat room for history
    io.to(chatId).emit("call_status_update", {
      status: "accepted",
      chatId: chatId,
      callType: callData.callType,
    });
  });

  socket.on("reject_call", (callData) => {
    console.log("❌ Call rejected:", callData);
    const { callId, chatId, rejector } = callData;

    // Notify caller that call was rejected
    socket.to(chatId).emit("call_rejected", {
      callId,
      rejector,
    });

    // Also notify the chat room for history
    io.to(chatId).emit("call_status_update", {
      status: "rejected",
      chatId: chatId,
      callType: callData.callType,
    });
  });

  socket.on("end_call", (callData) => {
    console.log("📞 Call ended:", callData);
    const { chatId, user } = callData;

    // Notify other participants that call ended
    socket.to(chatId).emit("call_ended", {
      endedBy: user,
    });
  });

  socket.on("call_connected", (callData) => {
    console.log("🔗 Call connected:", callData);
    const { chatId, callType } = callData;

    // Notify all participants that call is now connected (for timer sync)
    io.to(chatId).emit("call_connected", {
      chatId,
      callType,
      status: "connected",
    });
  });

  // Add call history to chat
  socket.on("add_call_history", async (callData) => {
    console.log("📝 Adding call history:", callData);
    try {
      // Create a system message for call history
      const callMessage = {
        sender: socket.userId,
        content: `${
          callData.callType === "audio" ? "📞" : "📹"
        } Call (${Math.floor(callData.duration / 60)}:${(callData.duration % 60)
          .toString()
          .padStart(2, "0")})`,
        chat: callData.chatId,
        isSystemMessage: true,
        callInfo: {
          type: callData.callType,
          duration: callData.duration,
        },
      };

      // Broadcast to chat room
      io.to(callData.chatId).emit("message_received", callMessage);
    } catch (error) {
      console.error("Error adding call history:", error);
    }
  });

  // WebRTC signaling events
  socket.on("offer", (data) => {
    console.log("📡 WebRTC offer:", data.chatId);
    socket.to(data.chatId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📡 WebRTC answer:", data.chatId);
    socket.to(data.chatId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("📡 ICE candidate:", data.chatId);
    socket.to(data.chatId).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Default route
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
// });

// 404 fallback
// app.use((req, res) => {
//   res.status(404).sendFile(path.join(__dirname, '../frontend/dist/404.html'));
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.io running on port ${PORT}`);
});

export default app;
