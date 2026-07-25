import { useForm } from "react-hook-form";
import { useAuthStore } from "@/auth/authStore";
import { useNavigate } from "react-router-dom";
import { loginApi } from "@/auth/authApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
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
            <Input type="email" placeholder="Email" {...register("email")} />
            <Input type="password" placeholder="Password" {...register("password")} />

            <Button className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
