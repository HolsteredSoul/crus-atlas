# CRUS

## Mission
Build a static, interactive educational atlas of the right lower leg, ankle and distal knee, with searchable anatomy layers and clinical landmarks. The app is not a medical device or diagnostic/surgical tool.

## Definition of done
The requested structures are independently selectable under a stable metadata contract; layer controls, focus/presets, three explode modes and all requested clinical topics are implemented. A runnable Vite app, catalogue, conditions, model attribution and GLB replacement instructions are delivered. The user rejected the initial procedural stand-in; acceptance now requires source-derived anatomy and visual review.

## Non-goals
- No diagnosis, treatment protocols or surgical guidance.
- No backend, authentication, patient data or clinical measurements.
- No claim of clinically validated geometry or registered source scans.
- No detailed full-body anatomy, complete foot musculature or new roadmap features.

## Status — where we are
- **Phase:** 2 — Supplemented source atlas delivered; explicit anatomical gaps remain.
- **Last done:** Published the supplemented 93-entry atlas to https://holsteredsoul.github.io/crus-atlas/ using GitHub Actions. CI tests/build/deploy succeeded; the public browser loaded all entries, rendered the model, exercised layer visibility and Foot focus, and reported no browser errors. The workflow builds with the repository base path and publishes dist on master pushes. Preserved the user's remote .nojekyll addition. Anatomy coverage and reviewed exclusions remain as documented in docs/reviews/IMPLEMENTATION.md.
- **Next action:** User review of delivered atlas and itemised gaps. G authoring needs registered footprint/receiving-surface evidence. Independent clinical validation and representative-device performance remain outstanding; no further scope is authorized by this pointer.
- **Synced to:** 18e9150 — 2026-09-07, GitHub Pages workflow committed and deployed successfully (run 34084464704); this update records the verified hosting status.

## Slips
- Treated procedural fallback permission as acceptable final anatomical quality; pursued publishing before visually verifying the model. User screenshots exposed the failure.
- Initial test assumed 15 clinical cards; actual 14 grouped cards cover the requested topics. Corrected the assertion and documentation.
- Clean rebuild exposed selected objects from other scenes and a Blender 5.2 scene-library copy crash. Restricted export to the active atlas scene and verified collection libraries instead.

## Stack
Vite 7, strict TypeScript, Three.js 0.180+, GLTFLoader/DRACOLoader, OrbitControls, GSAP, Lucide and a custom semantic HTML/CSS tree. Static app with bundled source-derived Draco GLB; no primitive fallback. No framework or server needed.

## Roadmap
- [x] **Phase 0 — Feasibility.** Dependencies obtainable; real GLB missing, explicitly authorized procedural fallback used.
- [x] **Phase 1 — Thin vertical slice.** Selectable 3D anatomy with detail card and controls.
- [ ] **Phase 2 — Fill out.** Controls, cards and source anatomy are integrated; user visual acceptance is pending.
- [ ] **Phase 3 — Harden.** Build and automated geometry/data/layout checks pass. Browser smoke checks pass; complete accessibility, independent anatomy and representative-device performance remain to validate.

The roadmap does not authorize additional work beyond the user's requested scope.
