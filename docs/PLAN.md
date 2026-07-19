# Project Plan

## Project Phase: BRAINSTORMING

> **This marker controls how Claude behaves at the start of every session — read it first.**
> - `BRAINSTORMING` — the vision/roadmap below isn't settled yet. Before building features, help the user complete the Vision and Features sections. Ask, propose, refine. Don't jump into code.
> - `BUILDING` — the roadmap is agreed. Follow the normal build workflow in CLAUDE.md.
>
> Flip this to `BUILDING` once the user confirms the roadmap is solid enough to start building.

## Current Focus

> The 30-second cold-start brief — so a fresh session (or a post-compaction one) can resume *without re-reading everything*. Kept current by `/checkpoint`: **the tight brief only** lives here (~15–30 lines); the full session reports go to `docs/CHECKPOINTS.md` (created by `/checkpoint`, newest first). **Read this first**, then read only the docs the "Start here" line points to. **"Next" is the tip, not the queue:** the full picture is the Features table below (priority-ordered) plus any un-triaged ideas in `docs/BACKLOG.md`.

_Last checkpoint: none yet_

- **Just shipped:** scaffold + initial brainstorm started (2026-07-19, via /project-init; pitch at `docs/specs/pitch-2026-07-19.md`)
- **In flight:** brainstorm — reference repos researched; official-docs research (plugin capabilities, rules dirs, Codex interop) pending; install mechanism + repo model undecided
- **Next:** decide install mechanism (#2) and the multi-artifact repo model (skill/rule/agent-bundle folders), then the compliance convention shape (#3)
- **Start here:** `docs/specs/pitch-2026-07-19.md`, this file's Vision + Decisions

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

**Pending verification (background research, official docs):** what plugins can ship (skills/agents/commands/hooks — and whether always-on rules are possible via plugin); user-level `~/.claude/rules/` existence; official Codex interop. Findings land here when they arrive.

## Features

Un-triaged ideas live in `docs/BACKLOG.md` (created on demand) — **this table is canonical**: an idea that graduates gets a row here and is deleted from the backlog.

| Feature | Priority | Status | Doc |
|---------|----------|--------|-----|
| | | | |

Status values: `planned` | `in-progress` | `done` | `cut`

## Decisions Log

Record every significant decision so future-you (or post-compaction-you) knows WHY things are the way they are. Append new rows at the bottom — newest last.

| Decision | Rationale | Date |
|----------|-----------|------|
| | | |

## Rejected Ideas

Record ideas we considered and explicitly decided NOT to do. This prevents re-suggesting them after compaction. Append new rows at the bottom — newest last.

| Idea | Why Rejected | Date |
|------|-------------|------|
| | | |
