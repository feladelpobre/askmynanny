import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Clock, FileUp, LogOut, Send, ShieldAlert, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LiveIdCapture } from "@/components/LiveIdCapture";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { PH_LOCATIONS, formatPeso } from "@/lib/locations";
import {
  BADGE_LABELS, DOCUMENT_LABELS, EXPIRING_DOCUMENTS, OPTIONAL_DOCUMENTS, REQUIRED_DOCUMENTS, STATUS_LABELS,
  belowMinimumWage, documentPath, missingRequiredDocuments, type DocumentKind, type ReviewStatus,
} from "@/lib/verification";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My account — askmynanny" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

const input = "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const MAX_BYTES = 10 * 1024 * 1024;
const CHILD_AGES = ["Newborn (0–1)", "Toddler (1–3)", "Preschool (3–5)", "School-age (6–12)", "Special needs"];
const BENEFITS = ["SSS", "PhilHealth", "Pag-IBIG", "13th month pay", "Own room", "Weekly rest day", "Meals included"];
const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20);

type Docs = Tables<"documents">[];

function AccountPage() {
  const { session, profile, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/login" });
  }, [loading, session, navigate]);

  if (loading || !session || !profile) {
    return <Shell><p className="text-muted-foreground">Loading your account…</p></Shell>;
  }
  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold">Hi{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          <p className="text-muted-foreground">{profile.account_type === "nanny" ? "Nanny account" : "Employer account"} · {session.user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && <Link to="/admin" className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">Admin review</Link>}
          <button onClick={() => void signOut().then(() => navigate({ to: "/" }))} className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"><LogOut className="h-4 w-4" />Sign out</button>
        </div>
      </div>
      {profile.account_type === "nanny" ? <NannyAccount userId={session.user.id} mobile={profile.mobile} /> : <EmployerAccount userId={session.user.id} mobile={profile.mobile} />}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">{children}</main>
    </div>
  );
}

function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`block text-sm font-semibold ${full ? "sm:col-span-2" : ""}`}>{label}<div className="mt-1 font-normal">{children}</div></label>;
}

function StatusBanner({ status, missing, onSubmit, busy, error }: { status: ReviewStatus; missing: DocumentKind[]; onSubmit: () => void; busy: boolean; error: string }) {
  const icon = status === "verified" ? <CheckCircle2 className="h-5 w-5 text-verified" /> : status === "rejected" ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-primary" />;
  return (
    <section className="rounded-3xl border border-border bg-secondary p-5">
      <p className="flex items-center gap-2 font-semibold">{icon}Verification: {STATUS_LABELS[status]}</p>
      {status === "verified" && <p className="mt-1 text-sm text-muted-foreground">You're fully verified. Editing your profile sends it back for a quick re-check.</p>}
      {status === "pending" && <p className="mt-1 text-sm text-muted-foreground">An admin is reviewing your documents. You'll appear as Fully Verified once approved.</p>}
      {(status === "draft" || status === "rejected") && (
        <div className="mt-2 space-y-2 text-sm">
          {missing.length > 0
            ? <p>Still needed: <strong>{missing.map((k) => DOCUMENT_LABELS[k]).join(", ")}</strong>.</p>
            : <p>Everything required is uploaded. Submit when your details are complete.</p>}
          {error && <p role="alert" className="font-semibold text-destructive">{error}</p>}
          <button disabled={busy || missing.length > 0} onClick={onSubmit} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" />Submit for verification</button>
        </div>
      )}
    </section>
  );
}

function useDocuments(userId: string) {
  const [docs, setDocs] = useState<Docs>([]);
  const reload = useCallback(async () => {
    const { data } = await supabase.from("documents").select("*").eq("owner_id", userId).order("created_at", { ascending: false });
    setDocs(data ?? []);
  }, [userId]);
  useEffect(() => void reload(), [reload]);
  return { docs, reload };
}

async function uploadDocument(userId: string, kind: DocumentKind, file: Blob, name: string, expiresOn?: string) {
  if (file.size > MAX_BYTES) throw new Error("File is larger than 10 MB.");
  if (!/^image\/(jpeg|png|webp)$|^application\/pdf$/.test(file.type)) throw new Error("Use a JPG, PNG, WEBP or PDF file.");
  if (kind === "profile_photo" && file.type === "application/pdf") throw new Error("Your profile photo must be an image.");
  const bucket = kind === "profile_photo" ? "profile-photos" : "verification";
  const path = documentPath(userId, kind, name);
  const up = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (up.error) throw new Error(up.error.message);
  const { error } = await supabase.from("documents").insert({ owner_id: userId, kind, storage_path: path, expires_on: expiresOn || null });
  if (error) throw new Error(error.message);
  return path;
}

function DocumentsCard({ userId, accountType, docs, reload, onProfilePhoto }: {
  userId: string; accountType: "nanny" | "employer"; docs: Docs; reload: () => Promise<void>; onProfilePhoto?: (path: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [optionalKind, setOptionalKind] = useState<DocumentKind>("nbi_clearance");
  const [expires, setExpires] = useState("");

  async function handle(kind: DocumentKind, file: Blob | undefined, name: string, expiresOn?: string) {
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const path = await uploadDocument(userId, kind, file, name, expiresOn);
      if (kind === "profile_photo" && onProfilePhoto) await onProfilePhoto(path);
      setMsg(`${DOCUMENT_LABELS[kind]} uploaded.`);
      await reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: Tables<"documents">) {
    const bucket = d.kind === "profile_photo" ? "profile-photos" : "verification";
    await supabase.storage.from(bucket).remove([d.storage_path]);
    await supabase.from("documents").delete().eq("id", d.id);
    await reload();
  }

  const required = REQUIRED_DOCUMENTS[accountType];
  const latest = (k: DocumentKind) => docs.find((d) => d.kind === k);
  return (
    <Card title="Verification documents" note="IDs, live photos and clearances are private. Only askmynanny admins can see them. Your ID is used only to verify you.">
      <div className="space-y-5">
        {required.map((k) => {
          const d = latest(k);
          return (
            <div key={k} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{DOCUMENT_LABELS[k]} <span className="text-xs font-normal text-destructive">required</span></p>
                {d && <DocStatus d={d} />}
              </div>
              {(!d || d.status === "rejected") && (
                <div className="mt-3">
                  {k === "id_live_photo" ? (
                    <LiveIdCapture disabled={busy} onCapture={(blob) => void handle(k, blob, "live.jpg")} />
                  ) : (
                    <input type="file" accept={k === "profile_photo" ? "image/jpeg,image/png,image/webp" : "image/jpeg,image/png,image/webp,application/pdf"}
                      {...(k === "profile_photo" ? { capture: "user" as const } : {})}
                      disabled={busy} onChange={(e) => void handle(k, e.target.files?.[0], e.target.files?.[0]?.name ?? "file")} className="text-sm" />
                  )}
                </div>
              )}
              {d?.review_note && <p className="mt-2 text-sm text-destructive">Admin note: {d.review_note}</p>}
            </div>
          );
        })}

        {accountType === "nanny" && (
          <div className="rounded-2xl border border-dashed border-primary p-4">
            <p className="font-semibold">Clearances and certificates <span className="text-xs font-normal text-muted-foreground">optional, earn badges</span></p>
            <p className="mt-1 text-sm text-muted-foreground">An ID check isn't a background check. Families trust NBI, police and barangay clearances, plus TESDA and first aid certificates.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <select id="optional_kind" className={input} value={optionalKind} onChange={(e) => setOptionalKind(e.target.value as DocumentKind)}>
                {OPTIONAL_DOCUMENTS.map((k) => <option key={k} value={k}>{DOCUMENT_LABELS[k]}</option>)}
              </select>
              {EXPIRING_DOCUMENTS.includes(optionalKind) && (
                <input id="optional_expires" type="date" className={input} value={expires} onChange={(e) => setExpires(e.target.value)} aria-label="Valid until" />
              )}
              <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ${busy ? "opacity-60" : ""}`}>
                <FileUp className="h-4 w-4" />Upload
                <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy}
                  onChange={(e) => {
                    if (EXPIRING_DOCUMENTS.includes(optionalKind) && !expires) { setMsg("Add the 'valid until' date first."); return; }
                    void handle(optionalKind, e.target.files?.[0], e.target.files?.[0]?.name ?? "file", expires || undefined);
                    e.target.value = "";
                  }} />
              </label>
            </div>
            <ul className="mt-4 space-y-2">
              {docs.filter((d) => OPTIONAL_DOCUMENTS.includes(d.kind)).map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{DOCUMENT_LABELS[d.kind]}{d.expires_on ? ` · valid until ${d.expires_on}` : ""}</span>
                  <span className="flex items-center gap-2"><DocStatus d={d} />
                    {d.status === "pending" && <button onClick={() => void remove(d)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {msg && <p role="status" className="text-sm font-semibold">{msg}</p>}
      </div>
    </Card>
  );
}

function DocStatus({ d }: { d: Tables<"documents"> }) {
  const style = d.status === "approved" ? "bg-verified/15 text-verified" : d.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>{d.status === "pending" ? "Waiting for review" : d.status === "approved" ? "Approved" : "Rejected"}</span>;
}

/* ---------------------------- Nanny ---------------------------- */

function NannyAccount({ userId, mobile }: { userId: string; mobile: string | null }) {
  const [np, setNp] = useState<Tables<"nanny_profiles"> | null>(null);
  const [priv, setPriv] = useState<Tables<"nanny_private"> | null>(null);
  const { docs, reload } = useDocuments(userId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      supabase.from("nanny_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("nanny_private").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    setNp(a.data);
    setPriv(b.data);
  }, [userId]);
  useEffect(() => void load(), [load]);

  if (!np || !priv) return <p className="text-muted-foreground">Loading your profile…</p>;

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved("");
    const f = new FormData(e.currentTarget);
    const salary = Number(f.get("expected_salary_php")) || null;
    const city = String(f.get("city") || "") || null;
    const below = belowMinimumWage(city, salary);
    if (below) return setError(`The kasambahay minimum wage in ${city} is ${formatPeso(below)} a month. Enter at least that.`);
    setBusy(true);
    const [r1, r2, r3] = await Promise.all([
      supabase.from("nanny_profiles").update({
        display_name: String(f.get("display_name") || "").trim().slice(0, 120),
        city,
        about: String(f.get("about") || "").trim().slice(0, 1500) || null,
        education: String(f.get("education") || "").trim().slice(0, 120) || null,
        years_experience: Number(f.get("years_experience")) || 0,
        expected_salary_php: salary,
        skills: splitList(String(f.get("skills") || "")),
        languages: splitList(String(f.get("languages") || "")),
        child_age_groups: f.getAll("child_age_groups").map(String),
        arrangement: String(f.get("arrangement") || "") || null,
        rest_day: String(f.get("rest_day") || "").trim().slice(0, 20) || null,
        available_from: String(f.get("available_from") || "") || null,
      }).eq("user_id", userId),
      supabase.from("nanny_private").update({
        emergency_contact_name: String(f.get("emergency_contact_name") || "").trim() || null,
        emergency_contact_phone: String(f.get("emergency_contact_phone") || "").trim() || null,
        adult_confirmed: f.get("adult_confirmed") === "on",
        privacy_consent_at: f.get("privacy_consent") === "on" ? (priv?.privacy_consent_at ?? new Date().toISOString()) : null,
      }).eq("user_id", userId),
      supabase.from("profiles").update({ mobile: String(f.get("mobile") || "").trim() || null, city }).eq("id", userId),
    ]);
    setBusy(false);
    const err = r1.error ?? r2.error ?? r3.error;
    if (err) return setError(err.message.includes("check constraint") ? "Please check your mobile and emergency numbers (digits only, with +63)." : err.message);
    setSaved("Saved.");
    await load();
  }

  async function submit() {
    setBusy(true);
    setError("");
    const { error } = await supabase.from("nanny_profiles").update({ status: "pending" }).eq("user_id", userId);
    setBusy(false);
    if (error) return setError(error.message);
    await load();
  }

  return (
    <>
      <StatusBanner status={np.status} missing={missingRequiredDocuments("nanny", docs)} onSubmit={() => void submit()} busy={busy} error={error} />
      {np.badges.length > 0 && <p className="flex flex-wrap gap-2">{np.badges.map((b) => <span key={b} className="rounded-full bg-verified/15 px-3 py-1 text-sm font-semibold text-verified">{BADGE_LABELS[b] ?? b}</span>)}</p>}

      <Card title="Your profile" note="Families see this once you're verified. Age and gender are never shown.">
        <form onSubmit={(e) => void save(e)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name shown to families"><input name="display_name" defaultValue={np.display_name} className={input} maxLength={120} required /></Field>
          <Field label="Mobile number (private)"><input name="mobile" type="tel" defaultValue={mobile ?? ""} className={input} placeholder="+63 9XX XXX XXXX" /></Field>
          <Field label="City / province"><select name="city" defaultValue={np.city ?? ""} className={input} required><option value="" disabled>Choose</option>{PH_LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Expected monthly salary (₱)"><input name="expected_salary_php" type="number" min={0} step={500} defaultValue={np.expected_salary_php ?? ""} className={input} /></Field>
          <Field label="Highest education"><input name="education" defaultValue={np.education ?? ""} className={input} placeholder="High school / TESDA / College" /></Field>
          <Field label="Years of experience"><input name="years_experience" type="number" min={0} max={60} defaultValue={np.years_experience ?? ""} className={input} /></Field>
          <Field label="Skills (comma-separated)" full><input name="skills" defaultValue={np.skills.join(", ")} className={input} placeholder="Infant care, Cooking, Tutoring, First aid" /></Field>
          <Field label="Languages (comma-separated)" full><input name="languages" defaultValue={np.languages.join(", ")} className={input} placeholder="Filipino, English, Cebuano/Bisaya, Ilocano" /></Field>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">Children I've cared for</legend>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">{CHILD_AGES.map((a) => <label key={a} className="flex items-center gap-1.5"><input type="checkbox" name="child_age_groups" value={a} defaultChecked={np.child_age_groups.includes(a)} className="h-4 w-4 accent-primary" />{a}</label>)}</div>
          </fieldset>
          <Field label="Work arrangement"><select name="arrangement" defaultValue={np.arrangement ?? ""} className={input}><option value="">Choose</option><option value="live_in">Stay-in (live-in)</option><option value="live_out">Stay-out (live-out)</option><option value="either">Either</option></select></Field>
          <Field label="Preferred rest day"><input name="rest_day" defaultValue={np.rest_day ?? ""} className={input} placeholder="Sunday" maxLength={20} /></Field>
          <Field label="Available from"><input name="available_from" type="date" defaultValue={np.available_from ?? ""} className={input} /></Field>
          <Field label="About you" full><textarea name="about" rows={3} defaultValue={np.about ?? ""} className={input} maxLength={1500} /></Field>
          <Field label="Emergency contact name (private)"><input name="emergency_contact_name" defaultValue={priv.emergency_contact_name ?? ""} className={input} /></Field>
          <Field label="Emergency contact number (private)"><input name="emergency_contact_phone" type="tel" defaultValue={priv.emergency_contact_phone ?? ""} className={input} placeholder="+63 9XX XXX XXXX" /></Field>
          <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="adult_confirmed" defaultChecked={priv.adult_confirmed} className="mt-0.5 h-4 w-4 accent-primary" />I confirm I am 18 or older. This stays private.</label>
          <label className="flex items-start gap-2 text-sm sm:col-span-2"><input type="checkbox" name="privacy_consent" defaultChecked={!!priv.privacy_consent_at} className="mt-0.5 h-4 w-4 accent-primary" />I agree that askmynanny may process my ID, photos and clearances only to verify me, under the Data Privacy Act (RA 10173). I never pay any fee to apply.</label>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">Save profile</button>
            {saved && <span role="status" className="text-sm font-semibold text-verified">{saved}</span>}
            {error && <span role="alert" className="text-sm font-semibold text-destructive">{error}</span>}
          </div>
        </form>
      </Card>

      <DocumentsCard userId={userId} accountType="nanny" docs={docs} reload={reload}
        onProfilePhoto={async (path) => { await supabase.from("nanny_profiles").update({ photo_path: path }).eq("user_id", userId); await load(); }} />
      <WorkHistoryCard userId={userId} />
      <RequestsCard userId={userId} role="nanny" />
    </>
  );
}

function WorkHistoryCard({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Tables<"work_history">[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.from("work_history").select("*").eq("nanny_id", userId).order("started_on", { ascending: false });
    setRows(data ?? []);
  }, [userId]);
  useEffect(() => void load(), [load]);

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const f = new FormData(form);
    const { data, error } = await supabase.from("work_history").insert({
      nanny_id: userId,
      employer_name: String(f.get("employer_name") || "").trim().slice(0, 120),
      city: String(f.get("city") || "").trim().slice(0, 60) || null,
      started_on: String(f.get("started_on") || "") ? `${f.get("started_on")}-01` : null,
      ended_on: String(f.get("ended_on") || "") ? `${f.get("ended_on")}-01` : null,
      salary_php: Number(f.get("salary_php")) || null,
      leave_reason: String(f.get("leave_reason") || "").trim().slice(0, 300) || null,
    }).select("id").single();
    if (error) return setError(error.message.includes("check") ? "Check the dates: the end month can't be before the start month." : error.message);
    const contact = String(f.get("contact") || "").trim();
    if (contact && data) await supabase.from("work_history_contacts").insert({ work_history_id: data.id, nanny_id: userId, contact: contact.slice(0, 200) });
    form.reset();
    await load();
  }

  return (
    <Card title="Work history" note="Past employers' contact details stay private. In a later version, askmynanny will ask them to confirm your history.">
      <ul className="mb-5 space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border px-4 py-3 text-sm">
            <span><strong>{r.employer_name}</strong>{r.city ? ` · ${r.city}` : ""} · {r.started_on?.slice(0, 7) ?? "?"} – {r.ended_on?.slice(0, 7) ?? "present"}{r.salary_php ? ` · ${formatPeso(r.salary_php)}/mo` : ""}</span>
            <button onClick={() => void supabase.from("work_history").delete().eq("id", r.id).then(load)} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </li>
        ))}
        {!rows.length && <li className="text-sm text-muted-foreground">No jobs added yet.</li>}
      </ul>
      <form onSubmit={(e) => void add(e)} className="grid gap-3 sm:grid-cols-2">
        <Field label="Employer / family name"><input name="employer_name" required maxLength={120} className={input} placeholder="The Reyes Family" /></Field>
        <Field label="City"><input name="city" maxLength={60} className={input} placeholder="Quezon City" /></Field>
        <Field label="From (month)"><input name="started_on" type="month" className={input} /></Field>
        <Field label="To (month, blank if current)"><input name="ended_on" type="month" className={input} /></Field>
        <Field label="Monthly salary (₱)"><input name="salary_php" type="number" min={0} step={500} className={input} /></Field>
        <Field label="Reason for leaving"><input name="leave_reason" maxLength={300} className={input} /></Field>
        <Field label="Employer's email or phone (private, for confirmation)" full><input name="contact" maxLength={200} className={input} /></Field>
        <div className="sm:col-span-2"><button className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary">Add job</button>{error && <span role="alert" className="ml-3 text-sm font-semibold text-destructive">{error}</span>}</div>
      </form>
    </Card>
  );
}

/* --------------------------- Employer --------------------------- */

function EmployerAccount({ userId, mobile }: { userId: string; mobile: string | null }) {
  const [ep, setEp] = useState<Tables<"employer_profiles"> | null>(null);
  const { docs, reload } = useDocuments(userId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const load = useCallback(async () => {
    const { data } = await supabase.from("employer_profiles").select("*").eq("user_id", userId).maybeSingle();
    setEp(data);
  }, [userId]);
  useEffect(() => void load(), [load]);
  if (!ep) return <p className="text-muted-foreground">Loading your profile…</p>;

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaved("");
    const f = new FormData(e.currentTarget);
    const city = String(f.get("city") || "") || null;
    const offer = Number(f.get("offered_salary_php")) || null;
    const below = belowMinimumWage(city, offer);
    if (below) return setError(`The kasambahay minimum wage in ${city} is ${formatPeso(below)} a month. Offers below it aren't allowed.`);
    setBusy(true);
    const [r1, r2] = await Promise.all([
      supabase.from("employer_profiles").update({
        city,
        household: String(f.get("household") || "").trim().slice(0, 1000) || null,
        duties: String(f.get("duties") || "").trim().slice(0, 1000) || null,
        arrangement: String(f.get("arrangement") || "") || null,
        offered_salary_php: offer,
        benefits: f.getAll("benefits").map(String),
      }).eq("user_id", userId),
      supabase.from("profiles").update({ mobile: String(f.get("mobile") || "").trim() || null, city }).eq("id", userId),
    ]);
    setBusy(false);
    const err = r1.error ?? r2.error;
    if (err) return setError(err.message.includes("check constraint") ? "Please check your mobile number (digits only, with +63)." : err.message);
    setSaved("Saved.");
    await load();
  }

  async function submit() {
    setBusy(true);
    setError("");
    const { error } = await supabase.from("employer_profiles").update({ status: "pending" }).eq("user_id", userId);
    setBusy(false);
    if (error) return setError(error.message);
    await load();
  }

  return (
    <>
      <StatusBanner status={ep.status} missing={missingRequiredDocuments("employer", docs)} onSubmit={() => void submit()} busy={busy} error={error} />
      <p className="rounded-2xl bg-secondary px-4 py-3 text-sm">Employers are verified too, so nannies know your job offer is real. You can contact nannies once you're <strong>Fully verified</strong>. <Link to="/find" className="font-semibold text-primary underline">Browse nannies</Link></p>
      <Card title="Your household and job">
        <form onSubmit={(e) => void save(e)} className="grid gap-4 sm:grid-cols-2">
          <Field label="City / province"><select name="city" defaultValue={ep.city ?? ""} className={input} required><option value="" disabled>Choose</option>{PH_LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Mobile number (private)"><input name="mobile" type="tel" defaultValue={mobile ?? ""} className={input} placeholder="+63 9XX XXX XXXX" /></Field>
          <Field label="Household (children's ages, pets, others at home)" full><textarea name="household" rows={2} defaultValue={ep.household ?? ""} className={input} maxLength={1000} placeholder="2 kids (1 and 4 years old), 1 dog" /></Field>
          <Field label="Duties" full><textarea name="duties" rows={2} defaultValue={ep.duties ?? ""} className={input} maxLength={1000} placeholder="Childcare, light cooking, laundry for the kids" /></Field>
          <Field label="Work arrangement"><select name="arrangement" defaultValue={ep.arrangement ?? ""} className={input}><option value="">Choose</option><option value="live_in">Stay-in (own room provided)</option><option value="live_out">Stay-out</option><option value="either">Either</option></select></Field>
          <Field label="Monthly salary offered (₱)"><input name="offered_salary_php" type="number" min={0} step={500} defaultValue={ep.offered_salary_php ?? ""} className={input} /></Field>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">Benefits you provide (SSS, PhilHealth, Pag-IBIG and 13th month pay are required by the Kasambahay Law)</legend>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">{BENEFITS.map((b) => <label key={b} className="flex items-center gap-1.5"><input type="checkbox" name="benefits" value={b} defaultChecked={ep.benefits.includes(b)} className="h-4 w-4 accent-primary" />{b}</label>)}</div>
          </fieldset>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button disabled={busy} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground disabled:opacity-60">Save</button>
            {saved && <span role="status" className="text-sm font-semibold text-verified">{saved}</span>}
            {error && <span role="alert" className="text-sm font-semibold text-destructive">{error}</span>}
          </div>
        </form>
      </Card>
      <DocumentsCard userId={userId} accountType="employer" docs={docs} reload={reload} />
      <RequestsCard userId={userId} role="employer" />
    </>
  );
}

/* ------------------------ Contact requests ------------------------ */

function RequestsCard({ userId, role }: { userId: string; role: "nanny" | "employer" }) {
  const [rows, setRows] = useState<(Tables<"contact_requests"> & { nanny_name?: string })[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("contact_requests").select("*").eq(role === "nanny" ? "nanny_id" : "employer_id", userId).order("created_at", { ascending: false });
    let list = data ?? [];
    if (role === "employer" && list.length) {
      const { data: names } = await supabase.from("nanny_profiles").select("user_id, display_name").in("user_id", list.map((r) => r.nanny_id));
      const map = new Map((names ?? []).map((n) => [n.user_id, n.display_name]));
      list = list.map((r) => ({ ...r, nanny_name: map.get(r.nanny_id) }));
    }
    setRows(list);
  }, [userId, role]);
  useEffect(() => void load(), [load]);

  const reply = async (id: string, status: "accepted" | "declined") => {
    await supabase.from("contact_requests").update({ status }).eq("id", id);
    await load();
  };

  return (
    <Card title={role === "nanny" ? "Messages from families" : "Your contact requests"}
      note={role === "nanny" ? "Never pay any fee to get a job. Report anyone who asks you for money." : "Never send money to a nanny before she starts work."}>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{role === "employer" ? `To ${r.nanny_name ?? "nanny"}` : "From a verified family"}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("en-PH")} · {r.status}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{r.message}</p>
            {role === "nanny" && r.status === "sent" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => void reply(r.id, "accepted")} className="rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground">Interested</button>
                <button onClick={() => void reply(r.id, "declined")} className="rounded-full border border-border px-4 py-1.5 font-semibold">Not now</button>
              </div>
            )}
          </li>
        ))}
        {!rows.length && <li className="text-sm text-muted-foreground">Nothing yet.</li>}
      </ul>
    </Card>
  );
}
