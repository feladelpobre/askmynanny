import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, UserPlus, ShieldCheck, Star, Briefcase } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "askmynanny — Find trusted, verified nannies" },
      { name: "description", content: "Browse nanny profiles with verified IDs, real employer reviews, and full work history." },
      { property: "og:title", content: "askmynanny — Find trusted, verified nannies" },
      { property: "og:description", content: "Browse nanny profiles with verified IDs, real employer reviews, and full work history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="rounded-full bg-secondary px-4 py-1 text-sm font-semibold text-secondary-foreground">Trusted care, honest history</span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-tight text-foreground md:text-6xl">
            The right nanny for your <em className="text-accent">family</em>.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Real work histories, reviews from past employers, and government ID verification — all in one place.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
          <Link to="/find" className="group rounded-3xl border border-border bg-card p-8 shadow-soft transition hover:-translate-y-1">
            <Search className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-2xl font-semibold">I'm hiring</h2>
            <p className="mt-2 text-muted-foreground">Search verified nannies by skills, location and experience.</p>
            <span className="mt-5 inline-block font-semibold text-primary group-hover:underline">Find a nanny →</span>
          </Link>
          <Link to="/register" className="group rounded-3xl bg-primary p-8 text-primary-foreground shadow-soft transition hover:-translate-y-1">
            <UserPlus className="h-8 w-8" />
            <h2 className="mt-4 font-display text-2xl font-semibold">I'm a nanny</h2>
            <p className="mt-2 opacity-85">Build a profile that showcases your experience and references.</p>
            <span className="mt-5 inline-block font-semibold group-hover:underline">Create my profile →</span>
          </Link>
        </div>
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 text-center sm:grid-cols-3">
          {[
            [ShieldCheck, "Verified IDs", "Checked at sign-up, kept private"],
            [Star, "Employer reviews", "Honest feedback from past families"],
            [Briefcase, "Full history", "Salary, benefits and leave reasons"],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div key={t as string}>
                <I className="mx-auto h-6 w-6 text-accent" />
                <p className="mt-2 font-semibold">{t as string}</p>
                <p className="text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
