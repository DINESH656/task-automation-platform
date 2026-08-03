import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  initializeApiAuthHandlers,
  refreshSession,
} from "../features/auth/authSlice";

export function GuestRoute() {
  const dispatch = useAppDispatch();
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
        Loading...
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
