# Backlog

Un-triaged idea dumps in dated batches. **The PLAN Features table is canonical** — an idea that graduates gets a row there and is deleted from here. This is also the intake point for the demand-driven P3 flow: feel a gap while working → one line here → `/forge` it when it recurs.

## 2026-07-19 — shelved by the P3 demand-driven pivot

All workflow-shaped; deferred (not rejected) because they overlap growing-docs in adopted repos — value activates mainly in un-adopted ones. Full context: PLAN Decisions log, 2026-07-19 reframe entry.

- **debug-to-gotcha** — original skill; debugging session ends by writing root cause + failed hypotheses to the feature doc's Gotchas. Was the advisor's build-first pick (canonical `## Ending` exemplar). If it graduates: check growing-docs' parked backlog entry wording first (docs-in/docs-out flips ownership), and resolve the Ending convention's "growing-docs host but feature doc absent" middle case in its forge.
- **pre-flight** — pre-task briefing/check discipline; adapt from asrafilll/work-skills (third-party, needs provenance).
- **handoff** — session handoff helper; if it ever graduates, the routing rule sends it to growing-docs (docs-in/docs-out ≈ /checkpoint), not here — recorded so it isn't re-proposed for this repo.

## Borrow-list (engineering-practice, pull when a gap bites)

From mattpocock/skills (MIT) and asrafilll/work-skills. **Bodies read 2026-07-19** — assessments below are grounded, not name-guesses. Ordered roughly by borrow-readiness:

- **resolving-merge-conflicts** (Pocock) — best borrow: tiny (~150 words, 5 steps), model-invoked, git-only deps. Discipline: research both sides' *intent* before resolving any hunk; keep both intents when feasible; "always resolve, never `--abort`"; run project checks after. Fits worktree workflows; candidate house mod (provenance-noted): a short docs-tree note — growing-docs conflicts (Decisions log, CHECKPOINTS) are append-heavy, both intents almost always keepable. Let this jump the queue the first time a worktree conflict bites.
- **taste** (via senior's repo; third-party Leonxlnx/taste-skill @ `3c7017d636c3`) — anti-"AI slop" frontend for *marketing surfaces only* (landing/portfolio; explicitly not dashboards/product UI). Design Read → three dials (variance/motion/density) → real design systems over invented ones → ~60-checkbox pre-flight; bans the LLM statistical defaults (purple-gradient heroes, Inter+slate, three-equal-cards). **Elevated interest: user works frontend-heavy.** Cautions: 8k+ words; stack-opinionated (Next.js RSC, Tailwind v4, Motion); overlaps the frontend-design plugin — at adopt time decide compose-or-choose and trim stack assumptions (mods in provenance).
- **tdd** (Pocock) — clean borrow, ~450 words: red-green on user-confirmed *seams*, vertical slices, refactoring deferred to review. Adopt-time mods: folder ships companion files (`tests.md`, `mocking.md`); trim/genericize Pocock-ecosystem refs (`CONTEXT.md`, ADRs, `/code-review` pointer).
- **security-audit** (senior's, original) — strongest senior-side candidate: attacker-minded OWASP sweep, severity-ranked findings. Pure engineering practice, zero growing-docs overlap, natural ending (findings → Gotchas/BACKLOG), useful at work.
- **production-readiness-audit** (senior's, original) — SRE scorecard (rollback, SLOs, observability, DR). Same clean shape; pull when something faces real traffic.
- **code-review** (Pocock) — borrow the *idea*, not the file: two parallel isolated review axes (standards w/ 12-Fowler-smell baseline; spec fidelity), never merged — each masks the other's failures. Implementation is wired to Pocock's tracker/setup skills. Note: orchestrate's task-reviewer already IS the spec-fidelity axis for delegated work; the gap is the standards axis + smell baseline. Reimplement-not-fork if pulled (minimalism precedent).
- **research** (Pocock) — investigates against primary sources, cited findings via background agent. Borderline workflow-shaped; leave until a gap proves it.
- **grill-me / caveman** (senior's) — grill-me overlaps advisor + /forge's interview; caveman (75% token-cut comms style) overlaps minimalism's chat scope. Both likely permanent shelf.

## Meta-skills (skill-writing craft — a real gap in our conventions)

Read 2026-07-19. Our RULES.md covers packaging/shipping conventions (invocation mode, Ending, provenance); neither it nor any resident covers the *craft* layer: progressive disclosure, description-as-routing-contract, context-load vs cognitive-load trade-off, routing-vs-execution debugging. Unlike the shelved candidates this demand recurs on every future resident forge. Two complementary references:

- **effective-agent-skills** (via senior's repo; third-party davidondrej/skills @ `50f4b7666347`) — the how-to manual: progressive disclosure stages, description = what+when+differentiator, capability vs process primitives, anti-patterns, routing-vs-execution testing, third-party-skill security audit.
- **writing-great-skills** (Pocock) — the vocabulary system: "wrangle determinism out of a stochastic system"; context load vs cognitive load; named failure modes (premature completion, sediment, sprawl, *negation* — prohibitions backfire, prompt the positive). Self-referential (user-invoked, practices its own doctrine); ships a GLOSSARY.md.
- Adopt shapes if pulled: borrow one as a resident, or distill the craft rules into RULES.md §Resident Conventions (a "writing residents" subsection) — decide at forge time.
