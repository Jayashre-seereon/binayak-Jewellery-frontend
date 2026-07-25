import { Navigate } from "react-router-dom";
import { useAuthStore } from "./authStore";

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
