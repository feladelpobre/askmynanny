import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Check, Lock, Plus, Trash2, Upload, PartyPopper } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PH_LOCATIONS } from "@/lib/locations";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join as a Nanny — askmynanny" },
      { name: "description", content: "Create your nanny profile with your work history, references and verified ID." },
      { property: "og:title", content: "Join as a Nanny — askmynanny" },
      { property: "og:description", content: "Create your nanny profile with your work history, references and verified ID." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Register,
});

const steps = ["Personal info", "Education & skills", "Work history", "ID verification", "Review"];
const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const skillOpts = ["Infant care", "Toddler care", "Tutoring", "Cooking", "First aid", "Swimming", "Special needs", "Elderly care", "Housekeeping", "Driving"];

function F({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={`block text-sm font-semibold ${full ? "sm:col-span-2" : ""}`}>{label}<div className="mt-1 font-normal">{children}</div></label>;
}

function Register() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [jobs, setJobs] = useState([0]);
  const [idFile, setIdFile] = useState("");

  if (done)
    return (
      <div className="min-h-screen"><SiteHeader />
        <main className="mx-auto max-w-lg px-5 py-24 text-center">
          <PartyPopper className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-4 font-display text-4xl font-semibold">Profile submitted!</h1>
          <p className="mt-3 text-muted-foreground">This is a preview — nothing was saved. In the real app we'd verify your ID and notify you once your badge is active.</p>
          <Link to="/find" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">See nanny profiles</Link>
        </main>
      </div>
    );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-4xl font-semibold">Create your nanny profile</h1>
        <p className="mt-1 text-muted-foreground">Families trust profiles with complete history and a verified ID.</p>
        <ol className="mt-8 flex gap-2">
          {steps.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              <p className={`mt-2 hidden text-xs font-semibold sm:block ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</p>
            </li>
          ))}
        </ol>
        <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-5 font-display text-2xl font-semibold">{steps[step]}</h2>
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Full name"><input className={input} placeholder="Maria Santos" /></F>
              <F label="Current location"><select className={input} defaultValue=""><option value="" disabled>Choose your city or province</option>{PH_LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></F>
              <F label="Mobile number"><input type="tel" className={input} placeholder="+63 9XX XXX XXXX" /></F>
              <F label="Email"><input type="email" className={input} placeholder="you@email.com" /></F>
              <F label="About you" full><textarea rows={3} className={input} placeholder="Tell families a little about yourself…" /></F>
              <label className="flex items-start gap-2 text-sm sm:col-span-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" />
                <span>I confirm I am 18 or older. <span className="text-muted-foreground">This stays private; askmynanny never shows or filters by age.</span></span>
              </label>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="Highest education"><select className={input}><option>High school</option><option>Vocational / Diploma</option><option>College degree</option><option>Postgraduate</option></select></F>
              <F label="Field / course"><input className={input} placeholder="Early Childhood Education" /></F>
              <F label="Years of experience"><input type="number" className={input} placeholder="5" /></F>
              <F label="Expected monthly salary (₱)"><input type="number" min={0} step={500} className={input} placeholder="12000" /></F>
              <F label="Languages" full><input className={input} placeholder="Filipino, English, Cebuano/Bisaya" /></F>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skillOpts.map((s) => {
                    const on = skills.includes(s);
                    return <button type="button" key={s} onClick={() => setSkills(on ? skills.filter((x) => x !== s) : [...skills, s])} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}>{on && <Check className="mr-1 inline h-3.5 w-3.5" />}{s}</button>;
                  })}
                </div>
              </div>
              <F label="Benefits you're looking for" full><input className={input} placeholder="Own room, 1 day off weekly, medical insurance" /></F>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              {jobs.map((k, i) => (
                <div key={k} className="rounded-2xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Employer #{i + 1}</p>
                    {jobs.length > 1 && <button onClick={() => setJobs(jobs.filter((x) => x !== k))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <F label="Employer / family name"><input className={input} placeholder="The Tan Family" /></F>
                    <F label="Location"><input className={input} placeholder="Quezon City" /></F>
                    <F label="From"><input type="month" className={input} /></F>
                    <F label="To"><input type="month" className={input} /></F>
                    <F label="Monthly salary (₱)"><input type="number" min={0} step={500} className={input} placeholder="10000" /></F>
                    <F label="Benefits received"><input className={input} placeholder="Own room, insurance" /></F>
                    <F label="Reason for leaving" full><input className={input} placeholder="Family relocated" /></F>
                    <F label="Employer contact (for review request)" full><input className={input} placeholder="Email or phone" /></F>
                  </div>
                </div>
              ))}
              <button onClick={() => setJobs([...jobs, Date.now()])} className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary px-4 py-2 text-sm font-semibold text-primary"><Plus className="h-4 w-4" />Add another employer</button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex gap-3 rounded-2xl bg-secondary p-4 text-sm">
                <Lock className="h-5 w-5 shrink-0 text-primary" />
                <p>Your ID is <strong>never shown</strong> to families. We only display an “ID Verified” badge on your profile once it's confirmed.</p>
              </div>
              <F label="ID type"><select className={input}><option>National ID</option><option>Passport</option><option>Work permit</option><option>Driver's license</option></select></F>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border p-8 text-center hover:bg-secondary/50">
                <Upload className="h-8 w-8 text-primary" />
                <span className="font-semibold">{idFile || "Upload a photo of your ID"}</span>
                <span className="text-xs text-muted-foreground">JPG, PNG or PDF</span>
                <input type="file" className="hidden" onChange={(e) => setIdFile(e.target.files?.[0]?.name ?? "")} />
              </label>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3 text-sm">
              <p>Please confirm everything is accurate. Past employers will be invited to leave a review.</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Skills selected: {skills.length ? skills.join(", ") : "none"}</li>
                <li>• Employers added: {jobs.length}</li>
                <li>• ID document: {idFile || "not uploaded"}</li>
              </ul>
              <label className="flex items-center gap-2 font-semibold"><input type="checkbox" className="h-4 w-4 accent-primary" />I confirm my information is true.</label>
            </div>
          )}
          <div className="mt-8 flex justify-between">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-full px-5 py-2.5 font-semibold text-muted-foreground hover:bg-secondary disabled:opacity-40">Back</button>
            <button onClick={() => (step === steps.length - 1 ? setDone(true) : setStep(step + 1))} className="rounded-full bg-primary px-6 py-2.5 font-semibold text-primary-foreground hover:opacity-90">
              {step === steps.length - 1 ? "Submit profile" : "Continue"}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
