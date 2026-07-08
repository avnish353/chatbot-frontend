import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { setAuthData } from "../services/auth";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";


function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
  try {
    const decoded = jwtDecode(credentialResponse.credential);

    const res = await fetch("https://chatbot-backend-production-fe14.up.railway.app/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decoded),
    });

    const data = await res.json();

    if (data.message === "SET_PASSWORD_REQUIRED") {
       navigate("/set-password", { state: { email: data.email } });
      return;
}

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      navigate("/");
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.log(err);
  }
};

  const handleLogin = async () => {
  try {
    const res = await loginUser({ email, password });

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));
    localStorage.setItem("role", res.user.role); // ✅ FIXED

    setAuthData(res.token, res.user);

    navigate("/");

  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};

return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

    {/* CARD */}
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-white">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-sm text-gray-300 mt-1">
          Login to continue chatting
        </p>
      </div>

      {/* INPUTS */}
      <div className="space-y-4">

        <input
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 cursor-pointer text-xl"
          >
           {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold shadow-lg"
        >
          Login
        </button>
        {/* ADD HERE */}
        <div className="flex justify-center">
             <span
               onClick={() => navigate("/forgot-password")}
               className="text-md text-blue-400  hover:underline cursor-pointer"
              >
                 Forgot password?
             </span>
         </div>
        <div className="flex justify-center mt-4">
            <GoogleLogin
            onSuccess={handleGoogleLogin}
             onError={() => alert("Google login failed")}
             />
          </div>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-white/20"></div>
        <p className="px-3 text-xs text-gray-300">OR</p>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      {/* SIGNUP LINK */}
      <p className="text-center text-md text-gray-300">
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Sign up now
        </span>
      </p>

    </div>
  </div>
);
}
export default LoginPage;
