---
name: orchestrate
description: Delegation protocol — the main agent keeps planning, judgment, and user discussion for itself, and farms out the rest to cheaper workers (repo browsing, code writing, investigation, database lookups, app driving, documentation lookup), with a reviewer gating substantive changes. Use when a task decomposes into several well-specified subtasks, or when progress is blocked on something reality can answer. Not for single-step work that fits in a few tool calls within one file.
---

# Orchestrate: delegate the mechanical, keep the judgment

You are the orchestrator. Workers do the work; you decide what the work is, brief it, route it, judge what comes back, and talk to the user. Subagents cannot talk to each other — every hop goes through you. That is the design: your judgment stays in the loop at every gate.

## 0. Self-initiative gate

**If you reached this skill on your own initiative** rather than the user asking for it — say so, name in one line the delegation you propose, and get the user's go-ahead **before spawning any agent**. Auto-invocation loads these instructions; it does not authorize spending the user's tokens on a fan-out they never asked for. If the work turns out to be yours (§1) or too small to reach the counter (§2), just do it and say nothing about this skill.

## 1. What stays yours

A closed list. Everything not on it is delegable work.

- Conversation with the user — including anything ambiguous about **what they want** (that's a conversation, not an investigation; no agent can resolve it).
- Design and judgment calls, and security-sensitive decisions. Optionally consult the `advisor` (§8); never delegate the decision itself.
- Decomposition, slicing, and writing briefs.
- Reading reports and deciding verdicts.
- Docs that **record** a decision or finding (the Ending).
- Integration glue: git, PRs, ticket and tracker updates.
- Anything the user explicitly told you to do yourself.

## 2. Delegate by default — count, don't forecast

Don't estimate a task's size up front. Estimates are made before you understand the task and run low: work judged "small enough that briefing it would cost more" has turned into 20–90 tool calls in real sessions. Count instead:

> **On any task not on the §1 list, your 5th tool call or 2nd edited file means stop.** Brief what remains and hand it off. What you already did goes into the brief as `[verified]` context — nothing is wasted.

Two small allowances, both counted:
- **Brief prep:** ~3 calls of reading to write a precise brief. Past that, send an `explorer`.
- **Post-PASS sanity check:** ~3 calls to confirm the change fits what the reviewer couldn't see. Past that it's a review — send a reviewer.

**Never do an agent's work while waiting on it.** A slow agent is something to check on or stop, not a reason to start duplicating it.

Why this is cheap: a brief costs you one turn. Doing it yourself costs every intermediate tool result, re-read on every later turn, in the most expensive context of the session. The real price of delegating is wall-clock, which the counter's floor already absorbs.

**Uncertain about what's *true*** — how something behaves, why it fails, where a record is — is never "yours" by default: reality can answer it, and it answers cheaper to a worker than to you. That is the opposite routing from ambiguity about what the user wants.

## 3. Route by kind of work

**First: does the host project ship its own agent for this kind of work** (an e2e runner, a ticket fetcher, a domain specialist)? Use it. Host agents carry project knowledge — accounts, known UI quirks, conventions — that this bundle cannot, so they outrank the defaults below.

Otherwise:

| Kind of work | Agent | Gate |
|---|---|---|
| Find where X lives, survey conventions, extract what a module does | `explorer` — cheap, read-only; fire liberally | none; you judge the findings |
| What governs this area (docs, rules, decisions) | `librarian` — one per session (§9) | none |
| What's true — will this work, how does it behave, why does it fail | `spiker` · INVESTIGATE | none; a contested high-stakes finding → `advisor` |
| Find a record, fact, or test data matching X; map how data relates (DB probing) | `spiker` · RETRIEVE | none |
| Drive the app through scripted scenarios, when no host agent covers it | `spiker` · VERIFY | none; **you** judge each scenario |
| Trivial mechanical edit (rename, config bump, boilerplate from an exact template) | `task-runner` | spot-check the report |
| Substantive code change (new logic, refactor, anything with failure modes), writing or running tests | `task-runner` | `task-reviewer` (§6) |
| Choosing between designs once the facts are in | you | optionally `advisor` (§8) |

Exploratory app-driving ("what does this page actually do when…", "why does submit silently fail") is INVESTIGATE, not VERIFY — the question is what's true, not whether steps passed.

For questions spanning several areas, fan out explorers in parallel, one narrow scope each, with an explicit boundary so they don't duplicate work; synthesize their reports yourself.

**The only two-level hop:** a runner may spawn explorers for mid-task retrieval ("find every caller of X"). Retrieval briefs are hard to garble; anything more degrades through relay. A runner that hits an unknown stops and reports it — you decide whether it warrants a spike.

## 4. Slice at seams

Decomposition is yours; runners never split work or spawn other runners.

**Slice a task when either holds:**
- it crosses a **process or layer seam** — main ↔ preload ↔ renderer, service ↔ controller ↔ view, plugin ↔ host, schema ↔ service ↔ UI; or
- it carries **3 or more independent deliverables**.

**Shape the slices:**
- **Parallel** — disjoint files, no shared state: one Agent call each, in the same block. If parallel slices could touch the same file, give each `isolation: "worktree"` or run them in sequence.
- **Phased** — slice B consumes A's output or state: A is reviewed and landed before B's brief is written, so B states A's real interface as `[verified]`. Scenario runs that mutate the same record are always phased — one phase's leftover state breaks the next.
- **One reviewer per slice.**

**Still batch up:** several small related edits in one area are ONE runner with a checklist brief, not N runners paying N cold starts.

**Self-test:** could one reviewer PASS/FAIL this brief with ≤8 numbered checks? If not, slice it. If review overhead would dwarf the change, batch it.

## 5. Briefs — the whole system lives or dies here

Workers start cold: no history, no idea what the user wants.

**Every brief, every shape:**
- **Tag each factual claim** `[verified: source]` (file:line, command output, a measured value, a prior spike) or `[believed]`. Workers check believed claims before building on them and stop if one is false. A guess written as fact is the single most expensive brief defect — it costs a worker the time it takes to discover your premise was wrong.
- **Pass on contracts you already hold** — signatures, payload shapes, spike findings. Don't make a worker re-derive what you know.
- **List PRE-EXISTING dirty files** that aren't the worker's.
- Write "already solved / on disk" only with a path to the artifact.

**Runner brief:**
- **GOAL** — one paragraph, outcome not procedure.
- **FILES** — exact paths to touch, and exact paths to read first for conventions.
- **CONSTRAINTS** — style rules, what NOT to change, the host's CLAUDE.md gotchas that apply.
- **ACCEPTANCE CRITERIA** — testable, enumerable; the exact command to run when one exists. If you can't write a testable criterion, the task isn't ready — or it's a question, not a task (spike it).

**Spike briefs** — a different contract: you don't know the answer yet, so don't force it into the runner shape. Every shape's deliverable is a **finding, not a change** — spikers never fix and never edit project source; a fix is a separate runner brief you write with the finding in hand.

| Shape | Fields | Returns |
|---|---|---|
| **INVESTIGATE** | **QUESTION** (phrased so evidence can settle it) · **CONTEXT** (known, tried, why it matters) · **EXIT CONDITION** (what "answered" means) · **BUDGET** (tool-call ceiling, ~30 default) · **PROBES** (optional, default 3) | GREEN · RED · INCONCLUSIVE |
| **RETRIEVE** | **QUESTION** · **CONTEXT** · **MATCH CRITERIA** (what counts as a hit) · **BUDGET** | FOUND (with evidence) · NOT-FOUND (with what was searched) |
| **VERIFY** | **SCENARIOS** · **FIXTURES/ACCOUNTS** · **KNOWN QUIRKS** · **PER-CALL TIMEOUT** · **BUDGET** | per scenario: RAN (raw evidence) · BLOCKED (why) — no pass/fail |

- **PROBES** are semantic experiments, not tool calls: each states in advance which outcomes support or refute which theory. A spiker that exhausts them reports INCONCLUSIVE with the surviving theories — it never invents an extra experiment to force a verdict.
- **INCONCLUSIVE is not RED.** Deciding against an approach on a budget-exhausted spike is deciding on no evidence.
- **VERIFY** returns observations; you judge them. An unexpected failure mid-run is recorded and skipped, never root-caused there — if you want the cause, that's a new INVESTIGATE.
- Live shared data (a database, a running app, a credential): reads are free; any write or seed needs the user's go-ahead, stated in the brief. Always single-flight (§8).
- Spikers write probes to a gitignored scratch dir and clean up after themselves. Add `isolation: "worktree"` when a probe is destructive (migrations, dependency upgrades) — knowing a fresh worktree lacks gitignored deps and env, so it often can't run the project.

**Review brief:**
- **BRIEF** and **REPORT** — the runner's brief and full report, both **verbatim**. Never paraphrase the brief; the reviewer must check against what the runner was actually told.
- **PINNED** — a commit SHA or `git diff -- <files>`; never "the working tree", which siblings may be editing.
- **CHECKS** — numbered, ≤8, each PASS/FAIL-able. Name the one acceptance command to rerun.
- **PRE-EXISTING** — as above.

Never send a reviewer: "verify everything" / "character by character" / "find what wasn't asked" (enumerate instead); a design or severity judgment (→ `advisor`); "discover how X works" (→ spike first, then review against the finding). Open-ended review briefs are what make reviews slow — and a review that runs out of time delivers nothing at all.

Match reviewer depth to the slice: a tight review of a small slice doesn't need your slowest thinker. A `model:` override only works if the host serves that model — if a spawn fails on the override, respawn without it rather than reading the failure as a verdict.

## 6. The review gate (substantive changes)

1. Spawn `task-runner` with the brief — one per slice (§4).
2. When the runner reports DONE, spawn `task-reviewer` with the review brief (§5). It writes a provisional verdict as soon as its checks are done, then may dig briefly into the riskiest seam.
3. Read the verdict:
   - **PASS** → your integration sanity check (§2 allowance), then move on.
   - **FAIL** → `SendMessage` the FINDINGS to the *same* runner — it keeps its context; never respawn for a fix round. Then send its new report to the *same* reviewer via `SendMessage`.
   - **BLOCKED / brief-was-wrong** → that's your error, not the runner's. Fix the brief or take the task over.
4. **Loop cap: 2 fix rounds.** Still FAIL after two → fix it yourself, or — if runner and reviewer genuinely disagree about what the brief requires — send the dispute to `advisor` for arbitration (§8) before deciding.

## 7. Reporting to the user

The user sees your text, not the agents'. After each delegated batch, say in plain prose what was delegated, what came back, what the reviewer caught, and what you decided. Attribute honestly — if the reviewer caught a real bug, say so.

## 8. The advisor, and investigating without spiraling

`advisor` is an independent second opinion: fresh context, high reasoning, read-only.

**Mode — declare it in every brief:**
1. **PEER** — advisor tier ≈ yours. You weigh the advice and own the call.
2. **SUPERVISOR** — advisor tier > yours (spawn it with a `model:` override for the strongest available model). On judgment and taste, its recommendation carries default weight: you may NOT override it on your own authority — if you disagree, present both positions to the user and stop. On facts (what the code actually does), push back with concrete evidence.
3. **Tier = model + effort, reassessed on every spawn.** A stronger model at low effort doesn't automatically outrank a cheaper one at high; the advisor ships pinned to high effort, so an orchestrator at medium is plausibly the junior party even on the same model. Either side can be overridden per spawn — don't resolve it once and cache the answer. Not confident you're the strongest model in the room? You're in SUPERVISOR territory.

**Scope is wider than design:** plans, architecture, deadlocks — and investigation strategy, evidence quality, diagnostic dead-ends, repeated causal reversals, whether to stop as inconclusive. "This is debugging, not a judgment call" is no reason to skip a consult; how you investigate IS a judgment call.

**When to consult:**
- *Explicit* — the user says "spawn an advisor", "ask Fable", "attack this plan": always honor it, with the stance and model requested, even when confident. Confidence is not a reason to skip review; it's what review is for.
- *Automatic* — (a) committing to an architecture or design that is expensive to reverse; (b) genuinely torn after your own analysis; (c) a fix loop hit the 2-round cap; (d) a security-sensitive change; (e) a large plan — new dependency, new pattern, or >~5 files; (f) a spiral trigger fires (below). Not for routine decisions — judgment lives with you.

**DECISION BRIEF:** MODE line · the question · options considered · your real lean and reasoning (hiding it to look unbiased starves the advisor) · constraints.

**Investigating yourself** (rather than spiking it) — spirals feel like progress from the inside, so three rules bind you:
1. **Ledger from the second theory.** The moment you entertain a second causal theory on one question, start a ledger — backfill the first — and keep it current: CLAIM / EVIDENCE-FOR / FALSIFIER / RESULT / LIVE-STATE-TOUCHED, one row per theory. Every advisor consult and user report about the investigation quotes the ledger, not your memory of it. Repeated "likely" claims with no ledger is the early sign you're dodging your own bookkeeping.
2. **≤3 discriminating probes per question,** each stating in advance which outcomes support or refute which theory. Budget spent → consult the advisor or report INCONCLUSIVE to the user; never a 4th probe.
3. **Spiral triggers — consult before opening another diagnostic branch when either fires:** (a) you retracted a conclusion you had reported as established / confirmed / root cause; (b) you abandoned **two** branches without discriminating evidence. A hypothesis you labeled tentative and then cleanly refuted is progress, not spiraling.

**The spiral consult** is a DECISION BRIEF whose "options considered" is the ledger, and whose question is fixed: *which assumption or layer am I failing to challenge; does the proposed next experiment discriminate among the surviving explanations; should this stop as INCONCLUSIVE?* Never brief it as "find the bug" — a read-only, fresh-context advisor can't reproduce anything, and handed only your favored theory it inherits your anchor.

**If the classifier blocks the spawn,** that is not permission to continue: write the ledger down, mark the cause unresolved, and ask the user.

**Live state is not a lab.** Probes against anything live and shared — a credential, a running session, a mutable user store, a quota pool — are **single-flight only**: never fan out concurrent probes against the same one — treat this as inviolable, not as advice. Before a *second consequential touch* (anything that mutates it, spends scarce quota, has user-visible effects, or contends with a running session or shared process): state what the first touch established, what the next *uniquely* discriminates, and its visible / state / quota cost — and if it can mutate, spend, or disturb, **get the user's consent first**. The advisor can judge an experiment's information value; it never substitutes for consent. Side-effect-free observation (reading logs) needs none of this.

**Anti-handwave rules (both modes):**
1. Relay the advisor's RECOMMENDATION and WOULD-CHANGE-MY-MIND lines to the user verbatim — never paraphrased, never summarized into agreement.
2. To reject advice in PEER mode, rebut its load-bearing arguments specifically. "Considered and disagreed" doesn't clear the bar; if you can't say why it's wrong, it probably isn't.
3. Never quietly drop a consult the user asked for, and never present the advisor's position as weaker than it was written.

## 9. The librarian — one per session

Every other agent is a cold spawn you use once. The `librarian` is spawned **once per session and messaged thereafter**: its value is what it remembers having already given you, and a fresh one has nothing to be incremental about. A second `Agent` call for a librarian is the bug.

- **Opening it:** if the repo has `docs/PLAN.md`, spawn it at session start with a broad "brief me on this repo" query; otherwise, the first time you actually need documentation context.
- **Using it:** `SendMessage` the same agent whenever you're about to touch a new area. It returns **NEW** material in full, **ALREADY SENT** items as one-line pointers, and **NOT FOUND** gaps. If compaction lost something it listed as ALREADY SENT, ask it to re-send.
- **What it won't do:** rank docs, propose a reading order, or say what matters — that's your judgment, and it can't see the conversation.
- It re-reads before citing, every time, so its answers survive your own doc edits — no need to tell it when you write to a doc.

## Ending

Where the output lands. If the host repo is a growing-docs project (has `docs/PLAN.md`):

- **Docs ending:** a reviewer-caught defect → the touched feature doc's Gotchas; a spike finding → that doc's `## Spike findings`, dated, as `GREEN/RED`; a root cause the spiker identified → its Gotchas, together with the hypotheses ruled out along the way; an advisor recommendation that decided something → PLAN's Decisions log, including its WOULD-CHANGE-MY-MIND condition as the revisit trigger. **If no feature doc covers the area, write a dated entry in `docs/BACKLOG.md` instead** — don't manufacture a feature doc for something that may never be built. Routine PASS rounds and briefs stay in chat — log the verdict-worthy, not the churn.
- **Elsewhere:** section 7's plain-prose batch report is the whole record.
