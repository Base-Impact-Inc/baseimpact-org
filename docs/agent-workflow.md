# Multi-editor workflow (agents + humans)

This repo is edited by more than one party at a time — Douglas, and automated agents
(e.g. Lexi). All commits currently land on `main` and carry the same author identity,
so history alone cannot tell you who changed what. Follow the rules below so edits
do not collide and a push never ships a half-finished change.

## Why this matters here

- `.github/workflows/ci.yml` runs build + axe accessibility + npm audit on every push
  to `main` and on PRs.
- Cloudflare Pages builds from `main`, so **every push to `main` is a production deploy**.
- Conflict-prone areas: `src/content/**` (posts, events, photos), `src/pages/**`,
  `src/lib/resources/data/*`, `public/_redirects`.

## Rules

1. **Never work directly on a local `main`.** Create a branch per task, named for the
   editor: `lexi/<topic>`, `hermes/<topic>`. Keep it short-lived; delete after merge.
2. **Sync before you start.** `git fetch origin` then `git switch main && git pull`
   (or rebase your branch: `git fetch origin && git rebase origin/main`).
3. **Rebase before you push**, especially on a long-running branch:
   `git fetch origin && git rebase origin/main --autostash`.
   Never force-push `main`. If a push is rejected as non-fast-forward, rebase — do not
   pull-merge a wall of unrelated agent commits.
4. **Stage explicit paths**, e.g. `git add src/pages/wishlist.astro`. Avoid `git add -A`
   / `git commit -a`: with another editor in the tree, that can commit their
   half-written file state.
5. **Build locally before pushing**: `npm run build`. A green build is the entry ticket;
   CI will rebuild anyway, but a broken push takes the live site down.
6. **Push the branch and open a PR** (`gh pr create`, or the GitHub compare URL).
   Squash-merge when the change is one logical unit. Do not push a WIP branch to `main`.
7. **Say what you are touching, before you touch it.** Post the files/pages in Discord
   or on the task board. Overlap in `src/content/**` or `src/pages/**` is where two
   editors most often clobber each other.
8. **Label the author in the commit message** so the log stays readable, e.g.
   subject prefix `[lexi]` / `[hermes]`, or a `Co-Authored-By:` trailer.
9. **One deploy at a time.** Whoever pushes to `main` triggers the Cloudflare build;
   coordinate timing if a big change is going out, and check the Pages deployment
   result before handing off.

## Quick checklist (per task)

```
git fetch origin
git switch -c <editor>/<topic> origin/main      # new task
# ...edit, npm run build...
git add <explicit paths>
git commit -m "[editor] <what and why>"
git fetch origin && git rebase origin/main --autostash
git push -u origin <editor>/<topic>
# open PR, squash-merge, delete branch
```

## Merge conflicts

If `git rebase` reports a conflict:

1. `git status` → open the marked files and resolve by hand.
2. Do not accept "theirs" blindly — the other editor's text may be newer and correct.
3. `git add <resolved files>` then `git rebase --continue`.
4. Re-run `npm run build` after resolving; conflicting markup in `.astro` files
   frequently breaks the build silently until compiled.
