import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );
      window.location.href = res.data.reset_link;

      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="bg-white/10 p-8 flex flex-col items-center rounded-2xl w-96 border border-white/20">

        <h2 className="text-xl font-bold mb-4"> 🔒︎ Forgot Password</h2>

        <input
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 mb-4"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 py-2 rounded-xl cursor-pointer"
        >
          Send Reset Link
        </button>

        {message && (
          <p className="text-sm text-green-400 mt-3">{message}</p>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;