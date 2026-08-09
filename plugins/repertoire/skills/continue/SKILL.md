---
name: continue
description: Reconstruct working context from an old conversation transcript so you can resume in a fresh chat — finds the session by title, strips the raw JSONL deterministically, extracts decisions and open threads through parallel subagents, verifies every citation, and writes an anchored BRIEF. Invoke when picking up work from a past session that was never checkpointed.
disable-model-invocation: true
---

# Continue: rebuild the context, then stop

Reconstruct what happened in an earlier session so work can resume in a **fresh chat** — without any model reading the raw transcript, which can run to tens of megabytes and is ~95% base64 attachments and tool dumps.

First argument is the **session title** (what shows in the conversation list), partial is fine:
`/continue "scheduler investigation OP #14651"`

Flags:
- `--archive` — full archive mode: summarize EVERYTHING, including what is already durable in memory/PRs/code. Default is **live-state** mode: only what is not yet durable.
- `--cheap` — cheaper model for extraction (short/light transcripts). Default: `sonnet`.
- `--model <alias>` — force a model for the extraction subagents.

Talk to the user in whatever language the session is already using.

---

## Principle

> **Preprocessing is deterministic, extraction is the model, synthesis is you.**
> Never point a model at raw JSONL — a single attachment line can be 450 KB of base64.

The dominant failure mode here is **omission** (a fact silently missing), not confabulation. Anchors protect against confabulation; they do **not** protect against omission. Hence the sonnet floor and the rigid extraction schema.

`SCRIPT` below means: `node ${CLAUDE_PLUGIN_ROOT}/skills/continue/scripts/transcript_prep.js`

---

## Phase 1 — Find the transcript

```bash
SCRIPT find "<title>"
```

Matches the **session title** (`ai-title`), not file contents — otherwise a session that merely *talks about* that title (like this one) gets caught too.

- **0 results** → report and ask for a different title. STOP.
- **>1 result** → one session is often stored in two places. Prefer the largest `mb` / newest `mtime`; say which you picked.

## Phase 2 — Choose where output goes (ask the user)

A cleaned transcript is a **full conversation** behind a redaction denylist that **fails open**. Where it lands is the user's call, not yours.

```bash
SCRIPT checkdir <candidate-dir>
```

Default candidate: `.claude/context/<slug>/`. `<slug>` = a ticket number if the title has one, else a short kebab-case name.

- `verdict: safe` → propose it and proceed once the user agrees.
- `verdict: unsafe` (in a git repo, **not** gitignored) → **do not write there.** Say plainly that a transcript written there could be committed, and offer: the external path from `suggestedExternal` (`~/.claude/continue/<project>/<slug>/`), or gitignoring the path first. The user chooses.

Never skip this check because "`.claude/` is usually gitignored" — it is in some repos and not in others, which is exactly why the check exists.

## Phase 3 — Preprocess (script, no model)

```bash
SCRIPT clean "<file.jsonl>" <outdir>
```

Strips base64 → redacts secrets → clips tool results → writes `transcript-clean.md`, `INDEX.md`, and volume-balanced `seg-*.md`.

Report briefly: size before→after, segment count, `maxAnchor`, and whether a local config was found. If `config: null` and this project has recurring private literals (a password, an internal token prefix) or its own entity formats, mention that `.claude/continue.json` can carry them — **and that it must be gitignored.**

```jsonc
{
  "secrets":  { "literals": ["..."], "patterns": ["prefix-[A-Za-z0-9]+"] },
  "entities": { "Ticket": "\\bOPS-\\d+\\b", "DB table": "\\b(?:tbl_)[a-z_]+\\b" }
}
```

## Phase 4 — Parallel extraction

Spawn **one subagent per segment, all in a single message** so they run in parallel. Each prompt must contain:

- The model override (`sonnet` by default; honor `--cheap` / `--model`).
- An instruction to **read the whole file** `<outdir>/seg-X.md`.
- 2–3 sentences of project context (what this repo is, who/what the recurring entities are).
- **Hard rules — copy verbatim:**
  1. Every item MUST end with an anchor `[L…]`; no anchor = discard the item.
  2. Every item MUST carry a verbatim quote of ≤15 words as evidence.
  3. **Anchors are ONLY `[L…]` tokens written in the file. NEVER use the file's own line numbers** — the valid range is stated in the header on line 1.
  4. Never infer what is not written; when unsure, put it under UNCERTAIN.
  5. Completeness beats brevity. 25 short items beat 8 long ones.
- **Fixed output schema:** `TIME RANGE` · `1. DECISIONS` (+ why, + who) · `2. DEFERRED / OPEN THREADS` (+ waiting on whom) · `3. COMMUNICATION STATE` · `4. STATE MUTATIONS` (DB, server, artifacts, anything with side effects) · `5. TECHNICAL FINDINGS` · `6. FOOTGUNS` · `7. USER PREFERENCES` · `8. UNCERTAIN`.
- The **last** segment also gets `0. STATE AT END OF SEGMENT` — the current situation, and the most important section in the whole run.

## Phase 5 — Verify (never skip)

1. Collect every subagent's output into one file, then:
   ```bash
   cat <outdir>/raw-extracts.md | SCRIPT verify <outdir>
   ```
   Anchors reported `invalid` are **dropped or re-mapped** — never carried into the BRIEF. Exit code 1 means at least one was bad.
2. **Spot-check 3–5 of the most consequential claims** against the source (`Grep` the anchor → `Read` around it).
3. **Reconcile code/artifact claims against the actual repo** — files, constants, commits, PRs. The transcript records *what was true then*; the repo records *what is true now*. **When they disagree, the repo wins.**

## Phase 6 — Write the BRIEF

Write `<outdir>/BRIEF.md`:

1. **CURRENT STATE** — table + last action + any next step already promised
2. **OPEN THREADS** — waiting on what/whom
3. **DECISIONS AND THEIR REASONS** — the ones still binding
4. **COMMUNICATION STATE** — who owes whom a reply; misunderstandings to keep in mind
5. **KEY TECHNICAL FINDINGS** — mark ✅ the ones verified against code
6. **FOOTGUNS not yet captured anywhere durable**
7. **USER WORKING PREFERENCES**
8. **ALREADY DURABLE** — pointers only, don't re-summarize (unless `--archive`)
9. **UNVERIFIED CLAIMS** — explicitly listed

Every consequential claim carries its anchor. Note the anchor reliability ceiling at the top (`max valid anchor L…`).

## Phase 7 — Report, then stop

Tell the user: **where things stand**, **what is hanging**, and **one suggested next step**. Don't paste the whole BRIEF — they can read it.

Then **stop and wait**. This skill reconstructs context; it does **not** continue the work, commit, push, or message anyone.

---

## Going deeper later

When something isn't in the BRIEF:
1. `INDEX.md` → find the topic/entity/date → get an anchor
2. `Grep -n "\[L1234\]" <outdir>/transcript-clean.md`
3. `Read` with offset/limit

Never `Read` the original JSONL.

---

## Gotchas

- **Anchor confusion is real** — subagents will cite a segment file's own line numbers if you let them. Three defenses, all needed: the header on line 1, hard rule #3, and the `verify` pass.
- **Redaction fails open.** Built-in patterns catch common secret shapes; anything project-specific needs `.claude/continue.json`. Treat a cleaned transcript as sensitive regardless — it never leaves the machine.
- **`verify` is strict on purpose:** it rejects an anchor that doesn't exist in the cleaned file, not merely one past the maximum. A plausible-looking fabricated citation gets caught.

## Ending

Where output lands. If the host repo is a growing-docs project (has `docs/PLAN.md`):

- **Docs ending:** the BRIEF is a working artifact and **stays out of `docs/`** — it is reconstruction, and partly unverified. Only findings **verified against the repo in Phase 5.3** graduate: a footgun → the touched feature doc's Gotchas; a still-binding decision → PLAN's Decisions log (with its reason); a finding with no owning doc → a dated entry in `docs/BACKLOG.md`. Unverified claims never graduate.
- **Elsewhere:** the BRIEF plus the Phase 7 summary is the whole record.
