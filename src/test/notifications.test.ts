import { describe, expect, it } from "vitest";

import {
  adminNewSubmission, documentRejected, firstName, newContactRequest, profileNeedsChanges, profileVerified,
  shortName, submissionReceived,
} from "../../supabase/functions/notify/templates";

const site = "https://askmynanny.example";

describe("Email notifications", () => {
  it("shows admins only a short name, the city and a link to the review page", () => {
    const mail = adminNewSubmission({ accountType: "nanny", fullName: "Maria Dela Cruz", city: "Cebu", documentCount: 4, siteUrl: site });
    expect(mail.subject).toBe("New nanny to verify: Maria C.");
    expect(mail.text).toContain("Maria C. from Cebu submitted 4 documents");
    expect(mail.text).toContain(`${site}/admin`);
    expect(mail.text).not.toContain("Dela Cruz");
  });

  it("tells the registrant what happens next for their account type", () => {
    expect(submissionReceived({ accountType: "nanny", fullName: "Maria Santos", siteUrl: site }).text).toContain("families can find your profile");
    expect(submissionReceived({ accountType: "employer", fullName: "Ana Reyes", siteUrl: site }).text).toContain("contact verified nannies");
    expect(profileVerified({ accountType: "employer", fullName: "Ana Reyes", siteUrl: site }).text).toContain(`${site}/find`);
  });

  it("passes on the admin's notes when changes are needed", () => {
    const mail = profileNeedsChanges({ fullName: "Maria", notes: ["ID photo is blurry", "  "], siteUrl: site });
    expect(mail.text).toContain("• ID photo is blurry");
    expect(mail.text).not.toContain("•  ");
    expect(documentRejected({ fullName: "Maria", kind: "nbi_clearance", note: null, siteUrl: site }).subject).toBe("Please upload your NBI clearance again");
  });

  it("escapes HTML so names and notes can't inject markup", () => {
    const mail = profileNeedsChanges({ fullName: "<script>alert(1)</script>", notes: ['<img src=x onerror="hack">'], siteUrl: site });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).not.toContain("<img");
    expect(mail.html).toContain("&lt;img");
  });

  it("never includes the family's message or contact details in the nanny's email", () => {
    const mail = newContactRequest({ fullName: "Maria", siteUrl: site });
    expect(mail.text).toContain("Sign in to read it");
    expect(mail.text).toContain("Never pay any fee");
  });

  it("formats names safely", () => {
    expect(firstName("  Maria  Santos ")).toBe("Maria");
    expect(firstName("")).toBe("there");
    expect(shortName("rosalie dela cruz")).toBe("rosalie C.");
    expect(shortName(null)).toBe("New user");
  });
});
