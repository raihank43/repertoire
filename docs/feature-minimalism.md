# Minimalism (resident: rule + command)

_Last updated: 2026-07-19 — recency signal, not a correctness guarantee. If the code has moved past this, trust the code. Files / Dependencies / API below are **derivable caches** — when stale, regenerate them from the code; hand-maintain only the sections above them (the code can't re-derive those)._

## Description

The first resident: a token-efficiency ruleset ("the shortest diff that actually works" — lazy-senior ladder, comment policy, Design & UX guard) delivered as a **scaffolding command**, `/repertoire:minimalism`. It installs/updates the ruleset block into a target repo or user scope. Deliberately **not skill-shaped**: behavioral guardrails must be always-on — a model won't self-invoke discipline against an instinct it doesn't recognize it has. Its growing-docs compliance is the **inverse shape**: no `## Ending`; instead the block's vocabulary is what growing-docs' minimalist-ruleset carve-out gate recognizes and yields to.

Migrated from the field-proven v3 at `~/.claude/commands/minimalism.md` (deployed live in setsuna; A/B-benchmarked 2026-07-08).

## Decided design

_Forged 2026-07-19 (storage, user-scope, cutover user-confirmed; the rest derived from docs/pitch)._

- **Content storage — embedded in the command body** (the proven v3 single-file shape): the verbatim ruleset block stays inside `commands/minimalism.md`, moved into the plugin as-is. Zero runtime moving parts; source of truth is the block inside the command. This **removes the top-level `rules/` dir** from the architecture sketch — the "canonical rule text" idea is satisfied by the block itself. _(Rejected: standalone `rules/minimalism.md` the command Reads at install time — cleaner separation but adds a runtime `${CLAUDE_PLUGIN_ROOT}` dependency that would need a spike, for no behavioral gain. Rejected: both file + embedded copy — two copies of one ruleset is the drift hazard itself.)_
- **Fourth destination: user scope `~/.claude/rules/minimalism.md`** — always-on in every project (verified in the init brainstorm: user rules load before project rules, project wins on conflict). Non-default; the project rules file stays Recommended. Step 1's marker search extends to five locations. _(Rejected: keep three project-only destinations — the researched capability would go unused and per-project re-runs are exactly the friction a global install removes.)_
- **Cutover — delete the local `~/.claude/commands/minimalism.md` after the plugin version verifies** (installs correctly into a scratch repo). One source of truth; existing repo installs are untouched — the marker-based updater finds them regardless of which command wrote them. Deletion happens with the user's explicit go-ahead as part of verification. _(Rejected: soak period with both live — two copies drift and `/minimalism` vs `/repertoire:minimalism` confusion.)_
- **Provenance block** (per house convention, inert HTML comment after frontmatter): upstream `github.com/DietrichGebert/ponytail` (MIT), pinned "reimplemented, not forked" (upstream was ~40 lines of system-prompt English; rebuilt rather than vendored), mods: renamed `ponytail:` shortcut to `minimal:`; explicit comment policy; Design & UX section + skill-invocation guard (v3); three-setting flow + destination routing; vocabulary tuned for growing-docs gate compatibility.
- **Coexistence ownership — already settled, nothing to reconcile:** growing-docs owns the gate side (carve-out + `## Comments` section, shipped v1.20.0, field-audited 2026-07-04 in setsuna — the boundary held); repertoire owns the ruleset side. This is the routing rule working as designed. The parked growing-docs backlog question is closed by this migration.
- **Settled upstream — don't re-open** (from the pitch): rules-file default destination; design boundary intensity-independent; scope (chat prose) orthogonal to intensity; always-on delivery, never a model-invoked skill.

## Gotchas

- **The block's wording is load-bearing:** the phrase "token-efficiency" + the ladder is what growing-docs' carve-out recognizes *semantically* (it detects by vocabulary, not filename). Don't reword the marker phrases when editing the ruleset.
- The `<!-- minimalism-rules v3 … -->` marker line is what makes re-runs idempotent — the command must write it as the block's first line, never omit it.
- This ruleset is an **alternative to the ponytail plugin** — both active means double-injection; the command's confirmation step warns about this.
- **v3 skill-invocation fix still unvalidated in a real session** (the 2026-07-08 benchmark couldn't exercise it — subagents had no frontend-design skill). Validate opportunistically: next real UI task in a minimalism-governed repo with frontend-design installed, watch whether the skill auto-invokes.

## Files

- `plugins/repertoire/commands/minimalism.md` — the command + embedded ruleset block (single file)
- `README.md` — resident table row
- `plugins/repertoire/.claude-plugin/plugin.json` — bumped to 0.2.0

## Dependencies

- Plugin packaging skeleton (`feature-plugin-packaging.md`) — ships through it; house conventions (`feature-house-conventions.md`) — provenance block + README row format.

## API / Interface

`/repertoire:minimalism [lite|full|ultra] [code-only|code+chat]` — arguments optional; unset settings resolved via one AskUserQuestion call. Destinations: `.claude/rules/minimalism.md` (recommended) | append to root `CLAUDE.md` | `CLAUDE.local.md` | `~/.claude/rules/minimalism.md` (user scope, all projects). Re-run to update in place (marker-detected across all five locations, duplicates consolidated).

## Changelog

- 2026-07-19: Migration design forged (embedded storage, fourth user-scope destination, delete-after-verify cutover, provenance block; coexistence ownership confirmed settled)
- 2026-07-19: Built as v0.2.0 — command migrated into plugin with provenance block, fifth marker location + fourth destination (user scope), layering exception in Step 1; ruleset block verified byte-identical to the field-proven v3; `claude plugin validate` green.
- 2026-07-19: Install verified (plugin v0.3.0 at user scope, cached file byte-identical to repo) and **cutover complete** — `~/.claude/commands/minimalism.md` deleted; `/repertoire:minimalism` is now the single source.
