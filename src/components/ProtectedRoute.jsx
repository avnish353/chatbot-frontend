import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
  return <Navigate to="/admin-login" />;
}

if (role !== "admin") {
  return <Navigate to="/admin-login" />;
}

  return children;
};

export default ProtectedRoute;