# Code Rules

_Entry shape: an entry here is a **generalized rule — imperative + one-line why + a pointer** to the feature doc holding the full story (the incident, the failed hypotheses, the fix mechanics). If a rule needs a war story to be believed, the story goes in the feature doc's Gotchas and gets linked — RULES stays skimmable in one pass._

## Main Principles

{To be filled as the project develops — overarching philosophies for how code should be written. Process disciplines the team works by — TDD, review rituals, debugging practice — belong here too: they're project conventions, not global truths.}

## Folder Structure Conventions

{To be filled — the *convention* for where new files go and why. (The actual current tree lives in ARCHITECTURE.md.)}

## Naming Conventions

{To be filled — naming rules for files, functions, variables, components, routes, etc.}

## Code Style

{To be filled — formatting, imports, patterns to follow.}

## Comments

Readable code first; comments stay compact. The docs carry the full detail — a comment is a *why* or a pointer (`see docs/feature-x.md`), never a duplicate of what a doc already explains. A one-liner for a non-obvious why is good; a comment restating the code or the docs is noise.

Existing comments: handle **opportunistically** — only when already touching that code. Update if stale. Before compacting a large comment, **verify its why is captured in a doc; if not, move it there first, then compact** (move → verify → remove — compacting is a delete, and uncaptured why is unrecoverable).

## Glossary

The project's domain language — terms code, docs, and conversations should use consistently. Grown organically: add a term when it's coined, or when a naming collision gets resolved (note the "not to be confused with…").

| Term | Meaning |
|------|---------|
| | |

## Anti-Patterns

Things we tried that didn't work. **Do not repeat these.**

| Anti-Pattern | What Went Wrong | Better Approach |
|-------------|----------------|-----------------|
| | | |
