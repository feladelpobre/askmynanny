/** "Nanny's Embrace": a nanny (teal) whose arms form a heart around a child (coral). */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g className="text-primary" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M32 58C14 47 6 37 9 27C11 21 17 19 22 21C27 23 30 27 32 31" />
        <path d="M32 58C48 49 56 40 55 31C54 25.5 49.5 23.5 45.5 26" />
      </g>
      <circle cx="20" cy="10" r="6.5" className="fill-primary" />
      <g className="fill-accent">
        <circle cx="40" cy="22.5" r="5" />
        <path d="M33.5 42C31.5 34.5 35 30.5 40 30.5C45 30.5 48 34.5 46 40.5C44 45.5 36.5 47 33.5 42Z" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-semibold text-primary">
          askmy<span className="text-accent">nanny</span>
        </span>
        <span className="mt-1 hidden text-xs font-semibold tracking-wide text-muted-foreground sm:block">Care you can trust!</span>
      </span>
    </span>
  );
}
