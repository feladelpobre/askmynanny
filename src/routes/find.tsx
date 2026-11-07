import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MapPin, Search, Briefcase } from "lucide-react";
import { SiteHeader, VerifiedBadge, Stars } from "@/components/SiteHeader";
import { nannies, allSkills, allLocations, avgRating } from "@/lib/nannies";

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find a Nanny — askmynanny" },
      { name: "description", content: "Search nannies by location, skills, age, education, salary and verification." },
      { property: "og:title", content: "Find a Nanny — askmynanny" },
      { property: "og:description", content: "Search nannies by location, skills, age, education, salary and verification." },
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
  const [gender, setGender] = useState("");
  const [maxAge, setMaxAge] = useState(65);
  const [maxSalary, setMaxSalary] = useState(1500);
  const [skills, setSkills] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(
    () =>
      nannies.filter(
        (n) =>
          (!q || (n.name + n.about + n.skills.join(" ")).toLowerCase().includes(q.toLowerCase())) &&
          (!loc || n.location === loc) &&
          (!gender || n.gender === gender) &&
          n.age <= maxAge &&
          n.expectedSalary <= maxSalary &&
          skills.every((s) => n.skills.includes(s)) &&
          (!verifiedOnly || n.verified),
      ),
    [q, loc, gender, maxAge, maxSalary, skills, verifiedOnly],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold">Find a nanny</h1>
        <p className="mt-1 text-muted-foreground">Sample profiles for preview.</p>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill or keyword…" className="w-full rounded-full border border-input bg-card py-3.5 pl-12 pr-4 shadow-soft focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit space-y-5 rounded-3xl border border-border bg-card p-5">
            <label className="block text-sm font-semibold">Location
              <select className={field + " mt-1"} value={loc} onChange={(e) => setLoc(e.target.value)}>
                <option value="">Anywhere</option>
                {allLocations.map((l) => <option key={l}>{l}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">Gender
              <select className={field + " mt-1"} value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Any</option><option>Female</option><option>Male</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">Max age: {maxAge}
              <input type="range" min={20} max={65} value={maxAge} onChange={(e) => setMaxAge(+e.target.value)} className="mt-2 w-full accent-primary" />
            </label>
            <label className="block text-sm font-semibold">Max salary: ${maxSalary}/mo
              <input type="range" min={500} max={1500} step={50} value={maxSalary} onChange={(e) => setMaxSalary(+e.target.value)} className="mt-2 w-full accent-primary" />
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
                    <img src={n.photo} alt={n.name} loading="lazy" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold group-hover:text-primary">{n.name}</h3>
                      <p className="text-sm text-muted-foreground">{n.age} · {n.gender}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{n.location}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    {n.verified && <VerifiedBadge small />}
                    <Stars value={avgRating(n)} />
                    <span className="flex items-center gap-1 text-muted-foreground"><Briefcase className="h-3.5 w-3.5" />{n.years} yrs</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {n.skills.slice(0, 3).map((s) => <span key={s} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">{s}</span>)}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-primary">From ${n.expectedSalary}/month</p>
                </Link>
              ))}
              {!results.length && <p className="text-muted-foreground">No nannies match these filters.</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
