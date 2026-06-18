import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Send,
  Bot,
  User as UserIcon,
  Loader2,
  ExternalLink,
  MapPin,
  Leaf,
  Star,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { API_BASE_URL as CONFIG_API_URL } from "../config";

interface Message {
  id: string;
  text?: string;
  sender: "user" | "ai";
  timestamp: Date;
  farms?: Array<{
    _id: string;
    farmName: string;
    description: string;
    address: string;
    category: string;
    pricing: number;
    rating: number;
  }>;
}

export default function AIAssistant() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [token, setToken] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Farmify AI Assistant. I can help you find organic farms, give booking updates, or recommend fresh produce. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageText = message.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`${CONFIG_API_URL}/api/chatbot/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to process chat");

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: "ai",
        timestamp: new Date(),
        farms: data.farms,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I am having trouble connecting to my servers. Please try again in a few moments.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">AI Farm Assistant</h1>
            <p className="text-xs text-green-150">Online • Ready to assist</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="bg-green-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-md rounded-2xl p-4 shadow-sm ${
                msg.sender === "user" ? "bg-green-600 text-white" : "bg-white text-green-800"
              }`}
            >
              {msg.text && <p className="whitespace-pre-line text-sm leading-relaxed font-medium">{msg.text}</p>}
              
              {/* Dynamic recommended farms from chatbot */}
              {msg.farms && msg.farms.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Recommended Farms:</p>
                  {msg.farms.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => navigate(`/farm/${f._id}`)}
                      className="bg-green-50/50 hover:bg-green-50 p-3.5 rounded-xl border border-green-100 cursor-pointer transition-all flex flex-col gap-1 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-green-800 text-sm">{f.farmName}</h4>
                        <span className="text-xs font-extrabold text-green-600">₹{f.pricing}</span>
                      </div>
                      <p className="text-xs text-green-650 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {f.address}
                      </p>
                      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-green-100/30">
                        <span className="flex items-center gap-0.5 text-xs text-green-800 font-bold">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {f.rating || 5.0}
                        </span>
                        <Badge className="bg-green-600 text-white text-[9px] px-2 py-0.5">
                          {f.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[9px] opacity-65 mt-2.5 text-right font-semibold">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {msg.sender === "user" && (
              <div className="bg-green-800 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2 justify-start">
            <div className="bg-green-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 shadow">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white text-green-850 rounded-2xl p-4 shadow-sm flex items-center">
              <Loader2 className="w-4 h-4 text-green-600 animate-spin mr-2" />
              <span className="text-xs font-bold text-green-700">Formulating recommendations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 bg-green-50">
          <p className="text-xs text-green-750 font-bold mb-2">Quick suggestions:</p>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
            {[
              "Recommend dairy farms",
              "Suggest a vegetable farm",
              "What is the status of my booking?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleQuickSuggestion(suggestion)}
                className="bg-white hover:bg-green-50 text-green-700 px-4.5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border border-green-100 shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-green-100 px-4 py-3 flex gap-2 items-center"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask AI for recommendations or booking support..."
          className="rounded-full border-green-150 flex-1 focus:border-green-600 focus-visible:ring-1 focus-visible:ring-green-400 font-medium text-green-800"
          disabled={isTyping}
        />
        <Button
          type="submit"
          disabled={!message.trim() || isTyping}
          className="bg-green-600 hover:bg-green-700 rounded-full w-10 h-10 p-0 flex items-center justify-center shadow"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
