# CRUS — shared agent instructions

This is the canonical guidance for every harness. Keep harness-specific entry files as
thin adapters; edit shared rules here. System/developer instructions and the user's
explicit directions take precedence over this scaffold and its memory or overlays.

## Required context

Before project work, read [PROJECT.md](PROJECT.md) and [memory/MEMORY.md](memory/MEMORY.md)
unless their current contents are already in context. Read
[memory/rejected-approaches.md](memory/rejected-approaches.md) before proposing an approach.
If `OBJECTIVE.md` exists at the project root, read it too; the template under `overlays/`
is inactive. Resolve paths relative to the project root, not a machine-specific absolute
path. A Markdown link is a reading instruction, not a guarantee of automatic import.
If required context cannot be read, report the gap instead of assuming it was loaded.

## Session ritual

**Start**

1. Load the required context above. Do not re-read unchanged content already in context.
2. If Git is available and this folder is in a repository, run `git status --short` and,
   when commits exist, `git log -5 --oneline`. Compare the Status anchor with history and
   relevant uncommitted changes. Reconcile stale state from evidence; a later docs-only
   status commit does not by itself mean the project state is stale. If there is no
   usable anchor, inspect relevant files and report the uncertainty.
3. Briefly state where we are and the next step relevant to the user's request.

**End** (proportional to the work; no bookkeeping changes for an unchanged read-only session)

1. For an initialized project, update Last done / Next action / Synced to when state
   changed. Synced to names the latest project commit reflected in the summary, before
   the status-only commit; it does not try to name its own commit. Mark summarized
   uncommitted changes explicitly. Commit only intended changes when permitted, using
   `docs: sync status` for status-only updates; otherwise report that they are uncommitted.
2. If a lasting decision or rejection was made, update `memory/` and its index. Rejections
   go in `rejected-approaches.md`; do not duplicate an existing entry.
3. If a phase changed, tick the roadmap. If the session went wrong, add one line in Slips.
4. Deliver the requested result and pause. A Next action or unchecked roadmap item is
   context for later work, not authorization to start it.

## Rules (checkable, in priority order)

1. Observed behaviour, code and Git history establish current state; docs can be stale.
   Fix stale descriptions, but fix code that fails the user's agreed requirements.
2. Check `memory/rejected-approaches.md` before proposing an approach. Revive a rejection
   only when its stated condition is met or the user explicitly changes the requirement.
3. Smallest change that serves the definition of done. Prefer deleting to adding. Don't
   tidy working code without a reason.
4. Build only what the current phase and authorized task need. No infrastructure for a
   thing not yet proven. The roadmap does not expand the user's request.
5. Before adding a dependency, flag, abstraction or special case, say what breaks without
   it. If nothing breaks, don't add it.
6. A patch per bug is a smell — fix the cause. One data point is not a pattern.
7. Verify the behaviour: run it and observe the result where applicable. For documents,
   verify consistency, references and requested content. Distinguish checks actually run
   from assumptions or untested behaviour; never execute placeholder commands.
8. Report failures plainly, with relevant output. A failed test or a dead end is a finding.
9. Feasibility before building: name a missing input; never build around it silently.
10. Answer questions directly, using proportionate verification when needed. A small fix
    gets a small session.

## Base requirement — delegation, quality and completion

Keep this scaffold model- and provider-agnostic. Do not prescribe model names, versions,
providers, fixed reasoning levels or permanent task-to-model mappings. Choose from the
capabilities available at execution time according to the task's requirements, and
reassess those choices as availability and capabilities change. Harness adapters only
load shared guidance; they must not impose model or provider preferences.

Use subagents selectively for independent work. The controlling model should choose each helper’s model and reasoning effort, with quality as the primary requirement. Optimize speed and cost only where doing so does not compromise correctness, completeness, maintainability, or the quality of the final result.

Use smaller models for clearly specified mechanical tasks whose results can be reliably verified. Assign work requiring substantial judgment to sufficiently capable models.

Give each helper a bounded assignment and clear acceptance criteria. Monitor progress and verify results before accepting them. If a helper fails to meet the required standard, stop it, reject the deficient work, and reassign the task to a more capable agent or complete it directly. Do not keep an underperforming agent in repeated correction loops or lower the standard to accommodate its output.

Keep the controlling agent accountable for planning, key decisions, coordination, integration, and final verification. Avoid overlapping file edits where applicable. Delegation does not transfer responsibility for quality.

Once the agreed requirements are met, deliver the result, report remaining issues honestly, and pause for review. Do not expand the scope or begin another refinement pass without my request.

Harness capability fallback: use only helper models and reasoning controls actually
available in the current harness. If helpers or the required controls are unavailable,
complete the work directly; do not invent a setting or claim a selection you could not
make. Pass each helper the relevant shared rules, context, allowed files and acceptance
criteria; do not assume it inherited the controlling agent's context.

## Build / test / run

Run from the project root with Node.js 22.12+ or 24 and npm. Install with npm ci.

- Build: npm run build
- Tests: npm test
- Develop: npm run dev
- Static preview: npm run preview

VITE_ATLAS_GLB_URL is optional public build-time configuration. No real anatomical GLB is bundled; the procedural fallback is the delivered model. Browser performance is not yet benchmarked.

## Code map (entry points only — open the file for detail)

| Concern | File | Notes |
|---|---|---|
| Anatomy contract | src/catalogue.ts | Stable IDs and metadata |
| Clinical overlays | src/conditions.ts | Cards, references and markers |
| Model and loader | src/model.ts | Procedural anatomy and GLB validation |
| Explode | src/layout.ts | Pure layout math |
| 3D viewer | src/viewer.ts | Camera, picking and scene lifecycle |
| Interface | src/main.ts | Controls and application state |

## Maintaining this file

Keep operational rules here; rationale lives in PROJECT.md or memory. Keep the code map
to entry points, never function lists or line numbers. Do not let an initialization
command regenerate shared guidance or duplicate it into harness adapters. When it grows,
prune without weakening the base requirements.

