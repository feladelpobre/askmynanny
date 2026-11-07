import n1 from "@/assets/n1.jpg";
import n2 from "@/assets/n2.jpg";
import n3 from "@/assets/n3.jpg";
import n4 from "@/assets/n4.jpg";

export type Job = {
  employer: string;
  location: string;
  from: string;
  to: string;
  salary: string;
  benefits: string[];
  leaveReason: string;
  rating: number;
  review: string;
};

export type Nanny = {
  id: string;
  name: string;
  photo: string;
  age: number;
  gender: "Female" | "Male";
  location: string;
  education: string;
  years: number;
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
    id: "maria-santos", name: "Maria Santos", photo: n1, age: 34, gender: "Female", location: "Singapore",
    education: "College — Early Childhood Education", years: 9, expectedSalary: 900,
    skills: ["Infant care", "First aid", "Cooking", "Tutoring"], benefitsWanted: ["Own room", "1 day off weekly", "Medical insurance"],
    languages: ["English", "Tagalog"], verified: true,
    about: "Patient and caring nanny with nearly a decade of experience raising toddlers and newborns.",
    history: [
      { employer: "The Tan Family", location: "Singapore", from: "2021", to: "2025", salary: "$850 / month", benefits: ["Own room", "Medical insurance", "Annual flight home"], leaveReason: "Family relocated overseas", rating: 5, review: "Maria was like family to us. Our twins adored her and she was always reliable." },
      { employer: "The Lim Family", location: "Singapore", from: "2017", to: "2021", salary: "$700 / month", benefits: ["Own room", "Day off weekly"], leaveReason: "Children started full-day school", rating: 5, review: "Very responsible, great cook, and wonderful with homework." },
    ],
  },
  {
    id: "siti-rahma", name: "Siti Rahma", photo: n2, age: 42, gender: "Female", location: "Kuala Lumpur",
    education: "High school diploma", years: 15, expectedSalary: 750,
    skills: ["Elderly care", "Cooking", "Housekeeping", "Toddler care"], benefitsWanted: ["Own room", "Halal kitchen"],
    languages: ["Bahasa", "English"], verified: true,
    about: "Calm, organized and experienced with both children and elderly family members.",
    history: [
      { employer: "The Ahmad Family", location: "Kuala Lumpur", from: "2016", to: "2024", salary: "RM 2,200 / month", benefits: ["Own room", "Annual bonus"], leaveReason: "Grandparent passed away; role ended", rating: 5, review: "Siti cared for our mother and kids with so much kindness. Highly recommended." },
    ],
  },
  {
    id: "jenny-lee", name: "Jenny Lee", photo: n3, age: 26, gender: "Female", location: "Singapore",
    education: "Diploma — Child Psychology", years: 4, expectedSalary: 1100,
    skills: ["Tutoring", "Swimming", "Arts & crafts", "First aid"], benefitsWanted: ["Weekends off", "Transport allowance"],
    languages: ["English", "Mandarin"], verified: false,
    about: "Energetic and creative, I love planning learning activities for school-age kids.",
    history: [
      { employer: "The Wong Family", location: "Singapore", from: "2022", to: "2025", salary: "$1,000 / month", benefits: ["Transport allowance"], leaveReason: "Contract completed", rating: 4, review: "Great with our kids' studies and very fun. Sometimes late but always communicated." },
    ],
  },
  {
    id: "lakshmi-nair", name: "Lakshmi Nair", photo: n4, age: 51, gender: "Female", location: "Hong Kong",
    education: "College — Nursing (2 years)", years: 22, expectedSalary: 1300,
    skills: ["Newborn care", "Special needs", "First aid", "Cooking"], benefitsWanted: ["Medical insurance", "Own room"],
    languages: ["English", "Hindi", "Malayalam"], verified: true,
    about: "Former nursing student with over twenty years supporting newborns and children with special needs.",
    history: [
      { employer: "The Chen Family", location: "Hong Kong", from: "2015", to: "2025", salary: "HK$6,500 / month", benefits: ["Own room", "Medical insurance", "Annual leave"], leaveReason: "Retirement of employer; moved to smaller home", rating: 5, review: "Lakshmi is extraordinary with our son who has autism. Truly a blessing." },
      { employer: "The Patel Family", location: "Dubai", from: "2008", to: "2015", salary: "AED 2,500 / month", benefits: ["Accommodation", "Flight home"], leaveReason: "Wanted to be closer to family", rating: 5, review: "Trustworthy, skilled and calm in every situation." },
    ],
  },
];

export const allSkills = Array.from(new Set(nannies.flatMap((n) => n.skills))).sort();
export const allLocations = Array.from(new Set(nannies.map((n) => n.location))).sort();
export const avgRating = (n: Nanny) =>
  n.history.length ? n.history.reduce((s, j) => s + j.rating, 0) / n.history.length : 0;
