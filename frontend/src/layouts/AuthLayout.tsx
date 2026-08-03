import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-8 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-500 text-sm font-bold text-white">
            S
          </div>
          <div>
            <strong className="block text-white">Saarthi</strong>
            <span className="block text-sm text-slate-500">Task Automation</span>
          </div>
        </div>
        <Outlet />
      </section>
    </main>
  );
}
