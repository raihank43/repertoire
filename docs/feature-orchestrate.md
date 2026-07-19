# Orchestrate (resident: bundle — skill + 4 agents)

_Last updated: 2026-07-19 — recency signal, not a correctness guarantee. If the code has moved past this, trust the code. Files / Dependencies / API below are **derivable caches** — when stale, regenerate them from the code; hand-maintain only the sections above them (the code can't re-derive those)._

## Description

The second resident and the repo's first **bundle**: a delegation-protocol skill plus the four agent definitions it requires (task-runner, task-reviewer, explorer, advisor), useless apart, installed together via the plugin. The main-chat model orchestrates and never delegates judgment: decomposition, briefs (GOAL/FILES/CONSTRAINTS/testable ACCEPTANCE CRITERIA), tier routing, and every verdict stay with it. Built and validated 2026-07-15→19 (smoke, sabotage, explorer fan-out, full-dress rehearsal, advisor PEER live run); migrated from five user-scoped files in `~/.claude/`.

## Decided design

_Forged 2026-07-19 (model pins, invocation, ending, supervisor-validation path user-confirmed; bundle layout derived from ARCHITECTURE)._

- **Model pins — keep alias pins (`haiku`/`sonnet`/`opus` + `reasoningEffort: high`), genericize the brain-tag:** official aliases resolve on any machine and *are* the tier design (cheap scout / mid worker / high-reasoning gates). The skill's SUPERVISOR example drops this machine's `[brain:...]` tag for a generic "spawn with a `model:` override". _(Rejected: strip pins and document intended tiers — an explorer inheriting the session model silently burns the economics the design exists for.)_
- **Invocation — user-invoked (`disable-model-invocation: true`),** confirming the logged 2026-07-19 decision: doctrine, not caution. Delegation is a 10–30× token loss below ~5 min of mechanical work; the human decides when the protocol runs. _(Rejected: model-invocation with triage as the only guard — re-opens a logged decision with no what-changed.)_
- **`## Ending` — selective, verdict-worthy only:** in a growing-docs host, a reviewer-caught defect → the touched feature doc's Gotchas; an advisor recommendation that decided something → PLAN's Decisions log including its would-change-my-mind condition as the revisit trigger. Routine PASS rounds and briefs stay in chat; elsewhere, §4's plain-prose batch report is the fallback. _(Rejected: log every batch — bulk mechanical churn flooding the docs is exactly the doc-theater failure mode.)_
- **SUPERVISOR mode — validated before shipping** (user chose validate-now over ship-experimental): staged a real run this session on a genuine decision (P3 triage order). See Spike findings. _(Rejected: ship-marked-experimental — user wanted the gap closed; strip-from-published — published/local divergence is the two-copies drift the cutover exists to prevent.)_
- **Bundle layout — per ARCHITECTURE:** `skills/orchestrate/SKILL.md` + the four defs in `agents/`, cross-referenced in both directions (SKILL.md names its agents; each agent's description says "spawned by the orchestrate skill"). Pitch sub-question 1 resolved by the existing layout decision — no new folder convention needed.
- **Cutover — same as minimalism:** delete the five local `~/.claude/` originals after the plugin version verifies in-session, with explicit user go-ahead.
- **Provenance — original** (no block; README says `original`). The tiered-orchestration post that inspired-then-got-rejected is credited in the pitch's evidence trail, not in the artifact.

## Spike findings

- 2026-07-19 — **Does SUPERVISOR-mode discipline hold in a real run?** (Opus 4.8 orchestrator + Fable 5 advisor, genuine decision: P3 triage order) → **GREEN, with one untested path.** Orchestrator correctly self-assessed SUPERVISOR territory, declared MODE in the brief, included its real lean, relayed RECOMMENDATION and WOULD-CHANGE-MY-MIND **verbatim** (checked word-for-word), accepted a factual correction grounded in repo evidence (its "exercise the provenance machinery first" argument for pre-flight died against the already-built minimalism provenance block), and distinguished factual-pushback from judgment-deference cleanly. **Untested:** the advisor *agreed*, so the override-refusal path (disagree → present both positions → stop) was never exercised — that remains designed-but-unobserved. Watch it in the first real disagreement.

## Gotchas

- **The override-refusal path is still unobserved** (see Spike findings) — GREEN covers brief discipline, verbatim relay, and factual-vs-judgment separation only.
- The advisor flagged an **unspecified middle case in the house Ending convention**: orchestrate (and debug-to-gotcha later) write into a feature doc's Gotchas, but a growing-docs host may lack the relevant feature doc. The two-bullet Ending format doesn't say what happens then — first flex point for the convention; resolve when it bites (likely in the debug-to-gotcha forge).
- Cheap-model leash (from validation): explorer got its <150-line report cap + ~15-call tool budget after haiku leaked (3× cap overflow; 8-min/42-call sweep despite "sample a few"). Escalation order if leaks persist: harder wording → tool budget → model bump.
- Loop cap is 2 fix rounds; on deadlock the orchestrator takes over or sends the dispute to advisor arbitration — never a third round.

## Files

- `plugins/repertoire/skills/orchestrate/SKILL.md` — the protocol (user-invoked)
- `plugins/repertoire/agents/task-runner.md` — sonnet; executes briefs verbatim; may spawn explorers (only permitted two-level hop)
- `plugins/repertoire/agents/task-reviewer.md` — opus high, read-only; re-runs acceptance commands itself; PASS/FAIL
- `plugins/repertoire/agents/explorer.md` — haiku, read-only; parallel retrieval scout; FINDINGS/NOT FOUND/POINTERS/FLAGS
- `plugins/repertoire/agents/advisor.md` — opus high default, read-only; RECOMMENDATION/REASONING/WOULD-CHANGE-MY-MIND/RISKS
- `plugins/repertoire/.claude-plugin/plugin.json` — bumped to 0.3.0

## Dependencies

- Plugin packaging skeleton; house conventions (invocation mode, README row). The bundle ships as one plugin unit — solves the install-together problem natively.

## API / Interface

`/repertoire:orchestrate` — user-invoked. Tier routing: retrieval → explorer (parallel fan-out, no reviewer); trivial mechanical → runner only; substantive → runner + reviewer gate (FAIL findings go to the *same* runner via SendMessage — resume ≈ 2k tokens vs ≈ 20k cold spawn); judgment → orchestrator, optionally advisor (PEER/SUPERVISOR declared per brief).

## Changelog

- 2026-07-19: Migration design forged; SUPERVISOR validation run GREEN (override-refusal path still unobserved)
- 2026-07-19: Built as v0.3.0 — skill + 4 agents copied into plugin (agents byte-identical to validated originals; skill changed only in the genericized SUPERVISOR example + new `## Ending`); `claude plugin validate` green. **Pending:** in-session install verify, then delete the five `~/.claude/` originals (cutover) and the throwaway test dirs `C:\tmp\orchestrate-test` / `C:\tmp\orchestrate-demo`
