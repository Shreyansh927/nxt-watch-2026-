import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { TbMessageChatbot } from "react-icons/tb";
import "./index.css";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/command`,
        { command: input },
        { withCredentials: true },
      );
      const responses = Array.isArray(res.data.response)
        ? res.data.response
        : [res.data.response];
      const aiMessages = responses.map((text) => ({ type: "ai", text }));
      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (err) {
      const errorMessage = {
        type: "ai",
        text:
          err.response?.data?.error ||
          "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        type: "ai",
        text: "Hello! I'm your AI assistant. How can I help you today?",
      },
    ]);
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`ai-assistant-popup ${isOpen ? "open" : ""}`}>
        <div className="ai-assistant-header">
          <h2>AI Command Assistant</h2>
          <div className="header-buttons">
            <button className="clear-chat-btn" onClick={clearChat}>
              Clear
            </button>
            <button className="close-btn" onClick={togglePopup}>
              ×
            </button>
          </div>
        </div>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-content">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="message-content typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your command..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
      <button className="ai-toggle-btn" onClick={togglePopup}>
        <TbMessageChatbot className="ai-icon" />
      </button>
    </>
  );
};

export default AiAssistant;
