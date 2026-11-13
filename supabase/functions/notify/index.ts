// notify: sends askmynanny email notifications.
//
// Called by database triggers and the daily expiry job (pg_net) with
// {"type": "profile" | "document" | "contact" | "expiry", "id": "<uuid>"}.
// The function never trusts the request beyond the id: it reads the current state from the
// database and only sends emails that state justifies. Every email is recorded in
// public.notification_log under a unique key, so repeated calls can't send it twice.
// That is why it needs no shared secret and is deployed with verify_jwt = false.
//
// Mail goes out over Gmail SMTP (port 465; Supabase blocks 25 and 587) using an App Password.
// Secrets: SMTP_USER, SMTP_PASS, MAIL_FROM (optional SMTP_HOST, SMTP_PORT, SITE_URL).
// Without SMTP_USER/SMTP_PASS nothing is sent and nothing is recorded, so emails go out once configured.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import {
  adminNewSubmission, documentExpired, documentExpiringSoon, documentRejected, expiryStage, manilaToday,
  newContactRequest, profileNeedsChanges, profileVerified, submissionReceived, type AccountType, type Mail,
} from "./templates.ts";

const SITE = Deno.env.get("SITE_URL") ?? "https://askmynanny.netlify.app";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function serviceKey(): string {
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    if (typeof keys.default === "string") return keys.default;
  } catch { /* fall back below */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}
const db = createClient(Deno.env.get("SUPABASE_URL") ?? "", serviceKey(), { auth: { persistSession: false } });

const mailConfigured = () => Boolean(Deno.env.get("SMTP_USER") && Deno.env.get("SMTP_PASS"));

/** Sends one email per recipient. Never throws; logs only the error type, never addresses or content. */
async function send(to: string[], mail: Mail): Promise<number> {
  if (!to.length) return 0;
  const user = Deno.env.get("SMTP_USER")!;
  const client = new SMTPClient({
    connection: {
      hostname: Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com",
      port: Number(Deno.env.get("SMTP_PORT") ?? 465),
      tls: true,
      auth: { username: user, password: Deno.env.get("SMTP_PASS")! },
    },
  });
  let sent = 0;
  try {
    for (const address of to) {
      try {
        await client.send({ from: Deno.env.get("MAIL_FROM") ?? `askmynanny <${user}>`, to: address, subject: mail.subject, content: mail.text, html: mail.html });
        sent++;
      } catch (err) {
        console.error("notify: send failed", (err as Error)?.name ?? "unknown");
      }
    }
  } finally {
    try { await client.close(); } catch { /* ignore */ }
  }
  return sent;
}

/** Records the notification; false if it was already sent. */
async function claim(key: string): Promise<boolean> {
  const { error } = await db.from("notification_log").insert({ key });
  return !error;
}
const release = (key: string) => db.from("notification_log").delete().eq("key", key);

async function emailOf(userId: string): Promise<string[]> {
  const { data } = await db.auth.admin.getUserById(userId);
  return data.user?.email ? [data.user.email] : [];
}

async function adminEmails(): Promise<string[]> {
  const { data } = await db.auth.admin.listUsers({ perPage: 1000 });
  return (data?.users ?? []).filter((u) => u.app_metadata?.role === "admin" && u.email).map((u) => u.email!);
}

/** Runs the sends for a claimed key; releases the key if nothing could be delivered so it can be retried. */
async function deliver(key: string, jobs: [string[], Mail][]): Promise<number> {
  if (!(await claim(key))) return 0;
  let sent = 0;
  for (const [to, mail] of jobs) sent += await send(to, mail);
  if (sent === 0) await release(key);
  return sent;
}

async function onProfile(userId: string): Promise<number> {
  const { data: profile } = await db.from("profiles").select("account_type, full_name").eq("id", userId).maybeSingle();
  if (!profile) return 0;
  const type = profile.account_type as AccountType;
  const table = type === "nanny" ? "nanny_profiles" : "employer_profiles";
  const { data: row } = await db.from(table).select("status, city, updated_at").eq("user_id", userId).maybeSingle();
  if (!row) return 0;
  const key = `profile:${userId}:${row.status}:${row.updated_at}`;
  const base = { accountType: type, fullName: profile.full_name, siteUrl: SITE };

  if (row.status === "pending") {
    const { count } = await db.from("documents").select("id", { count: "exact", head: true }).eq("owner_id", userId).neq("status", "rejected");
    return deliver(key, [
      [await adminEmails(), adminNewSubmission({ ...base, city: row.city, documentCount: count ?? 0 })],
      [await emailOf(userId), submissionReceived(base)],
    ]);
  }
  if (row.status === "verified") return deliver(key, [[await emailOf(userId), profileVerified(base)]]);
  if (row.status === "rejected") {
    const { data: docs } = await db.from("documents").select("kind, review_note").eq("owner_id", userId).eq("status", "rejected").not("review_note", "is", null);
    const notes = (docs ?? []).map((d) => d.review_note as string);
    return deliver(key, [[await emailOf(userId), profileNeedsChanges({ fullName: profile.full_name, notes, siteUrl: SITE })]]);
  }
  return 0;
}

async function onDocument(id: string): Promise<number> {
  const { data: doc } = await db.from("documents").select("owner_id, kind, status, review_note").eq("id", id).maybeSingle();
  if (!doc || doc.status !== "rejected") return 0;
  const { data: profile } = await db.from("profiles").select("full_name").eq("id", doc.owner_id).maybeSingle();
  return deliver(`document:${id}:rejected`, [
    [await emailOf(doc.owner_id), documentRejected({ fullName: profile?.full_name ?? null, kind: doc.kind, note: doc.review_note, siteUrl: SITE })],
  ]);
}

async function onContact(id: string): Promise<number> {
  const { data: req } = await db.from("contact_requests").select("nanny_id").eq("id", id).maybeSingle();
  if (!req) return 0;
  const { data: nanny } = await db.from("nanny_profiles").select("display_name").eq("user_id", req.nanny_id).maybeSingle();
  return deliver(`contact:${id}`, [[await emailOf(req.nanny_id), newContactRequest({ fullName: nanny?.display_name ?? null, siteUrl: SITE })]]);
}

/** Daily job: remind 4 weeks before an approved document's "valid until" date, and again once it has expired. */
async function onExpiry(id: string): Promise<number> {
  const { data: doc } = await db.from("documents").select("owner_id, kind, status, expires_on").eq("id", id).maybeSingle();
  if (!doc || doc.status !== "approved" || !doc.expires_on) return 0;
  const stage = expiryStage(doc.expires_on, manilaToday());
  if (!stage) return 0;
  const { data: profile } = await db.from("profiles").select("full_name").eq("id", doc.owner_id).maybeSingle();
  const base = { fullName: profile?.full_name ?? null, kind: doc.kind, expiresOn: doc.expires_on, siteUrl: SITE };
  const mail = stage.stage === "soon" ? documentExpiringSoon({ ...base, days: stage.days }) : documentExpired(base);
  return deliver(`expiry:${stage.stage}:${id}:${doc.expires_on}`, [[await emailOf(doc.owner_id), mail]]);
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method not allowed" }, 405);
  let payload: { type?: unknown; id?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "invalid body" }, 400);
  }
  const id = typeof payload.id === "string" && UUID.test(payload.id) ? payload.id : null;
  const handler = payload.type === "profile" ? onProfile : payload.type === "document" ? onDocument : payload.type === "contact" ? onContact : payload.type === "expiry" ? onExpiry : null;
  if (!id || !handler) return json({ ok: false, error: "invalid request" }, 400);
  if (!mailConfigured()) return json({ ok: true, sent: 0, note: "mail not configured" });
  try {
    return json({ ok: true, sent: await handler(id) });
  } catch (err) {
    console.error("notify: failed", (err as Error)?.name ?? "unknown");
    return json({ ok: false, error: "notification failed" }, 500);
  }
});
