import { useForm } from "react-hook-form";
import { useAuthStore } from "@/auth/authStore";
import { useNavigate } from "react-router-dom";
import { users } from "@/auth/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const user = users.find(
      (u) =>
        (u.username === data.username || u.email === data.username) &&
        u.password === data.password
    );

    if (user) {
      login(user);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-96">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Login</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Username or Email" {...register("username")} />
            <Input type="password" placeholder="Password" {...register("password")} />

            <Button className="w-full">Login</Button>
          </form>

          <div className="mt-4 text-sm text-gray-500">
            <p>Admin: admin / 123456</p>
            <p>Staff: staff / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}