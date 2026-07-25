import { Bell, User } from "lucide-react";
import { useAuthStore } from "@/auth/authStore";
import { logoutApi } from "@/auth/authApi";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  const handleLogout = async () => {
    try {
      if (token || refreshToken) {
        await logoutApi({ token, refreshToken });
      }
    } finally {
      logout();
      window.location.href = "/login";
    }
  };
  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Left */}
      <div className="font-semibold text-lg">
        Vinayak Jewellers
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* <Bell className="cursor-pointer" /> */}
        <div className="flex items-center gap-2 cursor-pointer">
            <div className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-full">
            <User />
            </div>
          <span>{user?.name || user?.email || "User"}</span>
          <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
        </div>
      </div>
    </div>
  );
}
