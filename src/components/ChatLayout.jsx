import React, { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import ChatBox from "./ChatBox";

function ChatLayout() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  // ✅ MOBILE SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------------- LOAD CHATS ----------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChats([]);
      setActiveChatId(null);
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem(`chats_${user.id}`) || "[]"
    );

    setChats(saved);

    if (saved.length > 0) {
      setActiveChatId(saved[0].id);
    }
  }, []);

  // ---------------- SAVE CHATS ----------------
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return;

    localStorage.setItem(
      `chats_${user.id}`,
      JSON.stringify(chats)
    );
  }, [chats]);

  return (
    <div className="h-full  w-full bg-[#020617] text-white overflow-hidden">

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#020617]">
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white text-2xl"
        >
          ☰
        </button>
      </div>

      <div className="flex h-screen">

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div
          className={`
            fixed md:static z-50 md:z-0
            top-0 left-0 h-screen
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
          `}
        >
          <Sidebar
            chats={chats}
            setChats={setChats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
            closeSidebar={() => setSidebarOpen(false)}
          />
        </div>

        {/* CHAT AREA */}
        <div className="flex-1  h-full overflow-hidden">
          <ChatBox
            chats={chats}
            setChats={setChats}
            activeChatId={activeChatId}
            setActiveChatId={setActiveChatId}
          />
        </div>

      </div>
    </div>
  );
}

export default ChatLayout;