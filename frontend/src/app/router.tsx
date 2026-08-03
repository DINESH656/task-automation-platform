import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { GuestRoute } from "../routes/GuestRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { TasksPage } from "../pages/TasksPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "tasks", element: <TasksPage /> },
        ],
      },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
