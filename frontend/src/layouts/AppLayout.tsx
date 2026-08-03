import {
  LayoutDashboard,
  ListChecks,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { logoutUser } from "../features/auth/authSlice";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
];

export function AppLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [collapsed, setCollapsed] = useState(false);
  const initials = `${user?.firstName?.[0] ?? "U"}${user?.lastName?.[0] ?? ""}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)]">
        <aside
          className={`sticky top-0 z-30 flex h-auto flex-col border-b border-slate-800 bg-slate-950 px-3 py-3 lg:h-screen lg:border-b-0 lg:border-r ${
            collapsed ? "lg:w-[76px]" : "lg:w-64"
          }`}
        >
          <div className="flex h-12 items-center justify-between gap-3 px-1">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky-500 text-sm font-bold text-white">
                S
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    Saarthi
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    Task Automation
                  </p>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="ghost-icon-button hidden lg:inline-grid"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? (
                <PanelLeftOpen aria-hidden="true" size={17} />
              ) : (
                <PanelLeftClose aria-hidden="true" size={17} />
              )}
            </button>
          </div>

          <nav
            className="mt-3 grid grid-cols-2 gap-1 lg:grid-cols-1"
            aria-label="Primary navigation"
          >
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition",
                    collapsed ? "lg:justify-center" : "",
                    isActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100",
                  ].join(" ")
                }
              >
                <Icon aria-hidden="true" size={18} className="shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto hidden border-t border-slate-800 pt-4 lg:block">
            <div
              className={`flex items-center gap-3 rounded-lg px-2 py-2 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-semibold uppercase text-slate-200">
                {initials}
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {user?.firstName ?? "User"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">Workspace</p>
                <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                  Track background jobs and task processing state
                </p>
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden min-w-0 text-right sm:block">
                  <p className="truncate text-sm text-slate-300">{user?.email}</p>
                  <p className="text-xs text-slate-600">{user?.role ?? "USER"}</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  onClick={() => void dispatch(logoutUser())}
                >
                  <LogOut aria-hidden="true" size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
