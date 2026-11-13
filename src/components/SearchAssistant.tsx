import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, Send, X, MapPin } from "lucide-react";
import { askAssistant, type AssistantMatch, type ChatTurn } from "@/lib/assistant.functions";
import { nannies } from "@/lib/nannies";
import { VerifiedBadge } from "@/components/SiteHeader";

type Msg = ChatTurn & { matches?: AssistantMatch[]; error?: boolean };

const starters = [
  "Verified nanny in Metro Manila with infant care",
  "Someone in Cebu who speaks Bisaya",
  "Nanny under ₱12,000 a month who can cook",
];

export function SearchAssistant() {
  const ask = useServerFn(askAssistant);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open, busy]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: question }];
    setMsgs(next);
    setText("");
    setBusy(true);
    try {
      const res = await ask({ data: { messages: next.filter((m) => !m.error).map(({ role, content }) => ({ role, content })) } });
      setMsgs((m) => [...m, res.error
        ? { role: "assistant", content: res.error, error: true }
        : { role: "assistant", content: res.reply, matches: res.matches }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "Sorry, something went wrong. Please try again.", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-soft hover:opacity-95">
        <HeartHandshake className="h-5 w-5" /> Ask the assistant
      </button>
    );

  return (
    <div className="fixed bottom-4 right-4 z-30 flex h-[min(620px,calc(100vh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-foreground/15"><HeartHandshake className="h-4 w-4" /></span>
          <div><p className="font-display font-semibold leading-tight">Nanny finder</p><p className="text-xs opacity-80">Searches askmynanny profiles only</p></div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1 hover:bg-primary-foreground/15"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!msgs.length && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tell me what your family needs and I'll suggest nannies from our profiles.</p>
            {starters.map((s) => (
              <button key={s} onClick={() => send(s)} className="block w-full rounded-2xl border border-border px-3 py-2 text-left text-sm hover:bg-secondary">{s}</button>
            ))}
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">{m.content}</div>
          ) : (
            <div key={i} className="space-y-2">
              <p className={`text-sm ${m.error ? "text-destructive" : ""}`}>{m.content}</p>
              {m.matches?.map((match) => {
                const n = nannies.find((x) => x.id === match.id);
                if (!n) return null;
                return (
                  <div key={n.id} className="flex gap-3 rounded-2xl border border-border bg-background p-3">
                    <img src={n.photo} alt={n.name} width={56} height={56} loading="lazy" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5"><p className="font-semibold">{n.name}</p>{n.verified && <VerifiedBadge small />}</div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{n.location} · {n.years} yrs</p>
                      <p className="mt-1 text-xs">{match.reason}</p>
                      <Link to="/nanny/$id" params={{ id: n.id }} className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">View profile</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        )}
        {busy && <p className="animate-pulse text-sm text-muted-foreground">Looking through profiles…</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 border-t border-border p-3">
        <textarea ref={inputRef} rows={1} value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
          placeholder="e.g. verified nanny with infant care…" className="max-h-28 flex-1 resize-none rounded-2xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
