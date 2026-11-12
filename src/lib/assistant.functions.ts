import { createServerFn } from "@tanstack/react-start";
import { nannies } from "./nannies";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type AssistantMatch = { id: string; reason: string };
export type AssistantReply = { reply: string; matches: AssistantMatch[]; error?: string };

const SYSTEM = `You are the askmynanny search assistant for employers.
Rules:
- Recommend ONLY nannies from the PROFILES list below, using their exact "id". Never invent nannies or use outside knowledge about people.
- Only help with finding a nanny on askmynanny. For anything else, politely say you can only help find a nanny here.
- Keep "reply" short (1-3 sentences). Do not repeat each nanny's full details; the app shows cards.
- Tell employers to open a nanny's profile to contact her.
- If nobody matches, return no matches and suggest loosening a requirement.
- Salaries are expected monthly amounts in USD.`;

function publicProfiles() {
  return nannies.map((n) => ({
    id: n.id, name: n.name, age: n.age, gender: n.gender, location: n.location,
    education: n.education, yearsExperience: n.years, expectedSalaryUSD: n.expectedSalary,
    skills: n.skills, languages: n.languages, benefitsWanted: n.benefitsWanted,
    idVerified: n.verified, about: n.about,
    pastEmployerRatings: n.history.map((h) => h.rating),
  }));
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatTurn[] }) => {
    const messages = (input?.messages ?? [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
    if (messages[messages.length - 1]?.role !== "user") throw new Error("Missing question");
    return { messages };
  })
  .handler(async ({ data }): Promise<AssistantReply> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        instructions: `${SYSTEM}\n\nPROFILES:\n${JSON.stringify(publicProfiles())}`,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
        text: {
          format: {
            type: "json_schema",
            name: "nanny_search",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["reply", "matches"],
              properties: {
                reply: { type: "string" },
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["id", "reason"],
                    properties: { id: { type: "string" }, reason: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      });
      const text = extractText(res);
      const parsed = JSON.parse(text) as { reply: string; matches: AssistantMatch[] };
      const known = new Set(nannies.map((n) => n.id));
      return {
        reply: String(parsed.reply ?? ""),
        matches: (parsed.matches ?? []).filter((m) => known.has(m.id)).slice(0, 6),
      };
    } catch (err) {
      console.error("assistant error", err);
      const msg =
        err instanceof GatewayError && err.httpStatus === 402
          ? "The assistant is out of AI credits right now."
          : err instanceof GatewayError && err.httpStatus === 429
            ? "The assistant is busy. Please try again in a moment."
            : "Sorry, the assistant couldn't answer right now. Please try again.";
      return { reply: "", matches: [], error: msg };
    }
  });

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  for (const item of r.output ?? []) {
    if (item.type !== "message") continue;
    for (const c of item.content ?? []) if (c.type === "output_text" && c.text) return c.text;
  }
  throw new Error("No text in response");
}
