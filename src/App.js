// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import UserManagementPage from "./pages/UserManagementPage";
import SectionManagementPage from "./pages/SectionManagementPage";
import FacultyManagementPage from "./pages/FacultyManagementPage";
import MainLayout from "./layouts/MainLayout";
import SchedulePage from "./pages/SchedulePage";
import SubjectsPage from "./pages/SubjectsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<h1>Welcome to the Dashboard</h1>} />
          <Route path="/users" element={<UserManagementPage />} />
          {/* <Route path="/schedules" element={<ScheduleManagementPage />} /> */}
          <Route path="/sections" element={<SectionManagementPage />} />
          <Route path="/faculty" element={<FacultyManagementPage />} />
          <Route path="/schedules" element={<SchedulePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
