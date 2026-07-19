# Architecture

_Last updated: 2026-07-19 — recency signal, not a correctness guarantee. The folder tree and data flow below rot fastest; if they disagree with the repo, trust the repo. They're **derivable caches** — when stale, regenerate them from the repo rather than hand-maintaining them line by line._

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Content | Markdown + YAML frontmatter (SKILL.md, agent defs, rules) | Hard constraint: skills are prompts, not code |
| Distribution | Claude Code plugin marketplace (this repo is marketplace + plugin in one) | Ships skills+agents+commands together, versioned auto-update at user scope; proven by growing-docs |
| Tooling | None beyond git | Thin-installer constraint — the plugin system IS the installer |

## Folder Structure

```
repertoire/
├── .claude-plugin/
│   └── marketplace.json          # marketplace manifest (lists the one plugin)
├── plugins/repertoire/
│   ├── .claude-plugin/plugin.json  # version — bump on every plugin change
│   ├── skills/
│   │   └── {skill-name}/SKILL.md   # one folder per skill; bundle agents live beside their SKILL.md (see note)
│   ├── agents/                     # agent defs shipped by bundles (orchestrate's four)
│   └── commands/                   # scaffolding commands (minimalism installer)
├── rules/                          # canonical rule text (source of truth commands scaffold FROM)
├── docs/                           # this repo's own growing-docs tree
└── README.md                       # resident index table with one-liners + provenance
```

> **Layout-by-shape note:** the tree above is the *target* shape — component dirs (`skills/`, `agents/`, `commands/`, `rules/`) are created by the first resident that needs them, not committed empty (decided in the plugin-packaging forge). The top-level split is by artifact shape because shape determines install destination. Within the plugin, Claude Code dictates `skills/` vs `agents/` vs `commands/`; a *bundle* (orchestrate) is expressed as its SKILL.md in `skills/` plus its agents in `agents/`, cross-referenced in both directions. Exact in-repo layout may refine when the first residents migrate.

## System Overview

repertoire is a **library of agent artifacts** in three shapes:

1. **Skills** — SKILL.md folders, each declaring `user-invoked` or `model-invoked` (user-invoked may call model-invoked, never each other). Skills producing durable knowledge end with an `## Ending` section (growing-docs docs-shaped ending + chat fallback).
2. **Rules** — always-on rulesets (minimalism). Plugins cannot ship always-on context, so each rule resident = canonical rule text in `rules/` + a scaffolding command in the plugin that installs/updates it into a target repo (`.claude/rules/`) or user scope (`~/.claude/rules/`).
3. **Bundles** — a skill plus the agent definitions it requires (orchestrate + task-runner/task-reviewer/explorer/advisor), installed together via the plugin.

**Scope boundary with growing-docs (the routing rule):** commands whose input AND output are docs artifacts belong in the growing-docs plugin; generic engineering disciplines with an *optional* docs ending belong here. Dependency points one way: repertoire may assume growing-docs conventions; growing-docs never references repertoire.

## Data Flow

Author/adopt a resident → commit here (third-party residents carry provenance: upstream repo + pinned SHA + modifications) → bump plugin version → `/plugin marketplace update repertoire` on consuming machines → artifacts live at user scope in every project.

## Key Patterns

- **Provenance blocks** on every third-party or derived resident (modeled on asrafilll/work-skills).
- **Endings, not processes** — the growing-docs integration principle; the `## Ending` section is its concrete form here.
- **Two compliance shapes:** produces-a-docs-ending (most skills) vs recognized-by-a-growing-docs-gate (minimalism).
