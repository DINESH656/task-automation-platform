import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { registerUser } from "../features/auth/authSlice";

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, status } = useAppSelector((state) => state.auth);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await dispatch(
      registerUser({
        firstName,
        lastName: lastName || undefined,
        email,
        password,
      }),
    );

    if (registerUser.fulfilled.match(result)) {
      navigate("/login", { replace: true });
    }
  };

  return (
    <form
      className="glass-panel grid gap-5 rounded-xl p-6"
      onSubmit={handleSubmit}
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Register a workspace user, then sign in.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          First name
          <input
            className="field-input"
            autoComplete="given-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
            minLength={2}
          />
        </label>

        <label className="field-label">
          Last name
          <input
            className="field-input"
            autoComplete="family-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
          />
        </label>
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
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button type="submit" className="neon-button" disabled={status === "loading"}>
        {status === "loading" ? "Creating..." : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link className="font-medium text-sky-400 hover:text-sky-300" to="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
