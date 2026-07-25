import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  role: localStorage.getItem("role") || null,
  selectedStore: JSON.parse(localStorage.getItem("selectedStore")) || null,

  setSession: ({ user, token, refreshToken, role }) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (role) localStorage.setItem("role", role);

    set((state) => ({
      user: user ?? state.user,
      token: token ?? state.token,
      refreshToken: refreshToken ?? state.refreshToken,
      role: role ?? state.role,
    }));
  },

  setSelectedStore: (store) => {
    localStorage.setItem("selectedStore", JSON.stringify(store));
    set({ selectedStore: store });
  },

  clearSelectedStore: () => {
    localStorage.removeItem("selectedStore");
    set({ selectedStore: null });
  },

  logout: () => {
    localStorage.clear();
    set({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      selectedStore: null,
    });
  },
}));
