import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { registerUser } from "../services/api";

function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // -------------------------
  // INPUT CHANGE
  // -------------------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // -------------------------
  // MANUAL REGISTER
  // -------------------------
  const handleRegister = async () => {
  try {
    if (!form.name || !form.email || !form.username || !form.password) {
      setMessage("Please fill all fields");
      return;
    }

    const res = await registerUser(form);

    setMessage(res.message);

    setTimeout(() => navigate("/login"), 1000);

  } catch (err) {
    setMessage(err.response?.data?.message || "Registration failed");
  }
};

  // -------------------------
  // GOOGLE SIGNUP
  // -------------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        username: decoded.email.split("@")[0],
        password: null,
        auth_provider: "google"
      };

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Google signup successful!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setMessage(data.message || "Google signup failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Google signup error");
    }
  };

  // -------------------------
  // UI
  // -------------------------
 return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

    {/* CARD */}
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 text-white">

      {/* HEADER */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Create Account</h2>
        <p className="text-sm text-gray-300 mt-1">
          Join and start chatting instantly
        </p>
      </div>

      {/* INPUTS */}
      <div className="space-y-4">

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* REGISTER BUTTON */}
        <button
          onClick={handleRegister}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold shadow-lg"
        >
          Create Account
        </button>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-white/20"></div>
        <p className="px-3 text-xs text-gray-300">OR</p>
        <div className="flex-1 h-px bg-white/20"></div>
      </div>

      {/* GOOGLE LOGIN */}
      <div className="flex justify-center">
        <div className="bg-gray-500 rounded-xl px-2 py-1 shadow-md">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google Login Failed")}
          />
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <p className="text-center text-sm mt-4 text-yellow-300">
          {message}
        </p>
      )}

      {/* LOGIN LINK */}
      <p className="text-center text-ms mt-6 text-gray-300">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  </div>
);
}

export default RegisterPage;