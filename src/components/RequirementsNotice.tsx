import { IdCard, Info } from "lucide-react";
import { ACCEPTED_IDS } from "@/lib/verification";

/** The one thing askmynanny requires from everyone: a valid government ID and a live photo holding it. */
export function IdRequiredNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-primary/40 bg-primary/5 p-4 text-sm ${className}`}>
      <p className="flex items-center gap-2 font-semibold text-primary">
        <IdCard className="h-4 w-4 shrink-0" />
        Required: a valid government ID + a live photo of you holding it
      </p>
      <p className="mt-1 text-muted-foreground">
        This is a must for every nanny and family. It proves you are a real person and stops fake accounts. The ID must not be expired when we review it.
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold text-primary">Accepted IDs</summary>
        <ul className="mt-1 list-inside list-disc text-muted-foreground">
          {ACCEPTED_IDS.map((id) => <li key={id}>{id}</li>)}
        </ul>
      </details>
    </div>
  );
}

const WHO = {
  nanny: "You may upload them voluntarily to earn a badge on your profile, but you don't have to.",
  family: "If you need them, ask the nanny before signing the contract, and you pay for them.",
  public: "Badges show documents the nanny uploaded voluntarily and an admin checked.",
} as const;

/**
 * Medical certificate, police, barangay and NBI clearances are the hiring employer's
 * requirement under the Kasambahay Law (RA 10361, Sec. 12), at the employer's cost.
 */
export function EmployerDocsDisclaimer({ audience, className = "" }: { audience: keyof typeof WHO; className?: string }) {
  return (
    <div className={`flex gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong className="text-foreground">Medical certificate, police, barangay and NBI clearances are not required by askmynanny.</strong>{" "}
        Under the Kasambahay Law (RA 10361, Sec. 12), the hiring employer may require them before signing the contract, and the employer pays for them.{" "}
        {WHO[audience]}{" "}
        <span lang="fil" className="italic">Ang employer ang maaaring humingi nito, at ang employer ang magbabayad.</span>
      </p>
    </div>
  );
}
