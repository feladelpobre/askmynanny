import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Camera, FileCheck2, Mail, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join as a Nanny — askmynanny" },
      { name: "description", content: "Create a verified nanny profile with your work history, clearances and certificates. Free for nannies." },
      { property: "og:title", content: "Join as a Nanny — askmynanny" },
      { property: "og:description", content: "Create a verified nanny profile with your work history, clearances and certificates. Free for nannies." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RegisterPage,
});

const steps = [
  { icon: Mail, title: "Sign up with your email", text: "We send a 6-digit code to confirm it's really you." },
  { icon: FileCheck2, title: "Build your profile", text: "Skills, languages, the ages of children you've cared for, salary in pesos, and your work history." },
  { icon: Camera, title: "Verify your identity", text: "Upload your profile photo and government ID, then take a live photo holding your ID with your camera." },
  { icon: BadgeCheck, title: "Add clearances and certificates", text: "NBI, police or barangay clearance, TESDA NC II, first aid and more. Each approved one adds a badge." },
  { icon: ShieldCheck, title: "Get Fully Verified", text: "An admin reviews your documents. Then families can find you and contact you through askmynanny." },
];

function RegisterPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold">Join askmynanny as a nanny</h1>
        <p className="mt-2 text-muted-foreground">It's free, and you never pay any fee to get a job. Your ID and clearances stay private; families only see your verified badges.</p>
        <ol className="mt-8 space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-3xl border border-border bg-card p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><s.icon className="h-5 w-5" /></span>
              <div><p className="font-semibold">{i + 1}. {s.title}</p><p className="text-sm text-muted-foreground">{s.text}</p></div>
            </li>
          ))}
        </ol>
        <Link to="/login" search={{ as: "nanny" }} className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground hover:opacity-90">Start my profile</Link>
        <p className="mt-3 text-xs text-muted-foreground">You must be 18 or older. We follow the Data Privacy Act (RA 10173) and the Kasambahay Law (RA 10361).</p>
      </main>
    </div>
  );
}
