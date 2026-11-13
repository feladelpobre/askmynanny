import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { fetchVerifiedNannies } from "@/lib/db-nannies";
import type { Nanny } from "@/lib/nannies";
import { MapPin, Search, Briefcase } from "lucide-react";
import { SiteHeader, VerifiedBadge, Stars } from "@/components/SiteHeader";
import { SearchAssistant } from "@/components/SearchAssistant";
import { nannies, allSkills, allLocations, avgRating, filterNannies, SALARY_FILTER } from "@/lib/nannies";
import { formatPeso } from "@/lib/locations";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find a Nanny — askmynanny" },
      { name: "description", content: "Search verified nannies across the Philippines by location, skills, salary and verification." },
      { property: "og:title", content: "Find a Nanny — askmynanny" },
      { property: "og:description", content: "Search verified nannies across the Philippines by location, skills, salary and verification." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindPage,
});

const field = "w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function FindPage() {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("");
  const [maxSalary, setMaxSalary] = useState<number>(SALARY_FILTER.max);
  const [skills, setSkills] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [real, setReal] = useState<Nanny[]>([]);
  useEffect(() => void fetchVerifiedNannies().then(setReal), []);

  const results = useMemo(
    () => filterNannies([...real, ...nannies], { q, location: loc, maxSalary, skills, verifiedOnly }),
    [real, q, loc, maxSalary, skills, verifiedOnly],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold">Find a nanny</h1>
        <p className="mt-1 text-muted-foreground">Fully verified nannies across the Philippines. Profiles marked "Sample" are for the preview.</p>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill or keyword…" className="w-full rounded-full border border-input bg-card py-3.5 pl-12 pr-4 shadow-soft focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-5 rounded-3xl border border-border bg-card p-5">
            <label className="block text-sm font-semibold">Location
              <select className={field + " mt-1"} value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="">Anywhere in the Philippines</option>
                {allLocations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Max salary: {formatPeso(maxSalary)}/mo
              <input type="range" min={SALARY_FILTER.min} max={SALARY_FILTER.max} step={SALARY_FILTER.step} value={maxSalary} onChange={(e) => setMaxSalary(+e.target.value)} className="mt-2 w-full accent-primary" />
            </label>
            <div>
              <p className="text-sm font-semibold">Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allSkills.map((s) => {
                  const on = skills.includes(s);
                  return (
                    <button key={s} onClick={() => setSkills(on ? skills.filter((x) => x !== s) : [...skills, s])}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>{s}</button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-primary" />
              Verified ID only
            </label>
          </aside>
          <section>
            <p className="mb-4 text-sm text-muted-foreground">{results.length} nannies found</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {results.map((n) => (
                <Link key={n.id} to="/nanny/$id" params={{ id: n.id }} className="group rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-1">
                  <div className="flex gap-4">
                    {n.photo
                      ? <img src={n.photo} alt={n.name} loading="lazy" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
                      : <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-secondary font-display text-2xl font-semibold text-primary">{n.name.charAt(0)}</div>}
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold group-hover:text-primary">{n.name}</h3>
                      <p className="text-sm text-muted-foreground">{n.languages.join(" · ")}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{n.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    {n.verified && <VerifiedBadge small />}
                    {n.sample && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">Sample</span>}
                    <Stars value={avgRating(n)} />
                    <span className="flex items-center gap-1 text-muted-foreground"><Briefcase className="h-3.5 w-3.5" />{n.years} yrs</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {n.skills.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{s}</span>)}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-primary">From {formatPeso(n.expectedSalary)}/month</p>
                </Link>
              ))}
              {!results.length && <p className="text-muted-foreground">No nannies match these filters.</p>}
            </div>
          </section>
        </div>
      </main>
      <SearchAssistant />
    </div>
  );
}
