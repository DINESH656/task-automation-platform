import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginUser } from "../features/auth/authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, status } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate(from, { replace: true });
    }
  };

  return (
    <form
      className="glass-panel grid gap-5 rounded-xl p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Continue to your task automation workspace.
        </p>
      </div>

      <label className="field-label">
        Email
        <input
          className="field-input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="field-label">
        Password
        <input
          className="field-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button type="submit" className="neon-button" disabled={status === "loading"}>
        {status === "loading" ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link className="font-medium text-sky-400 hover:text-sky-300" to="/register">
          Create an account
        </Link>
      </p>
    </form>
  );
}
