# Checkpoint Log
Full session reports from `/checkpoint`, newest first. The cold-start brief lives in
PLAN.md's Current Focus; this file is the history behind it. Full entries are uncapped;
`lite:` entries are budgeted summaries whose durable detail lives in native docs.

## 2026-07-27 — e80d763 — v1.0.0 → v1.1.0: orchestrate becomes a 6-agent bundle, forged/built/tandem-validated in one session

**Scope.** Baseline `0174b31` confirmed an ancestor; swept `0174b31..HEAD` = 6 commits (including the prior checkpoint's own commit `e04b567`). Working tree clean throughout.

**What shipped.**
1. **v1.0.0** (`c1051a5`) — claimed the forged gate (both P2 migrations validated), which had actually been met at v0.3.0 on 2026-07-19. Defined post-1.0 **major** = a breaking change to how residents install or invoke; the original forge had specified patch/minor only.
2. **`spiker` forged** (`67b8abe`, design-only) — the unknown-investigation tier. The framing that drove the whole design: spiking wasn't *underused*, it was **forbidden by contract** — §2 demands testable ACCEPTANCE CRITERIA, §1 says do it yourself without one, and a spike has neither. So it needed a second brief shape, not encouragement.
3. **`librarian` forged + both built as v1.1.0** (`33a7a30`) — session-scoped docs singleton; first agent shape here that is stateful rather than fan-out, and the first resident that **consumes** the docs contract instead of writing to it.
4. **Tandem validation + doc sync** (`918c92d`), then a **second spike** (`e80d763`).

**Design decisions worth remembering** (full rationale + rejected alternatives in `docs/feature-orchestrate.md`, two dated 2026-07-27 revisions):
- **Ambiguity ≠ uncertainty.** §1's "handle it yourself when ambiguous" would have swallowed every spike, killing the new tier exactly as the acceptance-criteria clause did. Split at the root: ambiguous about what the *user wants* → orchestrator; uncertain about what's *true* → delegate. Logged as general doctrine, not a spiker patch.
- **Correctness may never depend on the caller remembering.** Chose librarian's verify-before-cite (self-enforcing) over push-notify-on-doc-write (discipline-dependent), because a forgotten notification doesn't degrade — it produces a silent confident lie.
- **`ALREADY SENT` is compaction insurance**, not politeness — the orchestrator's window may have been summarised since delivery, so it must be able to see *what* it was given and re-request it.
- **Reality corrects the spiker**, so its model bar is lower than the advisor's (which reasons against no ground truth) — hence sonnet default with a per-brief opus override.
- **Ending convention's parked middle case resolved.** The "growing-docs host but no feature doc" gap the advisor flagged 2026-07-19 (parked for a debug-to-gotcha forge that never happened) now falls back to a dated `BACKLOG.md` entry. The **"exactly two bullets" rule survived its first flex test** — the chain lives inside the docs bullet rather than earning a third.
- **E2E-tester cut**, not built — contract-identical to task-runner (deterministic acceptance), so it became a §1 wording fix. Recorded in Rejected Ideas.
- **`debug-to-gotcha` half-superseded** — spiker absorbs the investigation; the doc-writing ritual that got it shelved stays shelved.

**Verification evidence.** `claude plugin validate` green on both manifests at every step. Phase D full-dress tandem run exercised all six agents on real repo work — **GREEN**. Both new agents ran as *injected prompt bodies* (the session's installed plugin predates them), which validates the prompts — the actual artifact — but **not** plugin discovery. Observed: librarian held the singleton across a `SendMessage` follow-up and returned `ALREADY SENT` as pointers; its verify-before-cite immediately caught `plugin.json` at 1.1.0 while PLAN still said otherwise, and it reported the conflict *without adjudicating it* (judgment boundary held unprompted). spiker returned GREEN and corrected the premise that spawned it. advisor (PEER) caught seven stale doc lines and rebutted the orchestrator with a citation. runner→reviewer gate returned PASS while catching an inaccurate runner self-report.

**Two spikes, and together they bound what validation buys you.**
- GREEN: `claude plugin validate` **does** check agent-file frontmatter *syntax*. The premise that prompted the spike was wrong — the validator prints per-file lines only for files *with problems*, so silence in a passing run is not evidence of a blind spot.
- RED: it does **not** check field *semantics*. A bogus `model:` and a misspelled tool name both pass clean, `--strict` included. This matters because four of six agents are read-only by their `tools:` allowlist alone, so a typo there is a silent privilege change nothing flags. Mitigation is a RULES proofread rule — a lint script was **rejected** as breaching the prompts-not-code hard constraint.

**Violation audit — 2 hits.**
1. **Frontmatter YAML colon-space** (near-miss, caught pre-commit by `validate`): a `: ` in an unquoted `description` silently drops the *entire* frontmatter block at runtime, which would have stripped `disable-model-invocation` and made a deliberately user-invoked skill model-invocable, with no visible error. *Outcome: graduated in-session* — new RULES §Frontmatter YAML + story in feature Gotchas.
2. **Stale composition shipped** (`33a7a30` pushed 7 docs describing a 4-agent bundle): CLAUDE.md Step 3 asks "does this doc need updating?" per *doc*, but a composition change is one fact restated across many docs, so per-doc review kept answering "no." Caught by the advisor, after the push. *Outcome (user-chosen): operation-shaped RULES entry* — §Composition changes: grep the old count in the same change; historical statements stay true. Rejected: promotion to Invariants (recoverable harm, would dilute a capped list), an executable guard (breaches "no tooling beyond git"), leave-as-is (lint only runs when invoked).

**Known blind spots.** Designed but unobserved: the reviewer FAIL→fix-round path, the spiker's INCONCLUSIVE and worktree-isolation paths, librarian respawn after a real compaction. Unverified until a restart: that both new agents load as `repertoire:*` types from the installed plugin (local install still holds the 0.3.0 cache). Open in BACKLOG: whether the *runtime* drops one invalid `tools:` entry or the whole allowlist — the question that decides whether the RED spike is a footnote or a hazard.

**Lint-class note (not chased this run).** `docs/specs/` exists but isn't listed in CLAUDE.md's Project Artifacts Index. Run `/checkpoint lint` for the full tree sweep.

## 2026-07-19 — 0174b31 — First checkpoint: v0.1.0→v0.3.0, both P1s + both P2s shipped, P3 reframed

**Scope.** First checkpoint (no prior marker) — rebaseline over the whole build session, from the roadmap flip to BUILDING through the backlog research fold. 12 commits; working tree clean.

**What shipped (all 2026-07-19).**
- **Both P1s forged + built.** Plugin packaging skeleton (`.claude-plugin/marketplace.json` + `plugins/repertoire/.claude-plugin/plugin.json`, installs as `repertoire@repertoire`) and house conventions (RULES.md §Resident Conventions + Glossary). Key design calls: no empty component dirs (arrive with residents), semver from 0.1.0 with 1.0.0 gated on both P2s, invocation mode via native `disable-model-invocation` field alone, two-bullet `## Ending`, inert HTML-comment provenance, five-column README table.
- **Both P2 migrations forged + built.** minimalism v0.2.0 (rule + command; ruleset embedded in command body — no top-level `rules/` dir; fourth destination `~/.claude/rules/` added; ponytail provenance; block verified byte-identical to field-proven v3). orchestrate v0.3.0 (bundle: skill + 4 agents; alias model-pins kept as the portable tier design; user-invoked confirmed; selective `## Ending`; agents byte-identical to validated originals, skill changed only in genericized SUPERVISOR example + new Ending).
- **SUPERVISOR mode validated GREEN.** Live run: Opus 4.8 orchestrator + Fable 5 advisor on a genuine decision (P3 triage order). Verbatim relay held, factual-vs-judgment separation held, orchestrator accepted a repo-grounded factual correction. Untested: the override-refusal path (advisor agreed, so disagree→present-both→stop never fired). Recorded in feature-orchestrate.md Spike findings.
- **Install verified + cutover complete.** Plugin live at user scope (all 7 cached files byte-identical to repo; agents visible as `repertoire:*`). Deleted the five `~/.claude/` originals + two `C:\tmp` orchestrate test dirs — plugin is now the single source of truth.
- **P3 reframed to demand-driven intake.** User's call, routed through the advisor's own would-change-my-mind clause: the three shortlisted candidates (debug-to-gotcha, pre-flight, handoff) are workflow-shaped and overlap growing-docs in adopted repos → moved to BACKLOG (shelved, not rejected). Engineering-practice borrow-list added.
- **Borrow-list research folded (read-now).** Read the bodies of 8 candidate skills across both reference repos; assessments replace name-guesses in BACKLOG, ordered by borrow-readiness. `taste` elevated (user works frontend-heavy). New meta-skills section: skill-writing craft (effective-agent-skills, writing-great-skills) is a real gap our RULES conventions don't cover — recurs on every future resident forge.

**Verification evidence.** `claude plugin validate` green on marketplace + plugin at each build; ruleset + agent files diffed byte-identical to their validated originals; plugin install confirmed via `installed_plugins.json` (v0.3.0, correct commit SHA) and cached-file diffs; four agents observably loaded as `repertoire:*` agent types this session.

**Violation audit.** One near-miss: a machine-local absolute path (`C:\Users\NITRO\...`) was embedded in a public-repo feature doc during the packaging build, caught and genericized to `<absolute path to local clone>` *before* commit. No documented rule covers this specifically; the forge/checkpoint privacy guards already act at the commit boundary. **Outcome: leave as-is** — caught mid-flight, existing guards cover the risk surface; genericize-local-paths noted as a habit, not promoted (below the harm bar; no leak occurred). No secrets staged, no history rewrites, no destructive ops.

**Known blind spots carried forward.** (1) orchestrate's override-refusal path unobserved. (2) minimalism's v3 skill-invocation fix still unvalidated in a real frontend session. (3) house `## Ending` convention has an unresolved middle case — growing-docs host where the target feature doc doesn't exist yet — will bite whenever debug-to-gotcha-style residents get built. (4) `taste` overlaps the frontend-design plugin; compose-or-choose deferred to adopt time.

**Housekeeping note.** Marketplace was added by local path, so `/plugin marketplace update repertoire` is the manual step to pull new versions on this machine.
