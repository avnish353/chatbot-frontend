import axios from "axios";

const api = axios.create({
  baseURL: "https://your-backend.onrender.com/api",
});

// --------------------
// AUTH APIs
// --------------------
export const registerUser = async (data) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error) {
    console.error("Signup Error:", error);
    throw error;
  }
};

export const loginUser = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// --------------------
// CHAT API (JWT PROTECTED)
// --------------------
export const sendMessageToBot = async (message) => {
  if (!message || message.trim() === "") {
    throw new Error("Empty message not allowed");
  }

  const token = localStorage.getItem("token");

  try {
    const res = await api.post(
      "/chat/",
      { message: message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return res.data;
  } catch (error) {
    console.log("FULL ERROR:", error.response?.data);
    throw error;
  }
};

export const streamMessageToBot = async (chatId,message, onChunk) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch("http://localhost:5000/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({chat_id: chatId, message }),
  });

  // ✅ CHECK RESPONSE FIRST
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error:", res.status, errorText);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;

    const chunk = decoder.decode(value);
    onChunk(chunk);
  }
};