import { jwtDecode } from "jwt-decode";

// ---------------------
// AUTH CHECK
// ---------------------
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    // exp is in seconds → convert to ms
    if (decoded.exp * 1000 < Date.now()) {
      // 🔥 Token expired → cleanup
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return false;
    }

    return true;
  } catch (err) {
    // invalid token
    console.log("Error:",err);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

// ---------------------
// LOGIN HELPERS
// ---------------------

export const setAuthData = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

// ---------------------
// GET DATA
// ---------------------

export const getToken = () => {
  return  localStorage.getItem("token");
};

export const getUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// ---------------------
// LOGOUT
// ---------------------

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
};

