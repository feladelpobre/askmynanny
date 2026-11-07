#!/usr/bin/env bash
# Branch status report for askmynanny.
# Fetches origin, then reports where nannyclaude stands against main (production)
# and nannydraft (Lovable's branch), plus a commit / push / PR safety verdict.
# Read-only apart from `git fetch`. Run: bash .claude/hooks/branch-status.sh

cd "$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Not in a git repo"; exit 0; }

git fetch origin --prune --quiet 2>/dev/null || echo "WARNING: git fetch failed (offline?) - remote info may be stale"

WORK=nannyclaude
cur=$(git branch --show-current)
counts() { git rev-list --left-right --count "$1...$2" 2>/dev/null; }

echo "=== askmynanny branch status ==="
echo "Current branch: $cur"
if [ "$cur" != "$WORK" ]; then
  echo "!! NOT on $WORK. Claude must only edit on $WORK. Do not commit here."
fi

dirty=$(git status --porcelain)
[ -n "$dirty" ] && { echo "Uncommitted changes:"; echo "$dirty" | sed 's/^/  /'; } || echo "Working tree clean"

read -r behind_lo ahead_lo <<<"$(counts origin/$WORK $WORK)"
read -r main_ahead work_ahead_main <<<"$(counts origin/main origin/$WORK)"
read -r draft_ahead work_ahead_draft <<<"$(counts origin/nannydraft origin/$WORK)"

echo
echo "Local $WORK vs origin/$WORK: $ahead_lo unpushed, $behind_lo not pulled"
echo "origin/main has $main_ahead commit(s) not in $WORK; $WORK has $work_ahead_main not in main"
echo "origin/nannydraft (Lovable) has $draft_ahead commit(s) not in $WORK"

echo
echo "--- Latest on main ---"
git log origin/main --format='  %h %ad %an: %s' --date=format:'%m-%d %H:%M' -5
echo "--- Latest on nannydraft (Lovable) ---"
git log origin/nannydraft --format='  %h %ad %an: %s' --date=format:'%m-%d %H:%M' -5

# Overlap: files changed on nannyclaude AND on nannydraft/main since they split.
overlap() {
  local other=$1 base
  base=$(git merge-base "$WORK" "$other" 2>/dev/null) || return
  comm -12 <(git diff --name-only "$base" "$WORK" | sort) \
           <(git diff --name-only "$base" "$other" | sort)
}
ov_draft=$(overlap origin/nannydraft)
ov_main=$(overlap origin/main)
[ -n "$ov_draft" ] && { echo; echo "Files edited by BOTH Claude and Lovable (conflict risk):"; echo "$ov_draft" | sed 's/^/  /'; }
[ -n "$ov_main" ] && { echo; echo "Files edited by BOTH $WORK and main (conflict risk):"; echo "$ov_main" | sed 's/^/  /'; }

# Real merge test against main, without touching the working tree.
conflict_main=""
if git merge-tree --write-tree origin/main "$WORK" >/dev/null 2>&1; then :; else
  conflict_main=yes
fi

echo
echo "=== Verdict ==="
if [ "$cur" != "$WORK" ]; then
  echo "COMMIT: NOT SAFE - wrong branch ($cur)"
elif echo "$dirty" | grep -qE '(supabase/migrations/|drizzle/)'; then
  echo "COMMIT: NOT SAFE - touches Lovable-managed DB files (supabase/migrations or drizzle)"
else
  echo "COMMIT: OK on $WORK (after build/lint/tests pass)"
fi
if [ "${behind_lo:-0}" -gt 0 ]; then
  echo "PUSH:   WAIT - pull origin/$WORK first ($behind_lo new commit(s))"
else
  echo "PUSH:   OK to push $WORK (never force-push)"
fi
if [ "${work_ahead_main:-0}" -eq 0 ]; then
  echo "PR:     NOTHING TO PR - $WORK has no commits that main lacks"
elif [ -n "$conflict_main" ]; then
  echo "PR:     NOT SAFE - $WORK conflicts with main; merge main into $WORK first"
elif [ "${main_ahead:-0}" -gt 0 ]; then
  echo "PR:     CAUTION - merges cleanly, but main has $main_ahead newer commit(s); merge main into $WORK and re-test first"
else
  echo "PR:     OK - $WORK -> main merges cleanly"
fi
exit 0
