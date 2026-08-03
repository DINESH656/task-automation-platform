import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  initializeApiAuthHandlers,
  refreshSession,
} from "../features/auth/authSlice";

export function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { status, hasBootstrapped } = useAppSelector((state) => state.auth);

  useEffect(() => {
    initializeApiAuthHandlers(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (!hasBootstrapped) {
      void dispatch(refreshSession());
    }
  }, [dispatch, hasBootstrapped]);

  if (!hasBootstrapped || status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-medium text-cyan-200">
        Loading workspace...
      </div>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
