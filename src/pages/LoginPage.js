import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../styles/LoginPage.css";
import logo from "../assets/images/logo.jpg";

const LoginPage = () => {
  const handleLoginSuccess = (credentialResponse) => {
    console.log("Google Login Success:", credentialResponse);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="login-container">
        <img src={logo} alt="Logo" className="logo" />
        <h1>SMIS Attendance Monitoring System</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
