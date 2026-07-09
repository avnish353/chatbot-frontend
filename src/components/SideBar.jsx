import React from "react";
import axios from "axios";
import  deleteLogo  from "../static/images/delete.png";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../services/auth.js";
import  { useEffect, useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

function Sidebar({
  chats = [],
  setChats = () => {},
  setActiveChatId = () => {},
  activeChatId,
  closeSidebar
}) {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);

  useEffect(() => {

  const handleClickOutside = () => {
    setMenuOpenId(null);
  };

  window.addEventListener("click", handleClickOutside);

  return () =>
    window.removeEventListener(
      "click",
      handleClickOutside
    );
}, []);

  useEffect(() => {
     const storedUser = JSON.parse(localStorage.getItem("user"));
     // eslint-disable-next-line react-hooks/set-state-in-effect
     setUser(storedUser); 
  }, []);

  // ---------------- NEW CHAT ----------------
 
  const createNewChat = async () => {
  const token = localStorage.getItem("token");
  
  if(!token){
    alert("Please login first");
    return;
  }

  const res = await axios.post(
    "http://localhost:5000/api/chat/create",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const newChat = {
    id: res.data.chat_id,
    title: "New Chat",
    messages: []
  };

  setChats((prev) => [newChat, ...prev]);  // FIXED (avoid stale state)
  setActiveChatId(newChat.id);
};

  // ---------------- OPEN CHAT ----------------
  const openChat = (id) => {
       setActiveChatId(id);

       if (closeSidebar) {
          closeSidebar();
         }
   };

  // ---------------- DELETE CHAT ----------------
const deleteChat = async (e, id) => {
  e.stopPropagation();

  try {
    const token = localStorage.getItem("token");

    // DELETE FROM BACKEND
    await axios.delete(
      `http://localhost:5000/api/chat/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // UPDATE UI
    const updated = chats.filter((c) => c.id !== id);

    const user = JSON.parse(localStorage.getItem("user"));

    setChats(updated);

    localStorage.setItem(
      `chats_${user.id}`,
      JSON.stringify(updated)
    );

    // HANDLE ACTIVE CHAT
    if (id === activeChatId) {
      setActiveChatId(
        updated.length ? updated[0].id : null
      );
    }

  } catch (err) {
    console.error("Delete failed:", err);

    alert(
      err.response?.data?.error ||
      "Failed to delete chat"
    );
  }
};
  

  return (
  <div className="w-72 md:w-80 h-screen bg-[#020617] border-r border-white/10 flex flex-col p-3 md:p-4">

    {/* GLOW */}
    <div className="absolute w-72 h-72 bg-blue-500/20 blur-[120px] rounded-full" />

    {/* HEADER */}
    <div className="p-4 relative z-10">

      <button
        onClick={createNewChat}
        className="w-full py-3 rounded-2xl font-medium text-white
        bg-linear-to-r from-blue-500 to-indigo-600
        hover:from-blue-600 hover:to-indigo-700
        transition active:scale-95 shadow-lg"
      >
        📝 New Chat
      </button>

    </div>

    {/* CHAT LIST */}
    <div className="flex-1 overflow-y-auto px-2 space-y-2 relative z-10">

        {/* RECENT HEADER */}
        {isAuthenticated() && chats.length > 0 && (
        <div className="px-2 pt-2 pb-3">
          <p className="text-md font-semibold uppercase tracking-widest text-white">
            Recent Chats
          </p>
        </div>
        )}

      {chats.map((chat) => {
        const isActive = chat.id === activeChatId;

        return (
          <div
            key={chat.id}
            onClick={() => openChat(chat.id)}
            className={`group flex items-center justify-between px-3 py-3 rounded-2xl cursor-pointer
            transition-all
            ${isActive
              ? "bg-white/10 border border-blue-500/40"
              : "hover:bg-white/5 border border-transparent"
            }`}
          >

            <span className="text-sm text-gray-200 truncate">
              {chat.title}
            </span>

            <div className="relative">

  <button
    onClick={(e) => {
      e.stopPropagation();

      setMenuOpenId( menuOpenId === chat.id ? null : chat.id);
    }}
    className="opacity-100
    transition p-2 rounded-lg bg-white/10"
  >
    <EllipsisVerticalIcon className="w-5 h-5 text-gray-300" />
  </button>

  {menuOpenId === chat.id && (
    <div
      className="absolute right-0 top-8
      w-40 rounded-xl
      bg-[#1e293b]
      border border-white/10
      shadow-xl
      z-50"
    >
      <button
        onClick={(e) => {
          deleteChat(e, chat.id);
          setMenuOpenId(null);
        }}
        className="w-full flex items-center gap-2
        px-4 py-3
        hover:bg-red-500/20
        text-red-400
        text-sm"
      >
        <img
          src={deleteLogo}
          className="w-4 h-4"
        />

        Delete Chat
      </button>
    </div>
  )}

</div>

          </div>
        );
      })}

    </div>

    {/* FOOTER */}
   <div className="p-4 border-t border-white/10 space-y-3">

  {/* USER INFO */}
  {user && (
    <div className="flex md:hidden flex-col gap-1">
      <p className="text-sm text-gray-400">Logged in as</p>
      <p className="text-lg font-semibold text-white">
        {user?.name}
      </p>
    </div>
  )}

  {/* AUTH BUTTONS */}
  <div className="md:hidden flex flex-col gap-2">

    {isAuthenticated() ? (
      <button
        onClick={() => {
          logout();
          navigate("/");
        }}
        className="px-4 py-2 rounded-xl text-sm font-medium text-white
        bg-linear-to-r from-red-500 to-red-600
        hover:from-red-600 hover:to-red-700
        shadow-md hover:shadow-lg
        transition-all duration-200 active:scale-95"
      >
        Logout
      </button>
    ) : (
      <>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white
          bg-white/5 border border-white/20
          hover:bg-white/10
          transition-all duration-200 active:scale-95"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white
          bg-linear-to-r from-blue-700 to-indigo-700
          hover:from-blue-600 hover:to-indigo-700
          shadow-md hover:shadow-blue-500/30
          transition-all duration-200 active:scale-95"
        >
          Signup
        </button>
      </>
    )}
  </div>

  <p className="text-xs text-gray-500 text-center pt-2">
    AI Chat System v2
  </p>

</div>

  </div>
);
}

export default Sidebar;
