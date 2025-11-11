import { useState, useEffect, useRef } from "react";

// Backend API URL - adjust if your backend runs on a different port
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch bot response from backend API
  const getBotResponse = async (userMessage) => {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error("Error fetching bot response:", error);
      throw error;
    }
  };

  // Auto-scroll to bottom when messages or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = input.trim();

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setError(null);
    setIsTyping(true);

    try {
      // Fetch bot response from backend
      const botReply = await getBotResponse(userMessage);

      const botResponse = {
        id: Date.now() + 1,
        text: botReply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      setError("Failed to get response. Please try again.");
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please check if the backend is running.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/chatbot.jpg"
            alt="Chat Bot Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h1 className="text-2xl font-semibold text-gray-800">Sabawi Tech</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">Start a conversation...</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <img
                    src="/chatbotlogo.png"
                    alt="Bot"
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm"
                      : "bg-gray-50 text-gray-800 border border-gray-200 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <img
                  src="/chatbotlogo.png"
                  alt="Bot"
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0">
        {error && <div className="mb-2 text-xs text-red-500">{error}</div>}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isTyping && handleSend()}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isTyping}
            className="px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;
