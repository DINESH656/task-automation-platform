import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center text-slate-100">
      <section className="glass-panel rounded-3xl p-8">
        <h1 className="text-3xl font-semibold text-white">Page not found</h1>
        <Link
          className="mt-5 inline-flex rounded-xl border border-cyan-300/30 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-300/10"
          to="/dashboard"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
