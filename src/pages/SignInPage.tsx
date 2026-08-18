import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
import { api, ApiError, token } from "../lib/api";

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await api.signIn(email, password);
      token.set(result.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="bg-ink text-white px-8 py-12 lg:px-16 flex flex-col justify-center">
        <div className="flex items-center gap-2.5 mb-8">
          <Radio size={20} className="text-signal" aria-hidden />
          <span className="font-display font-bold text-[17px]">Scrappy Pro</span>
        </div>
        <h1 className="text-[40px] leading-[1.1] text-white max-w-[16ch]">
          Four retailers. One spreadsheet.
        </h1>
        <p className="text-white/60 mt-5 max-w-[46ch]">
          Choose a store and the categories you care about. Scrappy Pro walks the
          listings at a polite pace and hands back every product with prices, stock,
          images and specifications.
        </p>
      </div>

      <div className="flex items-center justify-center px-8 py-12">
        <form onSubmit={submit} className="w-full max-w-95 flex flex-col gap-5">
          <div>
            <h2 className="text-[24px]">Sign in</h2>
            <p className="text-muted text-[14px] mt-1">Use your Scrappy Pro account.</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Email</span>
            <input
              type="email"
              className="field"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="eyebrow">Password</span>
            <input
              type="password"
              className="field"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <p className="text-[13px] text-signal bg-signal-soft px-3 py-2.5 rounded-[3px]">
              {error}
            </p>
          )}

          <button className="btn btn-signal" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
