// Email templates for askmynanny notifications. Pure functions (no Deno or Node APIs)
// so they can be unit tested. Emails never contain IDs, photos, phone numbers or
// messages from other users: only a short notice and a link back into the app.

export type Mail = { subject: string; text: string; html: string };
export type AccountType = "nanny" | "employer";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/** "Maria Santos" -> "Maria"; empty -> "there". */
export function firstName(full: string | null | undefined): string {
  const first = (full ?? "").trim().split(/\s+/)[0] ?? "";
  return first.slice(0, 40) || "there";
}

/** "Maria Dela Cruz" -> "Maria D." (admins see this, not the full name). */
export function shortName(full: string | null | undefined): string {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "New user";
  const first = parts[0]!.slice(0, 40);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1]!.charAt(0).toUpperCase()}.` : first;
}

export const DOCUMENT_LABELS: Record<string, string> = {
  profile_photo: "profile photo",
  id_live_photo: "live photo holding your ID",
  government_id: "government ID",
  nbi_clearance: "NBI clearance",
  police_clearance: "police clearance",
  barangay_clearance: "barangay clearance",
  tesda_certificate: "TESDA certificate",
  first_aid_certificate: "first aid certificate",
  medical_certificate: "medical certificate",
  other_certificate: "certificate",
};

function build(subject: string, title: string, paragraphs: string[], cta: { label: string; url: string }, footer: string): Mail {
  const text = [...paragraphs, "", `${cta.label}: ${cta.url}`, "", footer].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#17323a;max-width:560px">
<h2 style="color:#0f6b66;margin:0 0 12px">${esc(title)}</h2>
${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("\n")}
<p><a href="${esc(cta.url)}" style="display:inline-block;background:#0f6b66;color:#ffffff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">${esc(cta.label)}</a></p>
<p style="color:#6b7b80;font-size:13px">${esc(footer)}</p></div>`;
  return { subject, text, html };
}

const FOOTER = "askmynanny · Verified nannies for Filipino families. askmynanny never asks nannies for fees and never asks you to send money.";
const accountUrl = (site: string) => `${site.replace(/\/$/, "")}/account`;

/** To admins: someone submitted their documents for verification. */
export function adminNewSubmission(p: { accountType: AccountType; fullName: string | null; city: string | null; documentCount: number; siteUrl: string }): Mail {
  const who = p.accountType === "nanny" ? "nanny" : "family (employer)";
  const name = shortName(p.fullName);
  return build(
    `New ${p.accountType === "nanny" ? "nanny" : "employer"} to verify: ${name}`,
    `New ${who} to verify`,
    [
      `${name}${p.city ? ` from ${p.city}` : ""} submitted ${p.documentCount} document${p.documentCount === 1 ? "" : "s"} for verification.`,
      "Compare the live photo with the government ID, check any clearances for expiry, then verify the profile or mark it as needing changes.",
    ],
    { label: "Open admin review", url: `${p.siteUrl.replace(/\/$/, "")}/admin` },
    FOOTER,
  );
}

/** To the registrant: we received your submission. */
export function submissionReceived(p: { accountType: AccountType; fullName: string | null; siteUrl: string }): Mail {
  return build(
    "We received your verification documents",
    "Thanks, we got your documents",
    [
      `Hi ${firstName(p.fullName)}, your documents are now with the askmynanny team for review. This usually takes 1–2 days.`,
      p.accountType === "nanny"
        ? "Once you're Fully Verified, families can find your profile and contact you."
        : "Once you're Fully Verified, you can contact verified nannies.",
    ],
    { label: "View my account", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}

/** To the registrant: fully verified. */
export function profileVerified(p: { accountType: AccountType; fullName: string | null; siteUrl: string }): Mail {
  return build(
    "You're Fully Verified on askmynanny",
    "You're Fully Verified",
    [
      `Congratulations, ${firstName(p.fullName)}! Your identity has been verified.`,
      p.accountType === "nanny"
        ? "Families can now find your profile and send you messages. Keep your availability and salary up to date."
        : "You can now contact Fully Verified nannies from their profiles.",
    ],
    { label: p.accountType === "nanny" ? "View my account" : "Find a nanny", url: p.accountType === "nanny" ? accountUrl(p.siteUrl) : `${p.siteUrl.replace(/\/$/, "")}/find` },
    FOOTER,
  );
}

/** To the registrant: the admin needs changes. */
export function profileNeedsChanges(p: { fullName: string | null; notes: string[]; siteUrl: string }): Mail {
  const notes = p.notes.map((n) => n.trim()).filter(Boolean).slice(0, 5);
  return build(
    "Your askmynanny verification needs changes",
    "A few changes are needed",
    [
      `Hi ${firstName(p.fullName)}, we couldn't verify your profile yet.`,
      ...(notes.length ? notes.map((n) => `• ${n}`) : ["Please check your documents and details, then submit again."]),
      "Fix these in your account and submit again.",
    ],
    { label: "Fix my documents", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}

/** To the registrant: one document was rejected. */
export function documentRejected(p: { fullName: string | null; kind: string; note: string | null; siteUrl: string }): Mail {
  const label = DOCUMENT_LABELS[p.kind] ?? "document";
  return build(
    `Please upload your ${label} again`,
    `Please upload your ${label} again`,
    [
      `Hi ${firstName(p.fullName)}, the ${label} you uploaded couldn't be approved.`,
      `Reason: ${(p.note ?? "").trim() || "it wasn't clear enough to read."}`,
    ],
    { label: "Upload again", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}

/** To a nanny: a verified family sent a message. The message itself stays in the app. */
export function newContactRequest(p: { fullName: string | null; siteUrl: string }): Mail {
  return build(
    "A verified family wants to talk to you",
    "A verified family sent you a message",
    [
      `Hi ${firstName(p.fullName)}, a Fully Verified family on askmynanny sent you a message.`,
      "Sign in to read it and reply. Never pay any fee to get a job, and report anyone who asks for money.",
    ],
    { label: "Read the message", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}

/** Same 4-week window as the app (src/lib/verification.ts EXPIRY_REMINDER_DAYS). */
export const EXPIRY_REMINDER_DAYS = 28;

/** Today's date as YYYY-MM-DD in the Philippines (UTC+8). */
export function manilaToday(now = Date.now()): string {
  return new Date(now + 8 * 3_600_000).toISOString().slice(0, 10);
}

/** "soon" within 28 days of the "valid until" date (inclusive), "expired" after it, otherwise null. */
export function expiryStage(expiresOn: string | null, today: string): { stage: "soon" | "expired"; days: number } | null {
  if (!expiresOn) return null;
  const days = Math.round((Date.parse(`${expiresOn}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
  if (Number.isNaN(days)) return null;
  if (days < 0) return { stage: "expired", days };
  return days <= EXPIRY_REMINDER_DAYS ? { stage: "soon", days } : null;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-12-11" -> "Dec 11, 2026". */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${MONTHS[m - 1]} ${d}, ${y}` : iso;
}

const OPTIONAL_NOTE = "This document is optional on askmynanny. Under the Kasambahay Law, a hiring employer may ask for it before signing a contract, and the employer pays for it.";

/** To a nanny: an approved clearance or certificate expires within 4 weeks. */
export function documentExpiringSoon(p: { fullName: string | null; kind: string; expiresOn: string; days: number; siteUrl: string }): Mail {
  const label = DOCUMENT_LABELS[p.kind] ?? "document";
  const when = p.days === 0 ? "today" : `in ${p.days} day${p.days === 1 ? "" : "s"}`;
  return build(
    `Your ${label} expires ${when}`,
    `Your ${label} expires ${when}`,
    [
      `Hi ${firstName(p.fullName)}, your ${label} is valid until ${formatDate(p.expiresOn)}.`,
      "If you'd like to keep its badge on your profile, upload a new one before then. Once it expires, the badge is removed automatically.",
      OPTIONAL_NOTE,
    ],
    { label: "Upload a new one", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}

/** To a nanny: an approved clearance or certificate has expired and its badge was removed. */
export function documentExpired(p: { fullName: string | null; kind: string; expiresOn: string; siteUrl: string }): Mail {
  const label = DOCUMENT_LABELS[p.kind] ?? "document";
  return build(
    `Your ${label} has expired`,
    `Your ${label} has expired`,
    [
      `Hi ${firstName(p.fullName)}, your ${label} expired on ${formatDate(p.expiresOn)}, so its badge was removed from your profile.`,
      "You are still Fully Verified. Upload a new one any time to get the badge back.",
      OPTIONAL_NOTE,
    ],
    { label: "Upload a new one", url: accountUrl(p.siteUrl) },
    FOOTER,
  );
}
