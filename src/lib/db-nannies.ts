import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { isPhLocation } from "@/lib/locations";
import type { Nanny } from "@/lib/nannies";

type Row = Tables<"nanny_profiles"> & { work_history: Tables<"work_history">[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID.test(s);

/** Converts a verified nanny from the database into the shape the pages use. */
export function toNanny(row: Row): Nanny | null {
  if (!row.city || !isPhLocation(row.city)) return null;
  return {
    id: row.user_id,
    name: row.display_name || "Verified nanny",
    photo: row.photo_path ? supabase.storage.from("profile-photos").getPublicUrl(row.photo_path).data.publicUrl : "",
    location: row.city,
    education: row.education ?? "",
    years: row.years_experience ?? 0,
    expectedSalary: row.expected_salary_php ?? 0,
    skills: row.skills,
    benefitsWanted: [],
    languages: row.languages,
    verified: row.status === "verified",
    about: row.about ?? "",
    badges: row.badges,
    history: row.work_history.map((w) => ({
      employer: w.employer_name,
      location: w.city ?? "",
      from: w.started_on?.slice(0, 4) ?? "",
      to: w.ended_on?.slice(0, 4) ?? "present",
      salary: w.salary_php,
      benefits: w.benefits,
      leaveReason: w.leave_reason ?? "",
      ...(w.confirmed && w.rating ? { rating: w.rating, review: w.review ?? "" } : {}),
    })),
  };
}

/** Verified nannies only: the database's access rules hide everyone else from the public. */
export async function fetchVerifiedNannies(): Promise<Nanny[]> {
  const { data, error } = await supabase.from("nanny_profiles").select("*, work_history(*)").eq("status", "verified");
  if (error) return [];
  return (data as Row[]).map(toNanny).filter((n): n is Nanny => n !== null);
}

export async function fetchVerifiedNanny(id: string): Promise<Nanny | null> {
  if (!isUuid(id)) return null;
  const { data } = await supabase.from("nanny_profiles").select("*, work_history(*)").eq("user_id", id).eq("status", "verified").maybeSingle();
  return data ? toNanny(data as Row) : null;
}
