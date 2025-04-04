// utils/auth.js

export const getToken = () => localStorage.getItem("accessToken");

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};
