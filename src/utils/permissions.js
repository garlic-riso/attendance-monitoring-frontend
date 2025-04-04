// utils/permissions.js

export const rolePermissions = {
  admin: ["dashboard", "attendance", "users", "settings", "reports", "faculty", "students", "parents"],
  faculty: ["attendance", "schedules", "sections", "students"],
  student: ["students", "parents", "schedules"],
};
  
export const hasAccess = (role, resource) => {
  if (!role) return false;
  const normalizedRole = role.toLowerCase();
  if (normalizedRole === "admin") return true;
  return rolePermissions[normalizedRole]?.includes(resource);
};
  