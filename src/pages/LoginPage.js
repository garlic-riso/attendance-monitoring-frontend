import React, { useEffect } from "react";
import { getToken } from "../utils/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "../styles/LoginPage.css";
import logo from "../assets/images/logo.png";
import axios from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate("/");
    }
  }, [navigate]);

const handleLoginSuccess = async (credentialResponse) => {
  try {
    const response = await axios.post("/api/auth/google-login", {
      token: credentialResponse.credential,
    });

    const { token, user } = response.data;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Login successful:", user);
    navigate("/");
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || "Unknown error");
  }
};
  

  return (
    <GoogleOAuthProvider clientId="568639859443-uhdj3su3ob139hh057n7avcpmkllef46.apps.googleusercontent.com">
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
