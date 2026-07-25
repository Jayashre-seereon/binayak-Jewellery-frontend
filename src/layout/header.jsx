import { Bell, User } from "lucide-react";
import { useAuthStore } from "@/auth/authStore";
import { logoutApi } from "@/auth/authApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (token || refreshToken) {
        const response = await logoutApi();
        const message =
          response.data?.message ||
          response.data?.data?.message ||
          "Logout successful";
        toast.success(message);
      } else {
        toast.success("Logout successful");
      }
      logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 400);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Logout failed";
      toast.error(message);
      logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 400);
    } finally {
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
