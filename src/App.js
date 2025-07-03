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
import StudentSchedulePage from "./pages/StudentSchedulePage";
import StudentProfilePage from "./pages/StudentProfilePage";
import { hasAccess } from "./utils/permissions";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import ParentAttendancePage from "./pages/ParentAttendancePage";
import FacultySchedulePage from "./pages/FacultySchedulePage";
import HomePage from "./pages/HomePage";
import AttendanceReportPage from "./pages/AttendanceReportPage";
import { getUser } from "./utils/auth"; // Import getUser from auth.js
import ReportsStudentBased from "./pages/ReportsStudentBased"; // <-- Add this import

function App() {
  const user = getUser(); // Retrieve user information from local storage
  const userRole = user?.role || "guest"; // Default to "guest" if no role is found

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
          <Route path="/sections" element={<SectionManagementPage userRole={userRole} />} />
          <Route path="/faculty" element={<FacultyManagementPage />} />
          <Route path="/schedules" element={<SchedulePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/students" element={<StudentManagementPage userRole={userRole} />} />
          <Route path="/parents" element={<ParentManagementPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/my-attendance" element={<StudentAttendancePage />} />
          <Route path="/my-schedule" element={<StudentSchedulePage />} />
          <Route path="/my-profile" element={<StudentProfilePage />} />
          <Route path="/parent-attendance" element={<ParentAttendancePage />} />
          <Route path="/faculty-schedules" element={<FacultySchedulePage />} />
          <Route path="/reports" element={<AttendanceReportPage />} />
          <Route path="/reports-student-based" element={<ReportsStudentBased />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
