const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Groq SDK
const Groq = require("groq-sdk");
const Message = require("./models/Message");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Groq
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/aichat";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Helper: load messages from database
async function loadMessages() {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).lean();
    return messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
    }));
  } catch (err) {
    console.error("Error loading messages:", err);
    return [];
  }
}

// Helper: save message to database
async function saveMessage(message) {
  try {
    await Message.create(message);
  } catch (err) {
    console.error("Error saving message:", err);
  }
}

// ✅ GET /api/history – send full chat history
app.get("/api/history", async (req, res) => {
  const messages = await loadMessages();
  res.json({ messages });
});

// 💬 POST /api/chat – handle new user message + Gemini reply
app.post("/api/chat", async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    const userMessage = {
      id: Date.now() + "-user",
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    await saveMessage(userMessage);

    // Load all messages for context
    let messages = await loadMessages();

    // Build conversation history for Groq
    const conversationHistory = messages
      .slice(-6) // last few messages
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    // Add system message and current user message
    const chatMessages = [
      {
        role: "system",
        content: "You are a helpful AI assistant inside an internship assignment chat app. Reply in a friendly and concise way.",
      },
      ...conversationHistory,
    ];

    const completion = await groq.chat.completions.create({
      messages: chatMessages,
      model: "llama-3.3-70b-versatile", // fast and free
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiText = completion.choices[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    const aiMessage = {
      id: Date.now() + "-ai",
      sender: "ai",
      text: aiText,
      timestamp: new Date().toISOString(),
    };
    await saveMessage(aiMessage);

    // Reload messages to get updated list
    messages = await loadMessages();

    res.json({
      messages,
      reply: aiMessage,
    });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
