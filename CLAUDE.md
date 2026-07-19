<!-- growing-docs template v1.24.0 — stamped at scaffold/upgrade time; /project-adopt reads this to upgrade precisely. Keep this line. -->
# repertoire

## Invariants — never break these, in any context

Operation-shaped absolutes guarding against **irreversible harm** (data loss, history rewrites, leaked secrets, user-data writes). One incident of that class qualifies a rule — don't wait for a second unrecoverable bite. Write each as an absolute about an *operation* ("never X, in any context"), never about a workflow ("when doing Y, avoid X") — violations arrive wearing situations the rule's author never pictured. **Hard cap: 10** — scarcity is what keeps these salient. `/checkpoint` runs the audit that feeds this list, plus promotions and evictions; a rule born from a project incident links to its full story in `docs/RULES.md`.

- An automated script or teardown may only delete the exact paths it created. Anything found by *content search* is printed as a manifest for the user — never deleted. _(seed)_
- Never rewrite pushed git history (force-push, reset past a pushed commit) without the user's explicit go-ahead in the current session. _(seed)_

## Workflow — Follow This For Every Change

This workflow applies to every request that **changes the project** — a major feature, a one-line fix, a small addition, a refactor, a bug fix. Size doesn't matter: if it alters behavior, structure, or conventions, the full sequence runs. There is no change too small to skip it.

**Carve-out:** read-only requests — explaining code, answering "what does this do?", exploring without touching anything — skip the checklist. This applies to *changes*, not *conversations*. Rule of thumb: if you created or modified a file, the workflow applies.

### Step 1: Read Before You Work
1. Read this file fully
2. Open `/docs/PLAN.md` and check the **Project Phase** marker at the top FIRST:
   - If `BRAINSTORMING`, the roadmap isn't settled yet — help the user flesh out the vision and features before writing code. Don't jump straight into building.
   - If `BUILDING`, proceed normally.
3. Read **Current Focus** (top of PLAN.md) — the cold-start brief of where things left off (just-shipped / in-flight / next). If it has a **Start here** line, read those docs first; they're the ones relevant to resuming. This is your fastest path back into context — read them, not the whole `/docs/` tree. For direction questions ("what's next?", "what's on our table?"), **Next** is the tip, not the queue — answer from the Features table (priority order) plus a skim of `docs/BACKLOG.md` if it exists, never from Current Focus alone.
4. Use PLAN.md's **Features table as your map**: find the feature you're about to touch and open the doc in its `Doc` column. The table is the index — don't go globbing blindly through `/docs/`.
5. Check `/docs/RULES.md` for conventions to follow

### Step 2: Do The Work
- Follow all conventions in `/docs/RULES.md`
- Follow the architecture patterns in `/docs/ARCHITECTURE.md`
- If you discover a gotcha, edge case, or non-obvious behavior — write it down immediately in the relevant feature doc before you forget
- When a hard debugging session ends, capture **both halves**: the root cause (a Gotcha) *and* the hypotheses you ruled out on the way — failed hypotheses are rejected-ideas-for-debugging; the next session shouldn't re-walk your dead ends
- **Code is the source of truth.** If a doc contradicts what the code actually does, the code wins — fix the doc as part of your change. Stale docs that lie are worse than no docs. If two docs disagree with *each other*, precedence runs: code → the relevant `feature-*.md` → `ARCHITECTURE.md` / `PLAN.md` → `README.md`. Reconcile toward the higher-precedence source.

### Step 3: Update Documentation (BEFORE committing)
After the code change is done, go through this checklist and **decide** for each item whether it needs updating. Don't skip the decision — actively consider each one:

- [ ] **Feature doc** in `/docs/` — Create a new one if this is a new feature (even a small one). Update the existing one if you modified a feature. A "feature" is anything a user would notice or a developer would need to know about.
- [ ] **`/docs/PLAN.md`** — Did a feature's status change? Was something new added that should be tracked? Did we make a decision worth logging? Update the features table and/or decisions log.
- [ ] **`README.md`** — Would a human reading this project for the first time need to know about what just changed? If yes, update it. New features, changed behavior, new commands — these all belong in README.
- [ ] **`/docs/ARCHITECTURE.md`** — Did the system structure, data flow, or tech stack change?
- [ ] **`/docs/RULES.md`** — Did you establish a new convention, discover an anti-pattern, or learn something about how code should be written in this project?
- [ ] **Comment sweep** — comments *you wrote this session* whose story just landed in a doc: compact each to a one-line why + a pointer, in this same change. The doc carries the story; the comment carries the conclusion. (Pre-existing comments are not this sweep — those follow `docs/RULES.md` → Comments: opportunistic, move → verify → remove.)

Not every item needs updating every time. But you must **consider** every item every time. The decision to NOT update a doc should be conscious, not accidental.

**Minimalist-ruleset carve-out:** if a token-efficiency ruleset ("shortest diff, delete the explanation, no design notes") is active in this session, it governs code and chat prose — never this checklist. The docs' why-capture (gotchas, rejected ideas, failed hypotheses) is a required deliverable of the workflow, not unrequested prose; don't let "minimize" bias these decisions toward skip.

When you update a doc that carries a `Last updated:` line (feature docs, ARCHITECTURE.md), refresh it to today's date or the current short commit SHA. It's a **recency signal** so a future session can gauge staleness at a glance — *not* a correctness guarantee. If the code has moved past that point, trust the code.

### Step 4: Verify It Works
Before committing, confirm the change actually works — don't commit blind. Run the app or the relevant tests if they exist; if there's nothing runnable yet, at least sanity-check that what you wrote is coherent. Committing often is meant to capture a clean history of *working* states, not a log of broken ones.

### Step 5: Commit and Push
- **Never stage secrets** — `.env`, credentials, API keys, tokens. Confirm they're gitignored before staging.
- Stage all changes including doc updates
- Write a clear commit message (see Git section below)
- **Push only if a remote is configured.** If this is local-only git, commit locally and skip the push — don't error out pushing to a remote that doesn't exist.

### When Adding a New Feature
**If the feature lacks a decided design** — it's a one-line backlog entry with no doc, has more than one viable approach or an open UX choice, overlaps an existing feature, or revisits a rejected idea — **offer to `/forge` it first.** Forge is a relentless, one-question-at-a-time design interview that produces the decided design (with rejected alternatives) before any code. Offer when there's *real* ambiguity; skip it for mechanical or fully-specified changes, and never force it. Then build from the result.

First check the Features table in `docs/PLAN.md` — if a doc for this feature already exists, update that one instead of creating a near-duplicate (don't end up with both `feature-auth.md` and `feature-authentication.md`). Otherwise, copy `docs/_feature-template.md` to `docs/feature-{feature-name}.md`, fill it in, set its `Last updated:` line, and add a row to the Features table pointing to it.

### When Modifying an Existing Feature
- Read its doc first
- Update the doc with what changed
- Add new gotchas if you discovered any
- Update the changelog

### When You Learn Something Cross-Cutting
Cross-cutting knowledge has two homes — pick the right one:

- **About the *project's code*** — a convention, a pattern, or an anti-pattern that spans features → write it to **`docs/RULES.md`**. It's project knowledge: it belongs in the repo and is committed with everything else.
- **About the *user or how you work together*** — their preferences, working style, an external system they use, feedback on what does/doesn't land → write it to **Claude Code memory** (the user-level store *outside* the repo), so it persists across every project, not just this one. Keep memory files small and focused — one topic each.

Rule of thumb: if it would help anyone working on *this repo*, it's `RULES.md`. If it only makes sense because it's *this user*, it's memory.

### Checkpoints
At natural save points — a feature landed, before a break, or before the conversation gets large enough that you'll want to start fresh — run `/checkpoint`. It sweeps the docs against the code *and* this conversation, captures anything discussed-but-unwritten (decisions, gotchas, rejected ideas, backlog-worthy idea dumps), refreshes the `Last updated:` markers, appends the full session report to `docs/CHECKPOINTS.md`, and writes a tight Current Focus handoff brief. It's the deliberate, lossless alternative to waiting for auto-compaction: checkpoint, then start a fresh chat that inherits everything through the docs. During build-phase sessions, `/checkpoint lite` can capture the conversation cheaply; run a full `/checkpoint` at real milestones to sweep everything deferred. At milestones — or when a sharper model lands — also consider `/rethink`: it challenges the project against its own docs and proposes better; when the queue feels thin, `/scout` proposes what to build next. Accepted rethink proposals and scout ideas flow through `/forge`, with parked scout ideas entering BACKLOG first.

## Git Convention

Commit after every meaningful, **verified** change — never let working code accumulate uncommitted. Push too, *if a remote is configured*; otherwise local commits are fine. Never commit secrets (`.env`, credentials, keys) — keep them gitignored.

- **Format**: `type(scope): description`
- **Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`
- **Scope**: feature name or area (e.g., `auth`, `api`, `docs`)
- **Examples**:
  - `feat(auth): add JWT token refresh flow`
  - `fix(cart): prevent negative quantity on item update`
  - `docs(search): document elasticsearch gotchas`

Remote: https://github.com/raihank43/repertoire (public)

## Project Artifacts Index

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file — workflow instructions and artifact index |
| `README.md` | Human-readable project overview |
| `docs/PLAN.md` | Roadmap, brainstorming output, feature status, decision log |
| `docs/ARCHITECTURE.md` | Tech stack, folder structure, system design, data flow |
| `docs/RULES.md` | Code conventions, naming rules, anti-patterns |
| `docs/_feature-template.md` | Template to copy when documenting a new feature |
| `docs/feature-*.md` | Per-feature documentation (created as features are built) |
| `docs/proposals/` | `/rethink` and `/scout` output — dated proposal files (created on demand) |
| `docs/CHECKPOINTS.md` | Full `/checkpoint` session reports, newest first (created on demand) |
| `docs/BACKLOG.md` | Un-triaged idea dumps in dated batches (created on demand; the PLAN Features table is canonical) |

## Complex Decisions

For brainstorming sessions, architecture trade-offs, debugging complex issues, or any decision where you need to weigh multiple competing approaches — reason it through step by step rather than answering off the cuff. If the **sequential thinking MCP** (`sequentialthinking`) is available, use it; otherwise just think carefully and methodically.

Don't over-think routine tasks (following this checklist, writing straightforward code, updating docs). Reserve the deep reasoning for when the *thinking itself* is the hard part.
