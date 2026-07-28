# Project Plan

## Project Phase: BUILDING

> **This marker controls how Claude behaves at the start of every session — read it first.**
> - `BRAINSTORMING` — the vision/roadmap below isn't settled yet. Before building features, help the user complete the Vision and Features sections. Ask, propose, refine. Don't jump into code.
> - `BUILDING` — the roadmap is agreed. Follow the normal build workflow in CLAUDE.md.
>
> Flip this to `BUILDING` once the user confirms the roadmap is solid enough to start building.

## Current Focus

> The 30-second cold-start brief — so a fresh session (or a post-compaction one) can resume *without re-reading everything*. Kept current by `/checkpoint`: **the tight brief only** lives here (~15–30 lines); the full session reports go to `docs/CHECKPOINTS.md` (created by `/checkpoint`, newest first). **Read this first**, then read only the docs the "Start here" line points to. **"Next" is the tip, not the queue:** the full picture is the Features table below (priority-ordered) plus any un-triaged ideas in `docs/BACKLOG.md`.

_Last checkpoint: e80d763 (2026-07-27)_

- **Just shipped:** **v1.1.0** — `spiker` + `librarian` forged, built, and tandem-validated in one session (v1.0.0 was claimed earlier the same day). Orchestrate is now a 6-agent bundle. Two bonus resolutions fell out: §1 now splits ambiguity-of-intent from uncertainty-of-fact, and the Ending convention's parked no-feature-doc middle case is closed (→ dated BACKLOG entry). RULES gained a frontmatter-YAML rule after a colon-space silently dropped a whole frontmatter block. _(Local install still has the 0.3.0 cache — `/plugin marketplace update repertoire` + restart to pull.)_
- **In flight:** nothing — clean stopping point. All three P2 expansion rows are `done`.
- **Next:** no build queue by design — residents arrive when a gap bites (one line into `docs/BACKLOG.md` → `/forge` on recurrence). _(user-stated 2026-07-19, reaffirmed 2026-07-27.)_ Nearest concrete candidate if you want one: the **runtime `tools:` question** (BACKLOG 2026-07-27) — does an invalid entry get dropped individually, or discard the whole allowlist? That decides whether the RED spike is a footnote or a real hazard. Queue tail: 2 non-`done` Features rows (P3 demand-driven intake, P4 Codex export) + ~14 un-triaged BACKLOG ideas.
- **Watch (designed but unobserved):** reviewer FAIL→fix-round path, spiker INCONCLUSIVE + worktree-isolation paths, librarian respawn after a real compaction. ~~Also unverified until a restart: that both new agents load as `repertoire:*` types from the installed plugin.~~ **Verified 2026-07-28** — `repertoire:spiker` and `repertoire:librarian` both appear in the session's agent roster and `repertoire:spiker` ran live; plugin discovery works. **New unobserved path found instead:** a spiker can stall waiting on its own background children and return prose instead of a VERDICT (→ feature-orchestrate Gotchas).
- **Start here:** `docs/feature-orchestrate.md` (both 2026-07-27 revisions + Spike findings), `plugins/repertoire/skills/orchestrate/SKILL.md` §1/§2/§6, `docs/RULES.md` §Resident Conventions

## Vision

A personal, public-by-intent library of **agent artifacts** — skills, always-on rules, and skill+agent bundles — one repo, one folder per resident, installable into Claude Code (and possibly Codex) at user scope. It is the adopter-side complement to [growing-docs](https://github.com/raihank43/claude-growing-docs): generic engineering disciplines live here; docs-artifact commands live in the plugin.

**Distinctive angle:** every resident that produces durable knowledge declares its *docs-shaped ending* — where output lands when the host is a growing-docs project — with a graceful chat-only fallback elsewhere. A second compliance shape exists: rules a growing-docs gate *recognizes and yields to* (minimalism). Concrete convention shape: to be decided this brainstorm.

**Hard constraints** (from the pitch, confirmed 2026-07-19):
1. Separate repo from growing-docs; dependency points one way only (this repo → growing-docs conventions, never the reverse).
2. Third-party residents carry provenance: upstream repo + pinned SHA + modifications noted. Never silently fork.
3. Skills are prompts, not code (markdown + frontmatter); any installer stays a thin copy script.

### Feasibility notes (verified 2026-07-19)

**Reference repo 1 — [asrafilll/work-skills](https://github.com/asrafilll/work-skills)** (the senior's; shape-proven model):
- One top-level folder per skill: `SKILL.md` (YAML frontmatter `name`, `description` with "Use when…" phrasing) + optional reference `.md`s + optional `variants/codex/SKILL.md`.
- No central registry — interactive `install.sh` auto-discovers folders; targets claude (`~/.claude/skills/`, env override `CLAUDE_SKILLS_DIR`) and/or codex (`~/.codex/skills/`); flags `--all --target --list --force`; restart required (skills discovered at startup).
- Provenance style: pinned short SHA + upstream repo + one-line modification note per third-party skill (e.g. taste-skill @ `3c7017d636c3`, "frontmatter name aligned to folder; body untouched").
- 19 skills incl. ponytail (minimalism's upstream cousin), grill-me, pre-flight, handoff, caveman.

**Reference repo 2 — [mattpocock/skills](https://github.com/mattpocock/skills)** (MIT, ~177k stars):
- Skills under `skills/engineering/` and `skills/productivity/` (category subfolders — a contrast to the senior's flat layout).
- Key convention worth stealing: **user-invoked vs model-invoked** as a first-class split; rule: a user-invoked skill may invoke model-invoked ones, never another user-invoked one.
- Dual install: `npx skills@latest add mattpocock/skills` (copies editable files into a project — fork-to-own) **and** Claude Code plugin marketplace (`/plugin marketplace add mattpocock/skills`) as a read-only auto-updating subscription. Frames these as opposite philosophies.
- Notable residents to triage: tdd, diagnosing-bugs (maps to our debug-to-gotcha idea), research, code-review, grill-me/grilling, handoff, writing-great-skills, resolving-merge-conflicts.
- Claims to work with any Agent-Skills-standard harness; native Codex plugin only on roadmap.

**Official Claude Code / Codex docs** (verified 2026-07-19 via research agent; each claim cited):
- **Plugins can ship** `skills/`, `agents/`, `hooks/`, MCP servers, `commands/` (legacy — docs recommend `skills/` for new work; custom commands have been merged into skills) ([plugins-reference](https://code.claude.com/docs/en/plugins-reference), [skills](https://code.claude.com/docs/en/skills)).
- **Plugins canNOT ship always-on rules/context**: "A `CLAUDE.md` file at the plugin root is not loaded as project context." No rules/ component exists ([plugins-reference#plugin-directory-structure](https://code.claude.com/docs/en/plugins-reference#plugin-directory-structure)). → A rule resident (minimalism) must be *scaffolded by a command*, not shipped as plugin context — which is exactly the shape `/minimalism` already has.
- **User-level `~/.claude/rules/` EXISTS** and applies to every project; user rules load before project rules (project wins on conflict) ([memory#user-level-rules](https://code.claude.com/docs/en/memory#user-level-rules)). → Minimalism gains a possible third destination: user-scoped always-on.
- **Plugin install scopes**: user scope = personal, all projects; marketplace = `.claude-plugin/marketplace.json` in own repo, `/plugin marketplace add owner/repo`, `/plugin install name@marketplace`, update via `/plugin marketplace update`; private repos supported with git credentials ([plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)).
- **Loose user-scope dirs all confirmed**: `~/.claude/skills/`, `~/.claude/agents/`, `~/.claude/commands/` ([skills#where-skills-live](https://code.claude.com/docs/en/skills#where-skills-live), [sub-agents](https://code.claude.com/docs/en/sub-agents#choose-the-subagent-scope), [claude-directory](https://code.claude.com/docs/en/claude-directory)).
- **Codex interop**: both ecosystems follow the open **Agent Skills standard**; official Codex skill locations are `.agents/skills` (repo) and `~/.agents/skills` (user) ([developers.openai.com/codex/build-skills](https://developers.openai.com/codex/build-skills)) — note the senior's installer targets `~/.codex/skills/`, which does not match current official docs. Codex reads `AGENTS.md`, not `CLAUDE.md`; Claude Code docs suggest `@AGENTS.md` import for shared repos ([memory#agentsmd](https://code.claude.com/docs/en/memory#agentsmd)). No official page names cross-tool interop explicitly.

## Features

Un-triaged ideas live in `docs/BACKLOG.md` (created on demand) — **this table is canonical**: an idea that graduates gets a row here and is deleted from the backlog.

| Feature | Priority | Status | Doc |
|---------|----------|--------|-----|
| Plugin packaging skeleton (marketplace.json, plugin.json, install smoke-test; component dirs arrive with residents) | P1 | done | [feature-plugin-packaging.md](feature-plugin-packaging.md) |
| House conventions in RULES.md (`## Ending` section, invocation-mode frontmatter, provenance block format, resident README-table row) | P1 | done | [feature-house-conventions.md](feature-house-conventions.md) |
| Migrate `/minimalism` (command + embedded ruleset → plugin; user-scope destination added; provenance from ponytail) | P2 | done | [feature-minimalism.md](feature-minimalism.md) |
| Migrate `/orchestrate` bundle (skill + 4 agents; model-pinning portability; user-invoked mode; docs-ending shape) | P2 | done | [feature-orchestrate.md](feature-orchestrate.md) |
| Orchestrate expansion — `spiker` agent (5th agent; unknown-investigation tier + second brief shape) | P2 | done | [feature-orchestrate.md](feature-orchestrate.md) |
| Orchestrate expansion — `librarian` agent (session-scoped docs singleton; first resident that *consumes* the docs contract) | P2 | done | [feature-orchestrate.md](feature-orchestrate.md) |
| Demand-driven resident intake (capture gaps in BACKLOG while working; `/forge` on recurrence — build or borrow decided then; borrow-list tip: tdd, code-review from mattpocock/skills) | P3 | planned | — |
| Codex export path (thin copy to `~/.agents/skills`) | P4 | planned | — |

Status values: `planned` | `in-progress` | `done` | `cut`

## Decisions Log

Record every significant decision so future-you (or post-compaction-you) knows WHY things are the way they are. Append new rows at the bottom — newest last.

| Decision | Rationale | Date |
|----------|-----------|------|
| Name: **repertoire** | A performer's practiced pieces — fits a mixed library of skills/rules/agent bundles; no collision with the senior's `work-skills` | 2026-07-19 |
| Hard constraints adopted as pitched | Separate repo from growing-docs (one-way dependency); third-party provenance (upstream + pinned SHA + mods); prompts-not-code with thin installer | 2026-07-19 |
| **Two repos** for work vs personal | repertoire stays public-safe by construction; a private work repo can extend it later. Gitignored `work/` dir rejected as one-bad-`git add`-from-a-leak | 2026-07-19 |
| **Layout by artifact shape**: `skills/`, `rules/`, with bundle agents living beside their SKILL.md | Shape determines install destination, so the tree is the installer's routing table — keeps the installer thin (constraint #3). Topic categories rejected: topic doesn't determine install target | 2026-07-19 |
| **User-invoked vs model-invoked** is a first-class per-skill convention (from mattpocock/skills) | Every skill declares its invocation mode; user-invoked may call model-invoked, never each other. Resolves orchestrate migration Q3: publish as user-invoked — same behavior as today's `disable-model-invocation`, but as doctrine not caution | 2026-07-19 |
| **Install via Claude Code plugin marketplace** (marketplace.json in this repo, one plugin) | Proven model from growing-docs; ships skills+agents+commands together with versioned auto-update at user scope; solves orchestrate's bundle-install problem natively. Verified against official plugins-reference | 2026-07-19 |
| **Claude-only for now**; Codex deferred to backlog | User doesn't run Codex day-to-day; Agent Skills standard means SKILL.md folders port later via a thin copy step to `~/.agents/skills` | 2026-07-19 |
| Compliance convention = **`## Ending` section** in SKILL.md body (for skills producing durable knowledge) | The body is what the model executes — frontmatter is inert for behavior. States where output lands in a growing-docs host + chat-only fallback. Minimalism's inverse shape (gate-recognized rule) gets a provenance note instead. Convention documented once in RULES.md | 2026-07-19 |
| Plugin **semver from 0.1.0**; 1.0.0 gated on both P2 migrations landing validated | Empty-shell skeleton shouldn't claim v1; patch = fix, minor = resident change (forge: plugin-packaging) | 2026-07-19 |
| Invocation mode declared by the **native `disable-model-invocation` field alone** | The mechanism is the declaration — a parallel custom marker would be inert and drift-prone (forge: house-conventions) | 2026-07-19 |
| Provenance = **inert HTML comment in the resident file** + README short form | Lineage travels with a copied file without spending prompt tokens; rendered body section rejected (forge: house-conventions) | 2026-07-19 |
| Rule residents = **command with embedded ruleset block**, no top-level `rules/` dir | Proven v3 single-file shape; a standalone file the command Reads adds a `${CLAUDE_PLUGIN_ROOT}` runtime dependency for zero behavioral gain (forge: minimalism) | 2026-07-19 |
| **P3 triage order: debug-to-gotcha first**, pre-flight adapt-later, handoff route-to-growing-docs-or-cut; principle = flagship-value → friction → throughput | Advisor consult (Fable, SUPERVISOR mode — doubled as the mode's validation run): debug-to-gotcha is original, the canonical `## Ending` exemplar, and closes the parked growing-docs ownership question. Would-change-my-mind: if the user's near-term pain is session-start discipline, pre-flight-first is defensible; if growing-docs' parked entry specifies docs-in/docs-out, ownership flips | 2026-07-19 |
| **Ambiguity vs uncertainty is a routing distinction, not a synonym** — ambiguous about what the *user wants* → the orchestrator handles it; uncertain about what's *true* → delegate the investigation | Orchestrate §1 conflated them under "handle it yourself when ambiguous", which structurally excluded spiking. The split is general doctrine, not a spiker patch (forge: spiker) | 2026-07-27 |
| **Ending convention's no-feature-doc fallback = dated entry in `docs/BACKLOG.md`**; chain stays inside the docs bullet | Closes the middle case the advisor parked 2026-07-19 for the debug-to-gotcha forge that never happened. The "exactly two bullets" rule survived its first flex test — a third bullet would have changed the shape for every resident to solve a case only one had hit (forge: spiker) | 2026-07-27 |
| **`librarian` stays a bundle member, not a standalone resident** (advisor PEER consult, 2026-07-27) | Advisor rebutted the orchestrator's load-bearing argument with a citation: the singleton rule travels in the agent's own `description` (`librarian.md:3`), so it isn't stranded in the skill; and de-facto standalone availability is true of all six agents, so it doesn't distinguish this one. A standalone-agent row would also collide with the README hyperlink rule (the file would appear twice). **Revisit trigger (its would-change-my-mind, verbatim):** "If you observe yourself (or the user) reaching for the librarian in non-orchestrate sessions **three or more times**, or if duplicate-spawn respawns turn out to be frequent — that's the gotcha's own watch condition firing, and it's a `/forge` trigger, not a README-row trigger." Also flips if `SendMessage`-to-a-persistent-agent proves unavailable outside a skill context | 2026-07-27 |
| **Delegated-agent correctness may never depend on the caller remembering** — prefer self-enforcing designs (librarian's verify-before-cite) over protocol discipline (push-notify on doc writes) | A forgotten notification doesn't degrade, it produces a silent confident lie. General doctrine for any future stateful resident (forge: librarian) | 2026-07-27 |
| **Session-scoped singleton** is a new agent shape alongside stateless fan-out — spawn once, `SendMessage` thereafter | Statefulness and parallelism are structurally incompatible; explorer stays fan-out, librarian is the first singleton. Needs its own SKILL.md section because a second `Agent` call silently destroys the value (forge: librarian) | 2026-07-27 |
| **v1.0.0 released**; post-1.0 semver: major = breaking change to how residents install or invoke | The forged gate (both P2 migrations landed validated) was met at v0.3.0; 0.x was understating a plugin in daily use as the single source of truth. The original forge defined patch/minor only — major needed a meaning before it could be claimed | 2026-07-27 |
| **P3 reframed: demand-driven intake supersedes the triage build-queue** — capture gaps in BACKLOG while working, `/forge` on recurrence; engineering-practice skills over workflow-shaped ones | User call, via the advisor's own would-change-my-mind clause (only the user knows the near-term pain). All three shortlisted candidates are workflow-shaped and overlap growing-docs in adopted repos (debug-to-gotcha's ending ≈ the workflow's mandated gotcha capture; pre-flight ≈ Step 1; handoff ≈ /checkpoint) — their value activates only in un-adopted repos. Mirrors house doctrine: minimalism rung 1 + growing-docs' organic-only precedent. Borrow-list tip if a gap pulls: tdd, code-review | 2026-07-19 |

## Rejected Ideas

Record ideas we considered and explicitly decided NOT to do. This prevents re-suggesting them after compaction. Append new rows at the bottom — newest last.

| Idea | Why Rejected | Date |
|------|-------------|------|
| Names `loadout`, `setlist` | User preferred `repertoire`; setlist implied curation/ordering more than capability-hosting | 2026-07-19 |
| One private repo for work + personal | Kills publishing/sharing and the growing-docs cross-pointer | 2026-07-19 |
| Public repo + gitignored `work/` dir | Leak-fragile; work skills would get no version history | 2026-07-19 |
| Topic-category folders (Pocock-style `engineering/`, `productivity/`) | Topic doesn't determine install destination — routing metadata would still be needed on top | 2026-07-19 |
| Copy-script installer (senior's model) | No auto-update, script maintenance burden; plugin marketplace covers everything needed for Claude. Revisit only as a thin Codex export if that need materializes | 2026-07-19 |
| Codex support from day one | Variant maintenance for a harness not in daily use; the senior's `~/.codex/skills/` target doesn't even match current official Codex docs (`~/.agents/skills`) — evidence the target is still shifting | 2026-07-19 |
| Compliance as frontmatter field (`ending:`) | Frontmatter doesn't drive model behavior; the body section would still be needed, making the field redundant | 2026-07-19 |
| A dedicated **E2E-tester agent** (6th bundle member) | Contract-identical to task-runner — E2E work has deterministic acceptance ("suite green"), which the existing brief shape already expresses. Under-use was a routing-visibility problem; fixed with §1 wording instead. Two agents sharing one contract invite muddled briefs (forge: spiker) | 2026-07-27 |
