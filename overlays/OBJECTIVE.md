# Objective overlay — for projects with one measurable objective

> **Install:** copy this file to the project root as `OBJECTIVE.md`; AGENTS.md requires
> agents to read it there (no harness-specific import is needed). Replace PROJECT.md's
> **Definition of done** with "see OBJECTIVE.md"; replace
> roadmap Phase 1 with *"Build + evaluate — beat the naive baseline on held-out reality, or it
> stays evaluation-only."* Fill the placeholders. Then this file is binding within the
> user's agreed scope; AGENTS.md's base quality and completion requirements still apply.

Use this when the project optimises a single measurable quantity — a strategy, a model, a
ranking, a forecast. It exists because such projects drown by repeatedly substituting clever
proxies for the real objective; this is the immune system against that.

## The objective — one thing only
**<<THE ONE OBJECTIVE — a single measurable quantity, in its real units, evaluated on
held-out reality, not a proxy.>>**

That is the entire objective. If a number is not `<<the objective, in its real units>>`, it
is not the objective.

### Honest measurement
Choose the rule or design on one slice of evidence, then measure it on a *different* slice it
never saw. `<<The concrete held-out protocol: walk-forward by period, held-out test set,
real-world trial. Require it to hold per slice, not just in aggregate.>>` This is the only
guard that stops "maximise the objective" from collapsing into "maximise luck".

## The governing rule
**No gate, metric, model term, feature or flag exists unless removing it worsens the objective
measured honestly.** Put every proposed addition on trial against this. Most fail. Nothing is
added on intuition, elegance or "it feels safer".

### Carve-outs (narrow, named, closed)
Controls justified by reasoning the data structurally *cannot* adjudicate (rare-tail / ruin
avoidance) may stay despite no measurable benefit — as a closed, named list. Nothing joins it
by "demonstrating" a benefit. `<<List them, or write "none".>>`

## The gate (evaluation → committed)
`<<The bar, in the objective's units, on held-out reality, with a minimum-sample floor.>>`
Evaluate broad (cheap), commit narrow (only what clears the gate). An option that never
clears it stays evaluation-only — that is success, not failure.

## Data / inputs — the binding constraint
No inputs → no honest measurement → do not build. `<<What must be obtainable.>>`
Vet before integrating, with a time-boxed throwaway spike — never a pipeline first: coverage,
freshness, reliability (works *repeatedly*), access / cost / licence, granularity. If it
doesn't prove out in the box, stop. Record every verdict in memory. Prefer few, proven, owned
datasets over many live sources of uncertain reliability.

## Expressly rejected framings
Proxies that look rigorous and keep getting resurrected by fresh sessions:
- `<<Rejected framing 1 — the intermediate metric mistaken for the objective, and why.>>`
- `<<Rejected framing 2 …>>`

## Anti-patterns specific to this kind of project
- **Proxy substitution.** The objective restated as a cleverer intermediate metric, each one
  growing its own scaffolding. THE failure mode.
- **Gate-per-observation.** Every bad case gets a gate. A gate is a confession the model is
  miscalibrated — fix the model.
- **Small-sample chasing.** Decisions off an estimator with no power; outliers masquerading
  as signal.
- **Iterated "held-out".** A held-out test that is tuned, re-run or re-picked after seeing the
  data is not held out. Pre-register, run once, accept the result.

## A note to whoever (or whatever) is reading this
If you are an AI agent: this failure mode is *yours specifically*. You are drawn to legible,
measurable proxies because they give you something to optimise this turn, where the true
objective demands patience and a large sample and offers nothing to tweak today. Resist it.
When you notice yourself optimising or reporting a number that isn't the objective, stop and
say so. Open every report with the objective-impact, then the detail.
