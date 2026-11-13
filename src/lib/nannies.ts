import n1 from "@/assets/n1.jpg";
import n2 from "@/assets/n2.jpg";
import n3 from "@/assets/n3.jpg";
import n4 from "@/assets/n4.jpg";
import { PH_LOCATIONS, type PhLocation } from "@/lib/locations";

// Sample profiles for the preview. Age and gender are intentionally not part of a
// profile: the Anti-Age Discrimination in Employment Act (RA 10911) bans age
// preferences in hiring, so the app never shows or filters by them. Registration
// only records a private 18+ confirmation.

export type Job = {
  employer: string;
  location: string;
  from: string;
  to: string;
  /** Monthly salary in Philippine pesos. */
  salary: number;
  benefits: string[];
  leaveReason: string;
  rating: number;
  review: string;
};

export type Nanny = {
  id: string;
  name: string;
  photo: string;
  location: PhLocation;
  education: string;
  years: number;
  /** Expected monthly salary in Philippine pesos. */
  expectedSalary: number;
  skills: string[];
  benefitsWanted: string[];
  languages: string[];
  verified: boolean;
  about: string;
  history: Job[];
};

export const nannies: Nanny[] = [
  {
    id: "maria-santos", name: "Maria Santos", photo: n1, location: "Metro Manila",
    education: "College — Early Childhood Education", years: 9, expectedSalary: 14000,
    skills: ["Infant care", "First aid", "Cooking", "Tutoring"], benefitsWanted: ["Own room", "1 day off weekly", "SSS, PhilHealth & Pag-IBIG"],
    languages: ["Filipino", "English"], verified: true,
    about: "Patient and caring nanny with nearly a decade of experience raising toddlers and newborns.",
    history: [
      { employer: "The Tan Family", location: "Quezon City", from: "2021", to: "2025", salary: 13000, benefits: ["Own room", "SSS, PhilHealth & Pag-IBIG", "13th month pay"], leaveReason: "Family relocated overseas", rating: 5, review: "Maria was like family to us. Our twins adored her and she was always reliable." },
      { employer: "The Lim Family", location: "Makati", from: "2017", to: "2021", salary: 10000, benefits: ["Own room", "Day off weekly"], leaveReason: "Children started full-day school", rating: 5, review: "Very responsible, great cook, and wonderful with homework." },
    ],
  },
  {
    id: "rosalie-dela-cruz", name: "Rosalie Dela Cruz", photo: n2, location: "Cebu",
    education: "High school diploma", years: 15, expectedSalary: 10000,
    skills: ["Elderly care", "Cooking", "Housekeeping", "Toddler care"], benefitsWanted: ["Own room", "13th month pay"],
    languages: ["Cebuano/Bisaya", "Filipino", "English"], verified: true,
    about: "Calm, organized and experienced with both children and elderly family members.",
    history: [
      { employer: "The Gonzales Family", location: "Cebu City", from: "2016", to: "2024", salary: 9000, benefits: ["Own room", "13th month pay"], leaveReason: "Grandparent passed away; role ended", rating: 5, review: "Rosalie cared for our mother and kids with so much kindness. Highly recommended." },
    ],
  },
  {
    id: "jenny-reyes", name: "Jenny Reyes", photo: n3, location: "Davao",
    education: "Diploma — Child Psychology", years: 4, expectedSalary: 11000,
    skills: ["Tutoring", "Swimming", "Arts & crafts", "First aid"], benefitsWanted: ["Weekends off", "Transport allowance"],
    languages: ["Cebuano/Bisaya", "English", "Filipino"], verified: false,
    about: "Energetic and creative, I love planning learning activities for school-age kids.",
    history: [
      { employer: "The Wong Family", location: "Davao City", from: "2022", to: "2025", salary: 10000, benefits: ["Transport allowance"], leaveReason: "Contract completed", rating: 4, review: "Great with our kids' studies and very fun. Sometimes late but always communicated." },
    ],
  },
  {
    id: "lorna-villanueva", name: "Lorna Villanueva", photo: n4, location: "Baguio",
    education: "College — Nursing (2 years)", years: 22, expectedSalary: 16000,
    skills: ["Newborn care", "Special needs", "First aid", "Cooking"], benefitsWanted: ["SSS, PhilHealth & Pag-IBIG", "Own room"],
    languages: ["Ilocano", "Filipino", "English"], verified: true,
    about: "Former nursing student with over twenty years supporting newborns and children with special needs.",
    history: [
      { employer: "The Chen Family", location: "Baguio City", from: "2015", to: "2025", salary: 15000, benefits: ["Own room", "SSS, PhilHealth & Pag-IBIG", "Annual leave"], leaveReason: "Employer retired and moved to a smaller home", rating: 5, review: "Lorna is extraordinary with our son who has autism. Truly a blessing." },
      { employer: "The Patel Family", location: "Pasig", from: "2008", to: "2015", salary: 8000, benefits: ["Accommodation", "13th month pay"], leaveReason: "Wanted to be closer to family", rating: 5, review: "Trustworthy, skilled and calm in every situation." },
    ],
  },
];

export const allSkills = Array.from(new Set(nannies.flatMap((n) => n.skills))).sort();
/** All searchable locations, whether or not a sample nanny is there yet. */
export const allLocations: readonly PhLocation[] = PH_LOCATIONS;
export const avgRating = (n: Nanny) =>
  n.history.length ? n.history.reduce((s, j) => s + j.rating, 0) / n.history.length : 0;

export const SALARY_FILTER = { min: 6000, max: 20000, step: 500 } as const;

export type NannyFilters = {
  q: string;
  location: string;
  maxSalary: number;
  skills: string[];
  verifiedOnly: boolean;
};

/** The Find a Nanny filters. There is deliberately no age or gender filter (RA 10911). */
export function filterNannies(list: Nanny[], f: NannyFilters): Nanny[] {
  const q = f.q.trim().toLowerCase();
  return list.filter(
    (n) =>
      (!q || (n.name + " " + n.about + " " + n.skills.join(" ")).toLowerCase().includes(q)) &&
      (!f.location || n.location === f.location) &&
      n.expectedSalary <= f.maxSalary &&
      f.skills.every((s) => n.skills.includes(s)) &&
      (!f.verifiedOnly || n.verified),
  );
}
