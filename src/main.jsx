import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="725180003422-bquk1jcleteacenl6cno8g6icr61mscb.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider> 
    </StrictMode>
);
