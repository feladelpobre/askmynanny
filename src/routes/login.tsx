import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type Search = { as?: "nanny" | "employer" | undefined };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const as = s["as"];
    return { as: as === "nanny" || as === "employer" ? as : undefined };
  },
  head: () => ({ meta: [{ title: "Sign in — askmynanny" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const input = "w-full rounded-xl border border-input bg-card px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring";

function LoginPage() {
  const { as } = Route.useSearch();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"nanny" | "employer">(as ?? "employer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) void navigate({ to: "/account" });
  }, [session, navigate]);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // Account type and name are only used when this email signs up for the first time.
      options: { shouldCreateUser: true, data: { account_type: accountType, full_name: fullName.trim().slice(0, 120) } },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code.trim())) return setError("Enter the 6-digit code from your email.");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError("That code is wrong or has expired. Request a new one.");
    await navigate({ to: "/account" });
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">Sign in or join</h1>
        <p className="mt-2 text-muted-foreground">We email you a 6-digit code. No password to remember, and fake sign-ups can't get past it.</p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <fieldset>
              <legend className="text-sm font-semibold">I am…</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["employer", "nanny"] as const).map((t) => (
                  <label key={t} className={`cursor-pointer rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${accountType === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>
                    <input type="radio" name="account_type" value={t} checked={accountType === t} onChange={() => setAccountType(t)} className="sr-only" />
                    {t === "employer" ? "Hiring a nanny" : "A nanny / kasambahay"}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Only applies the first time you sign up.</p>
            </fieldset>
            <label className="block text-sm font-semibold">Full name
              <input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={input + " mt-1"} placeholder="Juana Dela Cruz" maxLength={120} autoComplete="name" />
            </label>
            <label className="block text-sm font-semibold">Email
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input + " mt-1"} placeholder="you@email.com" autoComplete="email" />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              <Mail className="h-4 w-4" />{busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <p className="text-sm">We sent a 6-digit code to <strong>{email}</strong>. It expires soon, so enter it now.</p>
            <label className="block text-sm font-semibold">Code
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className={input + " mt-1 text-center font-mono text-2xl tracking-[0.5em]"} placeholder="••••••" />
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
              <ShieldCheck className="h-4 w-4" />{busy ? "Checking…" : "Verify and continue"}
            </button>
            <button type="button" onClick={() => { setStep("email"); setCode(""); }} className="w-full text-sm font-semibold text-muted-foreground hover:text-foreground">Use a different email or resend</button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to how askmynanny handles your data under the Data Privacy Act (RA 10173). <Link to="/" className="underline">Back home</Link>
        </p>
      </main>
    </div>
  );
}
