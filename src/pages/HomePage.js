import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DailyAttendanceReportPage from "./DailyAttendanceReportPage";
import { Spin } from "antd";

const HomePage = () => {
  const [role, setRole] = useState(undefined); // undefined means "not yet checked"
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log("Loaded user:", user); // 🔍 debug here
        setRole(user?.role?.toLowerCase() || null); // normalize role
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, [location]);
  

  if (role === undefined) {
    return (
      <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (["admin", "faculty"].includes(role?.toLowerCase?.())) {
    return <DailyAttendanceReportPage />;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Welcome</h2>
      <p>You're logged in as a {role || "guest"}.</p>
    </div>
  );
};

export default HomePage;
