# Code Rules

_Entry shape: an entry here is a **generalized rule — imperative + one-line why + a pointer** to the feature doc holding the full story (the incident, the failed hypotheses, the fix mechanics). If a rule needs a war story to be believed, the story goes in the feature doc's Gotchas and gets linked — RULES stays skimmable in one pass._

## Main Principles

- **Residents are prompts, not code** (hard constraint): markdown + YAML frontmatter only. Any tooling stays a thin copy step; the plugin system is the installer.
- **Enforcement layer determines placement:** what the *harness* enforces goes in frontmatter (invocation mode); what the *model* must execute goes in the body (`## Ending`); what neither needs goes inert (provenance comment). Never restate one layer in another — the duplicate drifts.
- **Two compliance shapes** with growing-docs: most skills *produce a docs ending*; rules like minimalism are instead *recognized by a growing-docs gate* (vocabulary-compatible, no Ending section). Don't bolt an Ending onto a rule — see `docs/feature-house-conventions.md` Gotchas.

## Resident Conventions

_Full design + rejected alternatives: `docs/feature-house-conventions.md`._

### Invocation mode (skills)

Declared by the native frontmatter field alone — no parallel marker:

- **User-invoked** → `disable-model-invocation: true`; invoked as `/repertoire:<name>`.
- **Model-invoked** → omit the field; `description` phrased as "Use when…" so auto-invocation triggers well.

Doctrine (from mattpocock/skills): a user-invoked skill may invoke model-invoked ones, **never another user-invoked one**.

### `## Ending` section (skills producing durable knowledge)

Required last body section; opens with the detection cue, then exactly two bullets:

```markdown
## Ending
Where the output lands. If the host repo is a growing-docs project (has `docs/PLAN.md`):
- **Docs ending:** <where in the docs tree, which section>
- **Elsewhere:** <chat-only fallback>
```

Skills that produce nothing durable, and rule residents, omit the section.

**No-feature-doc fallback (2026-07-27):** when the host *is* a growing-docs project but no feature doc covers what was produced, the docs bullet falls back to a dated entry in `docs/BACKLOG.md` — homeless output is un-triaged knowledge, which is that file's purpose. Keep the chain **inside** the docs-ending bullet; the two-bullet rule held at its first flex test. Full story: `docs/feature-orchestrate.md` Gotchas.

### Frontmatter YAML — never use a bare `: ` inside an unquoted value

Use parentheses or an em dash instead of a colon in `description` (or quote the whole scalar). A colon-space makes YAML read the value as a nested mapping and **the entire frontmatter block is silently dropped at runtime** — including `disable-model-invocation`, which would turn a user-invoked skill model-invocable without any visible error. `claude plugin validate` catches it; run it after touching any frontmatter. Story: `docs/feature-orchestrate.md` Gotchas.

**Proofread `model:`, `tools:` and `reasoningEffort:` by eye — the validator does not.** Two spikes (2026-07-27) bound what `claude plugin validate` buys you: YAML *syntax* is caught, field *semantics* are not — a bogus model alias or a misspelled tool name passes clean, `--strict` included. Checking by eye rather than by script is deliberate: a linter would breach the prompts-not-code constraint.

Runtime spikes (2026-07-28) then graded how loudly each field fails, and they are **not** equally forgiving — proofread hardest where the feedback is weakest:

| Field | Bad value at runtime | Valid domain |
|---|---|---|
| `model:` | **Loud** — visible API error, agent terminates at spawn | aliases *or* full version names (`claude-opus-4-8` resolves) |
| `tools:` | **Quiet but bounded** — the bad entry is dropped individually, the rest of the allowlist holds; no privilege escalation | exact tool names, casing untested |
| `reasoningEffort:` | **Silent** — `banana` runs clean, falling back to something unknown | `low`, `medium`, `high`, `xhigh`, `max` (case-insensitive); per `claude --help` |

`reasoningEffort` is the dangerous one: it is the only field that gives you *no* signal when wrong, and the only one with no spawn-time override to correct it with. Story: `docs/feature-orchestrate.md` Spike findings.

### Composition changes — grep the old count before committing

**When a resident's composition changes — an agent added to or removed from a bundle — search the docs for the previous count and every enumeration of its parts, in the same change.** The count is restated in more places than memory reaches: ARCHITECTURE's tree comment and Bundles list, RULES' README-table example and Glossary, the feature doc's title and Description, the README row. Story: `docs/feature-orchestrate.md` Gotchas (v1.1.0 shipped seven such lines stale). Historical statements — changelog entries, dated forge records, checkpoint reports — describe a past state and must **not** be updated.

### Provenance block (third-party / derived residents)

Inert HTML comment immediately after the frontmatter of the resident's main file — lineage travels with a copied file without entering the prompt:

```markdown
<!-- provenance
upstream: <repo url> (<license>)
pinned:   <short SHA> | reimplemented, not forked
mods:     <one per line>
-->
```

Original residents skip the block and state `original` in the README table.

### README resident table

Every resident gets a row — five columns:

```markdown
| Resident | Shape | Invocation | What it does | Provenance |
```

Shape names the artifact bundle ("skill + 6 agents", "rule + command"). Invocation: the slash command for user-invoked, `model-invoked`, or `—` for non-skills. Provenance: `original` or `derived: <upstream> (<license>)`.

**Hyperlink rule (2026-07-19):** the Resident cell links to the resident's main file (SKILL.md / command md); a bundle's Shape cell links each shipped agent file. Every artifact a row mentions is one click from the README.

### Live-state single-flight (Invariant #3 — the story)

**Never fan out concurrent probes against a single live shared credential, session, or quota pool — single-flight only, in any context.** Born 2026-07-30 from a real incident in the user's Setsuna repo: during a ~2h debugging spiral over a proxy auth failure, the orchestrator escalated a single-probe question into **three concurrent probes against the user's one live shared credential**, tripping the app's auth-failure banner on the user's live session — twice. Concurrent probes against one live resource can lock accounts, trip rate limits and abuse detectors, corrupt session state, and burn shared quota — and the blast radius lands on the *user's* running work, not the repo. One incident of that class qualifies a rule.

The operation-shaped ban lives in CLAUDE.md's Invariants (always-on, mechanically checkable). Its judgment-shaped sibling — the consent gate before a *second consequential touch* of live state — deliberately did **not** graduate to an invariant: "consequential" needs interpretation, which is exactly where a mid-spiral agent slips through; it lives in orchestrate's SKILL.md §5, where the operational definition has room. Full design + rejected alternatives: `docs/feature-orchestrate.md` → Revision 2026-07-30.

### Versioning

Plugin semver, post-1.0: **patch** = fixes/wording, **minor** = new or changed resident, **major** = a breaking change to how residents install or invoke. Bump `plugins/repertoire/.claude-plugin/plugin.json` on every plugin change.

## Folder Structure Conventions

_The actual current tree lives in ARCHITECTURE.md — this section is the *why*, not a copy of it._

- **Split the top level by artifact shape, not topic.** Shape determines install destination, which keeps the installer thin; topic categories were rejected because topic doesn't determine install target. Full story: `docs/PLAN.md` Decisions log.
- **Create component dirs (`skills/`, `agents/`, `commands/`, `rules/`) only when the first resident needs them — never commit them empty.** Git can't track empty dirs and Claude Code doesn't require them to exist. Full story: `docs/feature-plugin-packaging.md`.
- **Express a bundle as its SKILL.md in `skills/` plus its agent defs in `agents/`, cross-referenced in both directions.** Within the plugin, Claude Code itself dictates the `skills/` vs `agents/` vs `commands/` split. Full story: `docs/ARCHITECTURE.md`.

## Naming Conventions

{To be filled — naming rules for files, functions, variables, components, routes, etc.}

## Code Style

{To be filled — formatting, imports, patterns to follow.}

## Comments

Readable code first; comments stay compact. The docs carry the full detail — a comment is a *why* or a pointer (`see docs/feature-x.md`), never a duplicate of what a doc already explains. A one-liner for a non-obvious why is good; a comment restating the code or the docs is noise.

Existing comments: handle **opportunistically** — only when already touching that code. Update if stale. Before compacting a large comment, **verify its why is captured in a doc; if not, move it there first, then compact** (move → verify → remove — compacting is a delete, and uncaptured why is unrecoverable).

## Glossary

The project's domain language — terms code, docs, and conversations should use consistently. Grown organically: add a term when it's coined, or when a naming collision gets resolved (note the "not to be confused with…").

| Term | Meaning |
|------|---------|
| **resident** | One artifact hosted by this library (a skill, a rule, or a bundle) — "one folder per resident" |
| **shape** | A resident's artifact kind: skill / rule / bundle. Shape determines install destination |
| **bundle** | A skill plus the agent definitions it requires, installed together (e.g. orchestrate + its 6 agents) |
| **ending** | Where a skill's durable output lands — docs-shaped in a growing-docs host, chat fallback elsewhere |
| **gate-recognized** | The inverse compliance shape: a rule a growing-docs gate detects and yields to (minimalism), not one that writes docs |
| **spike** | Any time-boxed empirical investigation — forward (will this work?) *or* backward (why is this failing?). Deliberately wider than the XP sense; verdicts are GREEN / RED / **INCONCLUSIVE**, and INCONCLUSIVE never collapses into RED |
| **session-scoped singleton** | An agent spawned once per session and reused via `SendMessage` (librarian), as opposed to stateless fan-out (explorer). Statefulness and parallelism are incompatible — a second spawn silently destroys the value |

## Anti-Patterns

Things we tried that didn't work. **Do not repeat these.**

| Anti-Pattern | What Went Wrong | Better Approach |
|-------------|----------------|-----------------|
| | | |
