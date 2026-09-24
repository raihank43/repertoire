# Checkpoint Log
Full session reports from `/checkpoint`, newest first. The cold-start brief lives in
PLAN.md's Current Focus; this file is the history behind it. Full entries are uncapped;
`lite:` entries are budgeted summaries whose durable detail lives in native docs.

## 2026-09-24 — 307ef5a — v1.5.0 + v1.6.0: a field audit of real use rebuilds orchestrate

**Scope.** Baseline `05be82f` confirmed an ancestor. Swept `05be82f..HEAD`: 8 commits across two releases. The working tree was clean at the start of the checkpoint.

**What shipped.**

- **v1.5.0: the invocation-mode flip** (2026-08-26, forged and built in one session). Foreign-model sessions were globbing the filesystem for orchestrate's `SKILL.md`. A contrast-pair spike showed that `disable-model-invocation: true` removes a skill from the model-visible catalog *entirely*, so a locked skill can't even be suggested. Orchestrate became model-invoked, guarded by a self-initiative gate and a `description` anti-trigger. `continue` stayed locked. The flag's coupling to catalog visibility became a house convention with a two-part locking test (RULES §Invocation mode). Live validation proved the *routing* layer; the gate's *execution* layer has never fired.
- **v1.6.0: the field-audit redesign** (2026-09-24). The user's question: were slow agents overthinking, genuinely busy, or badly briefed? The user proposed answering it from the transcripts themselves. The audit covered every session in about 2 months where an Opus 5 orchestrator loaded the skill: **98 sessions, 681 subagent runs**, across personal and work repos.
  - **Answer:** mostly the brief. Slow runners bundled process/layer seams (~65% would have sliced; the fast controls sliced 0 of 11). Slow reviewers got open-ended asks; the same diff and the same model took 17.8 min with no verdict under an open brief, versus 4.6 min and a real FAIL under three enumerated questions, and **8 of 30 slow reviews delivered nothing at all**. False premises in briefs were the costliest single defect.
  - **The unasked finding:** the orchestrator did **54% of delegable work itself** (5,045 of 9,306 main-thread calls), in bursts of up to 138 calls. Its justifications were up-front size forecasts that quoted §1's own wording back. DB probing (~320 calls) and app-driving (~880) had no agent to go to.
  - **Forged** (9 decisions, all user-confirmed apart from two marked derived):
    - a running counter in place of the "< ~5 min" forecast;
    - a closed "yours" list;
    - host agents outrank bundle defaults;
    - spiker INVESTIGATE / RETRIEVE / VERIFY;
    - slice-at-seams;
    - a scoped, pinned, verdict-first reviewer;
    - `[verified]`/`[believed]` brief tagging;
    - agent-file hardening;
    - SKILL.md restructured into decision order.
  - **Built** in three phases: agent files, the SKILL.md rewrite, then docs, version and smoke.

**Verification evidence.**

- `claude plugin validate` green after every phase. The description is colon-free.
- **Rule-preservation gate:** before the rewrite, all 93 v1.5.0 rules plus the 13 new ones went into a checklist, and a task-reviewer gated the rewrite against it with ≤8 CHECKS and verdict first. **Round 1 FAIL:** the restructure had dropped "a spike's deliverable is a finding, not a change" from the orchestrator side. It was only implied by the new verdict table, and a read-through would not have caught it. **Round 2 PASS** (2.5 min, then 3.4 min). This was also the new reviewer contract's first real use, on its own rewrite.
- **Live smoke GREEN, two arms** (CLI 2.1.281, `--plugin-dir`, scratch fixtures):
  - **Cross-seam feature:** 6 brief-prep reads, zero self-edits. It sliced at the api↔web seam and chose phased over parallel, stating why (a shared test file). The briefs were tagged `[verified]`, with a PRE-EXISTING note, one PINNED reviewer per slice, and numbered CHECKS. 9/9 tests passed.
  - **Data question:** routed straight to spiker RETRIEVE with the field names marked `[believed]`, and returned the correct planted record with file:line evidence.
  - **Finding, fixed in the same build:** the new "match reviewer depth" line led the orchestrator to request `model: sonnet`, which this host doesn't serve, so both reviewers failed loudly at spawn. The line now says to respawn without the override.

**Root causes and blind spots.**

- The audit's classifier layer used cheap-model judgments over condensed traces. Two of its claims were wrong when spot-checked against raw data: a thinking-volume figure was overstated about 10×, and a no-verdict count was off by one. Numbers the build decisions depend on come from the deterministic metrics script, not the classifiers.
- **Not exercised by the smoke:** the counter actually tripping, VERIFY, host-agent precedence, a reviewer FAIL round, and verdict-first under a kill.
- The audit is one user, one orchestrator model and about 2 months. The revisit triggers are written down (feature doc), and a re-run is scheduled for about a month out.

**Violation audit.**

- **Near-miss:** the first smoke run was launched from the repertoire repo root with `--add-dir` pointing at the fixture. `--add-dir` does not move the working directory, so the orchestrator under test began reading the real repo. It was killed before any edit, and both trees were verified clean. No written rule was violated. **Outcome, user-confirmed: leave it as a feature-doc Gotcha** (cd into the fixture; check the init event's cwd). It stays below the Invariants bar because the harm class is recoverable with git.
- **Field-surfaced (from the audit, in another project's session, not in this repo):** a runner's `rm -rf scratch/` destroyed untracked files, which is exactly Invariant #1's operation. **Outcome: agent-file hardening.** Literal-enumeration deletes are now in `task-runner.md`, so the plugin no longer relies on each host carrying its own guard. The host session had separately added a deny hook.
- **Classifier refusals, handled correctly:** the nested headless smoke was refused as `[Create Unsafe Agents]`, and the agent writing its own allow rule was refused as `[Self-Modification]`. Neither was worked around. The user added a project-local `Bash(claude -p *)` rule in the gitignored `.claude/settings.local.json`.

**Captured from conversation this checkpoint.**

- feature-orchestrate **Revision 2026-09-24**, a derived bullet: security-sensitive work narrowed (the decision stays with the orchestrator; the change can be delegated through advisor trigger (d)). The preservation reviewer surfaced it; the orchestrator accepted it.
- feature-orchestrate **Gotchas:** the `--add-dir` near-miss.
- **BACKLOG 2026-09-24:** preserve the ad hoc audit tooling before the scheduled re-run.
- RULES: stale SKILL.md section references fixed (§1 → §0 for the gate, §5 → §8 for the consent gate).
- User memory: on unfamiliar design forks the user wants every option explained in prose, and does change their pick after hearing it. A keep-alive monitor preference was also saved earlier this session.

**Recipes worth keeping.**

- **Field-audit method** (feature-orchestrate Spike findings, 2026-09-24): deterministic metrics → condensed traces → parallel cheap classifiers with fast-run control groups → spot-check against raw data.
- **Rule-preservation gate for any prompt rewrite:** build the checklist *first*, then have a reviewer gate the rewrite against it.

## 2026-08-10 — 05be82f — v1.1.0 → v1.4.0: three minor releases, two forges, and the residents start catching their own bugs

**Scope.** Baseline `e80d763` confirmed an ancestor; swept `e80d763..HEAD` = 9 commits across three releases. Working tree clean at checkpoint time.

**What shipped.**

- **v1.2.0 — orchestrate roster re-pinned on "inverse effort."** A runtime spike found `reasoningEffort` accepts five values (`low`/`medium`/`high`/`xhigh`/`max`), not just `high` — documented in `claude --help`'s `--effort` enum, the first documented source found for the field. That turned effort into a **new rung on the cheap-model escalation ladder** (previously: harder wording → tool budget → model bump), which is why explorer stayed on haiku and got `max` instead of being promoted to sonnet. Final roster: explorer haiku@max, librarian sonnet@high, spiker opus@medium, task-runner opus@low, task-reviewer opus@unset, advisor **fable**@high. SKILL.md §5 gained "tier means model × effort, assessed per consult" because the new roster put a fable@high advisor against an opus@medium orchestrator — a pairing the old model-name-only examples couldn't classify.
- **v1.3.0 — investigation control + live-state safety.** Forged and built same-day from a real incident in the user's other repo: a verification task hit an auth failure and the orchestrator spent ~2h on five proposed-then-retracted causal theories, ran three concurrent probes against one live shared credential (tripping the user's live auth banner twice), and never consulted the advisor. §5 gained the spiral machinery; §2's spike brief gained `PROBES:`; the single-flight ban became **CLAUDE.md Invariant #3** — the list's first non-seed entry.
- **v1.4.0 — `continue`, the first resident to ship a script.** Retrospective context reconstruction from a raw transcript; the forensic counterpart to `/checkpoint` (recovers sessions nobody checkpointed, works in repos with no docs system). Required opening a hard-constraint fence: prompts-not-code gained a **data-preprocessing carve-out**.

**Verification evidence.**

- **Runtime spike, three GREENs** (CLI 2.1.220, scratch harness): bad `model:` fails **loud** (visible API error at spawn, no silent substitution); bad `tools:` entry is **dropped individually** — the allowlist holds, closing the privilege-escalation worry the earlier RED spike left open, proven by capability (a typo'd read-only agent attempted a write and returned `CANNOTWRITE`, independently confirmed by filesystem check rather than self-report); bad `reasoningEffort` fails **silent**. That asymmetry is now a RULES table.
- **`continue` Phase A smoke:** 12.17 MB → 0.71 MB (94%), 7 balanced segments. Redaction proved on a synthetic fixture — six built-in shapes caught; two project-specific literals leaked with built-ins alone and were fully redacted once a local config was present, demonstrating the design's central claim rather than assuming it.
- **`continue` Phase D live run:** GREEN across all seven phases. `verify` returned **0 invalid anchors out of 144** cited by three independent parallel subagents — the exact failure that broke the original's first run. 4/4 spot-checks resolved with matching verbatim quotes; 7/7 claimed commits verified present in the source repo.

**Bugs the process caught (the theme of this stretch).**

1. **`checkdir` shipped fail-open — in the safety gate itself.** It ran `git -C` against the target's *parent*, which normally doesn't exist yet, read git's error as "not a repo", and returned **safe**. A tracked-but-not-yet-created output path would have been approved. Caught by testing the gate rather than trusting it; fixed by probing the nearest existing ancestor. Lesson: *a safety check whose failure mode is "assume safe" must be tested against paths that don't exist yet.*
2. **The advisor redirected a live spiral, unstaged.** Trigger (b) fired genuinely on the `reasoningEffort` investigation (three branches dead without discriminating evidence). The advisor re-read SKILL.md and the feature doc before ruling, then killed the orchestrator's proposed 4th branch for two concrete reasons it had missed — `--agent` selects a *session* agent, a different routing surface than Task-spawning, so the result wouldn't transfer; and `thinking_tokens` was never validated as an observable. Investigation closed INCONCLUSIVE with reopeners recorded verbatim.
3. **Spiker INCONCLUSIVE held twice** rather than collapsing into RED — once would have killed the entire re-pin on a false negative.

**Known blind spots.**

- Whether `reasoningEffort` has any *effect* remains unverified; the whole roster is pinned on a dominated bet (free if inert, valuable if not). Closed as INCONCLUSIVE by advisor ruling, not by evidence.
- **H3**, machine-local: Task-spawned `model: opus` pins were observed dispatching to the local gpt-5.5 subagent brain while haiku pins reached real haiku. → BACKLOG 2026-08-10.
- Still-unobserved v1.3.0 paths: spiral trigger (a) retraction, the live-state consent gate, the classifier-block fallback.
- Also unverified: whether a spawn-time `model:` override preserves frontmatter effort.

**Violation audit — 1 hit, graduated.** `rm -rf C:/tmp/continue-smoke C:/tmp/redact-out* …` used a **wildcard** during scratch cleanup. Harmless in fact (every match was self-created) but wrong in reasoning: a glob deletes by *match*, not by creation record, so any pre-existing `redact-out-anything` would have died silently. The old wording ("the exact paths it created") read as satisfied because the created paths did match — that is the loophole. **Outcome: Invariant #1 reshaped** to require literal enumeration, never wildcard/glob/pattern. Story in RULES §Literal-enumeration deletes. Invariants remain at 3 of 10.

**Recipes worth keeping.**

- A spiker can **stall waiting on its own background children** and return prose instead of a VERDICT — a reply with no VERDICT line is a stall, not a result; resume it, don't interpret it.
- `--permission-mode bypassPermissions` is refused outright by the auto-mode classifier; headless harnesses need `acceptEdits` + scoped `--allowedTools`.
- **A stale project-scope install silently shadows a fresh user-scope one.** `/plugin marketplace update` refreshed user scope to 1.4.0 while a project-scoped entry sat at 1.3.0 without the new skill. The cache's `.orphaned_at` marker is **not** a liveness signal — compare `installPath` per scope in `installed_plugins.json`.
- Frontmatter and the spawn-time override are **different surfaces with different value domains**: frontmatter takes full version names (`claude-opus-4-8` resolves), the Agent tool's override takes aliases only and has **no effort parameter**. So model pins are soft (correctable mid-session), effort pins are hard.

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
