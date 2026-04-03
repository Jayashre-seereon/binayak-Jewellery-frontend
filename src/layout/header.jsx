import { Bell, User } from "lucide-react";
import { useAuthStore } from "@/auth/authStore";

export default function Header() {
     const logout = useAuthStore((state) => state.logout);
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
          <span>Admin</span>
          <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
        </div>
      </div>
    </div>
  );
}