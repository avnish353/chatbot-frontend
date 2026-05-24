import React from "react";
import AIlogo from "../static/images/aiLogo.png";

function Message({ text, sender, user, time }) {
  const isUser = sender === "user";

  // USER INITIALS
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // FORMAT TIME
  const formatTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  // ✅ Prevent Invalid Date
  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  return (
    <div
      className={`flex items-end gap-3 mb-4 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* BOT AVATAR */}
      {!isUser && (
        <div
          className="
            w-8 h-8 rounded-full
            bg-white/10 border border-white/10
            flex items-center justify-center
            backdrop-blur shrink-0
          "
        >
          <img
            src={AIlogo}
            alt="AI"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      )}

      {/* MESSAGE CONTAINER */}
      <div className="flex flex-col max-w-[75%]">
        
        {/* MESSAGE BUBBLE */}
        <div
          className={`
            px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
            backdrop-blur-xl border transition-all duration-200
            break-words
            ${
              isUser
                ? "bg-blue-600/80 text-white rounded-2xl rounded-br-md shadow-lg border-blue-400/20"
                : "bg-white/5 text-gray-200 rounded-2xl rounded-bl-md border-white/10"
            }
          `}
        >
          {text}
        </div>

        {/* TIMESTAMP */}
        <span
          className={`
            text-[10px] text-gray-400 mt-1 px-1
            ${isUser ? "text-right" : "text-left"}
          `}
        >
          {formatTime(time)}
        </span>
      </div>

      {/* USER AVATAR */}
      {isUser && (
        <div
          className="
            w-9 h-9 rounded-full
            bg-linear-to-br from-blue-500 to-indigo-600
            flex items-center justify-center
            text-white text-xs font-semibold
            shrink-0
          "
        >
          {getInitials(user?.name || "U")}
        </div>
      )}
    </div>
  );
}

export default Message;