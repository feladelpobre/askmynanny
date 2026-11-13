// Pure helpers for the AI search assistant, kept separate from the server function
// so they can be unit tested without calling the AI.

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type AssistantMatch = { id: string; reason: string };

export const MAX_TURNS = 12;
export const MAX_CHARS = 1000;
export const MAX_MATCHES = 6;

/**
 * Validates and trims the chat history sent by the browser:
 * keeps only user/assistant turns with string content, the last MAX_TURNS turns,
 * and the first MAX_CHARS characters of each. The last turn must be a non-empty
 * question from the user.
 */
export function sanitizeMessages(input: unknown): ChatTurn[] {
  const raw = (input as { messages?: unknown })?.messages;
  const list = Array.isArray(raw) ? raw : [];
  const messages = list
    .filter(
      (m): m is ChatTurn =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatTurn).role === "user" || (m as ChatTurn).role === "assistant") &&
        typeof (m as ChatTurn).content === "string",
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) throw new Error("Missing question");
  return messages;
}

/**
 * Keeps only matches that point to a real nanny, so the AI can never recommend
 * someone who isn't on askmynanny, and caps the list at MAX_MATCHES.
 */
export function keepKnownMatches(matches: unknown, knownIds: Iterable<string>): AssistantMatch[] {
  const known = new Set(knownIds);
  const list = Array.isArray(matches) ? matches : [];
  return list
    .filter(
      (m): m is AssistantMatch =>
        !!m && typeof m === "object" && typeof (m as AssistantMatch).id === "string" && known.has((m as AssistantMatch).id),
    )
    .map((m) => ({ id: m.id, reason: typeof m.reason === "string" ? m.reason : "" }))
    .slice(0, MAX_MATCHES);
}
