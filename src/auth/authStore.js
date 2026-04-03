import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,

  login: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", user.token);
    localStorage.setItem("role", user.role);

    set({
      user: user,
      token: user.token,
      role: user.role,
    });
  },

  logout: () => {
    localStorage.clear();
    set({
      user: null,
      token: null,
      role: null,
    });
  },
}));