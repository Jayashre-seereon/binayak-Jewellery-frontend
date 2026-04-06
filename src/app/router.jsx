import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "@/layout/dashboard-layout";
import Dashboard from "@/features/dashboard/dashboard";
import LoginPage from "@/pages/loginPage";
import ProtectedRoute from "@/auth/protectedRoute";
import BrandPage from "@/features/masters/brand/brand-page";
import CategoryMaster from "@/features/masters/category/category-page";
import MetalPage from "@/features/masters/metal/metal-page";
import PurityPage from "@/features/masters/purity/purity-page";
export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      {path:"masters/brand",element:<BrandPage/>},
      {path:"masters/category",element:<CategoryMaster/>},
      {path:"masters/metal",element:<MetalPage/>},
      { path: "masters/purity", element: <PurityPage /> }
    ],
  },
]);