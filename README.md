# repertoire

A personal, public-by-intent library of **agent artifacts** — skills, always-on rules, and skill+agent bundles — one folder per resident, installable into Claude Code at user scope via the plugin marketplace.

## About

repertoire is the adopter-side complement to [growing-docs](https://github.com/raihank43/claude-growing-docs): generic engineering disciplines live here; docs-artifact commands live in that plugin. The routing rule: commands whose input **and** output are docs artifacts belong in growing-docs; disciplines with an *optional* docs ending belong here.

**The distinctive angle:** every resident that produces durable knowledge declares its **ending** — where output lands when the host is a growing-docs project (a debug session ends in a feature doc's Gotchas, not in evaporating chat), with a graceful chat-only fallback anywhere else. A second compliance shape exists for always-on rules a growing-docs gate recognizes and yields to.

House conventions (invocation mode, `## Ending`, provenance, versioning): `docs/RULES.md`.

## Install

```
/plugin marketplace add raihank43/repertoire
/plugin install repertoire@repertoire
```

Restart Claude Code after install — skills are discovered at startup.

## Residents

| Resident | Shape | Invocation | What it does | Provenance |
|----------|-------|------------|--------------|------------|
| minimalism | rule + command | `/repertoire:minimalism` | Scaffolds an always-on token-efficiency ruleset (lazy-senior ladder, comment policy, design-bar guard) into a repo or user scope; re-run to update in place | derived: [ponytail](https://github.com/DietrichGebert/ponytail) (MIT), reimplemented |

## Tech Stack

Markdown + YAML frontmatter, distributed as a Claude Code plugin marketplace (this repo is marketplace and plugin in one). No tooling beyond git — skills are prompts, not code.
