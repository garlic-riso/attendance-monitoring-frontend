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
import StudentManagementPage from "./pages/StudentManagementPage";
import ParentManagementPage from "./pages/ParentManagementPage";
import AttendancePage from "./pages/AttendancePage";
import SettingsPage from "./pages/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DailyAttendanceReportPage from "./pages/DailyAttendanceReportPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import { hasAccess } from "./utils/permissions";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import ParentAttendancePage from "./pages/ParentAttendancePage";
import HomePage from "./pages/HomePage";
import FacultySchedulePage from "./pages/FacultySchedulePage";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/sections" element={<SectionManagementPage />} />
          <Route path="/faculty" element={<FacultyManagementPage />} />
          <Route path="/schedules" element={<SchedulePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/students" element={<StudentManagementPage />} />
          <Route path="/parents" element={<ParentManagementPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/my-attendance" element={<StudentAttendancePage />} />
          <Route path="/my-schedule" element={<StudentSchedulePage />} />
          <Route path="/my-profile" element={<StudentProfilePage />} />
          <Route path="/parent-attendance" element={<ParentAttendancePage />} />
          <Route path="/faculty-schedules" element={<FacultySchedulePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
