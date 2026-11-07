# askmynanny: rules for Claude

Read [AGENTS.md](AGENTS.md) too. Its Lovable rules apply here as well.

## Branches

| Branch        | Owner                                         | Claude may                                                       |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `main`        | Production. Changes arrive only by merged PR. | Read only. Never commit, push, merge into, or check out to edit. |
| `nannydraft`  | Lovable's branch. Only Lovable writes here.   | Read only. Never commit, push, merge into, or edit.              |
| `nannyclaude` | Claude's working branch.                      | Edit, commit, push (after asking the user).                      |

- All Claude edits happen on `nannyclaude`. Before editing any file, confirm `git branch --show-current` is `nannyclaude`; if not, stop and tell the user.
- To bring in updates, merge **into** `nannyclaude` (`git merge origin/main`). Never merge `nannyclaude` into `main` or `nannydraft` directly; that happens only through a PR the user approves.
- Never force-push, rebase, amend, or squash pushed commits (it breaks Lovable history).
- Local git hooks in `.git/hooks/` block commits and pushes on `main` and `nannydraft`. Never bypass them (`--no-verify`).

## Monitoring main and Lovable (every session)

- A SessionStart hook runs `bash .claude/hooks/branch-status.sh` automatically. Read its output and give the user a short summary at the start of the session:
  - new commits on `main` and `nannydraft` (what Lovable did)
  - how far `nannyclaude` is behind `main`
  - files both Claude and Lovable have changed (conflict risk)
- Re-run the script before any commit, push, or PR, and whenever the user asks for status.
- If Lovable has changed a file Claude is about to edit, tell the user before editing it.

## Commit / push / PR: always report safety

Claude never commits, pushes, or opens a PR without the user's go-ahead. Whenever work reaches a natural stopping point, or the user asks, give this report, based on a fresh run of the status script plus checks:

```
Commit: SAFE / NOT SAFE  (reason)
Push:   SAFE / NOT SAFE  (reason)
PR:     SAFE / NOT SAFE  (reason)
```

It is only SAFE when all of these are true:

- **Commit:** on `nannyclaude`; `bun run build`, `bun run test` and lint (see below) pass; no secrets in the diff; nothing in `supabase/migrations/`, `drizzle/`, or auto-generated files.
- **Push:** commit conditions hold, and local `nannyclaude` is not behind `origin/nannyclaude`.
- **PR (`nannyclaude` → `main`):** push conditions hold; `nannyclaude` merges cleanly with the latest `main` (the status script tests this); and if `main` has new commits, merge them into `nannyclaude` and re-test first. Mention any overlap with Lovable's pending work on `nannydraft`.

## Project

- Vite + React + TypeScript, shadcn/ui, Tailwind. Built with Lovable (live: https://askmynanny.lovable.app).
- Use **Bun**, not npm: `bun install`, `bun run dev`, `bun run build`, `bun run test`. (`npm install` crashes on this project's `overrides`; Netlify also picks Bun because of `bun.lock`.)
- Lint: 83 of 88 files on `main` were committed with CRLF line endings, so `bun run lint` fails on Prettier `␍` errors that already exist upstream. Judge lint with `bun x eslint . --rule "prettier/prettier: off"` (expect 0 errors). Don't mass-fix line endings on `nannyclaude`; it would conflict with Lovable's work.
- A build regenerates `src/routeTree.gen.ts` (auto-generated). If it changed only line endings, revert it with `git checkout -- src/routeTree.gen.ts`.
- Netlify deploys use `netlify.toml` (`NITRO_PRESET=netlify`, publish `dist`). A plain `bun run build` still targets Cloudflare, which is what Lovable uses.
- GitHub: `feladelpobre/askmynanny` (public repo, so never commit secrets). The `gh` CLI is at `C:\Program Files\GitHub CLI\gh.exe` if not on PATH.
