import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/api/authApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const setSelectedStore = useAuthStore((state) => state.setSelectedStore);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await loginApi({
        email: data.email,
        password: data.password,
      });

      const payload = response.data?.data || response.data;
      const user = payload?.user || payload;
      const token = payload?.accessToken || payload?.token;
      const refreshToken = payload?.refreshToken;
      const role = user?.role || payload?.role;

      setSession({
        user,
        token,
        refreshToken,
        role,
      });

      if (role === "ADMIN") {
        toast.success("Login successful. Select a store to continue.");
        navigate("/select-store");
      } else {
        setSelectedStore(user?.store || null);
        toast.success("Login successful. Redirecting to dashboard.");
        navigate("/dashboard");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Login failed. Please check your credentials and try again.";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-96">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            <Button className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
