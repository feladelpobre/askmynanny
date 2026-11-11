// keep-alive: called once a day by an external cron (cron-job.org) so the
// Supabase project registers database activity and is not paused for
// inactivity. It runs a trivial query (`select now()`) over a direct database
// connection: no tables, no data, no schema changes.
//
// Auth: deployed with verify_jwt = false. The caller must send the header
//   x-keep-alive-token: <value of the KEEP_ALIVE_TOKEN function secret>
// Requests without the right token get 401 and never touch the database.
// If KEEP_ALIVE_TOKEN is not set, every request is rejected (fails closed).
import postgres from "npm:postgres@3.4.7";

const TOKEN = Deno.env.get("KEEP_ALIVE_TOKEN") ?? "";
const DB_URL = Deno.env.get("SUPABASE_DB_URL") ?? "";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Constant-time comparison so the token can't be guessed from response timing.
function tokenMatches(given: string, expected: string): boolean {
  const enc = new TextEncoder();
  const a = enc.encode(given);
  const b = enc.encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405);
  }

  const given = req.headers.get("x-keep-alive-token") ?? "";
  if (!TOKEN || !tokenMatches(given, TOKEN)) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const sql = postgres(DB_URL, { prepare: false, max: 1, idle_timeout: 5, connect_timeout: 10 });
  try {
    const [row] = await sql`select now() as db_time`;
    return json({ ok: true, db_time: row.db_time });
  } catch (err) {
    console.error("keep-alive: database query failed", err);
    return json({ ok: false, error: "database query failed" }, 500);
  } finally {
    await sql.end({ timeout: 5 });
  }
});
