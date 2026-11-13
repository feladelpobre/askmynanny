import { describe, expect, it } from "vitest";

import { formatPeso, isPhLocation, PH_LOCATIONS } from "@/lib/locations";
import { filterNannies, nannies, SALARY_FILTER, type NannyFilters } from "@/lib/nannies";

const all: NannyFilters = { q: "", location: "", maxSalary: SALARY_FILTER.max, skills: [], verifiedOnly: false };

describe("Philippine locations and pesos", () => {
  it("offers Philippine cities including Metro Manila, Cebu and Davao", () => {
    for (const city of ["Metro Manila", "Cebu", "Davao"]) expect(isPhLocation(city)).toBe(true);
    expect(isPhLocation("Singapore")).toBe(false);
  });

  it("only lists sample nannies who are in the Philippines", () => {
    for (const n of nannies) expect(PH_LOCATIONS).toContain(n.location);
  });

  it("formats salaries in pesos", () => {
    expect(formatPeso(12000)).toBe("₱12,000");
  });
});

describe("Find a Nanny filters", () => {
  it("returns everyone with no filters set", () => {
    expect(filterNannies(nannies, all)).toHaveLength(nannies.length);
  });

  it("filters by location", () => {
    const out = filterNannies(nannies, { ...all, location: "Cebu" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((n) => n.location === "Cebu")).toBe(true);
  });

  it("filters by maximum salary and verification", () => {
    const out = filterNannies(nannies, { ...all, maxSalary: 12000, verifiedOnly: true });
    expect(out.every((n) => n.expectedSalary <= 12000 && n.verified)).toBe(true);
  });

  it("has no age or gender data to filter on (RA 10911)", () => {
    for (const n of nannies) {
      expect(n).not.toHaveProperty("age");
      expect(n).not.toHaveProperty("gender");
    }
  });
});
