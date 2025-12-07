import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Fetch history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError("");
        const res = await axios.get(`${API_BASE_URL}/api/history`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load chat history. Please check backend.");
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");

    // Optimistic UI: show user message immediately
    const tempId = Date.now() + "-temp";
    const newUserMessage = {
      id: tempId,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { text: trimmed });
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
      // rollback optimistic message if needed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app-root">
      <div className="gradient-bg"></div>

      <div className="card">
        <header className="card-header">
          <div className="logo-circle">AI</div>
          <div>
            <h1>AI Chat Bot</h1>
          </div>
        </header>

        <div className="status-bar">
          <div className="status-dot"></div>
          <span>Backend: {error ? "Disconnected" : "Connected"}</span>
        </div>

        <main className="chat-area">
          {messages.length === 0 && !loading && (
            <div className="empty-state">
              <h2>Start the conversation 🚀</h2>
              <p>
                Ask anything about coding, AI, or this assignment. 
                Your chat history will stay even if you refresh.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${
                msg.sender === "user" ? "align-right" : "align-left"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="avatar ai-avatar">🤖</div>
              )}
              <div className="message-bubble-wrapper">
                <div
                  className={`message-bubble ${
                    msg.sender === "user" ? "user-bubble" : "ai-bubble"
                  }`}
                >
                  <div className="bubble-text">{msg.text}</div>
                </div>
                <div className="message-meta">
                  <span>{msg.sender === "user" ? "You" : "AI"}</span>
                  <span>· {formatTime(msg.timestamp)}</span>
                </div>
              </div>
              {msg.sender === "user" && (
                <div className="avatar user-avatar">🧑</div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message-row align-left">
              <div className="avatar ai-avatar">🤖</div>
              <div className="message-bubble-wrapper">
                <div className="message-bubble ai-bubble typing-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
                <div className="message-meta">
                  <span>AI</span>
                  <span>· typing...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </main>

        {error && <div className="error-bar">{error}</div>}

        <footer className="input-section">
          <div className="input-wrapper">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message and press Enter..."
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
          <div className="helper-text">
            Press <span>Enter</span> to send · <span>Shift + Enter</span> for new line
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
