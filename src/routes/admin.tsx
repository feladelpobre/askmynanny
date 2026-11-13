import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, ExternalLink, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { formatPeso } from "@/lib/locations";
import { BADGE_LABELS, DOCUMENT_LABELS, STATUS_LABELS, type ReviewStatus } from "@/lib/verification";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin review — askmynanny" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Applicant = {
  id: string;
  type: "nanny" | "employer";
  status: ReviewStatus;
  name: string;
  mobile: string | null;
  summary: string;
  badges: string[];
};

function AdminPage() {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ReviewStatus>("pending");
  const [people, setPeople] = useState<Applicant[]>([]);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const load = useCallback(async () => {
    const [n, e] = await Promise.all([
      supabase.from("nanny_profiles").select("*").eq("status", filter),
      supabase.from("employer_profiles").select("*").eq("status", filter),
    ]);
    const ids = [...(n.data ?? []).map((x) => x.user_id), ...(e.data ?? []).map((x) => x.user_id)];
    const { data: profiles } = ids.length ? await supabase.from("profiles").select("*").in("id", ids) : { data: [] };
    const p = new Map((profiles ?? []).map((x) => [x.id, x]));
    setPeople([
      ...(n.data ?? []).map((x): Applicant => ({
        id: x.user_id, type: "nanny", status: x.status, name: x.display_name || p.get(x.user_id)?.full_name || "(no name)",
        mobile: p.get(x.user_id)?.mobile ?? null, badges: x.badges,
        summary: [x.city, x.years_experience != null ? `${x.years_experience} yrs` : null, x.expected_salary_php ? formatPeso(x.expected_salary_php) : null, x.skills.join(", ")].filter(Boolean).join(" · "),
      })),
      ...(e.data ?? []).map((x): Applicant => ({
        id: x.user_id, type: "employer", status: x.status, name: p.get(x.user_id)?.full_name || "(no name)",
        mobile: p.get(x.user_id)?.mobile ?? null, badges: [],
        summary: [x.city, x.offered_salary_php ? `offers ${formatPeso(x.offered_salary_php)}` : null, x.household].filter(Boolean).join(" · "),
      })),
    ]);
  }, [filter]);
  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (loading) return <Page><p className="text-muted-foreground">Loading…</p></Page>;
  if (!isAdmin) return <Page><p>This page is for askmynanny admins only. <Link to="/account" className="text-primary underline">Go to my account</Link></p></Page>;

  return (
    <Page>
      <h1 className="font-display text-4xl font-semibold">Verification review</h1>
      <p className="text-muted-foreground">Compare each live photo with the government ID. Approve clearances only if they are genuine and not expired.</p>
      <div className="flex flex-wrap gap-2">
        {(["pending", "verified", "rejected", "draft"] as ReviewStatus[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{STATUS_LABELS[s]}</button>
        ))}
      </div>
      <div className="space-y-6">
        {people.map((a) => <ApplicantCard key={a.id} a={a} onChange={load} />)}
        {!people.length && <p className="text-muted-foreground">No one here.</p>}
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">{children}</main>
    </div>
  );
}

function ApplicantCard({ a, onChange }: { a: Applicant; onChange: () => Promise<void> }) {
  const [docs, setDocs] = useState<(Tables<"documents"> & { url?: string | undefined })[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const loadDocs = useCallback(async () => {
    const { data } = await supabase.from("documents").select("*").eq("owner_id", a.id).order("created_at", { ascending: false });
    const withUrls = await Promise.all((data ?? []).map(async (d) => {
      if (d.kind === "profile_photo") return { ...d, url: supabase.storage.from("profile-photos").getPublicUrl(d.storage_path).data.publicUrl };
      const { data: s } = await supabase.storage.from("verification").createSignedUrl(d.storage_path, 600);
      return { ...d, url: s?.signedUrl };
    }));
    setDocs(withUrls);
  }, [a.id]);
  useEffect(() => void loadDocs(), [loadDocs]);

  async function reviewDoc(id: string, status: "approved" | "rejected") {
    setError("");
    const { error } = await supabase.from("documents").update({ status, review_note: status === "rejected" ? note.trim().slice(0, 500) || "Please upload a clearer copy." : null }).eq("id", id);
    if (error) setError(error.message);
    await loadDocs();
    await onChange();
  }

  async function setStatus(status: ReviewStatus) {
    setError("");
    const table = a.type === "nanny" ? "nanny_profiles" : "employer_profiles";
    const { error } = await supabase.from(table).update({ status }).eq("user_id", a.id);
    if (error) return setError(error.message);
    await onChange();
  }

  const isImage = (path: string) => /\.(jpe?g|png|webp)$/i.test(path);
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{a.name}</h2>
          <p className="text-sm text-muted-foreground">{a.type === "nanny" ? "Nanny" : "Employer"} · {STATUS_LABELS[a.status]}{a.mobile ? ` · ${a.mobile}` : ""}</p>
          {a.summary && <p className="mt-1 text-sm">{a.summary}</p>}
          {a.badges.length > 0 && <p className="mt-2 flex flex-wrap gap-1.5">{a.badges.map((b) => <span key={b} className="rounded-full bg-verified/15 px-2.5 py-0.5 text-xs font-semibold text-verified">{BADGE_LABELS[b] ?? b}</span>)}</p>}
        </div>
        <div className="flex gap-2">
          {a.status !== "verified" && <button onClick={() => void setStatus("verified")} className="inline-flex items-center gap-1 rounded-full bg-verified px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" />Verify profile</button>}
          {a.status !== "rejected" && <button onClick={() => void setStatus("rejected")} className="inline-flex items-center gap-1 rounded-full border border-destructive px-4 py-2 text-sm font-semibold text-destructive"><X className="h-4 w-4" />Needs changes</button>}
        </div>
      </div>
      <label className="mt-4 block text-sm font-semibold">Note for rejections (shown to the user)
        <input id={`note-${a.id}`} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. ID photo is blurry; name doesn't match" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-destructive">{error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <figure key={d.id} className="min-w-0 rounded-2xl border border-border p-3">
            {d.url && isImage(d.storage_path)
              ? <a href={d.url} target="_blank" rel="noreferrer"><img src={d.url} alt={DOCUMENT_LABELS[d.kind]} className="aspect-video w-full rounded-xl object-cover" /></a>
              : <a href={d.url} target="_blank" rel="noreferrer" className="grid aspect-video place-items-center rounded-xl bg-muted text-sm font-semibold"><span className="inline-flex items-center gap-1"><ExternalLink className="h-4 w-4" />Open file</span></a>}
            <figcaption className="mt-2 text-sm">
              <p className="font-semibold">{DOCUMENT_LABELS[d.kind]}</p>
              <p className="text-xs text-muted-foreground">{d.status}{d.expires_on ? ` · valid until ${d.expires_on}` : ""}</p>
              {d.status === "pending" && (
                <div className="mt-2 flex gap-2">
                  <button onClick={() => void reviewDoc(d.id, "approved")} className="rounded-full bg-verified px-3 py-1 text-xs font-semibold text-white">Approve</button>
                  <button onClick={() => void reviewDoc(d.id, "rejected")} className="rounded-full border border-destructive px-3 py-1 text-xs font-semibold text-destructive">Reject</button>
                </div>
              )}
            </figcaption>
          </figure>
        ))}
        {!docs.length && <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
      </div>
    </section>
  );
}
