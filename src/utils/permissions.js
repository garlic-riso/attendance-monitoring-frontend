// utils/permissions.js

export const rolePermissions = {
  admin: ["dashboard", "attendance", "schedules", "sections", "subjects", "users", "settings", "reports", "faculty", "students", "parents"],
  faculty: ["dashboard", "attendance", "schedules", "sections", "students", "my-faculty-schedule"],
  student: ["my-profile", "my-schedule", "my-attendance"],
  parent: ["parent-attendance"],
};
  
export const hasAccess = (role, resource) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  // if (normalizedRole === "admin") return true;
  return rolePermissions[normalizedRole]?.includes(resource);
};
  