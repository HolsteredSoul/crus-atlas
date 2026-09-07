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
- **Last done:** Added six foot clinical cards (20 total): plantar fasciitis/fasciopathy, FHL tenosynovitis, navicular/metatarsal/calcaneal stress injuries and talar-dome osteochondral lesion. Separated six anatomical fascia sheets from four schematic compartment guides with independent controls and subdued guide rendering. Added region filters, marker-focused views and restoration of clinical-only visibility. Source geometry and all original 14 markers are unchanged. Independent review corrected the metatarsal marker to the dorsal shaft; nine tests, build and browser checks passed. Saved evidence is in docs/reviews/FOOT-CLINICAL.md.
- **Next action:** User review of the new clinical cards and fascia presentation. No further anatomy supplementation is authorized by this pointer. Distal interosseous ligament, tibiospring/receiving spring surface, plantar distal branches and disputed retinaculum remain open; existing dATTL identity remains interpreted. Independent clinical validation and representative-device performance testing remain outstanding.
- **Synced to:** 09e7161 — 2026-09-07, accepted foot clinical and layer presentation changes committed; publication uses the existing GitHub Pages workflow.

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
