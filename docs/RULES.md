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

Shape names the artifact bundle ("skill + 4 agents", "rule + command"). Invocation: the slash command for user-invoked, `model-invoked`, or `—` for non-skills. Provenance: `original` or `derived: <upstream> (<license>)`.

### Versioning

Plugin semver from `0.1.0`: **patch** = fixes/wording, **minor** = new or changed resident, **1.0.0** gated on both P2 migrations landing validated. Bump `plugins/repertoire/.claude-plugin/plugin.json` on every plugin change.

## Folder Structure Conventions

{To be filled — the *convention* for where new files go and why. (The actual current tree lives in ARCHITECTURE.md.)}

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
| **bundle** | A skill plus the agent definitions it requires, installed together (e.g. orchestrate + its 4 agents) |
| **ending** | Where a skill's durable output lands — docs-shaped in a growing-docs host, chat fallback elsewhere |
| **gate-recognized** | The inverse compliance shape: a rule a growing-docs gate detects and yields to (minimalism), not one that writes docs |

## Anti-Patterns

Things we tried that didn't work. **Do not repeat these.**

| Anti-Pattern | What Went Wrong | Better Approach |
|-------------|----------------|-----------------|
| | | |
