import { Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { canContact, type ReviewStatus } from "@/lib/verification";
import type { Nanny } from "@/lib/nannies";

/** Contact is only possible between a fully verified employer and a fully verified nanny (also enforced by the database). */
export function ContactPanel({ nanny }: { nanny: Nanny }) {
  const { session, profile } = useAuth();
  const [employerStatus, setEmployerStatus] = useState<ReviewStatus | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session || profile?.account_type !== "employer") return;
    void supabase.from("employer_profiles").select("status").eq("user_id", session.user.id).maybeSingle()
      .then(({ data }) => setEmployerStatus(data?.status ?? null));
  }, [session, profile]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    const text = message.trim();
    if (!text) return setError("Write a short message first.");
    setState("sending");
    setError("");
    const { error } = await supabase.from("contact_requests").insert({ employer_id: session.user.id, nanny_id: nanny.id, message: text.slice(0, 1000) });
    if (error) {
      setState("idle");
      return setError("We couldn't send this. Make sure your account is fully verified.");
    }
    setState("sent");
  }

  const box = "rounded-3xl border border-border bg-card p-6 shadow-soft";
  let body;
  if (nanny.sample) {
    body = <p className="text-sm text-muted-foreground">This is a sample profile for the preview. Contact works on real, fully verified nannies.</p>;
  } else if (!session) {
    body = <p className="text-sm">Only fully verified families can contact nannies. <Link to="/login" search={{ as: "employer" }} className="font-semibold text-primary underline">Sign in or join as a family</Link></p>;
  } else if (profile?.account_type !== "employer") {
    body = <p className="text-sm text-muted-foreground">Only family (employer) accounts can contact nannies.</p>;
  } else if (!canContact(employerStatus, nanny.verified ? "verified" : null)) {
    body = <p className="text-sm">Get your family account <strong>fully verified</strong> (ID and live photo) before contacting nannies. <Link to="/account" className="font-semibold text-primary underline">Finish verification</Link></p>;
  } else if (state === "sent") {
    body = <p className="text-sm font-semibold text-verified">Message sent. {nanny.name.split(" ")[0]} will see it in her account and can reply that she's interested.</p>;
  } else {
    body = (
      <form onSubmit={(e) => void send(e)} className="space-y-3">
        <textarea id="contact_message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} required
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="Introduce your family, the schedule, salary and how to reach you." />
        <p className="text-xs text-muted-foreground">Never ask for or send money. Report anyone who does.</p>
        {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
        <button disabled={state === "sending"} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-60"><Send className="h-4 w-4" />Send message</button>
      </form>
    );
  }
  return (
    <section className={box}>
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold"><Lock className="h-5 w-5 text-primary" />Contact {nanny.name.split(" ")[0]}</h2>
      <div className="mt-3">{body}</div>
    </section>
  );
}
