import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, GraduationCap, Wallet, Languages, ArrowLeft } from "lucide-react";
import { SiteHeader, VerifiedBadge, Stars } from "@/components/SiteHeader";
import { nannies, avgRating } from "@/lib/nannies";

export const Route = createFileRoute("/nanny/$id")({
  loader: ({ params }) => {
    const nanny = nannies.find((n) => n.id === params.id);
    if (!nanny) throw notFound();
    return { nanny };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.nanny.name} — Nanny profile | askmynanny` : "Nanny profile | askmynanny";
    const d = loaderData?.nanny.about ?? "Nanny profile on askmynanny.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Profile,
});

function Profile() {
  const { nanny: n } = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link to="/find" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Back to search</Link>
        <section className="mt-5 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-soft md:flex-row">
          <img src={n.photo} alt={n.name} width={160} height={160} className="h-40 w-40 rounded-3xl object-cover" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-4xl font-semibold">{n.name}</h1>
              {n.verified ? <VerifiedBadge /> : <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">Verification pending</span>}
            </div>
            <p className="mt-1 text-muted-foreground">{n.age} years · {n.gender} · {n.years} years experience</p>
            <div className="mt-2 flex items-center gap-2"><Stars value={avgRating(n)} /><span className="text-sm text-muted-foreground">{n.history.length} employer reviews</span></div>
            <p className="mt-4">{n.about}</p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{n.location}</p>
              <p className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary" />{n.education}</p>
              <p className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />Expects ${n.expectedSalary}/month</p>
              <p className="flex items-center gap-2"><Languages className="h-4 w-4 text-primary" />{n.languages.join(", ")}</p>
            </div>
          </div>
        </section>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Box title="Skills" items={n.skills} />
          <Box title="Benefits wanted" items={n.benefitsWanted} />
        </div>
        <h2 className="mt-10 font-display text-2xl font-semibold">Employment history</h2>
        <ol className="mt-5 space-y-5 border-l-2 border-border pl-6">
          {n.history.map((j) => (
            <li key={j.employer} className="relative rounded-3xl border border-border bg-card p-5">
              <span className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-4 border-background bg-primary" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-semibold">{j.employer}</h3>
                <span className="text-sm text-muted-foreground">{j.from} – {j.to} · {j.location}</span>
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold">Salary</dt><dd className="text-muted-foreground">{j.salary}</dd></div>
                <div><dt className="font-semibold">Reason for leaving</dt><dd className="text-muted-foreground">{j.leaveReason}</dd></div>
                <div className="sm:col-span-2"><dt className="font-semibold">Benefits</dt><dd className="text-muted-foreground">{j.benefits.join(" · ")}</dd></div>
              </dl>
              <blockquote className="mt-4 rounded-2xl bg-secondary p-4 text-sm">
                <Stars value={j.rating} />
                <p className="mt-1 italic">"{j.review}"</p>
              </blockquote>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}

function Box({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((s) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">{s}</span>)}
      </div>
    </div>
  );
}
