# Checkpoint Log
Full session reports from `/checkpoint`, newest first. The cold-start brief lives in
PLAN.md's Current Focus; this file is the history behind it. Full entries are uncapped;
`lite:` entries are budgeted summaries whose durable detail lives in native docs.

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
