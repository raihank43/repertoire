---
name: orchestrate
description: Delegation protocol — the main agent keeps planning, judgment, and user discussion for itself, and farms out the rest to cheaper workers (repo browsing, code writing, repetitive edits, empirical investigation, documentation lookup), with an Opus reviewer gating substantive changes. Invoke when a task decomposes into well-specified subtasks, or when progress is blocked on something reality can answer.
disable-model-invocation: true
---

# Orchestrate: delegate the mechanical, keep the judgment

You (the main agent) are the orchestrator. You own: decomposition, briefs, routing, reading reports, verdict decisions, integration, and all conversation with the user. You never delegate those. Subagents cannot talk to each other — every hop goes through you. That is the design, not a limitation: your judgment stays in the loop at every gate.

## 1. Triage — should this be delegated at all?

Handle it YOURSELF when the task is: a design decision, a discussion with the user, security-sensitive, or so small that writing the brief costs more than doing it (< ~5 min of mechanical work). Delegation has overhead; don't pay it for trivia.

**Ambiguity and uncertainty are not the same thing, and they route oppositely.** Ambiguous about what the *user wants* → handle it yourself; that's a conversation, not an investigation, and no agent can resolve it. Uncertain about what's *true* → delegate it; reality can answer that, and it answers cheaper to a worker than to you.

Route by tier:
- **Retrieval** (find where X lives, survey conventions, extract what a module does) → `explorer` (haiku at max effort — read-only, cheap). Fire liberally; no reviewer — you judge the findings yourself. For questions spanning multiple areas, fan out several explorers in parallel, one narrow scope each, and synthesize their reports yourself. Give each an explicit scope boundary so they don't duplicate work.
- **Documentation** (what governs this area? what conventions apply before I touch it?) → `librarian` — one per session, reused, never re-spawned (section 6).
- **Unknowns** (will this approach work? how does this API actually behave? why is this failing?) → `spiker`. The deliverable is a finding, not a change. No reviewer — you judge the finding, and a contested high-stakes one goes to `advisor`.
- **Trivial mechanical edits** (rename, config bump, boilerplate from an exact template) → `task-runner` only. You spot-check the report; no reviewer.
- **Substantive code changes** (new logic, refactors, anything with failure modes) — including **writing or running test suites**, which have deterministic acceptance criteria and fit the standard brief exactly → `task-runner` + `task-reviewer` gate (section 3).
- **Judgment calls** (architecture choices, plan review, deciding between designs once the facts are in) → handle yourself; optionally consult `advisor` (section 5). Never delegate the decision itself.

Runners may spawn `explorer` agents themselves for mid-task retrieval ("find every caller of X before changing its signature") — that is the only permitted two-level hop. Retrieval briefs are hard to garble; anything more degrades through relay. A runner that hits an unknown mid-task should stop and report it, not investigate: you decide whether it warrants a spike.

## 2. The brief — the whole system lives or dies here

Workers start cold: no conversation history, no idea what the user wants. Every delegation MUST include:

- **GOAL**: one paragraph, outcome not procedure.
- **FILES**: exact paths to touch, and exact paths to read first for conventions.
- **CONSTRAINTS**: style rules, what NOT to change, project-specific gotchas from CLAUDE.md that apply.
- **ACCEPTANCE CRITERIA**: testable, enumerable. Include the exact command to run (test/build/lint) when one exists. If you cannot write a testable criterion, either the task is not ready to delegate — or it isn't a task at all, but a question (see the spike brief below).

**The spike brief — a different contract.** A spike has no acceptance criteria by definition: you don't know the answer yet. Don't force it into the shape above. Brief a `spiker` with:

- **QUESTION**: the single thing to find out, phrased so evidence can settle it.
- **CONTEXT**: what's already known, what's been tried, why it matters.
- **EXIT CONDITION**: what "answered" means here — the semantic stop.
- **BUDGET**: a tool-call ceiling (~30 is a reasonable default). The hard stop.

It returns **GREEN** (confirmed), **RED** (refuted), or **INCONCLUSIVE** (budget spent, or couldn't reproduce). Treat INCONCLUSIVE as genuinely different from RED — deciding against an approach on a budget-exhausted spike is deciding on no evidence. Spikers write probes to a gitignored scratch dir and clean up after themselves; add `isolation: "worktree"` when the probe is destructive (migrations, dependency upgrades) — but know that a fresh worktree lacks gitignored dependencies and environment, so it often can't run the project.

## 3. The review gate (substantive changes only)

1. Spawn `task-runner` with the brief. Independent tasks in parallel — one Agent call each in the same block. If parallel tasks could touch the same files, give each `isolation: "worktree"`, or serialize them.

   **Batching (decomposition is YOUR job — runners never split work or spawn other runners; their only permitted delegation is `explorer` retrieval):**
   - *Batch up*: several small related edits = ONE runner with a checklist brief, not N runners paying N cold-start taxes (~20k tokens each).
   - *Split out*: a large task becomes parallel runners only when you can give each a disjoint file set. You know the boundaries because you did the decomposition; a runner doesn't.
   - *Granularity rule*: one brief = one reviewable unit. If the reviewer couldn't PASS/FAIL it as a coherent whole, the brief is too broad; if review overhead dwarfs the change, too narrow — batch it up.
2. When the runner reports DONE, spawn `task-reviewer` with: the original brief (verbatim), and the runner's full report. Never paraphrase the brief — the reviewer must check against what the runner was actually told.
3. Read the verdict:
   - **PASS** → do your own quick integration sanity check (does it fit the pieces the reviewer couldn't see?), then move on.
   - **FAIL** → `SendMessage` the FINDINGS to the *same* runner (it keeps its context; never respawn for a fix round). Then send the runner's new report back to the *same* reviewer via `SendMessage`.
   - **BLOCKED / brief-was-wrong** → that's your error, not the runner's. Fix the brief or take the task over.
4. **Loop cap: 2 fix rounds.** If the reviewer still FAILs after two rounds, stop the ping-pong. Either fix it yourself, or — if runner and reviewer genuinely disagree about what the brief requires — send the dispute to `advisor` for arbitration (section 5) before deciding.

## 4. Reporting to the user

The user sees your text, not the agents'. After each delegated batch, summarize in plain prose: what was delegated, what came back, what the reviewer caught (if anything), what you decided. Attribute honestly — if the reviewer caught a real bug, say so.

## 5. The advisor — second opinions with teeth

`advisor` is an independent second opinion (fresh context, high reasoning, read-only). Which of two modes applies depends on relative tier, and you MUST declare it in the brief:

- **MODE: PEER** — advisor tier ≈ your tier (e.g. Fable orchestrating, Opus-high advising). You weigh the advice and own the final call.
- **MODE: SUPERVISOR** — advisor tier > your tier (e.g. a mid-tier model orchestrating, the strongest available model advising — spawn the advisor with a `model:` override). On judgment/taste questions its recommendation carries default weight: you may NOT override it on your own authority — if you disagree, present both positions to the user and stop. On factual questions (what the code actually does) you may push back with concrete evidence.

**Tier means model *and* reasoning effort, not model name alone.** A stronger model at low effort does not automatically outrank a cheaper one at high effort, and the advisor ships pinned to high effort by design — so a session orchestrating at medium is plausibly the junior party even against the same model. Assess the pair, every time; do not resolve it once and cache the answer, because either side can be overridden per spawn.

Honestly assess which side of the line you are on. If you are not confident you are the strongest model in the room, you are in SUPERVISOR territory.

**Invocation is hybrid — explicit or automatic:**
- *Explicit*: the user says "spawn an advisor", "ask Fable", "attack this plan" — always honor it, with the stance and model requested, even if you are confident you don't need it. Confidence is not a reason to skip review; it is what review is for.
- *Automatic*: consult the advisor unprompted when (a) committing to an architecture/design that is expensive to reverse, (b) genuinely torn after your own analysis, (c) a fix loop hit the 2-round cap, (d) the change is security-sensitive, or (e) an implementation plan is large (new dependency, new pattern, or >~5 files). Do NOT consult for routine decisions — judgment lives here.

Send a DECISION BRIEF: MODE line, the question, options considered, your current lean and reasoning, constraints. Include your real lean — hiding it to look unbiased just starves the advisor of information.

**Anti-handwave rules (both modes):**
1. Relay the advisor's RECOMMENDATION and WOULD-CHANGE-MY-MIND lines to the user verbatim — never paraphrased, never summarized into agreement.
2. To reject advice in PEER mode you must rebut its load-bearing arguments specifically. "Considered and disagreed" does not clear the bar; if you cannot articulate why it is wrong, it probably isn't.
3. Never quietly drop an advisor consult the user asked for, and never present the advisor's position as weaker than it was written.

## 6. Session-scoped agents — the librarian

Every other agent here is a cold spawn you use once. The `librarian` is the exception: **one per session, spawned once and messaged thereafter.** Its value is entirely in what it remembers having already given you — a fresh one has nothing to be incremental about. If you find yourself writing a second `Agent` call for a librarian, that is the bug.

- **Opening it:** if the repo has `docs/PLAN.md`, spawn the librarian at the start of the session with a broad "brief me on this repo" query — a growing-docs project will have you touching docs before you're done. Otherwise spawn it the first time you actually need documentation context.
- **Using it:** `SendMessage` the same agent whenever you're about to touch a new area — "what governs the auth flow?" It returns **NEW** material in full, **ALREADY SENT** items as one-line pointers, and **NOT FOUND** gaps. If your context was compacted and you've lost something it listed under ALREADY SENT, just ask it to re-send.
- **What it will not do:** rank docs, propose a reading order, or tell you what matters. That's your judgment, and it can't see this conversation. It tells you what exists and what governs; you decide what to read.
- It re-reads before citing, every time, so its answers survive your own doc edits — you don't need to notify it when you write to a doc.

## Ending

Where the output lands. If the host repo is a growing-docs project (has `docs/PLAN.md`):

- **Docs ending:** a reviewer-caught defect → the touched feature doc's Gotchas; a spike finding → that doc's `## Spike findings`, dated, as `GREEN/RED`; a root cause the spiker identified → its Gotchas, together with the hypotheses ruled out along the way; an advisor recommendation that decided something → PLAN's Decisions log, including its WOULD-CHANGE-MY-MIND condition as the revisit trigger. **If no feature doc covers the area, write a dated entry in `docs/BACKLOG.md` instead** — don't manufacture a feature doc for something that may never be built. Routine PASS rounds and briefs stay in chat — log the verdict-worthy, not the churn.
- **Elsewhere:** section 4's plain-prose batch report to the user is the whole record.
