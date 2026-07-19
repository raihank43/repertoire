# Plugin Packaging Skeleton

_Last updated: 2026-07-19 — recency signal, not a correctness guarantee. If the code has moved past this, trust the code. Files / Dependencies / API below are **derivable caches** — when stale, regenerate them from the code; hand-maintain only the sections above them (the code can't re-derive those)._

## Description

The marketplace + plugin manifests that make this repo installable via the Claude Code plugin marketplace — the foundation every resident ships through. Two JSON files: `.claude-plugin/marketplace.json` at repo root (the marketplace, listing one plugin) and `plugins/repertoire/.claude-plugin/plugin.json` (the plugin itself). No component dirs until residents bring them.

## Decided design

_Forged 2026-07-19 (all choices user-confirmed via interview)._

- **Names — marketplace `repertoire`, plugin `repertoire`:** install reads `/plugin install repertoire@repertoire`; skills later invoke as `/repertoire:<skill>`. _(Rejected: shorter plugin alias like `rep` — a name that doesn't match the repo buys only a few characters of prefix.)_
- **No empty component dirs:** `skills/`, `agents/`, `commands/`, `rules/` are created by the first resident that needs them (minimalism brings `commands/` + `rules/`, orchestrate brings `skills/` + `agents/`). Git can't track empty dirs and Claude Code doesn't require them to exist. _(Rejected: `.gitkeep` placeholders — pure noise; a placeholder hello-skill — proves the pipeline but adds a fake resident to delete later; the P2 migrations are close enough to serve as the real pipeline test.)_
- **Smoke-test = local-path marketplace install, manual check** (see API / Interface for the steps). Local path avoids a push per manifest iteration. _(Rejected: install-from-GitHub as the routine test — it's the real end-user path but costs a push per fix; still worth one run before announcing the repo. Rejected: a JSON validation script — dev-side code in a prompts-only repo, brushes the "no tooling beyond git" line for little gain at two-file scale.)_
- **Versioning — semver from `0.1.0`:** skeleton ships as 0.1.0 ("installable but empty"); patch = fixes/wording, minor = new or changed resident; promote to **1.0.0 when both P2 migrations (minimalism + orchestrate) land validated**. _(Rejected: growing-docs' start-at-1.0.0 style — wrong signal for an empty shell.)_
- **Public metadata — same as growing-docs:** `Raihan` + `raihankusuma5@gmail.com` as marketplace `owner` and plugin `author`; the email is already public in the growing-docs manifests. _(Rejected: name-only — inconsistent with the sibling repo for negligible privacy gain.)_

## Gotchas

- Plugins **cannot ship always-on rules/context** — a `CLAUDE.md` at plugin root is not loaded (verified against plugins-reference during the init brainstorm). Rule residents (minimalism) must be *scaffolded by a command*; the canonical rule text lives in top-level `rules/`, outside the plugin.
- Skills/commands are discovered at startup — after install or update, **restart Claude Code** before judging whether something loaded.
- Marketplace `source` is a relative path (`./plugins/repertoire`) — it resolves within the repo whether added by local path or by `owner/repo`.

## Files

- `.claude-plugin/marketplace.json` — marketplace manifest (repo root)
- `plugins/repertoire/.claude-plugin/plugin.json` — plugin manifest, carries the version

## Dependencies

None — this is the foundation the resident migrations (P2s) build on.

## API / Interface

**End-user install:**

```
/plugin marketplace add raihank43/repertoire
/plugin install repertoire@repertoire
```

**Smoke-test (re-run after every packaging change, ~1 min):**

1. `/plugin marketplace add <absolute path to local clone>` (local path — no push needed)
2. `/plugin install repertoire@repertoire`
3. `/plugin` → repertoire listed, correct version + description, no load errors
4. Cleanup: uninstall + `/plugin marketplace remove repertoire` (or keep the local marketplace for resident development)

## Changelog

- 2026-07-19: Design forged (naming, no-empty-dirs, smoke-test shape, semver-from-0.1.0, public metadata)
