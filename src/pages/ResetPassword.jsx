import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    try {
      const res = await axios.post(
        `https://chatbot-backend-production-fe14.up.railway.app/api/auth/reset-password/${token}`,
        { password }
      );
       window.location.href = "/login";
      setMsg(res.data.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="bg-white/10 p-8 rounded-2xl w-96 border border-white/20">

        <h2 className="text-xl font-bold mb-4">🔒︎ Reset Password</h2>

        <input
          type="password"
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 mb-4"
          placeholder="New password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-blue-500 py-2 rounded-xl cursor-pointer"
        >
          Update Password
        </button>

        {msg && <p className="mt-3 text-sm text-green-400">{msg}</p>}

      </div>
    </div>
  );
}

export default ResetPassword;
