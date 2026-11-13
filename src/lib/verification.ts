import type { Enums } from "@/integrations/supabase/types";

export type DocumentKind = Enums<"document_kind">;
export type AccountType = Enums<"account_type">;
export type ReviewStatus = Enums<"review_status">;

export const DOCUMENT_LABELS: Record<DocumentKind, string> = {
  profile_photo: "Profile photo",
  id_live_photo: "Live photo holding your ID",
  government_id: "Government ID (PhilSys, UMID, passport, driver's license, postal ID)",
  nbi_clearance: "NBI clearance",
  police_clearance: "Police clearance",
  barangay_clearance: "Barangay clearance",
  tesda_certificate: "TESDA NC II certificate",
  first_aid_certificate: "First aid / CPR certificate",
  medical_certificate: "Medical certificate",
  other_certificate: "Other certificate or training",
};

/** Documents that must be uploaded before a profile can be submitted for review (mirrors the database check). */
export const REQUIRED_DOCUMENTS: Record<AccountType, DocumentKind[]> = {
  nanny: ["profile_photo", "id_live_photo", "government_id"],
  employer: ["id_live_photo", "government_id"],
};

/** Optional uploads that earn public badges once an admin approves them. */
export const OPTIONAL_DOCUMENTS: DocumentKind[] = [
  "nbi_clearance",
  "police_clearance",
  "barangay_clearance",
  "tesda_certificate",
  "first_aid_certificate",
  "medical_certificate",
  "other_certificate",
];

/** Documents that expire and should carry an expiry date. */
export const EXPIRING_DOCUMENTS: DocumentKind[] = ["nbi_clearance", "police_clearance", "barangay_clearance", "medical_certificate"];

export const BADGE_LABELS: Record<string, string> = {
  nbi_cleared: "NBI Cleared",
  police_cleared: "Police Cleared",
  barangay_cleared: "Barangay Cleared",
  tesda_certified: "TESDA Certified",
  first_aid_certified: "First Aid Trained",
  medically_fit: "Medically Fit",
};

export const STATUS_LABELS: Record<ReviewStatus, string> = {
  draft: "Not submitted",
  pending: "Under review",
  verified: "Fully verified",
  rejected: "Needs changes",
};

/** Required documents still missing, ignoring rejected uploads (same rule as the database). */
export function missingRequiredDocuments(
  accountType: AccountType,
  uploads: { kind: DocumentKind; status: Enums<"document_status"> }[],
): DocumentKind[] {
  const have = new Set(uploads.filter((u) => u.status !== "rejected").map((u) => u.kind));
  return REQUIRED_DOCUMENTS[accountType].filter((k) => !have.has(k));
}

/** An employer may contact a nanny only when both are fully verified. */
export function canContact(employerStatus: ReviewStatus | null | undefined, nannyStatus: ReviewStatus | null | undefined): boolean {
  return employerStatus === "verified" && nannyStatus === "verified";
}

/**
 * Kasambahay monthly minimum wages we have confirmed. Metro Manila: ₱7,800 under
 * Wage Order No. NCR-DW-06, effective 7 February 2026. Other regions set their own
 * rates; add them here once confirmed with DOLE or the regional wage board.
 */
export const KASAMBAHAY_MINIMUM_WAGE: Partial<Record<string, number>> = { "Metro Manila": 7800 };

/** Returns the confirmed minimum if the amount is below it for that location, otherwise null. */
export function belowMinimumWage(location: string | null | undefined, monthlyPhp: number | null | undefined): number | null {
  const min = location ? KASAMBAHAY_MINIMUM_WAGE[location] : undefined;
  if (min === undefined || monthlyPhp === null || monthlyPhp === undefined) return null;
  return monthlyPhp < min ? min : null;
}

const SAFE_NAME = /[^a-zA-Z0-9._-]/g;

/** Storage path inside the user's own folder, e.g. "<uid>/nbi_clearance-1700000000000-scan.pdf". */
export function documentPath(userId: string, kind: DocumentKind, fileName: string, now = Date.now()): string {
  const clean = fileName.replace(SAFE_NAME, "_").replace(/\.{2,}/g, ".").slice(-60) || "file";
  return `${userId}/${kind}-${now}-${clean}`;
}
