import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AIlogo from "../static/images/aiLogo.png"

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://chatbot-backend-production-fe14.up.railway.app/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        alert("You are not admin");
        console.log(res.data.role)
      }
    } catch (err) {
      alert("Invalid credentials");
      console.log(err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-blue-900 to-black">

      <div className="w-full max-w-md p-8 rounded-2xl 
        bg-white/10 backdrop-blur-xl 
        border border-white/20 shadow-2xl
        transform transition hover:scale-[1.02]">

        {/* Header */}
        <div className=" text-center mb-6">
        <div className="flex justify-center items-center gap-2">
            <img className="h-12 w-12 rounded-xl bg-white p-1 shadow" src={AIlogo} alt="AI" />
          <h1 className="text-3xl font-bold text-white">
            Admin Portal
          </h1>
        </div>
          <p className="text-gray-300 text-sm pl-12 mt-1">
            Secure access to control panel
          </p>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-gray-200 text-sm">Email</label>
          <input
            type="email"
            placeholder="admin@example.com"
            className="w-full mt-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20 focus:border-blue-400"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <label className="text-gray-200 text-sm">Password</label>

          <input
            type={show ? "text" : "password"}
            placeholder="••••••••"
            className="w-full mt-1 p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 outline-none border border-white/20 focus:border-blue-400"
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-9 text-xs text-gray-300 cursor-pointer hover:text-white"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full mt-2 py-3 rounded-lg 
          bg-linear-to-r from-blue-500 to-indigo-600 
          text-white font-semibold
          hover:from-blue-600 hover:to-indigo-700
          transition-all shadow-lg"
        >
          Login as Admin
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-5">
          © Secure Admin System
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;
