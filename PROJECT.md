# CRUS

## Mission
Build a static, interactive educational atlas of the right lower leg, ankle and distal knee, with searchable anatomy layers and clinical landmarks. The app is not a medical device or diagnostic/surgical tool.

## Definition of done
The requested structures are independently selectable under a stable metadata contract; layer controls, focus/presets, three explode modes and all requested clinical topics are implemented. A runnable Vite app, catalogue, conditions, model attribution and GLB replacement instructions are delivered. The user explicitly permits a procedural stand-in pending a real GLB.

## Non-goals
- No diagnosis, treatment protocols or surgical guidance.
- No backend, authentication, patient data or clinical measurements.
- No claim of clinically validated geometry or registered source scans.
- No detailed full-body anatomy, full foot or new roadmap features.

## Status — where we are
- **Phase:** 3 — Harden: implementation and automated validation complete; browser/device validation unperformed.
- **Last done:** Implemented 47-part procedural atlas, metadata-validating Draco loader, 14 clinical cards, layers, camera, selection, clipping and three explode modes. Five automated tests and strict production build pass; local server returned HTTP 200.
- **Next action:** User review; separately validate browser interactions/performance and supply/register a licensed real GLB if requested.
- **Synced to:** uncommitted — 2026-09-06. All application, documentation and bootstrap changes are currently uncommitted.

## Slips
- Initial test assumed 15 clinical cards; actual 14 grouped cards cover the requested topics. Corrected the assertion and documentation.

## Stack
Vite 7, strict TypeScript, Three.js 0.180+, GLTFLoader/DRACOLoader, OrbitControls, GSAP, Lucide and a custom semantic HTML/CSS tree. Static deployment; original procedural mesh fallback. No framework or server needed.

## Roadmap
- [x] **Phase 0 — Feasibility.** Dependencies obtainable; real GLB missing, explicitly authorized procedural fallback used.
- [x] **Phase 1 — Thin vertical slice.** Selectable 3D anatomy with detail card and controls.
- [x] **Phase 2 — Fill out.** Required systems, layers, presets, explode and clinical cards.
- [ ] **Phase 3 — Harden.** Build and automated geometry/data/layout checks pass. Browser interaction, accessibility and representative-device performance remain to validate.

The roadmap does not authorize additional work beyond the user's requested scope.
