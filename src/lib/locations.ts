// Locations families can search by. askmynanny launches in the Philippines only:
// matching Filipino household workers with employers abroad needs a DMW-licensed
// agency (direct hiring of household service workers is banned), so overseas jobs
// are out of scope until a licensed partner is in place.
export const PH_LOCATIONS = [
  "Metro Manila",
  "Cebu",
  "Davao",
  "Baguio",
  "Iloilo",
  "Bacolod",
  "Cagayan de Oro",
  "Pampanga",
  "Cavite",
  "Laguna",
  "Batangas",
  "Bulacan",
  "Rizal",
  "General Santos",
  "Zamboanga",
  "Tacloban",
] as const;

export type PhLocation = (typeof PH_LOCATIONS)[number];

export function isPhLocation(value: string): value is PhLocation {
  return (PH_LOCATIONS as readonly string[]).includes(value);
}

const pesoFormat = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

/** Formats a whole-peso amount, e.g. 12000 -> "₱12,000". */
export function formatPeso(amount: number): string {
  return pesoFormat.format(amount);
}
