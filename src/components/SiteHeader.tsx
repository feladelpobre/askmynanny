import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { session } = useAuth();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          askmynanny
        </Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link to="/find" className="rounded-full px-4 py-2 text-foreground hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>
            Find a Nanny
          </Link>
          {session ? (
            <Link to="/account" className="rounded-full bg-accent px-4 py-2 text-accent-foreground hover:opacity-90">My account</Link>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-foreground hover:bg-secondary sm:inline-block">Sign in</Link>
              <Link to="/register" className="rounded-full bg-accent px-4 py-2 text-accent-foreground hover:opacity-90">Join as a Nanny</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function VerifiedBadge({ small }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-verified/15 font-semibold text-verified ${small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}`}>
      <svg viewBox="0 0 24 24" className={small ? "h-3 w-3" : "h-4 w-4"} fill="currentColor"><path d="M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1.1 3 1.1 3-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1L2.7 15.5l1.1-3-1.1-3 2.8-1.6.9-3.1 3.2.3z"/><path d="M10.5 15.5l-3-3 1.4-1.4 1.6 1.6 4.6-4.6 1.4 1.4z" fill="white"/></svg>
      ID Verified
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="text-star" aria-label={`${value.toFixed(1)} stars`}>
      {"★★★★★".slice(0, Math.round(value))}
      <span className="text-muted-foreground/40">{"★★★★★".slice(Math.round(value))}</span>
    </span>
  );
}
