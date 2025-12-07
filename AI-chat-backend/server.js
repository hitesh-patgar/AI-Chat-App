const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// Groq SDK
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const MESSAGES_FILE = path.join(__dirname, "messages.json");

// Initialize Groq
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Helper: load messages from file
async function loadMessages() {
  try {
    const data = await fs.readFile(MESSAGES_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading messages file:", err);
    return [];
  }
}

// Helper: save messages to file
async function saveMessages(messages) {
  try {
    await fs.writeFile(
      MESSAGES_FILE,
      JSON.stringify(messages, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Error writing messages file:", err);
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
    let messages = await loadMessages();

    const userMessage = {
      id: Date.now() + "-user",
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    messages.push(userMessage);

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
      {
        role: "user",
        content: text.trim(),
      },
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
    messages.push(aiMessage);

    await saveMessages(messages);

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
