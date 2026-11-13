import { describe, expect, it } from "vitest";

import { belowMinimumWage, canContact, documentPath, missingRequiredDocuments, REQUIRED_DOCUMENTS } from "@/lib/verification";

describe("Verification rules", () => {
  it("requires a profile photo, live ID photo and government ID from nannies", () => {
    expect(missingRequiredDocuments("nanny", [])).toEqual(REQUIRED_DOCUMENTS.nanny);
    expect(
      missingRequiredDocuments("nanny", [
        { kind: "profile_photo", status: "pending" },
        { kind: "id_live_photo", status: "approved" },
        { kind: "government_id", status: "pending" },
      ]),
    ).toEqual([]);
  });

  it("treats rejected uploads as missing", () => {
    expect(missingRequiredDocuments("employer", [
      { kind: "id_live_photo", status: "rejected" },
      { kind: "government_id", status: "approved" },
    ])).toEqual(["id_live_photo"]);
  });

  it("only lets a verified employer contact a verified nanny", () => {
    expect(canContact("verified", "verified")).toBe(true);
    expect(canContact("pending", "verified")).toBe(false);
    expect(canContact("verified", "pending")).toBe(false);
    expect(canContact(null, "verified")).toBe(false);
  });

  it("flags salaries below the confirmed Metro Manila kasambahay minimum", () => {
    expect(belowMinimumWage("Metro Manila", 7000)).toBe(7800);
    expect(belowMinimumWage("Metro Manila", 7800)).toBeNull();
    expect(belowMinimumWage("Cebu", 7000)).toBeNull();
    expect(belowMinimumWage("Metro Manila", null)).toBeNull();
  });

  it("stores uploads inside the user's own folder with a safe file name", () => {
    const path = documentPath("user-123", "nbi_clearance", "../my NBI (1).pdf", 1000);
    expect(path.startsWith("user-123/nbi_clearance-1000-")).toBe(true);
    expect(path).not.toContain("..");
    expect(path).not.toMatch(/[ ()]/);
  });
});
