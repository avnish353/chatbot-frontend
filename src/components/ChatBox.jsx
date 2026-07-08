import React, { useState, useEffect, useRef } from "react";
import Message from "./Message";
import { streamMessageToBot } from "../services/api";
import AIlogo from "../static/images/aiLogo.png";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../services/auth.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function ChatBox({ chats, setChats, activeChatId, setActiveChatId }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [isListening, setIsListening] = useState(false);


  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const debounceRef = useRef(null);


// -------------------- Intents array-------------------------
  const quickIntents = [
  { label: "📦 Track my order", text: "Track my order" },
  { label: "💰 Request a refund", text: "I want a refund" },
  { label: "🔐 Reset password", text: "Reset my password" },
  { label: "💳 Billing issue", text: "Billing issue" },
  { label: "🚚 Shipping time", text: "How long does delivery take?" },
  { label: "🛠 App not working", text: "App is not working" },
];

const miniIntents = [
  { label: "📦 Track Order", text: "Track my order" },
  { label: "💰 Refund", text: "Refund" },
  { label: "🛠 Tech Help", text: "Technical support" },
  { label: "👤 Human Agent", text: "Speak to human" },
];

  // ---------------- AUTH ----------------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000 - Date.now();

      if (expiryTime <= 0) {
        handleLogout();
      } else {
        const timer = setTimeout(() => {
          handleLogout();
        }, expiryTime);

        return () => clearTimeout(timer);
      }
    } catch {
      handleLogout();
    }
  }, []);

  // 2️⃣ THEN FETCH CHAT HISTORY (THIS IS YOUR CODE)
useEffect(() => {
  const fetchHistory = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user?.id || !token) return;

    try {
      const res = await axios.get(
  `https://chatbot-backend-production-fe14.up.railway.app/api/chat/history/${user.id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      const merged = res.data.map((c) => ({
            id: c.id,
            title:
            c.title ||
            c.messages?.[0]?.text?.slice(0, 30) || "New Chat",

         messages: (c.messages || []).map((msg) => ({
           ...msg,
           time: msg.time || null,
             })),
          }));

      setChats(merged);

      // ✅ AUTO-SELECT FIRST CHAT
      if (merged.length > 0) {
        setActiveChatId(merged[0].id);
      }

    } catch (err) {
      console.error("History fetch failed:", err);
    }
  };

  fetchHistory();

}, [user]);

  //-----------------Date & Time ------------
 const formatDateLabel = (timestamp) => {
  if (!timestamp) return "";

  const msgDate = new Date(timestamp);

  if (isNaN(msgDate.getTime())) return "";

  const today = new Date();

  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const msgOnly = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate()
  );

  const diffDays =
    (todayOnly - msgOnly) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const sameYear =
    today.getFullYear() === msgDate.getFullYear();

  return msgDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

const isDifferentDay = (current, previous) => {
  if (!current) return false;
  if (!previous) return true;

  const currentDate = new Date(current);
  const previousDate = new Date(previous);

  if (
    isNaN(currentDate.getTime()) ||
    isNaN(previousDate.getTime())
  ) {
    return false;
  }

  return (
    currentDate.toDateString() !==
    previousDate.toDateString()
  );
};

  // -----------------Voice Input------------
  const startVoiceInput = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Your browser does not support voice input");
    return;
  }

  const recognition = new SpeechRecognition();
  recognitionRef.current = recognition;

  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.start();
  setIsListening(true);

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.onerror = () => {
    setIsListening(false);
  };
};

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    logout();
    setChats([]);
    setActiveChatId(null);
    setUser(null);
    navigate("/");
  };

  // ---------------- CHAT ----------------
  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];


  // ---------------- SUGGESTIONS ----------------
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://chatbot-backend-production-fe14.up.railway.app/api/admin/suggest-faq?q=${value}`
        );
        setSuggestions(res.data);
      } catch (err) {
        console.log(err);
      }
    }, 300);
  };

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async (text = input) => {
  if (!text.trim()) return;

  let chatId = activeChatId;

  // ✅ CREATE CHAT IF NONE EXISTS
  if (!chatId) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
          alert("Please login first");
      return;
  }

      const res = await axios.post(
  "https://chatbot-backend-production-fe14.up.railway.app/api/chat/create",
  {},
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

      const newChat = {
        id: res.data.chat_id,
        title: text.slice(0, 30),
        messages: []
      };

      setChats((prev) => [newChat, ...prev]);

      setActiveChatId(newChat.id);

      chatId = newChat.id; // ✅ IMPORTANT
    } catch (err) {
      console.error("Failed to create chat", err);
      return;
    }
  }

const userMessage = {
  text,
  sender: "user",
  time: new Date().toISOString(),
};

  const botPlaceholder = {
  text: "",
  sender: "bot",
  time: new Date().toISOString(),
};

  setInput("");
  setSuggestions([]);
  setLoading(true);

  // ✅ update UI safely
  setChats((prev) =>
  prev.map((chat) => {
    if (chat.id !== chatId) return chat;

    // ✅ Update title only for new chats
    const updatedTitle =
      chat.title === "New Chat"
        ? text.slice(0, 30)
        : chat.title;

    return {
      ...chat,
      title: updatedTitle,
      messages: [
        ...chat.messages,
        userMessage,
        botPlaceholder
      ]
    };
  })
);

  let fullText = "";

  try {
    await streamMessageToBot(chatId, text, (chunk) => {
      fullText += chunk;

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          const msgs = [...chat.messages];

          msgs[msgs.length - 1] = {
           ...msgs[msgs.length - 1],
          text: fullText,
          time: msgs[msgs.length - 1].time || new Date().toISOString(),
          };
          return { ...chat, messages: msgs };
        })
      );
    });
  } catch (err) {
    console.error(err);

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages.slice(0, -1),
                {
                  text: "Error connecting to server",
                  sender: "bot",
                  time: new Date().toISOString(),
                }
              ]
            }
          : chat
      )
    );
  } finally {
    setLoading(false);
  }
  requestAnimationFrame(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
});
};

  // ---------------- UI ----------------
  return (
  <div className="relative z-10 w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col bg-[#020617]">
    {/* BACKGROUND GLOW (Admin theme) */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full" />

    <div className="relative z-10 w-full max-w-6xl h-full flex flex-col rounded-3xl
      bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">

      {/* HEADER (AUTH RESTORED + MODERNIZED) */}
         <div className="flex items-center sm:justify-center md:justify-between px-6 py-4 border-b border-white/10">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <img src={AIlogo} className="h-10 w-10 rounded-xl bg-white p-1" />

          <div>
            <h1 className="text-lg font-semibold">
              AI Customer Support Chatbot
            </h1>
            <p className="text-xs text-gray-400">
              Online • Instant AI responses
            </p>
          </div>
        </div>

        {/* RIGHT (AUTH UI RESTORED EXACTLY) */}
       <div className="hidden md:flex items-center gap-3">

          {isAuthenticated() ? (
            <>
              <div className="flex flex-row items-end gap-2">
                <p className=" text-lg font-serif text-gray-200 ">Welcome ,</p>
                <p className="text-xl font-semibold font-sans text-white">
                  {user?.name}
                </p> 
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white
                bg-linear-to-r from-red-500 to-red-600
                hover:from-red-600 hover:to-red-700
                shadow-md hover:shadow-lg
                transition-all duration-200 active:scale-95"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-xl text-sm font-medium
                text-white/90 border border-white/20
                hover:bg-white/10
                transition-all duration-200 active:scale-95"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white
                bg-linear-to-r from-blue-500 to-indigo-600
                hover:from-blue-600 hover:to-indigo-700
                shadow-md hover:shadow-blue-500/30
                transition-all duration-200 active:scale-95"
              >
                Signup
              </button>
            </>
          )}

        </div>
      </div>

      {/* QUICK INTENTS */}
      <div className="px-6 pt-4">
        <div className="flex flex-wrap gap-2">

          {quickIntents.map((intent, index) => (
            <button
              key={index}
              onClick={() => sendMessage(intent.text)}
              className="px-3 py-1.5 rounded-full text-xs
              bg-white/5 border border-white/10
              hover:bg-blue-500/10 hover:border-blue-500/30
              text-gray-300 hover:text-white
              transition-all duration-200"
            >
              {intent.label}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 space-y-4 pb-28">
        {messages.map((msg, i) => {
  const showDate = isDifferentDay(
    msg.time,
    messages[i - 1]?.time
  );

  return (
    <React.Fragment key={i}>
      
      {/* DATE SEPARATOR */}
      {showDate && (
        <div className="flex justify-center my-4">
          <div
            className="
              px-4 py-1 rounded-full
              bg-white/10 border border-white/10
              text-xs text-gray-300
              backdrop-blur
            "
          >
            {formatDateLabel(msg.time)}
          </div>
        </div>
      )}

      {/* MESSAGE */}
      <Message
        text={msg.text}
        sender={msg.sender}
        user={user}
        time={msg.time}
      />
    </React.Fragment>
  );
})}
        <div ref={bottomRef} />

        {loading && (
          <div className="flex gap-2 text-gray-400">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
          </div>
        )}

      </div>

      {/* INPUT AREA */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5">

        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 items-center bg-white/5 border border-white/10
          px-4 py-3 rounded-2xl backdrop-blur-xl
          focus-within:border-blue-500/40 transition">
            {/* SUGGESTIONS DROPDOWN */}
              {suggestions.length > 0 && (
                <div className="absolute bottom-20 sm:bottom-24 left-3 right-3 sm:left-6 sm:right-6 z-50
                bg-[#0f172a]/90 backdrop-blur-xl
                border border-white/10 rounded-2xl shadow-2xl
                 overflow-hidden">

    <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
      Suggested Questions
    </div>

    {suggestions.map((s, i) => (
      <div
        key={i}
        onClick={() => {
          setInput(s.question);
          setSuggestions([]);
        }}
        className="px-4 py-3 text-sm text-gray-200
        hover:bg-white/10 cursor-pointer transition flex items-center gap-2"
      >
        <span className="text-blue-400">•</span>
        {s.question}
      </div>
    ))}
  </div>
)}

          <input
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            placeholder="Ask about orders, refunds, support..."
          />

          <button
            onClick={startVoiceInput}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition
            ${isListening 
            ? "bg-red-500 animate-pulse" 
            : "bg-white/10 hover:bg-white/20"
           }`}
            title="Voice Input"
          >
           🎙️
          </button>

          <button
            onClick={() => sendMessage()}
            className="w-full sm:w-auto px-5 py-2 rounded-xl font-medium text-white
                       bg-linear-to-r from-blue-500 to-indigo-600
                       hover:from-blue-600 hover:to-indigo-700
                        shadow-lg hover:shadow-blue-500/30
                         transition active:scale-95"
          >
            Send
          </button>

        </div>

        {/* MINI INTENTS */}
        <div className="flex flex-wrap gap-2 mt-3">

          {miniIntents.map((intent, index) => (
            <button
              key={index}
              onClick={() => sendMessage(intent.text)}
              className="px-3 py-1 rounded-full text-xs
              bg-white/5 border border-white/10
              text-gray-400 hover:text-white
              hover:bg-white/10 transition"
            >
              {intent.label}
            </button>
          ))}

        </div>

      </div>

    </div>
  </div>
);
}

export default ChatBox;
