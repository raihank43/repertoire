# House Conventions

_Last updated: 2026-08-26 — recency signal, not a correctness guarantee. If the code has moved past this, trust the code. Files / Dependencies / API below are **derivable caches** — when stale, regenerate them from the code; hand-maintain only the sections above them (the code can't re-derive those)._

## Description

The per-resident conventions every artifact in this library follows: how a skill declares its invocation mode, the shape of the `## Ending` section (the growing-docs compliance angle), the provenance block format for third-party/derived residents, and the README resident-table row. The build step writes these into `docs/RULES.md` (the canonical statement) and seeds the README table.

## Decided design

_Forged 2026-07-19 (all choices user-confirmed via interview)._

- **Invocation mode = the native field, nothing else:** user-invoked skills carry `disable-model-invocation: true` in frontmatter; model-invoked skills omit it (and phrase their `description` as "Use when…"). The mechanism *is* the declaration — no second marker to drift. Doctrine (from mattpocock/skills, adopted in the init brainstorm): a user-invoked skill may invoke model-invoked ones, never another user-invoked one. _(Rejected: an extra human-readable `mode:` frontmatter key — inert to Claude Code and a sync hazard; a body "Mode:" blockquote — prose restating what the field enforces.)_
- **`## Ending` = two fixed bullets:** required in every skill that produces durable knowledge; the section opens with the detection cue ("if the host repo is a growing-docs project — has `docs/PLAN.md`") then exactly two bullets: **Docs ending** (where output lands in the docs tree) and **Elsewhere** (the chat-only fallback). Uniform enough that the fallback can't be forgotten; light enough to dodge doc-theater. _(Rejected: free prose under the heading — fallback goes silently missing, endings drift; a third explicit **Detect** bullet per skill — detection is stated once in RULES.md, repeating it per-skill is boilerplate.)_
- **Provenance = HTML comment after the frontmatter + README short form:** third-party/derived residents carry an inert `<!-- provenance … -->` block (fields: `upstream` repo+license, `pinned` SHA or "reimplemented, not forked", `mods` one-per-line) at the top of the resident's main file, so lineage travels with the file when copied — without spending prompt tokens on it. README table carries the short form ("derived: ponytail (MIT)"). Original residents skip the block and say "original" in the README. _(Rejected: a rendered `## Provenance` body section — enters the model's context on every load for zero behavioral value; README-table-only, the senior's model — provenance detaches the moment a folder is copied out.)_
- **README resident table = five columns:** `Resident | Shape | Invocation | What it does | Provenance`. Shape names the artifact bundle ("skill + 4 agents", "rule + command"); Invocation shows the slash command for user-invoked residents, "model-invoked" otherwise, "—" for non-skills; docs-ending needs no column (visible in the skill body). _(Rejected: the senior's minimal 3-column table — a visitor can't tell skill from rule from bundle without clicking in; per-shape grouped sections — three tables is heavy at 2–6 residents, revisit if the library grows past ~10.)_

### Revision 2026-08-26 — invocation mode is two coupled axes, not one

_Forged 2026-08-26 alongside the orchestrate flip. **Design only** — the build step writes this into `docs/RULES.md` §Invocation mode._

- **The convention must state what the flag actually does.** `disable-model-invocation: true` blocks autonomous invocation **and** removes the skill from the model-visible catalog. The 2026-07-19 convention framed the choice as "can the model fire it?"; it is really "can the model fire it, **and does the model know it exists at all?**" An author reaching for the flag today has no way to learn they are also making the skill **un-suggestable** — the model cannot recommend what it has never heard of. Verified by contrast pair; evidence in `docs/feature-orchestrate.md` → Spike findings, 2026-08-26.
- **Default to model-invoked; locking now needs a two-part justification.** Lock only when **(a)** the skill is always deliberately invoked — the user knows they want it before the session starts, so visibility buys nothing — **and (b)** a spurious run is costly enough to be worth the invisibility. **If (a) fails, do not lock regardless of (b)** — use a body-level gate instead. Both live residents are worked examples: `orchestrate` fails (a) → unlocked, with a §1 self-initiative gate; `continue` passes (a) → stays locked. _(Rejected: recording the coupling as a Gotcha only and leaving the decision rule untouched — the next author would re-derive the same trade-off from scratch, which is the cost this convention exists to remove. Rejected: reframing the section as an explicit visibility × invocability matrix — the most honest model of reality, but only the diagonal is expressible with the single native field, so three of the four cells would be hypothetical.)_
- **The binary mechanism itself survives.** There is no second field to decouple the axes — confirmed against `claude --help`, which exposes only `--disable-slash-commands` (all-or-nothing) and no per-skill visibility control. This revision changes the **doctrine around** the field, not how it is declared; the 2026-07-19 "the mechanism *is* the declaration, no parallel marker" rule is unaffected.

## Gotchas

- **Locking a skill also makes it invisible.** `disable-model-invocation: true` is not a pure "user-invoked" marker — the skill vanishes from the model's catalog, so the model can neither fire it **nor mention it**. Symptom when this bites: a session that is asked to use the skill goes globbing for its `SKILL.md`, because as far as it knows the skill does not exist. Choosing rule in RULES §Invocation mode; evidence in `docs/feature-orchestrate.md` Spike findings, 2026-08-26.
- Frontmatter is **inert for model behavior** — that's why `## Ending` is a body section (the model executes the body) while invocation mode is frontmatter (the *harness* enforces it). Two different enforcement layers, deliberately.
- The minimalism resident is the **inverse compliance shape**: it produces no docs ending (it's a rule the growing-docs minimalist-ruleset gate *yields to*), so it gets a provenance block and gate-compatible vocabulary instead of an `## Ending`. RULES.md must state both shapes or authors will bolt a meaningless Ending onto rules.

## Files

- `docs/RULES.md` — canonical statement of all four conventions (build step fills Main Principles / Naming / Glossary)
- `README.md` — resident table seeded with the five-column header

## Dependencies

- Plugin packaging skeleton (`feature-plugin-packaging.md`) — conventions reference plugin-relative paths; both P1s precede the P2 migrations that first exercise them.

## API / Interface

The conventions themselves, in template form:

```markdown
# user-invoked skill frontmatter
---
name: <name>
description: <what it does>
disable-model-invocation: true
---

# model-invoked skill frontmatter — description phrased "Use when…"

# Ending section (skills producing durable knowledge)
## Ending
Where the output lands. If the host repo is a growing-docs project (has `docs/PLAN.md`):
- **Docs ending:** <where in the docs tree, which section>
- **Elsewhere:** <chat fallback>

# provenance block (third-party/derived residents, after frontmatter)
<!-- provenance
upstream: <repo url> (<license>)
pinned:   <short SHA> | reimplemented, not forked
mods:     <one per line>
-->

# README table row — Resident cell links to the main file; a bundle's Shape cell links each agent file
| [<resident>](<path to SKILL.md or command md>) | <shape> | </cmd> \| model-invoked \| — | <one-liner> | original \| derived: <upstream> (<license>) |
```

## Changelog

- 2026-08-26: **Invocation-mode convention revised** (design only, not built) — the flag's coupling to catalog visibility documented, plus a two-part test for when locking is justified (default model-invoked; lock only when visibility buys nothing AND a spurious run is costly). To be written into `docs/RULES.md` §Invocation mode at build time, alongside the orchestrate flip (v1.5.0).
- 2026-07-19: Design forged (native-field invocation mode, two-bullet Ending, HTML-comment provenance, five-column README table)
- 2026-07-19: Built — conventions written to RULES.md (Main Principles, Resident Conventions, Glossary terms); README rewritten with install steps + empty five-column resident table
- 2026-07-19: Hyperlink rule added (user request): Resident cell links its main file, bundle Shape cell links each agent file — applied to both existing rows
