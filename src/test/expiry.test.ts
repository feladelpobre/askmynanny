import { describe, expect, it } from "vitest";

import {
  EMPLOYER_REQUESTED_DOCUMENTS, EXPIRY_REMINDER_DAYS, OPTIONAL_DOCUMENTS, REQUIRED_DOCUMENTS, expiryState, todayInManila,
} from "@/lib/verification";
import {
  EXPIRY_REMINDER_DAYS as EMAIL_REMINDER_DAYS, documentExpired, documentExpiringSoon, expiryStage, formatDate, manilaToday,
} from "../../supabase/functions/notify/templates";

const site = "https://askmynanny.example";

describe("Document requirements", () => {
  it("requires only a government ID and live ID photo; employer documents stay optional", () => {
    for (const type of ["nanny", "employer"] as const) {
      expect(REQUIRED_DOCUMENTS[type]).toEqual(expect.arrayContaining(["government_id", "id_live_photo"]));
      for (const k of EMPLOYER_REQUESTED_DOCUMENTS) expect(REQUIRED_DOCUMENTS[type]).not.toContain(k);
    }
    for (const k of EMPLOYER_REQUESTED_DOCUMENTS) expect(OPTIONAL_DOCUMENTS).toContain(k);
  });
});

describe("Document expiry", () => {
  it("reminds 4 weeks before the valid-until date, which still counts as valid", () => {
    expect(EXPIRY_REMINDER_DAYS).toBe(28);
    expect(EMAIL_REMINDER_DAYS).toBe(EXPIRY_REMINDER_DAYS);
    expect(expiryState("2026-12-11", "2026-11-12")).toEqual({ state: "valid", days: 29 });
    expect(expiryState("2026-12-11", "2026-11-13")).toEqual({ state: "expiring", days: 28 });
    expect(expiryState("2026-12-11", "2026-12-11")).toEqual({ state: "expiring", days: 0 });
    expect(expiryState("2026-12-11", "2026-12-12")).toEqual({ state: "expired", days: -1 });
    expect(expiryState(null, "2026-12-12")).toEqual({ state: "none", days: null });
  });

  it("the email job uses the same rule as the app", () => {
    for (const today of ["2026-11-12", "2026-11-13", "2026-12-11", "2026-12-12"]) {
      const app = expiryState("2026-12-11", today).state;
      const email = expiryStage("2026-12-11", today)?.stage ?? null;
      expect(email).toBe(app === "expiring" ? "soon" : app === "expired" ? "expired" : null);
    }
  });

  it("uses the Philippine date (UTC+8)", () => {
    const lateEveningUtc = Date.parse("2026-12-11T17:00:00Z"); // 1:00 AM Dec 12 in Manila
    expect(todayInManila(lateEveningUtc)).toBe("2026-12-12");
    expect(manilaToday(lateEveningUtc)).toBe("2026-12-12");
  });

  it("writes clear reminder and expiry emails that say the document is optional", () => {
    const soon = documentExpiringSoon({ fullName: "Maria Santos", kind: "nbi_clearance", expiresOn: "2026-12-11", days: 26, siteUrl: site });
    expect(soon.subject).toBe("Your NBI clearance expires in 26 days");
    expect(soon.text).toContain("valid until Dec 11, 2026");
    expect(soon.text).toContain("the employer pays for it");
    const past = documentExpired({ fullName: "Maria Santos", kind: "nbi_clearance", expiresOn: "2026-12-11", siteUrl: site });
    expect(past.subject).toBe("Your NBI clearance has expired");
    expect(past.text).toContain("still Fully Verified");
    expect(formatDate("2026-01-05")).toBe("Jan 5, 2026");
  });
});
